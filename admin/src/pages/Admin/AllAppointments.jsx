/*import React from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../../../frontend/src/assets/assets'

const AllAppointments = () => {

  const {aToken, appointments, getAllAppointments, cancelAppointment} = useContext(AdminContext)

  const {calculateAge, slotDateFormat, currency} = useContext(AppContext)

  useEffect(()=>{
    if(aToken){
      getAllAppointments()
    }
  },[aToken])

  return (
    <div className='w-full max-w-6xl m-5'>

      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll'>

        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b'>

          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fee</p>
          <p>Actions</p>

        </div>

        {appointments.map((item,index)=>(
          <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-100' key={index}>
            <p className='max-sm:hidden'>{index+1}</p>
            <div className='flex items-center gap-2'>
              <img className='w-8 rounded-full' src={item.userData.image} alt="" /> <p>{item.userData.name}</p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
             <div className='flex items-center gap-2'>
              <img className='w-8 rounded-full bg-primary' src={item.docData.image} alt="" /> <p>{item.docData.name}</p>
            </div>
            <p>{currency}{item.amount}</p>
            {item.status === 'cancelled' ? <p className='text-red-500 text-xs font-medium'>Cancelled</p> : <img onClick={()=>cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" /> }
            
          </div>
        ))}
      </div>
    </div>
  )
}

export default AllAppointments  */


import React, { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import RescheduleModal from '../../components/RescheduleModal'
import ReasonModal from '../../components/ReasonModal'
import { useNavigate } from 'react-router-dom'

const AllAppointments = () => {

  const location = useLocation()
  const navigate = useNavigate()

  const { aToken, appointments, getAllAppointments, doctors, getAllDoctors, cancelAppointmentWithReason, rescheduleAppointment } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)

  // Filter state
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedDoctor, setSelectedDoctor] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Modal states
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
    if (aToken) {
      getAllAppointments()
      getAllDoctors()
    }
  }, [aToken])

  useEffect(() => {
    if (location.state?.filter) {
      setActiveFilter(location.state.filter)
    }
  }, [location.state])

  // Filter appointments
  const getFilteredAppointments = () => {
    let filtered = [...appointments].reverse()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Apply status filter
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
      case 'completed':
        filtered = filtered.filter(apt => apt.status === 'completed')
        break
      case 'cancelled':
        filtered = filtered.filter(apt => apt.status === 'cancelled')
        break
      default:
        break
    }

    // Apply doctor filter
    if (selectedDoctor !== 'all') {
      filtered = filtered.filter(apt => apt.docId === selectedDoctor)
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(apt =>
        apt.userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.userData.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const filteredAppointments = getFilteredAppointments()

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
      expired: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Expired' },  // NEW
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' }
    }

    const { bg, text, label } = config[status] || config.pending

    return (
      <span className={`${bg} ${text} px-3 py-1 rounded-full text-xs font-bold w-fit`}>
        {label}
      </span>
    )
  }

  // Get cancelled/rescheduled by text
  const getActionByText = (by) => {
    switch (by) {
      case 'doctor': return 'by Doctor'
      case 'admin': return 'by Admin'
      case 'patient': return 'by Patient'
      default: return ''
    }
  }

  // ==================== ACTION HANDLERS ====================

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
    const success = await cancelAppointmentWithReason(selectedAppointment._id, reason)
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

  // Close all modals
  const closeAllModals = () => {
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
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>All Appointments</h1>
        <p className='text-gray-500 text-sm mt-1'>Manage and track all appointments across doctors</p>
      </div>

      {/* Filters & Search */}
      <div className='bg-white rounded-xl shadow-sm p-4 mb-6'>
        <div className='flex flex-col gap-4'>

          {/* Row 1: Status Filter Tabs */}
          <div className='flex flex-wrap gap-2'>
            {[
              { key: 'all', label: 'All' },
              { key: 'today', label: 'Today' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                                    ${activeFilter === filter.key
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Row 2: Doctor Filter & Search */}
          <div className='flex flex-col lg:flex-row gap-4 justify-between'>

            {/* Doctor Filter */}
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium text-gray-600'>Doctor:</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white'
              >
                <option value="all">All Doctors</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className='relative'>
              <input
                type='text'
                placeholder='Search patient name or email...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full lg:w-72 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
              />
              <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Count */}
      <div className='mb-4'>
        <p className='text-sm text-gray-500'>
          Showing <span className='font-semibold text-gray-700'>{filteredAppointments.length}</span> appointments
        </p>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
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
                    src={item.userData.image}
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
                      <p className='text-sm text-gray-500'>{item.userData.email}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Info Grid */}
                  <div className='flex flex-wrap items-center gap-6 mb-4'>
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
                    <div>
                      <p className='text-xs text-gray-400 uppercase font-medium'>Doctor</p>
                      <div className='flex items-center gap-2 mt-1'>
                        <img
                          className='w-6 h-6 rounded-full object-cover'
                          src={item.docData.image}
                          alt={item.docData.name}
                        />
                        <p className='text-sm font-semibold text-primary'>
                          {item.docData.name}
                        </p>
                      </div>
                    </div>
                    <div className='flex-1'></div>

                    {/*<button
                      onClick={() => {
                        console.log('View details:', item._id)
                      }}
                      className='flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-all'
                    >
                      View Details
                    </button>*/}

                    <button
                      onClick={() => navigate(`/admin-appointment-details/${item._id}`)}
                      className='flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-all'
                    >
                      View Details
                    </button>
                  </div>



                  {/* Cancellation Reason */}
                  {item.cancelReason && item.status === 'cancelled' && (
                    <div className='bg-red-50 border border-red-100 rounded-lg p-3 mb-3'>
                      <p className='text-xs text-red-600 font-medium'>
                        Cancellation Reason ({getActionByText(item.cancelledBy)}):
                      </p>
                      <p className='text-sm text-red-700 mt-1'>{item.cancelReason}</p>
                    </div>
                  )}

                  {/* Reschedule Reason */}
                  {item.rescheduleReason && item.previousSlotDate && (
                    <div className='bg-orange-50 border border-orange-100 rounded-lg p-3 mb-3'>
                      <p className='text-xs text-orange-600 font-medium'>
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
              <p className="text-sm text-gray-500 mb-2">
                Doctor: Dr. {selectedAppointment.docData.name}
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
              <p className="text-sm text-gray-500 mb-2">
                Doctor: Dr. {selectedAppointment.docData.name}
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

      {/* Reschedule Modal - Slot Selection 
            {showRescheduleModal && selectedAppointment && (
                <RescheduleModal
                    appointment={selectedAppointment}
                    doctorData={selectedAppointment.docData}
                    onClose={closeAllModals}
                    onSlotConfirmed={handleSlotSelected}
                />
            )}  */}

      {/* Reschedule Modal - Slot Selection */}
      {showRescheduleModal && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          doctorData={doctors.find(d => d._id === selectedAppointment.docId) || selectedAppointment.docData}
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

export default AllAppointments