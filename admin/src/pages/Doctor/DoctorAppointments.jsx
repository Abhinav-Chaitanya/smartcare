import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import RescheduleModal from '../../components/RescheduleModal'
import ReasonModal from '../../components/ReasonModal'
import DiagnosisModal from '../../components/DiagnosisModal'
import getProfileImage from '../../utils/getProfileImage'

const DoctorAppointments = () => {

  const location = useLocation()
  const navigate = useNavigate()

  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment, rescheduleAppointment, profileData, getProfileData } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)

  // Filter state
  const [activeFilter, setActiveFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  // Date filter state
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [specificDate, setSpecificDate] = useState('')

  // Modal states
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false)
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false)
  const [showRescheduleConfirmModal, setShowRescheduleConfirmModal] = useState(false)
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)

  // Selected appointment
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [actionType, setActionType] = useState('')
  const [newSlotData, setNewSlotData] = useState({ date: '', time: '' })

  // Loading states
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch data on mount
  useEffect(() => {
    if (dToken) {
      getAppointments()
      getProfileData()
    }
  }, [dToken])

  // Handle URL query params and location state
  useEffect(() => {
    // Check for filter from location state
    if (location.state?.filter) {
      setActiveFilter(location.state.filter)
    }

    // Check for date filter from URL query params
    const searchParams = new URLSearchParams(location.search)
    const dateParam = searchParams.get('filterDate')
    if (dateParam) {
      // Convert slotDate format (day_month_year) to yyyy-mm-dd for specificDate
      const [day, month, year] = dateParam.split('_')
      setSpecificDate(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
      setActiveFilter('all')
    }
  }, [location.state, location.search])

  // Filter appointments
  const getFilteredAppointments = () => {
    let filtered = [...appointments]

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Specific date filter
    if (specificDate) {
      const target = new Date(specificDate)
      target.setHours(0, 0, 0, 0)
      filtered = filtered.filter(apt => {
        const [day, month, year] = apt.slotDate.split('_').map(Number)
        const aptDate = new Date(year, month - 1, day)
        aptDate.setHours(0, 0, 0, 0)
        return aptDate.getTime() === target.getTime()
      })
    }

    // Date range filter
    if (fromDate) {
      const from = new Date(fromDate)
      from.setHours(0, 0, 0, 0)
      filtered = filtered.filter(apt => {
        const [day, month, year] = apt.slotDate.split('_').map(Number)
        return new Date(year, month - 1, day) >= from
      })
    }
    if (toDate) {
      const to = new Date(toDate)
      to.setHours(23, 59, 59, 999)
      filtered = filtered.filter(apt => {
        const [day, month, year] = apt.slotDate.split('_').map(Number)
        return new Date(year, month - 1, day) <= to
      })
    }

    // Main status filter buttons (All, Today, Upcoming)
    switch (activeFilter) {
      case 'today':
        filtered = filtered.filter(apt => {
          const [day, month, year] = apt.slotDate.split('_')
          const aptDate = new Date(year, month - 1, day)
          aptDate.setHours(0, 0, 0, 0)
          return aptDate.getTime() === today.getTime() && apt.status === 'confirmed'
        })
        break
      case 'upcoming':
        filtered = filtered.filter(apt => {
          const [day, month, year] = apt.slotDate.split('_')
          const aptDate = new Date(year, month - 1, day)
          aptDate.setHours(0, 0, 0, 0)
          return aptDate.getTime() >= today.getTime() && apt.status === 'confirmed'
        })
        break
      default:
        break
    }

    // Dropdown status filter (completed, cancelled, expired)
    if (activeFilter === 'all' && statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(apt =>
        apt.userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.userData.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const filteredAppointments = getFilteredAppointments()

  const hasDateFilter = fromDate || toDate
  const clearDateFilter = () => { setFromDate(''); setToDate('') }
  const clearSpecificDate = () => { setSpecificDate(''); navigate('/doctor-appointments', { replace: true }) }

  // Helper: who performed the action (fixes admin attribution)
  const getActionByText = (by) => {
    if (by === 'doctor') return 'by you'
    if (by === 'admin') return 'by admin'
    if (by === 'patient') return 'by patient'
    return ''
  }

  // Get status badge with SVG icons
  const getStatusBadge = (status) => {
    const config = {
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Confirmed',
        icon: (
          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M5 13l4 4L19 7' />
          </svg>
        )
      },
      completed: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: 'Completed',
        icon: (
          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M5 13l4 4L19 7' />
          </svg>
        )
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: 'Cancelled',
        icon: (
          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
          </svg>
        )
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        label: 'Pending',
        icon: (
          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
        )
      },
      expired: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        label: 'Expired',
        icon: (
          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
        )
      }
    }

    const { bg, text, label, icon } = config[status] || config.pending

    return (
      <span className={`${bg} ${text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit`}>
        {icon}
        {label}
      </span>
    )
  }

  // Filter icons
  const filterIcons = {
    all: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
      </svg>
    ),
    today: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
      </svg>
    ),
    upcoming: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
      </svg>
    ),
    completed: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
      </svg>
    ),
    cancelled: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' />
      </svg>
    )
  }

  // ==================== ACTION HANDLERS ====================

  // Complete appointment - Now opens DiagnosisModal
  const handleCompleteClick = (appointment) => {
    setSelectedAppointment(appointment)
    setShowDiagnosisModal(true)
  }

  // Handle diagnosis submission
  const handleDiagnosisSubmit = async (diagnosisData) => {
    setIsProcessing(true)
    const success = await completeAppointment(selectedAppointment._id, diagnosisData)
    setIsProcessing(false)
    if (success) {
      setShowDiagnosisModal(false)
      setSelectedAppointment(null)
    }
  }

  // Cancel appointment
  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment)
    setShowCancelConfirmModal(true)
  }

  const handleCancelConfirm = () => {
    setShowCancelConfirmModal(false)
    setActionType('cancel')
    setShowReasonModal(true)
  }

  const handleCancelSubmit = async (reason) => {
    setIsProcessing(true)
    const success = await cancelAppointment(selectedAppointment._id, reason)
    setIsProcessing(false)
    if (success) {
      setShowReasonModal(false)
      setSelectedAppointment(null)
      setActionType('')
    }
  }

  // Reschedule appointment
  const handleRescheduleClick = (appointment) => {
    setSelectedAppointment(appointment)
    setShowRescheduleConfirmModal(true)
  }

  const handleRescheduleConfirm = () => {
    setShowRescheduleConfirmModal(false)
    setShowRescheduleModal(true)
  }

  const handleSlotSelected = (newSlotDate, newSlotTime) => {
    setNewSlotData({ date: newSlotDate, time: newSlotTime })
    setShowRescheduleModal(false)
    setActionType('reschedule')
    setShowReasonModal(true)
  }

  const handleRescheduleSubmit = async (reason) => {
    setIsProcessing(true)
    const success = await rescheduleAppointment(
      selectedAppointment._id,
      newSlotData.date,
      newSlotData.time,
      reason
    )
    setIsProcessing(false)
    if (success) {
      setShowReasonModal(false)
      setSelectedAppointment(null)
      setActionType('')
      setNewSlotData({ date: '', time: '' })
    }
  }

  // View Details Handler
  const handleViewDetails = (appointment) => {
    navigate(`/appointment-details/${appointment._id}`)
  }

  // Close all modals
  const closeAllModals = () => {
    setShowDiagnosisModal(false)
    setShowCancelConfirmModal(false)
    setShowRescheduleConfirmModal(false)
    setShowReasonModal(false)
    setShowRescheduleModal(false)
    setSelectedAppointment(null)
    setActionType('')
    setNewSlotData({ date: '', time: '' })
  }

  // ==================== UI ====================

  return (
    <div className='w-full max-w-6xl m-5'>

      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>All Appointments</h1>
          <p className='text-gray-500 text-sm mt-1'>Manage and track your patient appointments</p>
        </div>

        {/* View My Slots Button */}
        <button
          onClick={() => navigate('/doctor-slots')}
          className='flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
          </svg>
          View My Slots
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
          </svg>
        </button>
      </div>

      {/* Filters & Search */}
      <div className='bg-white rounded-xl shadow-sm p-4 mb-6'>
        <div className='flex flex-col gap-4'>

          {/* Row 1: Status buttons + dropdown + search */}
          <div className='flex flex-wrap items-center gap-2'>

            {/* Main filter buttons: All, Today, Upcoming */}
            {[
              { key: 'all', label: 'All' },
              { key: 'today', label: 'Today' },
              { key: 'upcoming', label: 'Upcoming' },
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => { setActiveFilter(filter.key); if (filter.key !== 'all') setStatusFilter('all') }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                  ${activeFilter === filter.key
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {filterIcons[filter.key]}
                {filter.label}
              </button>
            ))}

            {/* Divider */}
            <div className='w-px h-8 bg-gray-200 mx-1'></div>

            {/* Status dropdown: Completed, Cancelled, Expired */}
            <div className='relative'>
              <select
                value={activeFilter === 'all' ? statusFilter : 'all'}
                onChange={(e) => {
                  setActiveFilter('all')
                  setStatusFilter(e.target.value)
                }}
                disabled={activeFilter !== 'all'}
                className={`pl-4 pr-8 py-2 rounded-lg text-sm font-medium border transition-all appearance-none cursor-pointer
                  ${activeFilter === 'all' && statusFilter !== 'all'
                    ? 'bg-primary text-white border-primary shadow-md'
                    : activeFilter !== 'all'
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-600 border-gray-100 hover:bg-gray-200'
                  }`}
              >
                <option value='all'>Status Filter</option>
                <option value='completed'>Completed</option>
                <option value='cancelled'>Cancelled</option>
                <option value='expired'>Expired</option>
              </select>
              <svg className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${activeFilter === 'all' && statusFilter !== 'all' ? 'text-white' : 'text-gray-400'}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
              </svg>
            </div>

            {/* Search — pushed to right */}
            <div className='relative ml-auto'>
              <input
                type='text'
                placeholder='Search patient name or email...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full lg:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm'
              />
              <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </div>
          </div>

          {/* Row 2: Specific date + Date range filter */}
          <div className='flex flex-wrap items-center gap-3'>

            {/* Specific Date */}
            <span className='text-sm font-medium text-gray-500 flex items-center gap-1'>
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
              </svg>
              Specific Date:
            </span>
            <input
              type='date'
              value={specificDate}
              onChange={(e) => { setSpecificDate(e.target.value); if (e.target.value) { setFromDate(''); setToDate('') } }}
              className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                specificDate ? 'border-primary bg-primary/5' : 'border-gray-300'
              }`}
            />
            {specificDate && (
              <button
                onClick={clearSpecificDate}
                className='flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all border border-red-200'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                </svg>
                Clear
              </button>
            )}

            {/* Divider */}
            <div className='w-px h-8 bg-gray-200 mx-1'></div>

            {/* Date Range */}
            <span className='text-sm font-medium text-gray-500 flex items-center gap-1'>
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
              </svg>
              Date Range:
            </span>
            <input
              type='date'
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); if (e.target.value) setSpecificDate('') }}
              className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
            />
            <span className='text-gray-400 text-sm'>to</span>
            <input
              type='date'
              value={toDate}
              min={fromDate}
              onChange={(e) => { setToDate(e.target.value); if (e.target.value) setSpecificDate('') }}
              className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
            />
            {hasDateFilter && (
              <button
                onClick={clearDateFilter}
                className='flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all border border-red-200'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Appointments Count */}
      <div className='mb-4'>
        <p className='text-sm text-gray-500'>
          Showing <span className='font-semibold text-gray-700'>{filteredAppointments.length}</span> appointments
          {specificDate && (
            <span className='text-primary ml-1'>
              for {new Date(specificDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          {hasDateFilter && fromDate && toDate && (
            <span className='text-primary ml-1'>
              from {new Date(fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} to {new Date(toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </p>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
            </svg>
          </div>
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Appointments Found</h3>
          <p className='text-gray-500'>
            {searchTerm ? 'Try a different search term' : 'No appointments match the selected filter'}
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          {filteredAppointments.map((item, index) => (
            <div
              key={index}
              className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all'
            >
              <div className='flex flex-col lg:flex-row'>

                {/* Patient Image */}
                <div className='lg:w-32 flex-shrink-0 bg-gray-100 flex items-center justify-center p-4'>
                  <img
                    className='w-20 h-20 rounded-full object-cover border-4 border-white shadow-md'
                    src={getProfileImage(item.userData.image)}
                    alt={item.userData.name}
                  />
                </div>

                {/* Appointment Details */}
                <div className='flex-1 p-5'>
                  <div className='flex flex-wrap items-start justify-between gap-3 mb-3'>
                    <div>
                      <h3 className='text-lg font-bold text-gray-800'>
                        {item.userData.name}
                      </h3>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Info Grid */}
                  <div className='flex items-center gap-4 mb-4'>
                    <div>
                      <p className='text-xs text-gray-400 uppercase font-medium'>Date</p>
                      <p className='text-sm font-semibold text-gray-700'>
                        {slotDateFormat(item.slotDate)}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-400 uppercase font-medium'>Time</p>
                      <p className='text-sm font-semibold text-gray-700'>
                        {item.slotTime}
                      </p>
                    </div>
                    <div className='flex-1'></div>

                    {/* View Details Button */}
                    <button
                      onClick={() => handleViewDetails(item)}
                      className='flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-all'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                      </svg>
                      View Details
                    </button>
                  </div>

                  {/* Diagnosis Preview for Completed */}
                  {item.status === 'completed' && item.diagnosis && (
                    <div className='bg-green-50 border border-green-100 rounded-lg p-3 mb-3'>
                      <p className='text-xs text-green-600 font-medium mb-1 flex items-center gap-1'>
                        <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                        Diagnosis:
                      </p>
                      <p className='text-sm text-green-800'>{item.diagnosis}</p>
                      {item.prescription?.hasMedicines && (
                        <p className='text-xs text-green-600 mt-2 flex items-center gap-1'>
                          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' />
                          </svg>
                          {item.prescription.medicines.length} medicine(s) prescribed
                        </p>
                      )}
                    </div>
                  )}

                  {/* Cancellation/Reschedule Reason */}
                  {item.cancelReason && item.status === 'cancelled' && (
                    <div className='bg-red-50 border border-red-100 rounded-lg p-3 mb-3'>
                      <p className='text-xs text-red-600 font-medium flex items-center gap-1'>
                        <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                        Cancellation Reason ({getActionByText(item.cancelledBy)}):
                      </p>
                      <p className='text-sm text-red-700 mt-1'>{item.cancelReason}</p>
                    </div>
                  )}

                  {item.rescheduleReason && item.previousSlotDate && (
                    <div className='bg-orange-50 border border-orange-100 rounded-lg p-3 mb-3'>
                      <p className='text-xs text-orange-600 font-medium flex items-center gap-1'>
                        <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                        </svg>
                        Rescheduled ({getActionByText(item.rescheduledBy)}):
                      </p>
                      <p className='text-sm text-orange-700 mt-1'>
                        From {slotDateFormat(item.previousSlotDate)} at {item.previousSlotTime}
                      </p>
                      <p className='text-sm text-orange-700'>Reason: {item.rescheduleReason}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {item.status === 'confirmed' && (
                    <div className='flex flex-wrap gap-2 pt-3 border-t border-gray-100'>
                      <button
                        onClick={() => handleCompleteClick(item)}
                        className='flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all shadow-sm'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                        </svg>
                        Complete
                      </button>
                      <button
                        onClick={() => handleRescheduleClick(item)}
                        className='flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-all shadow-sm'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                        </svg>
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancelClick(item)}
                        className='flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all shadow-sm'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* Diagnosis Modal */}
      {showDiagnosisModal && selectedAppointment && (
        <DiagnosisModal
          appointment={selectedAppointment}
          onClose={closeAllModals}
          onSubmit={handleDiagnosisSubmit}
          isProcessing={isProcessing}
          slotDateFormat={slotDateFormat}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirmModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 text-center">
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cancel Appointment?
              </h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to cancel the appointment with <strong>{selectedAppointment.userData.name}</strong>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {slotDateFormat(selectedAppointment.slotDate)} at {selectedAppointment.slotTime}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closeAllModals}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleCancelConfirm}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                  </svg>
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Confirmation Modal */}
      {showRescheduleConfirmModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 text-center">
              <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Reschedule Appointment?
              </h3>
              <p className="text-gray-600 mb-2">
                Do you want to reschedule the appointment with <strong>{selectedAppointment.userData.name}</strong>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Current: {slotDateFormat(selectedAppointment.slotDate)} at {selectedAppointment.slotTime}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closeAllModals}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleConfirm}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                  </svg>
                  Select New Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal - Slot Selection */}
      {showRescheduleModal && selectedAppointment && profileData && (
        <RescheduleModal
          appointment={selectedAppointment}
          doctorData={profileData}
          onClose={closeAllModals}
          onSlotConfirmed={handleSlotSelected}
        />
      )}

      {/* Reason Modal - For Cancel/Reschedule */}
      {showReasonModal && selectedAppointment && (
        <ReasonModal
          type={actionType}
          appointment={selectedAppointment}
          newSlotData={actionType === 'reschedule' ? newSlotData : null}
          onClose={closeAllModals}
          onSubmit={actionType === 'cancel' ? handleCancelSubmit : handleRescheduleSubmit}
          isProcessing={isProcessing}
          slotDateFormat={slotDateFormat}
        />
      )}

    </div>
  )
}

export default DoctorAppointments