import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import getProfileImage from '../../utils/getProfileImage'

const DoctorAppointmentsPage = () => {

    const { docId } = useParams()
    const navigate = useNavigate()

    const { aToken, getDoctorById } = useContext(AdminContext)
    const { slotDateFormat, currency } = useContext(AppContext)

    const [doctor, setDoctor] = useState(null)
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)

    const [activeFilter, setActiveFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [specificDate, setSpecificDate] = useState('')

    // Fetch doctor data and appointments
    useEffect(() => {
        if (aToken && docId) {
            loadDoctorData()
        }
    }, [aToken, docId])

    const loadDoctorData = async () => {
        setLoading(true)
        const data = await getDoctorById(docId)
        if (data) {
            setDoctor(data.doctor)
            setAppointments(data.appointments || [])
        }
        setLoading(false)
    }

    // Calculate stats
    const getStats = () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const todayStr = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`

        return {
            total: appointments.length,
            today: appointments.filter(apt => apt.slotDate === todayStr && apt.status === 'confirmed').length,
            upcoming: appointments.filter(apt => {
                if (apt.status !== 'confirmed') return false
                const [day, month, year] = apt.slotDate.split('_').map(Number)
                const aptDate = new Date(year, month - 1, day)
                aptDate.setHours(0, 0, 0, 0)
                return aptDate >= today
            }).length,
            completed: appointments.filter(apt => apt.status === 'completed').length,
            cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
            expired: appointments.filter(apt => apt.status === 'expired').length
        }
    }

    const parseSlotDate = (slotDate) => {
        const [day, month, year] = slotDate.split('_').map(Number)
        return new Date(year, month - 1, day)
    }

    // Filter appointments
    const getFilteredAppointments = () => {
        let filtered = [...appointments].reverse()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Main status filter buttons (All, Today, Upcoming)
        switch (activeFilter) {
            case 'today':
                filtered = filtered.filter(apt => {
                    const aptDate = parseSlotDate(apt.slotDate)
                    aptDate.setHours(0, 0, 0, 0)
                    return aptDate.getTime() === today.getTime() && apt.status === 'confirmed'
                }); break
            case 'upcoming':
                filtered = filtered.filter(apt => {
                    const aptDate = parseSlotDate(apt.slotDate)
                    aptDate.setHours(0, 0, 0, 0)
                    return aptDate.getTime() >= today.getTime() && apt.status === 'confirmed'
                }); break
            default: break
        }

        // Dropdown status filter (completed, cancelled, expired)
        if (activeFilter === 'all' && statusFilter !== 'all') {
            filtered = filtered.filter(apt => apt.status === statusFilter)
        }

        // Specific date filter
        if (specificDate) {
            const target = new Date(specificDate)
            target.setHours(0, 0, 0, 0)
            filtered = filtered.filter(apt => {
                const aptDate = parseSlotDate(apt.slotDate)
                aptDate.setHours(0, 0, 0, 0)
                return aptDate.getTime() === target.getTime()
            })
        }

        // Date range filter
        if (fromDate) {
            const from = new Date(fromDate)
            from.setHours(0, 0, 0, 0)
            filtered = filtered.filter(apt => parseSlotDate(apt.slotDate) >= from)
        }
        if (toDate) {
            const to = new Date(toDate)
            to.setHours(23, 59, 59, 999)
            filtered = filtered.filter(apt => parseSlotDate(apt.slotDate) <= to)
        }

        if (searchTerm.trim()) {
            filtered = filtered.filter(apt =>
                apt.userData?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.userData?.email?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        return filtered
    }

    // Get status badge
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
            expired: {
                bg: 'bg-orange-100',
                text: 'text-orange-700',
                label: 'Expired',
                icon: (
                    <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
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

    const stats = getStats()
    const filteredAppointments = getFilteredAppointments()

    const hasDateFilter = fromDate || toDate
    const clearDateFilter = () => { setFromDate(''); setToDate('') }
    const clearSpecificDate = () => setSpecificDate('')

    // Loading state
    if (loading) {
        return (
            <div className='w-full max-w-6xl m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-500'>Loading appointments...</p>
                </div>
            </div>
        )
    }

    // Not found state
    if (!doctor) {
        return (
            <div className='w-full max-w-6xl m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                    </div>
                    <h3 className='text-xl font-semibold text-gray-700 mb-2'>Doctor Not Found</h3>
                    <button
                        onClick={() => navigate('/doctor-list')}
                        className='text-primary font-medium hover:underline flex items-center gap-1 justify-center'
                    >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                        </svg>
                        Back to Doctors List
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='w-full max-w-6xl m-5'>

            {/* Back Button */}
            <button
                onClick={() => navigate(`/doctor-details/${docId}`)}
                className='flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-all group'
            >
                <svg className='w-5 h-5 group-hover:-translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                </svg>
                <span className='font-medium'>Back to Doctor Details</span>
            </button>

            {/* Doctor Header Card */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'>
                <div className='p-6 bg-gradient-to-r from-primary/5 to-blue-50'>
                    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6'>
                        <img
                            src={doctor.image}
                            alt={doctor.name}
                            className='w-20 h-20 rounded-xl object-cover border-4 border-white shadow-md bg-primary/10'
                        />
                        <div className='flex-1'>
                            <h1 className='text-2xl font-bold text-gray-800 mb-1'>{doctor.name}</h1>
                            <p className='text-primary font-medium mb-2'>{doctor.speciality}</p>
                            <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
                                <span className='flex items-center gap-1'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                    </svg>
                                    {doctor.email}
                                </span>
                                <span className='flex items-center gap-1'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                    {currency}{doctor.fees}
                                </span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className='flex flex-wrap items-center gap-3'>
                            <div className='text-center px-4 py-2 bg-white rounded-xl shadow-sm'>
                                <p className='text-2xl font-bold text-gray-800'>{stats.total}</p>
                                <p className='text-xs text-gray-500'>Total</p>
                            </div>
                            <div className='text-center px-4 py-2 bg-white rounded-xl shadow-sm'>
                                <p className='text-2xl font-bold text-yellow-600'>{stats.today}</p>
                                <p className='text-xs text-gray-500'>Today</p>
                            </div>
                            <div className='text-center px-4 py-2 bg-white rounded-xl shadow-sm'>
                                <p className='text-2xl font-bold text-green-600'>{stats.upcoming}</p>
                                <p className='text-xs text-gray-500'>Upcoming</p>
                            </div>
                            <div className='text-center px-4 py-2 bg-white rounded-xl shadow-sm'>
                                <p className='text-2xl font-bold text-blue-600'>{stats.completed}</p>
                                <p className='text-xs text-gray-500'>Completed</p>
                            </div>
                            <div className='text-center px-4 py-2 bg-white rounded-xl shadow-sm'>
                                <p className='text-2xl font-bold text-red-600'>{stats.cancelled}</p>
                                <p className='text-xs text-gray-500'>Cancelled</p>
                            </div>
                            <div className='text-center px-4 py-2 bg-white rounded-xl shadow-sm'>
                                <p className='text-2xl font-bold text-yellow-500'>{stats.expired}</p>
                                <p className='text-xs text-gray-500'>Expired</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Title */}
                <div className='px-6 py-4 border-t border-gray-100'>
                    <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        All Appointments
                    </h2>
                </div>
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
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                                    ${activeFilter === filter.key
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
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
                                placeholder='Search patient...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full lg:w-48 xl:w-72 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm'
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
                            className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${specificDate ? 'border-primary bg-primary/5' : 'border-gray-300'
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

            {/* Appointments Count Optional Text */}
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
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                    </div>
                    <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Appointments Found</h3>
                    <p className='text-gray-500'>No appointments match the selected filter</p>
                </div>
            ) : (
                <div className='space-y-3'>
                    {filteredAppointments.map((appointment, index) => (
                        <div key={index} className='bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all'>
                            <div className='flex flex-col sm:flex-row items-start gap-4'>

                                {/* Patient Image */}
                                <img
                                    src={getProfileImage(appointment.userData?.image)}
                                    alt={appointment.userData?.name}
                                    className='w-16 h-16 rounded-xl object-cover border-2 border-gray-100'
                                />

                                {/* Appointment Info */}
                                <div className='flex-1 min-w-0'>
                                    <div className='flex flex-wrap items-start justify-between gap-2 mb-2'>
                                        <div>
                                            <h3 className='text-lg font-bold text-gray-800'>{appointment.userData?.name}</h3>
                                            <p className='text-sm text-gray-500'>{appointment.userData?.email}</p>
                                        </div>
                                        {getStatusBadge(appointment.status)}
                                    </div>

                                    <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
                                        <span className='flex items-center gap-1'>
                                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                            </svg>
                                            {slotDateFormat(appointment.slotDate)}
                                        </span>
                                        <span className='flex items-center gap-1'>
                                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                            </svg>
                                            {appointment.slotTime}
                                        </span>
                                        <span className='flex items-center gap-1 font-semibold text-gray-800'>
                                            {currency}{appointment.amount}
                                        </span>
                                    </div>

                                    {/* Cancellation Info */}
                                    {appointment.status === 'cancelled' && appointment.cancelReason && (
                                        <div className='mt-3 p-2 bg-red-50 rounded-lg border border-red-100'>
                                            <p className='text-xs text-red-600'>
                                                <span className='font-medium'>Cancelled by {appointment.cancelledBy}: </span>
                                                {appointment.cancelReason}
                                            </p>
                                        </div>
                                    )}

                                    {/* Reschedule Info */}
                                    {appointment.rescheduleReason && (
                                        <div className='mt-3 p-2 bg-orange-50 rounded-lg border border-orange-100'>
                                            <p className='text-xs text-orange-600'>
                                                <span className='font-medium'>Rescheduled by {appointment.rescheduledBy}: </span>
                                                {appointment.rescheduleReason}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* View Details Button */}
                                <button
                                    onClick={() => navigate(`/admin-appointment-details/${appointment._id}`)}
                                    className='flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-all'
                                >
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                                    </svg>
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}

export default DoctorAppointmentsPage