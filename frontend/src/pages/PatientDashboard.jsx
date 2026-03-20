import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const PatientDashboard = () => {

    const { token, userData, appointments, getUserAppointments, slotDateFormat } = useContext(AppContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (token) {
            getUserAppointments()
        }
    }, [token])

    // Get today's date string for comparison
    const getTodayString = () => {
        const today = new Date()
        return `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`
    }

    // Filter appointments for this patient only
    const myAppointments = appointments || []

    const todayAppointments = myAppointments.filter(apt => {
        return apt.slotDate === getTodayString() && apt.status === 'confirmed'
    })

    const upcomingAppointments = myAppointments.filter(apt => {
        const [day, month, year] = apt.slotDate.split('_')
        const aptDate = new Date(year, month - 1, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return aptDate > today && apt.status === 'confirmed'
    }).slice(0, 5)

    const recentActivity = myAppointments.filter(apt => {
        return apt.status === 'completed' || apt.status === 'cancelled'
    }).slice(0, 6)

    // Counts
    const todayCount = todayAppointments.length
    const upcomingCount = myAppointments.filter(apt => {
        const [day, month, year] = apt.slotDate.split('_')
        const aptDate = new Date(year, month - 1, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return aptDate > today && apt.status === 'confirmed'
    }).length

    // Get status badge
    const getStatusBadge = (status) => {
        const config = {
            confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
            completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
            expired: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Expired' }
        }
        const { bg, text, label } = config[status] || config.pending
        return (
            <span className={`${bg} ${text} px-3 py-1.5 rounded-full text-xs font-semibold`}>
                {label}
            </span>
        )
    }

    // Get relative date text
    const getRelativeDate = (slotDate) => {
        const [day, month, year] = slotDate.split('_')
        const aptDate = new Date(year, month - 1, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        if (aptDate.getTime() === today.getTime()) {
            return 'Today'
        } else if (aptDate.getTime() === tomorrow.getTime()) {
            return 'Tomorrow'
        } else {
            return slotDateFormat(slotDate)
        }
    }

    // Navigate to appointments page with filter
    const navigateToAppointments = (filter) => {
        navigate('/my-appointments', { state: { filter } })
    }

    // Loading state
    if (!userData) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-500 text-sm'>Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='w-full max-w-[1200px] mx-auto p-6'>

            {/* Welcome Section */}
            <div className='mb-6'>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>
                    Welcome back, {userData?.name?.split(' ')[0] || 'Patient'}
                </h1>
                <p className='text-gray-500 mt-1'>Here's an overview of your appointments.</p>
            </div>

            {/* Stats Cards - Only 2 Cards (Same style as Admin Dashboard) */}
            <div className='flex flex-wrap gap-4 mb-8'>

                {/* Today's Appointments Card */}
                <div
                    onClick={() => navigateToAppointments('today')}
                    className='bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl px-5 py-4 text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all cursor-pointer hover:-translate-y-0.5 group flex items-center gap-4'
                >
                    <div className='w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                    </div>
                    <div>
                        <p className='text-2xl font-bold'>{todayCount}</p>
                        <p className='text-orange-100 text-sm'>Today's Appointments</p>
                    </div>
                    <svg className='w-5 h-5 text-white/50 group-hover:text-white/80 ml-2 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                    </svg>
                </div>

                {/* Upcoming Appointments Card */}
                <div
                    onClick={() => navigateToAppointments('upcoming')}
                    className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl px-5 py-4 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer hover:-translate-y-0.5 group flex items-center gap-4'
                >
                    <div className='w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                    </div>
                    <div>
                        <p className='text-2xl font-bold'>{upcomingCount}</p>
                        <p className='text-blue-100 text-sm'>Upcoming Appointments</p>
                    </div>
                    <svg className='w-5 h-5 text-white/50 group-hover:text-white/80 ml-2 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                    </svg>
                </div>

            </div>

            {/* Today's & Upcoming Appointments - Side by Side */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>

                {/* Today's Appointments Section */}
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
                    <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white'>
                        <div className='flex items-center gap-3'>
                            <div className='w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center'>
                                <svg className='w-4 h-4 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                </svg>
                            </div>
                            <div>
                                <h2 className='font-bold text-gray-800'>Today's Appointments</h2>
                                <p className='text-xs text-gray-500'>{todayCount} scheduled for today</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigateToAppointments('today')}
                            className='text-primary text-sm font-semibold hover:underline flex items-center gap-1'
                        >
                            View All
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                            </svg>
                        </button>
                    </div>

                    <div className='divide-y divide-gray-50 max-h-[320px] overflow-y-auto'>
                        {todayAppointments.length === 0 ? (
                            <div className='p-8 text-center'>
                                <div className='w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                                    <svg className='w-7 h-7 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                    </svg>
                                </div>
                                <p className='text-gray-600 font-medium'>No appointments for today</p>
                                <p className='text-gray-400 text-sm mt-1'>Enjoy your free day!</p>
                            </div>
                        ) : (
                            todayAppointments.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigate('/my-appointments')}
                                    className='flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-all group'
                                >
                                    <img
                                        className='w-11 h-11 rounded-full object-cover border-2 border-gray-100 bg-primary'
                                        src={item.docData?.image}
                                        alt={item.docData?.name}
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='font-semibold text-gray-800 truncate'>Dr. {item.docData?.name}</p>
                                        <p className='text-sm text-gray-500'>{item.slotTime}</p>
                                        <p className='text-xs text-primary font-medium truncate'>{item.docData?.speciality}</p>
                                    </div>
                                    {getStatusBadge(item.status)}
                                    <svg className='w-4 h-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                                    </svg>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Upcoming Appointments Section */}
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
                    <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white'>
                        <div className='flex items-center gap-3'>
                            <div className='w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center'>
                                <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                </svg>
                            </div>
                            <div>
                                <h2 className='font-bold text-gray-800'>Upcoming Appointments</h2>
                                <p className='text-xs text-gray-500'>{upcomingCount} scheduled</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigateToAppointments('upcoming')}
                            className='text-primary text-sm font-semibold hover:underline flex items-center gap-1'
                        >
                            View All
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                            </svg>
                        </button>
                    </div>

                    <div className='divide-y divide-gray-50 max-h-[320px] overflow-y-auto'>
                        {upcomingAppointments.length === 0 ? (
                            <div className='p-8 text-center'>
                                <div className='w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                                    <svg className='w-7 h-7 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                </div>
                                <p className='text-gray-600 font-medium'>No upcoming appointments</p>
                                <button
                                    onClick={() => navigate('/doctors')}
                                    className='text-primary text-sm mt-2 hover:underline'
                                >
                                    Book an appointment
                                </button>
                            </div>
                        ) : (
                            upcomingAppointments.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigate('/my-appointments')}
                                    className='flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-all group'
                                >
                                    <img
                                        className='w-11 h-11 rounded-full object-cover border-2 border-gray-100 bg-primary'
                                        src={item.docData?.image}
                                        alt={item.docData?.name}
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='font-semibold text-gray-800 truncate'>Dr. {item.docData?.name}</p>
                                        <p className='text-sm text-gray-500'>{getRelativeDate(item.slotDate)} at {item.slotTime}</p>
                                        <p className='text-xs text-primary font-medium truncate'>{item.docData?.speciality}</p>
                                    </div>
                                    {getStatusBadge(item.status)}
                                    <svg className='w-4 h-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                                    </svg>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* Recent Activity Section */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
                <div className='flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white'>
                    <div className='flex items-center gap-4'>
                        <div className='w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center'>
                            <svg className='w-5 h-5 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                            </svg>
                        </div>
                        <div>
                            <h2 className='font-bold text-gray-800 text-lg'>Recent Activity</h2>
                            <p className='text-sm text-gray-500'>Your completed and cancelled appointments</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigateToAppointments('all')}
                        className='text-primary text-sm font-semibold hover:underline flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/5 transition-all'
                    >
                        View All
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                        </svg>
                    </button>
                </div>

                {recentActivity.length === 0 ? (
                    <div className='p-12 text-center'>
                        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                            </svg>
                        </div>
                        <p className='text-gray-600 font-medium'>No recent activity</p>
                        <p className='text-gray-400 text-sm mt-1'>Your appointment history will appear here</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6'>
                        {recentActivity.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => navigate('/my-appointments')}
                                className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md group
                                    ${item.status === 'completed'
                                        ? 'bg-green-50/50 border-green-200 hover:border-green-400'
                                        : 'bg-red-50/50 border-red-200 hover:border-red-400'
                                    }`}
                            >
                                <div className='flex items-center gap-4 mb-3'>
                                    <img
                                        className='w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm bg-primary'
                                        src={item.docData?.image}
                                        alt={item.docData?.name}
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='font-semibold text-gray-800 truncate'>Dr. {item.docData?.name}</p>
                                        <p className='text-sm text-gray-500'>{slotDateFormat(item.slotDate)}</p>
                                    </div>
                                </div>
                                <p className='text-xs text-gray-600 mb-3'>{item.docData?.speciality}</p>
                                <div className='flex items-center justify-between'>
                                    {getStatusBadge(item.status)}
                                    <span className='text-sm text-gray-400 group-hover:text-primary transition-colors flex items-center gap-1'>
                                        View
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className='mt-8 bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl p-6 border border-primary/10'>
                <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center'>
                            <svg className='w-6 h-6 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 10V3L4 14h7v7l9-11h-7z' />
                            </svg>
                        </div>
                        <div>
                            <h3 className='font-bold text-gray-800'>Quick Actions</h3>
                            <p className='text-sm text-gray-500'>Book a new appointment or manage existing ones</p>
                        </div>
                    </div>
                    <div className='flex flex-wrap gap-3'>
                        <button
                            onClick={() => navigate('/doctors')}
                            className='px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                            </svg>
                            Book Appointment
                        </button>
                        <button
                            onClick={() => navigateToAppointments('all')}
                            className='px-5 py-2.5 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200 flex items-center gap-2'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                            My Appointments
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default PatientDashboard