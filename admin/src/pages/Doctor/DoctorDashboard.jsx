/*import React from 'react'
import { useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { useEffect } from 'react'
import { assets } from '../../../../frontend/src/assets/assets'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {

  const { dToken, dashData, setDashData, getDashData, completeAppointment, cancelAppointment, getAppointments } = useContext(DoctorContext)

  const { currency, slotDateFormat } = useContext(AppContext)

  useEffect(() => {

    if (dToken) {
      getDashData()
      getAppointments()

    }

  }, [dToken])


  return dashData && (
    <div className='m-5'>

      <div className='flex flex-wrap gap-3'>

        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.earning_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{currency} {dashData.earnings}</p>
            <p className='text-gray-400'>Earnings</p>
          </div>
        </div>


        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>


        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
            <p className='text-gray-400'>Patients</p>
          </div>
        </div>

      </div>



      <div className='bg-white'>
        <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold'>Latest Bookings</p>
        </div>
      </div>


      <div className='p-4 border border-t-0'>
        {
          dashData.latestAppointments.map((item, index) => (
            <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key={index}>
              <img className='rounded-full w-10' src={item.userData.image} alt="" />
              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                <p className='text-gray-600'>{slotDateFormat(item.slotDate)}</p>
              </div>
              {
                item.status === 'completed'
                  ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                  : item.status === 'cancelled'
                    ? <p className='text-red-500 text-xs font-medium'>Cancelled</p>
                    : <div className='flex'>

                      <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                      <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                    </div>
              }




            </div>



          ))
        }

      </div>





    </div>
  )
}

export default DoctorDashboard  */



