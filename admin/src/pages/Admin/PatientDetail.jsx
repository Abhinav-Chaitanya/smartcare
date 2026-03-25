import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import getProfileImage from '../../utils/getProfileImage'

const PatientDetail = () => {

    const { patientId } = useParams()
    const navigate = useNavigate()

    const { aToken, getPatientById } = useContext(AdminContext)
    const { slotDateFormat, currency } = useContext(AppContext)

    const [patient, setPatient] = useState(null)
    const [appointments, setAppointments] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('details')
    const [activeFilter, setActiveFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [specificDate, setSpecificDate] = useState('')

    useEffect(() => {
        if (aToken && patientId) {
            loadPatientData()
        }
    }, [aToken, patientId])

    const loadPatientData = async () => {
        setLoading(true)
        const data = await getPatientById(patientId)
        if (data) {
            setPatient(data.patient)
            setAppointments(data.appointments)
            setStats(data.stats)
        }
        setLoading(false)
    }

    const parseSlotDate = (slotDate) => {
        const [day, month, year] = slotDate.split('_').map(Number)
        return new Date(year, month - 1, day)
    }

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

        return filtered
    }

    const calculateAge = (dob) => {
        if (!dob || dob === 'Not Selected') return 'N/A'
        const today = new Date()
        const birthDate = new Date(dob)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
        return age + ' years'
    }

    const getStatusBadge = (status) => {
        const config = {
            confirmed: {
                bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed',
                icon: (<svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M5 13l4 4L19 7' /></svg>)
            },
            completed: {
                bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed',
                icon: (<svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M5 13l4 4L19 7' /></svg>)
            },
            cancelled: {
                bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled',
                icon: (<svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' /></svg>)
            },
            expired: {
                bg: 'bg-orange-100', text: 'text-orange-700', label: 'Expired',
                icon: (<svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>)
            }
        }
        const { bg, text, label, icon } = config[status] || config.confirmed
        return (
            <span className={`${bg} ${text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit`}>
                {icon}{label}
            </span>
        )
    }

    const filteredAppointments = getFilteredAppointments()

    const hasDateFilter = fromDate || toDate
    const clearDateFilter = () => { setFromDate(''); setToDate('') }
    const clearSpecificDate = () => setSpecificDate('')

    if (loading) {
        return (
            <div className='w-full max-w-6xl m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <div className='w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-500'>Loading patient details...</p>
                </div>
            </div>
        )
    }

    if (!patient) {
        return (
            <div className='w-full max-w-6xl m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                    </div>
                    <h3 className='text-xl font-semibold text-gray-700 mb-2'>Patient Not Found</h3>
                    <button onClick={() => navigate('/patients-list')} className='text-purple-600 font-medium hover:underline flex items-center gap-1 justify-center'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' /></svg>
                        Back to Patients List
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='w-full max-w-6xl m-5'>

            {/* Back Button */}
            <button onClick={() => navigate('/patients-list')} className='flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-all group'>
                <svg className='w-5 h-5 group-hover:-translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                </svg>
                <span className='font-medium'>Back to Patients List</span>
            </button>

            {/* Patient Header Card */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'>
                <div className='p-6 bg-gradient-to-r from-purple-50 to-blue-50'>
                    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6'>
                        <img
                            src={getProfileImage(patient.image)}
                            alt={patient.name}
                            className='w-24 h-24 rounded-xl object-cover border-4 border-white shadow-md'
                        />
                        <div className='flex-1'>
                            <h1 className='text-2xl font-bold text-gray-800 mb-2'>{patient.name}</h1>
                            <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
                                <span className='flex items-center gap-1'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                    </svg>
                                    {patient.email}
                                </span>
                                <span className='flex items-center gap-1'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                    </svg>
                                    {patient.phone}
                                </span>
                            </div>
                        </div>

                        {/* Stats */}
                        {stats && (
                            <div className='flex items-center gap-3'>
                                <div className='text-center px-4 py-2 bg-white rounded-xl shadow-sm'>
                                    <p className='text-2xl font-bold text-gray-800'>{stats.total}</p>
                                    <p className='text-xs text-gray-500'>Total</p>
                                </div>
                                <div className='text-center px-4 py-2 bg-white rounded-xl shadow-sm'>
                                    <p className='text-2xl font-bold text-green-600'>{stats.completed}</p>
                                    <p className='text-xs text-gray-500'>Completed</p>
                                </div>
                                <div className='text-center px-4 py-2 bg-white rounded-xl shadow-sm'>
                                    <p className='text-2xl font-bold text-blue-600'>{stats.confirmed}</p>
                                    <p className='text-xs text-gray-500'>Upcoming</p>
                                </div>
                                <div className='text-center px-4 py-2 bg-white rounded-xl shadow-sm'>
                                    <p className='text-2xl font-bold text-red-600'>{stats.cancelled}</p>
                                    <p className='text-xs text-gray-500'>Cancelled</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className='border-b border-gray-200'>
                    <div className='flex'>
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                                activeTab === 'details'
                                    ? 'border-purple-500 text-purple-600 bg-purple-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <span className='flex items-center justify-center gap-2'>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                </svg>
                                Patient Details
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('appointments')}
                            className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                                activeTab === 'appointments'
                                    ? 'border-purple-500 text-purple-600 bg-purple-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <span className='flex items-center justify-center gap-2'>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                </svg>
                                Appointments ({stats?.total || 0})
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' ? (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
                    <h2 className='text-lg font-bold text-gray-800 mb-6 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                        </svg>
                        Personal Information
                    </h2>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-4'>
                            <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-xl'>
                                <svg className='w-5 h-5 text-gray-400 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' /></svg>
                                <div>
                                    <p className='text-xs text-gray-400 uppercase font-medium'>Full Name</p>
                                    <p className='text-sm font-semibold text-gray-800'>{patient.name}</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-xl'>
                                <svg className='w-5 h-5 text-gray-400 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' /></svg>
                                <div>
                                    <p className='text-xs text-gray-400 uppercase font-medium'>Email Address</p>
                                    <p className='text-sm font-semibold text-gray-800'>{patient.email}</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-xl'>
                                <svg className='w-5 h-5 text-gray-400 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' /></svg>
                                <div>
                                    <p className='text-xs text-gray-400 uppercase font-medium'>Phone Number</p>
                                    <p className='text-sm font-semibold text-gray-800'>{patient.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-4'>
                            <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-xl'>
                                <svg className='w-5 h-5 text-gray-400 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg>
                                <div>
                                    <p className='text-xs text-gray-400 uppercase font-medium'>Date of Birth</p>
                                    <p className='text-sm font-semibold text-gray-800'>
                                        {patient.dob !== 'Not Selected' ? patient.dob : 'Not Provided'}
                                        {patient.dob !== 'Not Selected' && (
                                            <span className='text-gray-500 font-normal ml-2'>({calculateAge(patient.dob)})</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-xl'>
                                <svg className='w-5 h-5 text-gray-400 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' /></svg>
                                <div>
                                    <p className='text-xs text-gray-400 uppercase font-medium'>Gender</p>
                                    <p className='text-sm font-semibold text-gray-800 capitalize'>
                                        {patient.gender !== 'Not Selected' ? patient.gender : 'Not Provided'}
                                    </p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-xl'>
                                <svg className='w-5 h-5 text-gray-400 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
                                <div>
                                    <p className='text-xs text-gray-400 uppercase font-medium'>Address</p>
                                    <p className='text-sm font-semibold text-gray-800'>
                                        {patient.address?.line1 || patient.address?.line2
                                            ? `${patient.address?.line1 || ''} ${patient.address?.line2 || ''}`.trim()
                                            : 'Not Provided'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Appointments Tab */
                <div className='space-y-4'>
                    {/* Filters & Search */}
                    <div className='bg-white rounded-xl shadow-sm p-4 mb-6'>
                        <div className='flex flex-col gap-4'>

                            {/* Row 1: Status buttons + dropdown */}
                            <div className='flex flex-wrap items-center gap-2'>
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'today', label: 'Today' },
                                    { key: 'upcoming', label: 'Upcoming' },
                                ].map(filter => (
                                    <button
                                        key={filter.key}
                                        onClick={() => { setActiveFilter(filter.key); if (filter.key !== 'all') setStatusFilter('all') }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            activeFilter === filter.key
                                                ? 'bg-purple-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}

                                <div className='w-px h-8 bg-gray-200 mx-1'></div>

                                {/* Status dropdown */}
                                <div className='relative'>
                                    <select
                                        value={activeFilter === 'all' ? statusFilter : 'all'}
                                        onChange={(e) => {
                                            setActiveFilter('all')
                                            setStatusFilter(e.target.value)
                                        }}
                                        disabled={activeFilter !== 'all'}
                                        className={`pl-4 pr-8 py-2 rounded-lg text-sm font-medium border transition-all appearance-none cursor-pointer ${
                                            activeFilter === 'all' && statusFilter !== 'all'
                                                ? 'bg-purple-600 text-white border-purple-600 shadow-md'
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
                                    className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${specificDate ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}`}
                                />
                                {specificDate && (
                                    <button
                                        onClick={clearSpecificDate}
                                        className='flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all border border-red-200'
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' /></svg>
                                        Clear
                                    </button>
                                )}

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
                                    className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500'
                                />
                                <span className='text-gray-400 text-sm'>to</span>
                                <input
                                    type='date'
                                    value={toDate}
                                    min={fromDate}
                                    onChange={(e) => { setToDate(e.target.value); if (e.target.value) setSpecificDate('') }}
                                    className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500'
                                />
                                {hasDateFilter && (
                                    <button
                                        onClick={clearDateFilter}
                                        className='flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all border border-red-200'
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' /></svg>
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Appointments Count Optional Text */}
                    <div className='mb-4 text-sm text-gray-500'>
                        Showing <span className='font-semibold text-gray-700'>{filteredAppointments.length}</span> appointments
                        {specificDate && (
                            <span className='text-purple-600 ml-1'>
                                for {new Date(specificDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        )}
                        {hasDateFilter && fromDate && toDate && (
                            <span className='text-purple-600 ml-1'>
                                from {new Date(fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} to {new Date(toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        )}
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

                                        {/* Doctor Image */}
                                        <img
                                            src={appointment.docData?.image}
                                            alt={appointment.docData?.name}
                                            className='w-16 h-16 rounded-xl object-cover border-2 border-gray-100 bg-primary/10'
                                        />

                                        {/* Appointment Info */}
                                        <div className='flex-1 min-w-0'>
                                            <div className='flex flex-wrap items-start justify-between gap-2 mb-2'>
                                                <div>
                                                    <h3 className='text-lg font-bold text-gray-800'>{appointment.docData?.name}</h3>
                                                    <p className='text-sm text-purple-600 font-medium'>{appointment.docData?.speciality}</p>
                                                </div>
                                                {getStatusBadge(appointment.status)}
                                            </div>

                                            <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
                                                <span className='flex items-center gap-1'>
                                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg>
                                                    {slotDateFormat(appointment.slotDate)}
                                                </span>
                                                <span className='flex items-center gap-1'>
                                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
                                                    {appointment.slotTime}
                                                </span>
                                                <span className='flex items-center gap-1 font-semibold text-gray-800'>
                                                    {currency}{appointment.amount}
                                                </span>
                                            </div>

                                            {appointment.status === 'cancelled' && appointment.cancelReason && (
                                                <div className='mt-3 p-2 bg-red-50 rounded-lg border border-red-100'>
                                                    <p className='text-xs text-red-600'>
                                                        <span className='font-medium'>Cancelled by {appointment.cancelledBy}: </span>
                                                        {appointment.cancelReason}
                                                    </p>
                                                </div>
                                            )}

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
                                            className='flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-all'
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
            )}
        </div>
    )
}

export default PatientDetail