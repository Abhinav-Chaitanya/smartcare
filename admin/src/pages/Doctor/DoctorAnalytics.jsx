import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    BarChart, Bar,
    LineChart, Line
} from 'recharts'
import { exportDoctorToPDF, exportDoctorToExcel } from '../../utils/doctorExportUtils'

const DoctorAnalytics = () => {

    const navigate = useNavigate()
    const { dToken, analyticsData, analyticsLoading, getAnalyticsData } = useContext(DoctorContext)
    const { slotDateFormat, currency } = useContext(AppContext)

    const [period, setPeriod] = useState('30d')
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        if (dToken) {
            getAnalyticsData(period)
        }
    }, [dToken, period])

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
    const PATIENT_COLORS = [COLORS.primary, COLORS.success]

    // Handle Export
    const handleExport = async (type) => {
        if (!analyticsData) {
            toast.error('No data to export')
            return
        }

        setExporting(true)
        try {
            if (type === 'pdf') {
                await exportDoctorToPDF(analyticsData, period)
                toast.success('PDF exported successfully!')
            } else {
                await exportDoctorToExcel(analyticsData, period)
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

    const {
        doctorInfo,
        overviewStats,
        statusDistribution,
        appointmentsOverTime,
        revenueOverTime,
        busiestDays,
        popularTimeSlots,
        patientTypeDistribution,
        upcomingAppointments,
        recentAppointments,
        frequentPatients
    } = analyticsData

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
                        My Analytics
                    </h1>
                    <p className='text-gray-500 mt-1'>Track your performance and appointment statistics</p>
                </div>

                <div className='flex flex-wrap items-center gap-3'>
                    {/* Period Filter */}
                    <div className='flex items-center bg-white rounded-xl border border-gray-200 p-1'>
                        {[
                            { key: '7d', label: '7D' },
                            { key: '30d', label: '30D' },
                            { key: '6m', label: '6M' },
                            { key: '1y', label: '1Y' },
                            { key: 'all', label: 'All' }
                        ].map(p => (
                            <button
                                key={p.key}
                                onClick={() => setPeriod(p.key)}
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

            {/* Overview Stats Cards */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6'>
                {/* Total Appointments */}
                <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all'>
                    <div className='flex items-center justify-between mb-3'>
                        <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                            <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                        </div>
                    </div>
                    <p className='text-2xl font-bold text-gray-800'>{overviewStats.totalAppointments}</p>
                    <p className='text-sm text-gray-500'>Total Appointments</p>
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

                {/* Total Revenue */}
                <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all'>
                    <div className='flex items-center justify-between mb-3'>
                        <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center'>
                            <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
                    <p className='text-sm text-gray-500'>Today</p>
                </div>

                {/* This Week */}
                <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all'>
                    <div className='flex items-center justify-between mb-3'>
                        <div className='w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center'>
                            <svg className='w-6 h-6 text-pink-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                            </svg>
                        </div>
                    </div>
                    <p className='text-2xl font-bold text-gray-800'>{overviewStats.thisWeekAppointments}</p>
                    <p className='text-sm text-gray-500'>This Week</p>
                </div>

                {/* Completion Rate */}
                <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all'>
                    <div className='flex items-center justify-between mb-3'>
                        <div className='w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center'>
                            <svg className='w-6 h-6 text-teal-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                        </div>
                    </div>
                    <p className='text-2xl font-bold text-gray-800'>{overviewStats.completionRate}%</p>
                    <p className='text-sm text-gray-500'>Completion Rate</p>
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
                        <svg className='w-5 h-5 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
                                <Line type='monotone' dataKey='revenue' name='Revenue' stroke={COLORS.success} strokeWidth={3} dot={{ fill: COLORS.success, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Busiest Days */}
                <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-orange-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        Busiest Days
                    </h3>
                    <div className='h-72'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={busiestDays}>
                                <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                                <XAxis dataKey='day' tick={{ fontSize: 12 }} stroke='#9CA3AF' />
                                <YAxis tick={{ fontSize: 12 }} stroke='#9CA3AF' />
                                <Tooltip />
                                <Bar dataKey='appointments' name='Appointments' fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 3 */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                {/* Popular Time Slots */}
                <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-purple-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        Popular Time Slots
                    </h3>
                    <div className='h-72'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={popularTimeSlots} layout='vertical'>
                                <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                                <XAxis type='number' tick={{ fontSize: 12 }} stroke='#9CA3AF' />
                                <YAxis dataKey='time' type='category' tick={{ fontSize: 11 }} stroke='#9CA3AF' width={70} />
                                <Tooltip />
                                <Bar dataKey='appointments' name='Appointments' fill={COLORS.purple} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* New vs Returning Patients */}
                <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-teal-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                        </svg>
                        Patient Type
                    </h3>
                    <div className='h-72'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <PieChart>
                                <Pie
                                    data={patientTypeDistribution}
                                    cx='50%'
                                    cy='50%'
                                    outerRadius={100}
                                    dataKey='value'
                                    label={({ name, value }) => `${name}: ${value}`}
                                    labelLine={true}
                                >
                                    {patientTypeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PATIENT_COLORS[index % PATIENT_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Frequent Patients */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6'>
                <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                    <svg className='w-5 h-5 text-yellow-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
                    </svg>
                    Frequent Patients
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
                    {frequentPatients.map((patient, index) => (
                        <div key={index} className='flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all'>
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'}`}>
                                {index + 1}
                            </span>
                            <img src={patient.image} alt={patient.name} className='w-10 h-10 rounded-full object-cover border-2 border-white shadow' />
                            <div className='flex-1 min-w-0'>
                                <p className='font-semibold text-gray-800 text-sm truncate'>{patient.name}</p>
                                <p className='text-xs text-gray-500'>{patient.count} visits</p>
                            </div>
                        </div>
                    ))}
                    {frequentPatients.length === 0 && (
                        <p className='text-gray-500 col-span-5 text-center py-4'>No patient data available</p>
                    )}
                </div>
            </div>

            {/* Tables Row */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                {/* Upcoming Appointments */}
                <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        Upcoming Appointments
                    </h3>
                    <div className='space-y-3 max-h-80 overflow-y-auto'>
                        {upcomingAppointments.map((apt, index) => (
                            <div key={index} className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all'>
                                <img src={apt.patientImage} alt={apt.patientName} className='w-10 h-10 rounded-full object-cover border-2 border-white shadow' />
                                <div className='flex-1 min-w-0'>
                                    <p className='font-semibold text-gray-800 text-sm truncate'>{apt.patientName}</p>
                                    <p className='text-xs text-gray-500'>{slotDateFormat(apt.date)} • {apt.time}</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    {getStatusBadge(apt.status)}
                                    <button
                                        onClick={() => navigate(`/appointment-details/${apt.id}`)}
                                        className='flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-all'
                                    >
                                        <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                                        </svg>
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                        {upcomingAppointments.length === 0 && (
                            <p className='text-gray-500 text-center py-8'>No upcoming appointments</p>
                        )}
                    </div>
                </div>

                {/* Recent Appointments */}
                <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        Recent Appointments
                    </h3>
                    <div className='space-y-3 max-h-80 overflow-y-auto'>
                        {recentAppointments.map((apt, index) => (
                            <div key={index} className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all'>
                                <img src={apt.patientImage} alt={apt.patientName} className='w-10 h-10 rounded-full object-cover border-2 border-white shadow' />
                                <div className='flex-1 min-w-0'>
                                    <p className='font-semibold text-gray-800 text-sm truncate'>{apt.patientName}</p>
                                    <p className='text-xs text-gray-500'>{slotDateFormat(apt.date)} • {apt.time}</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    {getStatusBadge(apt.status)}
                                    <button
                                        onClick={() => navigate(`/appointment-details/${apt.id}`)}
                                        className='flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-all'
                                    >
                                        <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                                        </svg>
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                        {recentAppointments.length === 0 && (
                            <p className='text-gray-500 text-center py-8'>No recent appointments</p>
                        )}
                    </div>
                </div>
            </div>

        </div>
    )
}

export default DoctorAnalytics