/*import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {

    const { dToken, dashData, getDashData, appointments, getAppointments, profileData, getProfileData } = useContext(DoctorContext)
    const { currency, slotDateFormat } = useContext(AppContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (dToken) {
            getDashData()
            getAppointments()
            getProfileData()
        }
    }, [dToken])

    // Get today's date string for comparison
    const getTodayString = () => {
        const today = new Date()
        return `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`
    }

    // Filter appointments
    const todayAppointments = appointments.filter(apt => {
        return apt.slotDate === getTodayString() && apt.status === 'confirmed'
    })

    const upcomingAppointments = appointments.filter(apt => {
        const [day, month, year] = apt.slotDate.split('_')
        const aptDate = new Date(year, month - 1, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return aptDate > today && apt.status === 'confirmed'
    }).slice(0, 5)

    const recentActivity = appointments.filter(apt => {
        return apt.status === 'completed' || apt.status === 'cancelled'
    }).slice(0, 5)

    // Calculate additional stats
    const completedCount = appointments.filter(apt => apt.status === 'completed').length
    const cancelledCount = appointments.filter(apt => apt.status === 'cancelled').length
    const todayCount = todayAppointments.length

    // Get status badge
    const getStatusBadge = (status) => {
        const config = {
            confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed', icon: '✓' },
            completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed', icon: '✔' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: '✕' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: '⏳' },
            expired: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Expired', icon: '⏱' }
        }
        const { bg, text, label, icon } = config[status] || config.pending
        return (
            <span className={`${bg} ${text} px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}>
                <span>{icon}</span>
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

    // Loading state
    if (!dashData) {
        return (
            <div className='m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-500'>Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='m-5 max-w-7xl'>

            
            <div className='mb-8'>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>
                    Welcome back, Dr. {profileData?.name?.split(' ')[1] || 'Doctor'} 👋
                </h1>
                <p className='text-gray-500 mt-1'>Here's what's happening with your appointments today.</p>
            </div>

            
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
                
               
                <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all cursor-pointer hover:-translate-y-1'>
                    <div className='flex items-center justify-between mb-3'>
                        <span className='text-3xl'>💰</span>
                        <span className='bg-white/20 px-2 py-1 rounded-lg text-xs font-medium'>Total</span>
                    </div>
                    <p className='text-2xl font-bold'>{currency}{dashData.earnings}</p>
                    <p className='text-green-100 text-sm mt-1'>Earnings</p>
                </div>

                
                <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all cursor-pointer hover:-translate-y-1'>
                    <div className='flex items-center justify-between mb-3'>
                        <span className='text-3xl'>📅</span>
                        <span className='bg-white/20 px-2 py-1 rounded-lg text-xs font-medium'>All Time</span>
                    </div>
                    <p className='text-2xl font-bold'>{dashData.appointments}</p>
                    <p className='text-blue-100 text-sm mt-1'>Appointments</p>
                </div>

             
                <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all cursor-pointer hover:-translate-y-1'>
                    <div className='flex items-center justify-between mb-3'>
                        <span className='text-3xl'>👥</span>
                        <span className='bg-white/20 px-2 py-1 rounded-lg text-xs font-medium'>Unique</span>
                    </div>
                    <p className='text-2xl font-bold'>{dashData.patients}</p>
                    <p className='text-purple-100 text-sm mt-1'>Patients</p>
                </div>

                <div className='bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all cursor-pointer hover:-translate-y-1'>
                    <div className='flex items-center justify-between mb-3'>
                        <span className='text-3xl'>📆</span>
                        <span className='bg-white/20 px-2 py-1 rounded-lg text-xs font-medium'>Today</span>
                    </div>
                    <p className='text-2xl font-bold'>{todayCount}</p>
                    <p className='text-orange-100 text-sm mt-1'>Today's Slots</p>
                </div>

            
                <div className='bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 transition-all cursor-pointer hover:-translate-y-1'>
                    <div className='flex items-center justify-between mb-3'>
                        <span className='text-3xl'>✅</span>
                        <span className='bg-white/20 px-2 py-1 rounded-lg text-xs font-medium'>Done</span>
                    </div>
                    <p className='text-2xl font-bold'>{completedCount}</p>
                    <p className='text-teal-100 text-sm mt-1'>Completed</p>
                </div>

           
                <div className='bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all cursor-pointer hover:-translate-y-1'>
                    <div className='flex items-center justify-between mb-3'>
                        <span className='text-3xl'>❌</span>
                        <span className='bg-white/20 px-2 py-1 rounded-lg text-xs font-medium'>Total</span>
                    </div>
                    <p className='text-2xl font-bold'>{cancelledCount}</p>
                    <p className='text-red-100 text-sm mt-1'>Cancelled</p>
                </div>

            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>

                
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white'>
                        <div className='flex items-center gap-3'>
                            <span className='text-2xl'>📆</span>
                            <div>
                                <h2 className='font-bold text-gray-800'>Today's Appointments</h2>
                                <p className='text-xs text-gray-500'>{todayCount} appointments scheduled</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/doctor-appointments')}
                            className='text-primary text-sm font-semibold hover:underline flex items-center gap-1'
                        >
                            View All
                            <span>→</span>
                        </button>
                    </div>

                    <div className='divide-y divide-gray-50'>
                        {todayAppointments.length === 0 ? (
                            <div className='p-8 text-center'>
                                <span className='text-4xl mb-3 block'>🎉</span>
                                <p className='text-gray-500'>No appointments for today!</p>
                                <p className='text-gray-400 text-sm'>Enjoy your free time</p>
                            </div>
                        ) : (
                            todayAppointments.slice(0, 4).map((item, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => navigate('/doctor-appointments')}
                                    className='flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-all group'
                                >
                                    <img 
                                        className='w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md' 
                                        src={item.userData.image} 
                                        alt={item.userData.name} 
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='font-semibold text-gray-800 truncate'>{item.userData.name}</p>
                                        <p className='text-sm text-gray-500'>⏰ {item.slotTime}</p>
                                    </div>
                                    {getStatusBadge(item.status)}
                                    <span className='text-gray-300 group-hover:text-primary transition-colors'>→</span>
                                </div>
                            ))
                        )}
                    </div>

                    {todayAppointments.length > 4 && (
                        <div className='px-6 py-3 bg-gray-50 border-t border-gray-100'>
                            <button 
                                onClick={() => navigate('/doctor-appointments')}
                                className='text-sm text-primary font-medium hover:underline'
                            >
                                +{todayAppointments.length - 4} more appointments
                            </button>
                        </div>
                    )}
                </div>

               
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white'>
                        <div className='flex items-center gap-3'>
                            <span className='text-2xl'>🗓️</span>
                            <div>
                                <h2 className='font-bold text-gray-800'>Upcoming Appointments</h2>
                                <p className='text-xs text-gray-500'>Next {upcomingAppointments.length} scheduled</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/doctor-appointments')}
                            className='text-primary text-sm font-semibold hover:underline flex items-center gap-1'
                        >
                            View All
                            <span>→</span>
                        </button>
                    </div>

                    <div className='divide-y divide-gray-50'>
                        {upcomingAppointments.length === 0 ? (
                            <div className='p-8 text-center'>
                                <span className='text-4xl mb-3 block'>📭</span>
                                <p className='text-gray-500'>No upcoming appointments</p>
                                <p className='text-gray-400 text-sm'>New bookings will appear here</p>
                            </div>
                        ) : (
                            upcomingAppointments.map((item, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => navigate('/doctor-appointments')}
                                    className='flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-all group'
                                >
                                    <img 
                                        className='w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md' 
                                        src={item.userData.image} 
                                        alt={item.userData.name} 
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='font-semibold text-gray-800 truncate'>{item.userData.name}</p>
                                        <p className='text-sm text-gray-500'>
                                            📅 {getRelativeDate(item.slotDate)} • ⏰ {item.slotTime}
                                        </p>
                                    </div>
                                    {getStatusBadge(item.status)}
                                    <span className='text-gray-300 group-hover:text-primary transition-colors'>→</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2'>
                    <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white'>
                        <div className='flex items-center gap-3'>
                            <span className='text-2xl'>📊</span>
                            <div>
                                <h2 className='font-bold text-gray-800'>Recent Activity</h2>
                                <p className='text-xs text-gray-500'>Completed & Cancelled appointments</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/doctor-appointments')}
                            className='text-primary text-sm font-semibold hover:underline flex items-center gap-1'
                        >
                            View All
                            <span>→</span>
                        </button>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
                        {recentActivity.length === 0 ? (
                            <div className='col-span-full p-8 text-center'>
                                <span className='text-4xl mb-3 block'>📋</span>
                                <p className='text-gray-500'>No recent activity</p>
                                <p className='text-gray-400 text-sm'>Completed/Cancelled appointments will appear here</p>
                            </div>
                        ) : (
                            recentActivity.map((item, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => navigate('/doctor-appointments')}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md group
                                        ${item.status === 'completed' 
                                            ? 'bg-green-50 border-green-100 hover:border-green-300' 
                                            : 'bg-red-50 border-red-100 hover:border-red-300'
                                        }`}
                                >
                                    <div className='flex items-center gap-3 mb-3'>
                                        <img 
                                            className='w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm' 
                                            src={item.userData.image} 
                                            alt={item.userData.name} 
                                        />
                                        <div className='flex-1 min-w-0'>
                                            <p className='font-semibold text-gray-800 truncate text-sm'>{item.userData.name}</p>
                                            <p className='text-xs text-gray-500'>{slotDateFormat(item.slotDate)}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        {getStatusBadge(item.status)}
                                        <span className='text-xs text-gray-400 group-hover:text-primary transition-colors'>
                                            View →
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

           
            <div className='mt-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/20'>
                <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                        <div className='w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center'>
                            <span className='text-3xl'>🚀</span>
                        </div>
                        <div>
                            <h3 className='font-bold text-gray-800'>Quick Actions</h3>
                            <p className='text-sm text-gray-500'>Manage your appointments efficiently</p>
                        </div>
                    </div>
                    <div className='flex gap-3'>
                        <button 
                            onClick={() => navigate('/doctor-appointments')}
                            className='px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2'
                        >
                            <span>📅</span>
                            All Appointments
                        </button>
                        <button 
                            onClick={() => navigate('/doctor-profile')}
                            className='px-5 py-2.5 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200 flex items-center gap-2'
                        >
                            <span>👤</span>
                            My Profile
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default DoctorDashboard       */



