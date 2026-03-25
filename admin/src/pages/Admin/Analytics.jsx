import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    BarChart, Bar,
    LineChart, Line
} from 'recharts'
import { exportToPDF, exportToExcel } from '../../utils/exportUtils'
import getProfileImage from '../../utils/getProfileImage'

const Analytics = () => {

    const navigate = useNavigate()
    const { aToken, analyticsData, analyticsLoading, getAnalyticsData, doctors, getAllDoctors } = useContext(AdminContext)
    const { slotDateFormat, currency } = useContext(AppContext)

    const [period, setPeriod] = useState('30d')
    const [specificDate, setSpecificDate] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [selectedDoctor, setSelectedDoctor] = useState('all')
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        if (aToken) {
            getAllDoctors()
        }
    }, [aToken])

    useEffect(() => {
        if (aToken) {
            const options = { period, doctorId: selectedDoctor }
            if (specificDate) options.specificDate = specificDate
            if (fromDate) options.fromDate = fromDate
            if (toDate) options.toDate = toDate
            getAnalyticsData(options)
        }
    }, [aToken, period, specificDate, fromDate, toDate, selectedDoctor])

    // Date filter helpers
    const hasDateFilter = fromDate || toDate
    const clearDateRange = () => { setFromDate(''); setToDate('') }
    const clearSpecificDate = () => setSpecificDate('')
    const handlePeriodChange = (p) => { setPeriod(p); setSpecificDate(''); setFromDate(''); setToDate('') }
    const handleSpecificDateChange = (val) => { setSpecificDate(val); if (val) { setFromDate(''); setToDate(''); setPeriod('custom') } }
    const handleFromDateChange = (val) => { setFromDate(val); if (val) { setSpecificDate(''); setPeriod('custom') } }
    const handleToDateChange = (val) => { setToDate(val); if (val) { setSpecificDate(''); setPeriod('custom') } }

    // Colors
    const COLORS = {
        primary: '#5F6FFF',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        purple: '#8B5CF6',
        pink: '#EC4899',
        teal: '#14B8A6'
    }

    const PIE_COLORS = [COLORS.success, COLORS.info, COLORS.danger, COLORS.warning, COLORS.purple]
    const SPECIALITY_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.purple, COLORS.pink, COLORS.teal, COLORS.info]

    // Handle Export
    const handleExport = async (type) => {
        if (!analyticsData) {
            toast.error('No data to export')
            return
        }

        setExporting(true)
        try {
            if (type === 'pdf') {
                await exportToPDF(analyticsData, period)
                toast.success('PDF exported successfully!')
            } else {
                await exportToExcel(analyticsData, period)
                toast.success('Excel exported successfully!')
            }
        } catch (error) {
            console.error('Export error:', error)
            toast.error(`Failed to export ${type.toUpperCase()}. Please try again.`)
        }
        setExporting(false)
    }

    // Get status badge
    const getStatusBadge = (status) => {
        const config = {
            confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
            completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
            expired: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Expired' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' }
        }
        const { bg, text, label } = config[status] || config.pending
        return (
            <span className={`${bg} ${text} px-2 py-1 rounded-full text-xs font-semibold`}>
                {label}
            </span>
        )
    }

    // Custom Tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className='bg-white p-3 rounded-lg shadow-lg border border-gray-200'>
                    <p className='text-sm font-semibold text-gray-800'>{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className='text-sm' style={{ color: entry.color }}>
                            {entry.name}: {entry.name === 'revenue' ? currency : ''}{entry.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    // Loading state
    if (analyticsLoading && !analyticsData) {
        return (
            <div className='w-full max-w-7xl m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-500'>Loading analytics...</p>
                </div>
            </div>
        )
    }

    if (!analyticsData) {
        return (
            <div className='w-full max-w-7xl m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <p className='text-gray-500'>No analytics data available</p>
                </div>
            </div>
        )
    }

    const { overviewStats, statusDistribution, appointmentsOverTime, revenueOverTime, doctorsBySpeciality, topDoctors, patientRegistrations, recentAppointments, revenueByDoctor } = analyticsData

    // Prepare pie chart data
    const statusPieData = [
        { name: 'Confirmed', value: statusDistribution.confirmed },
        { name: 'Completed', value: statusDistribution.completed },
        { name: 'Cancelled', value: statusDistribution.cancelled },
        { name: 'Expired', value: statusDistribution.expired },
        { name: 'Pending', value: statusDistribution.pending }
    ].filter(item => item.value > 0)

    return (
        <div className='w-full max-w-7xl m-5'>

            {/* Header */}
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-3'>
                        <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center'>
                            <svg className='w-6 h-6 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                            </svg>
                        </div>
                        Analytics Dashboard
                    </h1>
                    <p className='text-gray-500 mt-1'>Comprehensive overview of your hospital management system</p>
                </div>

                <div className='flex flex-wrap items-center gap-3'>
                    {/* Period Filter */}
                    <div className='flex items-center bg-white rounded-xl border border-gray-200 p-1'>
                        {[
                            { key: '7d', label: '7 Days' },
                            { key: '30d', label: '30 Days' },
                            { key: '6m', label: '6 Months' },
                            { key: '1y', label: '1 Year' },
                            { key: 'all', label: 'All Time' }
                        ].map(p => (
                            <button
                                key={p.key}
                                onClick={() => handlePeriodChange(p.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p.key
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Export Buttons */}
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={() => handleExport('excel')}
                            disabled={exporting}
                            className='flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-all disabled:opacity-50'
                        >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                            </svg>
                            Excel
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            disabled={exporting}
                            className='flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-50'
                        >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                            </svg>
                            PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Date Filters & Doctor Filter Row */}
            <div className='bg-white rounded-xl shadow-sm p-4 mb-6'>
                <div className='flex flex-wrap items-center gap-3'>
                    {/* Doctor Filter */}
                    <span className='text-sm font-medium text-gray-500 flex items-center gap-1'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z' />
                        </svg>
                        Doctor:
                    </span>
                    <select
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white min-w-[180px]'
                    >
                        <option value='all'>All Doctors</option>
                        {doctors && doctors.map(doc => (
                            <option key={doc._id} value={doc._id}>Dr. {doc.name} — {doc.speciality}</option>
                        ))}
                    </select>
                    {selectedDoctor !== 'all' && (
                        <button onClick={() => setSelectedDoctor('all')} className='flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all border border-red-200'>
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' /></svg>
                            Clear
                        </button>
                    )}

                    <div className='w-px h-8 bg-gray-200 mx-1'></div>

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
                        onChange={(e) => handleSpecificDateChange(e.target.value)}
                        className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${specificDate ? 'border-primary bg-primary/5' : 'border-gray-300'
                            }`}
                    />
                    {specificDate && (
                        <button onClick={clearSpecificDate} className='flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all border border-red-200'>
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
                    <input type='date' value={fromDate} onChange={(e) => handleFromDateChange(e.target.value)} className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' />
                    <span className='text-gray-400 text-sm'>to</span>
                    <input type='date' value={toDate} min={fromDate} onChange={(e) => handleToDateChange(e.target.value)} className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' />
                    {hasDateFilter && (
                        <button onClick={clearDateRange} className='flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all border border-red-200'>
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' /></svg>
                            Clear
                        </button>
                    )}

                    {/* Active filter indicator */}
                    {(specificDate || hasDateFilter || selectedDoctor !== 'all') && (
                        <span className='ml-auto text-xs text-primary bg-primary/10 px-3 py-1 rounded-full font-medium'>
                            {selectedDoctor !== 'all' ? 'Doctor + ' : ''}{(specificDate || hasDateFilter) ? 'Custom date filter active' : 'Doctor filter active'}
                        </span>
                    )}
                </div>
            </div>

            {/* Overview Stats Cards */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6'>
                {/* Total Doctors */}
                <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all'>
                    <div className='flex items-center justify-between mb-3'>
                        <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                            <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                        </div>
                    </div>
                    <p className='text-2xl font-bold text-gray-800'>{overviewStats.totalDoctors}</p>
                    <p className='text-sm text-gray-500'>Total Doctors</p>
                    <p className='text-xs text-green-600 mt-1'>{overviewStats.availableDoctors} available</p>
                </div>

                {/* Total Patients */}
                <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all'>
                    <div className='flex items-center justify-between mb-3'>
                        <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center'>
                            <svg className='w-6 h-6 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                            </svg>
                        </div>
                    </div>
                    <p className='text-2xl font-bold text-gray-800'>{overviewStats.totalPatients}</p>
                    <p className='text-sm text-gray-500'>Total Patients</p>
                </div>

                {/* Total Appointments */}
                <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all'>
                    <div className='flex items-center justify-between mb-3'>
                        <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center'>
                            <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                        </div>
                    </div>
                    <p className='text-2xl font-bold text-gray-800'>{overviewStats.totalAppointments}</p>
                    <p className='text-sm text-gray-500'>Total Appointments</p>
                </div>

                {/* Total Revenue */}
                <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all'>
                    <div className='flex items-center justify-between mb-3'>
                        <div className='w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center'>
                            <svg className='w-6 h-6 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                        </div>
                    </div>
                    <p className='text-2xl font-bold text-gray-800'>{currency}{overviewStats.totalRevenue.toLocaleString()}</p>
                    <p className='text-sm text-gray-500'>Total Revenue</p>
                </div>

                {/* Today's Appointments */}
                <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all'>
                    <div className='flex items-center justify-between mb-3'>
                        <div className='w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center'>
                            <svg className='w-6 h-6 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                        </div>
                    </div>
                    <p className='text-2xl font-bold text-gray-800'>{overviewStats.todaysAppointments}</p>
                    <p className='text-sm text-gray-500'>Today's Appts</p>
                </div>

                {/* This Month */}
                <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all'>
                    <div className='flex items-center justify-between mb-3'>
                        <div className='w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center'>
                            <svg className='w-6 h-6 text-pink-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                            </svg>
                        </div>
                    </div>
                    <p className='text-2xl font-bold text-gray-800'>{overviewStats.thisMonthAppointments}</p>
                    <p className='text-sm text-gray-500'>This Month</p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                {/* Appointments Over Time */}
                <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' />
                        </svg>
                        Appointments Over Time
                    </h3>
                    <div className='h-72'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <AreaChart data={appointmentsOverTime}>
                                <defs>
                                    <linearGradient id='colorTotal' x1='0' y1='0' x2='0' y2='1'>
                                        <stop offset='5%' stopColor={COLORS.primary} stopOpacity={0.3} />
                                        <stop offset='95%' stopColor={COLORS.primary} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id='colorCompleted' x1='0' y1='0' x2='0' y2='1'>
                                        <stop offset='5%' stopColor={COLORS.success} stopOpacity={0.3} />
                                        <stop offset='95%' stopColor={COLORS.success} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                                <XAxis dataKey='date' tick={{ fontSize: 12 }} stroke='#9CA3AF' />
                                <YAxis tick={{ fontSize: 12 }} stroke='#9CA3AF' />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area type='monotone' dataKey='total' name='Total' stroke={COLORS.primary} fillOpacity={1} fill='url(#colorTotal)' strokeWidth={2} />
                                <Area type='monotone' dataKey='completed' name='Completed' stroke={COLORS.success} fillOpacity={1} fill='url(#colorCompleted)' strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Appointment Status Distribution */}
                <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' />
                        </svg>
                        Appointment Status
                    </h3>
                    <div className='h-72'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <PieChart>
                                <Pie
                                    data={statusPieData}
                                    cx='50%'
                                    cy='50%'
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey='value'
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {statusPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                {/* Revenue Trend */}
                <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-yellow-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        Revenue Trend
                    </h3>
                    <div className='h-72'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <LineChart data={revenueOverTime}>
                                <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                                <XAxis dataKey='date' tick={{ fontSize: 12 }} stroke='#9CA3AF' />
                                <YAxis tick={{ fontSize: 12 }} stroke='#9CA3AF' />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type='monotone' dataKey='revenue' name='Revenue' stroke={COLORS.warning} strokeWidth={3} dot={{ fill: COLORS.warning, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Doctors by Speciality */}
                <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-purple-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
                        </svg>
                        Doctors by Speciality
                    </h3>
                    <div className='h-72'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <PieChart>
                                <Pie
                                    data={doctorsBySpeciality}
                                    cx='50%'
                                    cy='50%'
                                    outerRadius={100}
                                    dataKey='value'
                                    label={({ name, value }) => `${name}: ${value}`}
                                    labelLine={true}
                                >
                                    {doctorsBySpeciality.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={SPECIALITY_COLORS[index % SPECIALITY_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 3 */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                {/* Top Doctors */}
                <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' />
                        </svg>
                        Top 5 Doctors
                    </h3>
                    <div className='space-y-3'>
                        {topDoctors.map((doctor, index) => (
                            <div key={index} className='flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer' onClick={() => navigate(`/doctor-details/${doctor.id}`)}>
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'}`}>
                                    {index + 1}
                                </span>
                                {/* Doctor image — no fallback needed, doctors always have images */}
                                <img src={doctor.image} alt={doctor.name} className='w-10 h-10 rounded-full object-cover border-2 border-white shadow' />
                                <div className='flex-1 min-w-0'>
                                    <p className='font-semibold text-gray-800 truncate'>{doctor.name}</p>
                                    <p className='text-xs text-gray-500'>{doctor.speciality}</p>
                                </div>
                                <div className='text-right'>
                                    <p className='font-bold text-primary'>{doctor.completedAppointments}</p>
                                    <p className='text-xs text-gray-500'>appointments</p>
                                </div>
                            </div>
                        ))}
                        {topDoctors.length === 0 && (
                            <p className='text-gray-500 text-center py-8'>No data available</p>
                        )}
                    </div>
                </div>

                {/* Revenue by Doctor */}
                <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                        </svg>
                        Revenue by Doctor (Top 5)
                    </h3>
                    <div className='h-64'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={revenueByDoctor} layout='vertical'>
                                <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                                <XAxis type='number' tick={{ fontSize: 12 }} stroke='#9CA3AF' />
                                <YAxis dataKey='name' type='category' tick={{ fontSize: 11 }} stroke='#9CA3AF' width={100} />
                                <Tooltip formatter={(value) => [`${currency}${value.toLocaleString()}`, 'Revenue']} />
                                <Bar dataKey='revenue' fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Patient Registrations */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6'>
                <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                    <svg className='w-5 h-5 text-purple-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' />
                    </svg>
                    New Patient Registrations
                </h3>
                <div className='h-64'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={patientRegistrations}>
                            <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                            <XAxis dataKey='date' tick={{ fontSize: 12 }} stroke='#9CA3AF' />
                            <YAxis tick={{ fontSize: 12 }} stroke='#9CA3AF' />
                            <Tooltip />
                            <Bar dataKey='count' name='New Patients' fill={COLORS.purple} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Appointments Table */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                    <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                    </svg>
                    Recent Appointments
                </h3>
                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead>
                            <tr className='bg-gray-50'>
                                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>Patient</th>
                                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>Doctor</th>
                                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>Date & Time</th>
                                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>Amount</th>
                                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>Status</th>
                                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>Action</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100'>
                            {recentAppointments.map((apt, index) => (
                                <tr key={index} className='hover:bg-gray-50'>
                                    <td className='px-4 py-3'>
                                        <div className='flex items-center gap-3'>
                                            {/* ✅ Patient image with fallback */}
                                            <img src={getProfileImage(apt.patientImage)} alt={apt.patientName} className='w-8 h-8 rounded-full object-cover' />
                                            <span className='font-medium text-gray-800'>{apt.patientName}</span>
                                        </div>
                                    </td>
                                    <td className='px-4 py-3'>
                                        <div className='flex items-center gap-3'>
                                            {/* Doctor image — no fallback needed */}
                                            <img src={apt.doctorImage} alt={apt.doctorName} className='w-8 h-8 rounded-full object-cover bg-primary/10' />
                                            <div>
                                                <p className='font-medium text-gray-800'>{apt.doctorName}</p>
                                                <p className='text-xs text-gray-500'>{apt.speciality}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='px-4 py-3'>
                                        <p className='text-sm text-gray-800'>{slotDateFormat(apt.date)}</p>
                                        <p className='text-xs text-gray-500'>{apt.time}</p>
                                    </td>
                                    <td className='px-4 py-3 font-semibold text-gray-800'>{currency}{apt.amount}</td>
                                    <td className='px-4 py-3'>{getStatusBadge(apt.status)}</td>
                                    <td className='px-4 py-3'>
                                        <button
                                            onClick={() => navigate(`/admin-appointment-details/${apt.id}`)}
                                            className='text-primary hover:text-primary/80 font-medium text-sm'
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {recentAppointments.length === 0 && (
                        <p className='text-gray-500 text-center py-8'>No recent appointments</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Analytics