/*import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {

    const { dToken, dashData, getDashData, appointments, getAppointments, profileData, getProfileData } = useContext(DoctorContext)
    const { slotDateFormat } = useContext(AppContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (dToken) {
            getDashData()
            getAppointments()
            getProfileData()
        }
    }, [dToken])

    // Get today's date string for comparison
    const getTodayString = () => {
        const today = new Date()
        return `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`
    }

    // Filter appointments
    const todayAppointments = appointments.filter(apt => {
        return apt.slotDate === getTodayString() && apt.status === 'confirmed'
    })

    const upcomingAppointments = appointments.filter(apt => {
        const [day, month, year] = apt.slotDate.split('_')
        const aptDate = new Date(year, month - 1, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return aptDate > today && apt.status === 'confirmed'
    }).slice(0, 5)

    const recentActivity = appointments.filter(apt => {
        return apt.status === 'completed' || apt.status === 'cancelled'
    }).slice(0, 6)

    // Counts
    const todayCount = todayAppointments.length
    const upcomingCount = appointments.filter(apt => {
        const [day, month, year] = apt.slotDate.split('_')
        const aptDate = new Date(year, month - 1, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return aptDate > today && apt.status === 'confirmed'
    }).length

    // Get status badge
    const getStatusBadge = (status) => {
        const config = {
            confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed', icon: '✓' },
            completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed', icon: '✔' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: '✕' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: '⏳' },
            expired: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Expired', icon: '⏱' }
        }
        const { bg, text, label, icon } = config[status] || config.pending
        return (
            <span className={`${bg} ${text} px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}>
                <span>{icon}</span>
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
        navigate('/doctor-appointments', { state: { filter } })
    }

    // Loading state
    if (!dashData) {
        return (
            <div className='m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-500'>Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='m-5 max-w-7xl'>

            <div className='mb-8'>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>
                    Welcome back, Dr. {profileData?.name?.split(' ').slice(1).join(' ') || 'Doctor'} 👋
                </h1>
                <p className='text-gray-500 mt-1'>Here's what's happening with your appointments today.</p>
            </div>

            
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8'>

              
                <div
                    onClick={() => navigateToAppointments('today')}
                    className='bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all cursor-pointer hover:-translate-y-1 group'
                >
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='flex items-center gap-2 mb-2'>
                                <span className='text-3xl'>📆</span>
                                <span className='bg-white/20 px-2.5 py-1 rounded-lg text-xs font-medium'>Today</span>
                            </div>
                            <p className='text-4xl font-bold'>{todayCount}</p>
                            <p className='text-orange-100 text-sm mt-1'>Appointments Today</p>
                        </div>
                        <div className='text-white/50 group-hover:text-white/80 transition-colors'>
                            <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                            </svg>
                        </div>
                    </div>
                    <div className='mt-4 pt-4 border-t border-white/20'>
                        <p className='text-sm text-orange-100 flex items-center gap-2'>
                            <span>Click to view today's appointments</span>
                            <span className='group-hover:translate-x-1 transition-transform'>→</span>
                        </p>
                    </div>
                </div>

              
                <div
                    onClick={() => navigateToAppointments('upcoming')}
                    className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all cursor-pointer hover:-translate-y-1 group'
                >
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='flex items-center gap-2 mb-2'>
                                <span className='text-3xl'>🗓️</span>
                                <span className='bg-white/20 px-2.5 py-1 rounded-lg text-xs font-medium'>Upcoming</span>
                            </div>
                            <p className='text-4xl font-bold'>{upcomingCount}</p>
                            <p className='text-blue-100 text-sm mt-1'>Upcoming Appointments</p>
                        </div>
                        <div className='text-white/50 group-hover:text-white/80 transition-colors'>
                            <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                            </svg>
                        </div>
                    </div>
                    <div className='mt-4 pt-4 border-t border-white/20'>
                        <p className='text-sm text-blue-100 flex items-center gap-2'>
                            <span>Click to view upcoming appointments</span>
                            <span className='group-hover:translate-x-1 transition-transform'>→</span>
                        </p>
                    </div>
                </div>

            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>

           
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white'>
                        <div className='flex items-center gap-3'>
                            <span className='text-2xl'>📆</span>
                            <div>
                                <h2 className='font-bold text-gray-800'>Today's Appointments</h2>
                                <p className='text-xs text-gray-500'>{todayCount} appointments scheduled</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigateToAppointments('today')}
                            className='text-primary text-sm font-semibold hover:underline flex items-center gap-1'
                        >
                            View All
                            <span>→</span>
                        </button>
                    </div>

                    <div className='divide-y divide-gray-50'>
                        {todayAppointments.length === 0 ? (
                            <div className='p-8 text-center'>
                                <span className='text-4xl mb-3 block'>🎉</span>
                                <p className='text-gray-500'>No appointments for today!</p>
                                <p className='text-gray-400 text-sm'>Enjoy your free time</p>
                            </div>
                        ) : (
                            todayAppointments.slice(0, 4).map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigateToAppointments('today')}
                                    className='flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-all group'
                                >
                                    <img
                                        className='w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md'
                                        src={item.userData.image}
                                        alt={item.userData.name}
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='font-semibold text-gray-800 truncate'>{item.userData.name}</p>
                                        <p className='text-sm text-gray-500'>⏰ {item.slotTime}</p>
                                    </div>
                                    {getStatusBadge(item.status)}
                                    <span className='text-gray-300 group-hover:text-primary transition-colors'>→</span>
                                </div>
                            ))
                        )}
                    </div>

                    {todayAppointments.length > 4 && (
                        <div className='px-6 py-3 bg-gray-50 border-t border-gray-100'>
                            <button
                                onClick={() => navigateToAppointments('today')}
                                className='text-sm text-primary font-medium hover:underline'
                            >
                                +{todayAppointments.length - 4} more appointments
                            </button>
                        </div>
                    )}
                </div>

        
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white'>
                        <div className='flex items-center gap-3'>
                            <span className='text-2xl'>🗓️</span>
                            <div>
                                <h2 className='font-bold text-gray-800'>Upcoming Appointments</h2>
                                <p className='text-xs text-gray-500'>Next {upcomingAppointments.length} scheduled</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigateToAppointments('upcoming')}
                            className='text-primary text-sm font-semibold hover:underline flex items-center gap-1'
                        >
                            View All
                            <span>→</span>
                        </button>
                    </div>

                    <div className='divide-y divide-gray-50'>
                        {upcomingAppointments.length === 0 ? (
                            <div className='p-8 text-center'>
                                <span className='text-4xl mb-3 block'>📭</span>
                                <p className='text-gray-500'>No upcoming appointments</p>
                                <p className='text-gray-400 text-sm'>New bookings will appear here</p>
                            </div>
                        ) : (
                            upcomingAppointments.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigateToAppointments('upcoming')}
                                    className='flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-all group'
                                >
                                    <img
                                        className='w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md'
                                        src={item.userData.image}
                                        alt={item.userData.name}
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='font-semibold text-gray-800 truncate'>{item.userData.name}</p>
                                        <p className='text-sm text-gray-500'>
                                            📅 {getRelativeDate(item.slotDate)} • ⏰ {item.slotTime}
                                        </p>
                                    </div>
                                    {getStatusBadge(item.status)}
                                    <span className='text-gray-300 group-hover:text-primary transition-colors'>→</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2'>
                    <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white'>
                        <div className='flex items-center gap-3'>
                            <span className='text-2xl'>📊</span>
                            <div>
                                <h2 className='font-bold text-gray-800'>Recent Activity</h2>
                                <p className='text-xs text-gray-500'>Completed & Cancelled appointments</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigateToAppointments('all')}
                            className='text-primary text-sm font-semibold hover:underline flex items-center gap-1'
                        >
                            View All
                            <span>→</span>
                        </button>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
                        {recentActivity.length === 0 ? (
                            <div className='col-span-full p-8 text-center'>
                                <span className='text-4xl mb-3 block'>📋</span>
                                <p className='text-gray-500'>No recent activity</p>
                                <p className='text-gray-400 text-sm'>Completed/Cancelled appointments will appear here</p>
                            </div>
                        ) : (
                            recentActivity.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigateToAppointments(item.status)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md group
                                        ${item.status === 'completed'
                                            ? 'bg-green-50 border-green-100 hover:border-green-300'
                                            : 'bg-red-50 border-red-100 hover:border-red-300'
                                        }`}
                                >
                                    <div className='flex items-center gap-3 mb-3'>
                                        <img
                                            className='w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm'
                                            src={item.userData.image}
                                            alt={item.userData.name}
                                        />
                                        <div className='flex-1 min-w-0'>
                                            <p className='font-semibold text-gray-800 truncate text-sm'>{item.userData.name}</p>
                                            <p className='text-xs text-gray-500'>{slotDateFormat(item.slotDate)}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        {getStatusBadge(item.status)}
                                        <span className='text-xs text-gray-400 group-hover:text-primary transition-colors'>
                                            View →
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

          
            <div className='mt-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/20'>
                <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                        <div className='w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center'>
                            <span className='text-3xl'>🚀</span>
                        </div>
                        <div>
                            <h3 className='font-bold text-gray-800'>Quick Actions</h3>
                            <p className='text-sm text-gray-500'>Manage your appointments efficiently</p>
                        </div>
                    </div>
                    <div className='flex gap-3'>
                        <button
                            onClick={() => navigateToAppointments('all')}
                            className='px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2'
                        >
                            <span>📅</span>
                            All Appointments
                        </button>
                        <button
                            onClick={() => navigate('/doctor-profile')}
                            className='px-5 py-2.5 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200 flex items-center gap-2'
                        >
                            <span>👤</span>
                            My Profile
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default DoctorDashboard    */



/*import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {

    const { dToken, dashData, getDashData, appointments, getAppointments, profileData, getProfileData } = useContext(DoctorContext)
    const { slotDateFormat } = useContext(AppContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (dToken) {
            getDashData()
            getAppointments()
            getProfileData()
        }
    }, [dToken])

    // Get today's date string for comparison
    const getTodayString = () => {
        const today = new Date()
        return `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`
    }

    // Filter appointments
    const todayAppointments = appointments.filter(apt => {
        return apt.slotDate === getTodayString() && apt.status === 'confirmed'
    })

    const upcomingAppointments = appointments.filter(apt => {
        const [day, month, year] = apt.slotDate.split('_')
        const aptDate = new Date(year, month - 1, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return aptDate > today && apt.status === 'confirmed'
    }).slice(0, 5)

    const recentActivity = appointments.filter(apt => {
        return apt.status === 'completed' || apt.status === 'cancelled'
    }).slice(0, 6)

    // Counts
    const todayCount = todayAppointments.length
    const upcomingCount = appointments.filter(apt => {
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
        navigate('/doctor-appointments', { state: { filter } })
    }

    // Loading state
    if (!dashData) {
        return (
            <div className='m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-500 text-sm'>Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='w-full max-w-[1400px] mx-auto p-6'>

      
            <div className='mb-8'>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>
                    Welcome back, Dr. {profileData?.name?.split(' ').slice(1).join(' ') || 'Doctor'}
                </h1>
                <p className='text-gray-500 mt-1'>Here's what's happening with your appointments today.</p>
            </div>

       
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8'>

                <div
                    onClick={() => navigateToAppointments('today')}
                    className='bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all cursor-pointer hover:-translate-y-1 group'
                >
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='flex items-center gap-3 mb-3'>
                                <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center'>
                                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                    </svg>
                                </div>
                                <span className='bg-white/20 px-3 py-1 rounded-lg text-xs font-medium'>Today</span>
                            </div>
                            <p className='text-4xl font-bold'>{todayCount}</p>
                            <p className='text-orange-100 text-sm mt-1'>Appointments Scheduled</p>
                        </div>
                        <div className='text-white/40 group-hover:text-white/70 transition-colors'>
                            <svg className='w-10 h-10' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                            </svg>
                        </div>
                    </div>
                    <div className='mt-5 pt-4 border-t border-white/20'>
                        <p className='text-sm text-orange-100 flex items-center gap-2'>
                            <span>Click to view today's appointments</span>
                            <svg className='w-4 h-4 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 8l4 4m0 0l-4 4m4-4H3' />
                            </svg>
                        </p>
                    </div>
                </div>

        
                <div
                    onClick={() => navigateToAppointments('upcoming')}
                    className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all cursor-pointer hover:-translate-y-1 group'
                >
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='flex items-center gap-3 mb-3'>
                                <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center'>
                                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                </div>
                                <span className='bg-white/20 px-3 py-1 rounded-lg text-xs font-medium'>Upcoming</span>
                            </div>
                            <p className='text-4xl font-bold'>{upcomingCount}</p>
                            <p className='text-blue-100 text-sm mt-1'>Appointments Scheduled</p>
                        </div>
                        <div className='text-white/40 group-hover:text-white/70 transition-colors'>
                            <svg className='w-10 h-10' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                            </svg>
                        </div>
                    </div>
                    <div className='mt-5 pt-4 border-t border-white/20'>
                        <p className='text-sm text-blue-100 flex items-center gap-2'>
                            <span>Click to view upcoming appointments</span>
                            <svg className='w-4 h-4 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 8l4 4m0 0l-4 4m4-4H3' />
                            </svg>
                        </p>
                    </div>
                </div>

            </div>

            <div className='space-y-6'>

             
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
                    <div className='flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white'>
                        <div className='flex items-center gap-4'>
                            <div className='w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center'>
                                <svg className='w-5 h-5 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                </svg>
                            </div>
                            <div>
                                <h2 className='font-bold text-gray-800 text-lg'>Today's Appointments</h2>
                                <p className='text-sm text-gray-500'>{todayCount} appointments scheduled for today</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigateToAppointments('today')}
                            className='text-primary text-sm font-semibold hover:underline flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/5 transition-all'
                        >
                            View All
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                            </svg>
                        </button>
                    </div>

                    <div className='divide-y divide-gray-50'>
                        {todayAppointments.length === 0 ? (
                            <div className='p-12 text-center'>
                                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                    <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                    </svg>
                                </div>
                                <p className='text-gray-600 font-medium'>No appointments for today</p>
                                <p className='text-gray-400 text-sm mt-1'>Enjoy your free time</p>
                            </div>
                        ) : (
                            todayAppointments.slice(0, 5).map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigateToAppointments('today')}
                                    className='flex items-center gap-5 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-all group'
                                >
                                    <img
                                        className='w-14 h-14 rounded-xl object-cover border-2 border-gray-100 shadow-sm'
                                        src={item.userData.image}
                                        alt={item.userData.name}
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='font-semibold text-gray-800 text-base'>{item.userData.name}</p>
                                        <p className='text-sm text-gray-500 mt-0.5'>{item.slotTime}</p>
                                    </div>
                                    <div className='hidden sm:block text-sm text-gray-500'>
                                        {item.userData.email}
                                    </div>
                                    {getStatusBadge(item.status)}
                                    <svg className='w-5 h-5 text-gray-300 group-hover:text-primary transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                                    </svg>
                                </div>
                            ))
                        )}
                    </div>

                    {todayAppointments.length > 5 && (
                        <div className='px-6 py-4 bg-gray-50 border-t border-gray-100'>
                            <button
                                onClick={() => navigateToAppointments('today')}
                                className='text-sm text-primary font-medium hover:underline'
                            >
                                +{todayAppointments.length - 5} more appointments
                            </button>
                        </div>
                    )}
                </div>

                
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
                    <div className='flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white'>
                        <div className='flex items-center gap-4'>
                            <div className='w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center'>
                                <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                </svg>
                            </div>
                            <div>
                                <h2 className='font-bold text-gray-800 text-lg'>Upcoming Appointments</h2>
                                <p className='text-sm text-gray-500'>Next {upcomingAppointments.length} scheduled appointments</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigateToAppointments('upcoming')}
                            className='text-primary text-sm font-semibold hover:underline flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/5 transition-all'
                        >
                            View All
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                            </svg>
                        </button>
                    </div>

                    <div className='divide-y divide-gray-50'>
                        {upcomingAppointments.length === 0 ? (
                            <div className='p-12 text-center'>
                                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                    <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                </div>
                                <p className='text-gray-600 font-medium'>No upcoming appointments</p>
                                <p className='text-gray-400 text-sm mt-1'>New bookings will appear here</p>
                            </div>
                        ) : (
                            upcomingAppointments.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigateToAppointments('upcoming')}
                                    className='flex items-center gap-5 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-all group'
                                >
                                    <img
                                        className='w-14 h-14 rounded-xl object-cover border-2 border-gray-100 shadow-sm'
                                        src={item.userData.image}
                                        alt={item.userData.name}
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='font-semibold text-gray-800 text-base'>{item.userData.name}</p>
                                        <p className='text-sm text-gray-500 mt-0.5'>
                                            {getRelativeDate(item.slotDate)} at {item.slotTime}
                                        </p>
                                    </div>
                                    <div className='hidden sm:block text-sm text-gray-500'>
                                        {item.userData.email}
                                    </div>
                                    {getStatusBadge(item.status)}
                                    <svg className='w-5 h-5 text-gray-300 group-hover:text-primary transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                                    </svg>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                
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
                                <p className='text-sm text-gray-500'>Completed and cancelled appointments</p>
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
                            <p className='text-gray-400 text-sm mt-1'>Completed and cancelled appointments will appear here</p>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6'>
                            {recentActivity.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigateToAppointments(item.status)}
                                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md group
                                        ${item.status === 'completed'
                                            ? 'bg-green-50/50 border-green-200 hover:border-green-400'
                                            : 'bg-red-50/50 border-red-200 hover:border-red-400'
                                        }`}
                                >
                                    <div className='flex items-center gap-4 mb-4'>
                                        <img
                                            className='w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm'
                                            src={item.userData.image}
                                            alt={item.userData.name}
                                        />
                                        <div className='flex-1 min-w-0'>
                                            <p className='font-semibold text-gray-800 truncate'>{item.userData.name}</p>
                                            <p className='text-sm text-gray-500'>{slotDateFormat(item.slotDate)}</p>
                                        </div>
                                    </div>
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

            </div>

        
            <div className='mt-8 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200'>
                <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center'>
                            <svg className='w-6 h-6 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 10V3L4 14h7v7l9-11h-7z' />
                            </svg>
                        </div>
                        <div>
                            <h3 className='font-bold text-gray-800'>Quick Actions</h3>
                            <p className='text-sm text-gray-500'>Manage your appointments efficiently</p>
                        </div>
                    </div>
                    <div className='flex gap-3'>
                        <button
                            onClick={() => navigateToAppointments('all')}
                            className='px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                            All Appointments
                        </button>
                        <button
                            onClick={() => navigate('/doctor-profile')}
                            className='px-5 py-2.5 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200 flex items-center gap-2'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                            </svg>
                            My Profile
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default DoctorDashboard    */



import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {

    const { dToken, dashData, getDashData, appointments, getAppointments, profileData, getProfileData } = useContext(DoctorContext)
    const { slotDateFormat } = useContext(AppContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (dToken) {
            getDashData()
            getAppointments()
            getProfileData()
        }
    }, [dToken])

    // Get today's date string for comparison
    const getTodayString = () => {
        const today = new Date()
        return `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`
    }

    // Filter appointments
    const todayAppointments = appointments.filter(apt => {
        return apt.slotDate === getTodayString() && apt.status === 'confirmed'
    })

    const upcomingAppointments = appointments.filter(apt => {
        const [day, month, year] = apt.slotDate.split('_')
        const aptDate = new Date(year, month - 1, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return aptDate > today && apt.status === 'confirmed'
    }).slice(0, 5)

    const recentActivity = appointments.filter(apt => {
        return apt.status === 'completed' || apt.status === 'cancelled'
    }).slice(0, 6)

    // Counts
    const todayCount = todayAppointments.length
    const upcomingCount = appointments.filter(apt => {
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
        navigate('/doctor-appointments', { state: { filter } })
    }

    // Loading state
    if (!dashData) {
        return (
            <div className='m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-500 text-sm'>Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='w-full max-w-[1400px] mx-auto p-6'>

            {/* Welcome Section */}
            <div className='mb-6'>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>
                    Welcome back, Dr. {profileData?.name?.split(' ').slice(1).join(' ') || 'Doctor'}
                </h1>
                <p className='text-gray-500 mt-1'>Here's what's happening with your appointments today.</p>
            </div>

            {/* Stats Cards - Smaller Size */}
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
                                <p className='text-xs text-gray-500'>{todayCount} scheduled</p>
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
                                <p className='text-gray-400 text-sm mt-1'>Enjoy your free time</p>
                            </div>
                        ) : (
                            todayAppointments.slice(0, 5).map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigateToAppointments('today')}
                                    className='flex items-center gap-4 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-all group'
                                >
                                    <img
                                        className='w-11 h-11 rounded-full object-cover border-2 border-gray-100'
                                        src={item.userData.image}
                                        alt={item.userData.name}
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='font-semibold text-gray-800 truncate'>{item.userData.name}</p>
                                        <p className='text-sm text-gray-500'>{item.slotTime}</p>
                                    </div>
                                    {getStatusBadge(item.status)}
                                    <svg className='w-4 h-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                                    </svg>
                                </div>
                            ))
                        )}
                    </div>

                    {todayAppointments.length > 5 && (
                        <div className='px-5 py-3 bg-gray-50 border-t border-gray-100'>
                            <button
                                onClick={() => navigateToAppointments('today')}
                                className='text-sm text-primary font-medium hover:underline'
                            >
                                +{todayAppointments.length - 5} more appointments
                            </button>
                        </div>
                    )}
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
                                <p className='text-xs text-gray-500'>{upcomingAppointments.length} scheduled</p>
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
                                <p className='text-gray-400 text-sm mt-1'>New bookings will appear here</p>
                            </div>
                        ) : (
                            upcomingAppointments.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigateToAppointments('upcoming')}
                                    className='flex items-center gap-4 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-all group'
                                >
                                    <img
                                        className='w-11 h-11 rounded-full object-cover border-2 border-gray-100'
                                        src={item.userData.image}
                                        alt={item.userData.name}
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='font-semibold text-gray-800 truncate'>{item.userData.name}</p>
                                        <p className='text-sm text-gray-500'>
                                            {getRelativeDate(item.slotDate)} at {item.slotTime}
                                        </p>
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

            {/* Recent Activity Section - Unchanged */}
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
                            <p className='text-sm text-gray-500'>Completed and cancelled appointments</p>
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
                        <p className='text-gray-400 text-sm mt-1'>Completed and cancelled appointments will appear here</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6'>
                        {recentActivity.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => navigateToAppointments(item.status)}
                                className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md group
                                    ${item.status === 'completed'
                                        ? 'bg-green-50/50 border-green-200 hover:border-green-400'
                                        : 'bg-red-50/50 border-red-200 hover:border-red-400'
                                    }`}
                            >
                                <div className='flex items-center gap-4 mb-4'>
                                    <img
                                        className='w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm'
                                        src={item.userData.image}
                                        alt={item.userData.name}
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='font-semibold text-gray-800 truncate'>{item.userData.name}</p>
                                        <p className='text-sm text-gray-500'>{slotDateFormat(item.slotDate)}</p>
                                    </div>
                                </div>
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
            <div className='mt-8 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200'>
                <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center'>
                            <svg className='w-6 h-6 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 10V3L4 14h7v7l9-11h-7z' />
                            </svg>
                        </div>
                        <div>
                            <h3 className='font-bold text-gray-800'>Quick Actions</h3>
                            <p className='text-sm text-gray-500'>Manage your appointments efficiently</p>
                        </div>
                    </div>
                    <div className='flex gap-3'>
                        <button
                            onClick={() => navigateToAppointments('all')}
                            className='px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                            All Appointments
                        </button>
                        <button
                            onClick={() => navigate('/doctor-profile')}
                            className='px-5 py-2.5 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200 flex items-center gap-2'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                            </svg>
                            My Profile
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default DoctorDashboard