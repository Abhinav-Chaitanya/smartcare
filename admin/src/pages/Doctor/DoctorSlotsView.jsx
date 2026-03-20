import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'

const DoctorSlotsView = () => {

    const navigate = useNavigate()

    const { dToken, profileData, getProfileData, appointments, getAppointments } = useContext(DoctorContext)
    const { slotDateFormat } = useContext(AppContext)

    const [loading, setLoading] = useState(true)
    const [slotIndex, setSlotIndex] = useState(0)
    const [docSlots, setDocSlots] = useState([])

    // View mode - 'upcoming' or 'custom'
    const [viewMode, setViewMode] = useState('upcoming')

    // Custom date range
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Number of days to show (for upcoming mode)
    const [daysToShow, setDaysToShow] = useState(7)

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

    // Fetch data
    useEffect(() => {
        if (dToken) {
            fetchData()
        }
    }, [dToken])

    const fetchData = async () => {
        setLoading(true)
        await getProfileData()
        await getAppointments()
        setLoading(false)
    }

    // Generate slots based on view mode
    useEffect(() => {
        if (profileData && appointments) {
            if (viewMode === 'upcoming') {
                generateUpcomingSlots()
            } else if (viewMode === 'custom' && startDate) {
                generateCustomSlots()
            }
        }
    }, [profileData, appointments, viewMode, startDate, endDate, daysToShow])

    // Helper: Parse time string to hours and minutes
    const parseTime = (timeStr) => {
        if (!timeStr) return { hours: 0, minutes: 0 }
        const [time, period] = timeStr.split(' ')
        let [hours, minutes] = time.split(':').map(Number)

        if (period === 'PM' && hours !== 12) {
            hours += 12
        } else if (period === 'AM' && hours === 12) {
            hours = 0
        }

        return { hours, minutes }
    }

    // Helper: Format time to 12-hour format
    const format12 = (date) =>
        date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })

    // Helper: Round up to next interval
    const roundUpToNextInterval = (date, interval) => {
        const d = new Date(date)
        const r = d.getMinutes() % interval
        if (r === 0) return d
        d.setMinutes(d.getMinutes() + (interval - r), 0, 0)
        return d
    }

    // Helper: Check if a date is blocked
    const isDateBlocked = (date, blockedDates) => {
        if (!blockedDates || blockedDates.length === 0) return { blocked: false, reason: '' }

        const day = date.getDate()
        const month = date.getMonth() + 1
        const year = date.getFullYear()
        const dateStr = `${day}_${month}_${year}`

        const blockedEntry = blockedDates.find(b => b.date === dateStr)
        if (blockedEntry) {
            return { blocked: true, reason: blockedEntry.reason || 'Unavailable' }
        }
        return { blocked: false, reason: '' }
    }

    // Helper: Generate slots for a single day using DYNAMIC schedule
    const generateSlotsForDay = (dayDate, bookedSlotsMap, includePast = false) => {
        const slotsForDay = []
        const now = new Date()

        // Get doctor's schedule settings
        const weeklySchedule = profileData.weeklySchedule
        const slotDuration = profileData.slotDuration || 20
        const blockedDates = profileData.blockedDates || []

        // Check if date is blocked
        const blockInfo = isDateBlocked(dayDate, blockedDates)
        if (blockInfo.blocked) {
            return { slots: [], isBlocked: true, blockReason: blockInfo.reason }
        }

        // Get day name (sunday, monday, etc.)
        const dayIndex = dayDate.getDay()
        const dayName = dayNames[dayIndex]

        // Check if doctor has schedule set
        const hasSchedule = weeklySchedule && Object.values(weeklySchedule).some(
            day => day.isWorking && day.timeSlots && day.timeSlots.length > 0
        )

        // Get schedule for this day
        let daySchedule = null
        if (hasSchedule && weeklySchedule[dayName]) {
            daySchedule = weeklySchedule[dayName]
        }

        // If no schedule or not working this day
        if (!daySchedule || !daySchedule.isWorking || !daySchedule.timeSlots || daySchedule.timeSlots.length === 0) {
            return { slots: [], isDayOff: true }
        }

        // Generate slots for each time window in the day's schedule
        daySchedule.timeSlots.forEach(({ start, end }) => {
            const startTime = parseTime(start)
            const endTime = parseTime(end)

            const windowStart = new Date(dayDate)
            windowStart.setHours(startTime.hours, startTime.minutes, 0, 0)

            const windowEnd = new Date(dayDate)
            windowEnd.setHours(endTime.hours, endTime.minutes, 0, 0)

            let cursor = new Date(windowStart)

            // For today, skip past slots (only if not including past)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const isToday = dayDate.getTime() === today.getTime()

            if (isToday && !includePast) {
                if (now >= windowEnd) return // Skip this entire window
                if (now > windowStart) {
                    cursor = roundUpToNextInterval(now, slotDuration)
                    if (cursor >= windowEnd) return
                }
            }

            // Generate individual slots
            while (cursor < windowEnd) {
                const formattedTime = format12(cursor)

                const day = cursor.getDate()
                const month = cursor.getMonth() + 1
                const year = cursor.getFullYear()
                const slotDate = `${day}_${month}_${year}`
                const slotKey = `${slotDate}_${formattedTime}`

                const bookingInfo = bookedSlotsMap[slotKey] || null
                const isBooked = bookingInfo !== null && bookingInfo.status !== 'cancelled'
                const isCompleted = bookingInfo?.status === 'completed'
                const isExpired = bookingInfo?.status === 'expired'

                const slotDateTime = new Date(cursor)
                const isPast = slotDateTime < now

                slotsForDay.push({
                    datetime: new Date(cursor),
                    time: formattedTime,
                    slotDate: slotDate,
                    isBooked: isBooked,
                    isCompleted: isCompleted,
                    isExpired: isExpired,
                    isPast: isPast,
                    bookingInfo: bookingInfo
                })

                cursor = new Date(cursor)
                cursor.setMinutes(cursor.getMinutes() + slotDuration)
            }
        })

        return { slots: slotsForDay, isBlocked: false, isDayOff: false }
    }

    // Generate upcoming slots (next X days from today) using DYNAMIC schedule
    const generateUpcomingSlots = () => {
        const allDays = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Create a map of booked slots with patient info and status
        const bookedSlotsMap = {}
        appointments.forEach(apt => {
            const key = `${apt.slotDate}_${apt.slotTime}`
            bookedSlotsMap[key] = {
                patientName: apt.userData?.name || 'Unknown',
                patientImage: apt.userData?.image || '',
                patientEmail: apt.userData?.email || '',
                appointmentId: apt._id,
                status: apt.status
            }
        })

        for (let i = 0; i < daysToShow; i++) {
            const dayDate = new Date(today)
            dayDate.setDate(today.getDate() + i)

            const result = generateSlotsForDay(dayDate, bookedSlotsMap, false)

            allDays.push({
                date: dayDate,
                slots: result.slots,
                isBlocked: result.isBlocked || false,
                blockReason: result.blockReason || '',
                isDayOff: result.isDayOff || false
            })
        }

        setDocSlots(allDays)
        setSlotIndex(0)
    }

    // Generate custom date range slots (including past) using DYNAMIC schedule
    const generateCustomSlots = () => {
        if (!startDate) return

        const allDays = []

        // Create booked slots map
        const bookedSlotsMap = {}
        appointments.forEach(apt => {
            const key = `${apt.slotDate}_${apt.slotTime}`
            bookedSlotsMap[key] = {
                patientName: apt.userData?.name || 'Unknown',
                patientImage: apt.userData?.image || '',
                patientEmail: apt.userData?.email || '',
                appointmentId: apt._id,
                status: apt.status
            }
        })

        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        const end = endDate ? new Date(endDate) : new Date(startDate)
        end.setHours(0, 0, 0, 0)
        if (!endDate) {
            end.setDate(end.getDate() + 6) // Default 7 days if no end date
        }

        const current = new Date(start)
        while (current <= end) {
            const dayDate = new Date(current)

            const result = generateSlotsForDay(dayDate, bookedSlotsMap, true) // Include past for custom view

            allDays.push({
                date: dayDate,
                slots: result.slots,
                isBlocked: result.isBlocked || false,
                blockReason: result.blockReason || '',
                isDayOff: result.isDayOff || false
            })

            current.setDate(current.getDate() + 1)
        }

        setDocSlots(allDays)
        setSlotIndex(0)
    }

    // Handle slot click - Navigate to appointment details
    const handleSlotClick = (slot) => {
        if (slot.bookingInfo && slot.bookingInfo.appointmentId) {
            navigate(`/appointment-details/${slot.bookingInfo.appointmentId}`)
        }
    }

    // Chunk array helper
    const chunkArray = (arr, n) => {
        const out = []
        for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
        return out
    }

    // Get schedule summary for display
    const getScheduleSummary = () => {
        if (!profileData?.weeklySchedule) return null

        const dayLabels = {
            monday: 'Mon',
            tuesday: 'Tue',
            wednesday: 'Wed',
            thursday: 'Thu',
            friday: 'Fri',
            saturday: 'Sat',
            sunday: 'Sun'
        }

        const workingDays = Object.entries(profileData.weeklySchedule)
            .filter(([_, schedule]) => schedule.isWorking && schedule.timeSlots && schedule.timeSlots.length > 0)
            .map(([day, _]) => dayLabels[day])

        if (workingDays.length === 0) return null

        return workingDays.join(', ')
    }

    // Check if doctor has schedule configured
    const hasScheduleConfigured = profileData?.weeklySchedule && Object.values(profileData.weeklySchedule).some(
        day => day.isWorking && day.timeSlots && day.timeSlots.length > 0
    )

    // Loading state
    if (loading) {
        return (
            <div className='m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-500 text-sm'>Loading your schedule...</p>
                </div>
            </div>
        )
    }

    // Not found state
    if (!profileData) {
        return (
            <div className='m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                        </svg>
                    </div>
                    <h3 className='text-xl font-semibold text-gray-700 mb-2'>Profile Not Found</h3>
                    <button
                        onClick={() => navigate('/doctor-appointments')}
                        className='text-primary font-medium hover:underline'
                    >
                        Back to Appointments
                    </button>
                </div>
            </div>
        )
    }

    const activeDay = docSlots[slotIndex]
    const slotRows = activeDay?.slots?.length ? chunkArray(activeDay.slots, 6) : []

    return (
        <div className='w-full max-w-6xl m-5'>

            {/* Back Button */}
            <button
                onClick={() => navigate('/doctor-appointments')}
                className='flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-all group'
            >
                <svg className='w-5 h-5 group-hover:-translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
                </svg>
                <span className='font-medium'>Back to Appointments</span>
            </button>

            {/* Page Header */}
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-3'>
                        <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center'>
                            <svg className='w-6 h-6 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                        </div>
                        My Appointment Slots
                    </h1>
                    <p className='text-gray-500 mt-1'>View your schedule and booked appointments</p>
                </div>

                {/* Availability Status */}
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${profileData.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <span className={`w-3 h-3 rounded-full ${profileData.available ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span className={`font-medium ${profileData.available ? 'text-green-700' : 'text-red-700'}`}>
                        {profileData.available ? 'Currently Available' : 'Currently Unavailable'}
                    </span>
                </div>
            </div>

            {/* Schedule Info Card */}
            {hasScheduleConfigured && (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6'>
                    <div className='flex flex-wrap items-center justify-between gap-4'>
                        <div className='flex flex-wrap items-center gap-6'>
                            <div className='flex items-center gap-2 text-gray-700'>
                                <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                </svg>
                                <span className='font-medium'>Working Days:</span>
                                <span className='text-primary font-semibold'>{getScheduleSummary()}</span>
                            </div>
                            <div className='flex items-center gap-2 text-gray-600'>
                                <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                </svg>
                                <span>{profileData.slotDuration || 20} min slots</span>
                            </div>
                            <div className='flex items-center gap-2 text-gray-600'>
                                <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                                </svg>
                                <span>{profileData.advanceBookingDays || 7} days advance booking</span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/doctor-profile')}
                            className='flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all'
                        >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                            </svg>
                            Edit Schedule
                        </button>
                    </div>
                </div>
            )}

            {/* Warning if no schedule configured */}
            {!hasScheduleConfigured && (
                <div className='mb-6 p-5 bg-yellow-50 rounded-2xl border border-yellow-200'>
                    <div className='flex items-start gap-4'>
                        <div className='w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0'>
                            <svg className='w-6 h-6 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                            </svg>
                        </div>
                        <div className='flex-1'>
                            <h3 className='font-semibold text-yellow-800 mb-1'>Schedule Not Configured</h3>
                            <p className='text-sm text-yellow-700 mb-3'>
                                You haven't set your working schedule yet. Please configure your schedule to start accepting appointments.
                            </p>
                            <button
                                onClick={() => navigate('/doctor-profile')}
                                className='px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-all'
                            >
                                Configure Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Time Slots Section */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>

                <div className='p-6 border-b border-gray-100'>
                    <div className='flex flex-col gap-4'>

                        {/* Title & View Mode Toggle */}
                        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                            <div>
                                <h2 className='text-xl font-bold text-gray-800 mb-1'>Appointment Slots</h2>
                                <p className='text-gray-500 text-sm'>View your availability and booked slots</p>
                            </div>

                            {/* View Mode Toggle */}
                            <div className='flex items-center gap-2 bg-gray-100 p-1 rounded-xl'>
                                <button
                                    onClick={() => setViewMode('upcoming')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'upcoming'
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                    </svg>
                                    Upcoming
                                </button>
                                <button
                                    onClick={() => setViewMode('custom')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'custom'
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                                    </svg>
                                    Custom Range
                                </button>
                            </div>
                        </div>

                        {/* Upcoming Mode Options */}
                        {viewMode === 'upcoming' && (
                            <div className='flex flex-wrap items-center gap-3'>
                                <span className='text-sm text-gray-600'>Show next:</span>
                                {[7, 14, 30].map(days => (
                                    <button
                                        key={days}
                                        onClick={() => setDaysToShow(days)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${daysToShow === days
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {days} days
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Custom Range Options */}
                        {viewMode === 'custom' && (
                            <div className='flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-xl'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-600 mb-1'>
                                        Start Date
                                    </label>
                                    <input
                                        type='date'
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-600 mb-1'>
                                        End Date
                                    </label>
                                    <input
                                        type='date'
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                        className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                                    />
                                </div>
                                <button
                                    onClick={generateCustomSlots}
                                    disabled={!startDate}
                                    className='px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    View Slots
                                </button>
                            </div>
                        )}

                        {/* Total Appointments & Back Button */}
                        <div className='flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-gray-100'>
                            <div className='flex items-center gap-2 text-gray-600'>
                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                                </svg>
                                <span className='text-sm font-medium'>
                                    Total Appointments: <span className='text-primary font-bold'>{appointments.length}</span>
                                </span>
                            </div>
                            <button
                                onClick={() => navigate('/doctor-appointments')}
                                className='flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg'
                            >
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                                </svg>
                                View All Appointments
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                                </svg>
                            </button>
                        </div>

                        {/* Legend */}
                        <div className='flex flex-wrap items-center gap-4'>
                            <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 bg-green-100 border-2 border-green-500 rounded'></div>
                                <span className='text-xs text-gray-600'>Available</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 bg-red-100 border-2 border-red-500 rounded'></div>
                                <span className='text-xs text-gray-600'>Booked</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 bg-blue-100 border-2 border-blue-500 rounded'></div>
                                <span className='text-xs text-gray-600'>Completed</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 bg-yellow-100 border-2 border-yellow-500 rounded'></div>
                                <span className='text-xs text-gray-600'>Expired</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 bg-gray-100 border-2 border-gray-300 rounded'></div>
                                <span className='text-xs text-gray-600'>Past</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 bg-orange-100 border-2 border-orange-400 rounded'></div>
                                <span className='text-xs text-gray-600'>Day Off</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 bg-red-100 border-2 border-red-400 rounded'></div>
                                <span className='text-xs text-gray-600'>Blocked</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='p-6'>
                    {/* Check if schedule is configured */}
                    {!hasScheduleConfigured ? (
                        <div className='text-center py-12 bg-yellow-50 rounded-xl border-2 border-dashed border-yellow-200'>
                            <div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg className='w-8 h-8 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                </svg>
                            </div>
                            <h3 className='text-xl font-semibold text-yellow-700 mb-2'>No Schedule Configured</h3>
                            <p className='text-yellow-600 max-w-md mx-auto'>
                                Please configure your working schedule to view appointment slots.
                            </p>
                        </div>
                    ) : docSlots.length > 0 ? (
                        <>
                            {/* Date Selection - Horizontal Scroll */}
                            <div className='mb-6'>
                                <h3 className='text-sm font-semibold text-gray-600 mb-3'>Select Date</h3>
                                <div className='flex gap-3 overflow-x-auto pb-2'>
                                    {docSlots.map((dayObj, index) => {
                                        const d = dayObj.date
                                        const isActive = slotIndex === index
                                        const today = new Date()
                                        today.setHours(0, 0, 0, 0)
                                        const isToday = d.getTime() === today.getTime()
                                        const isPastDay = d < today
                                        const isBlocked = dayObj.isBlocked
                                        const isDayOff = dayObj.isDayOff

                                        // Count stats
                                        const bookedCount = dayObj.slots.filter(s => s.isBooked || s.isCompleted || s.isExpired).length
                                        const completedCount = dayObj.slots.filter(s => s.isCompleted).length
                                        const availableCount = dayObj.slots.filter(s => !s.isBooked && !s.isPast).length

                                        // Determine card style
                                        let cardStyle = ''
                                        let statusText = ''

                                        if (isBlocked) {
                                            cardStyle = 'bg-red-50 border-red-200 text-red-600'
                                            statusText = dayObj.blockReason || 'Blocked'
                                        } else if (isDayOff) {
                                            cardStyle = 'bg-orange-50 border-orange-200 text-orange-600'
                                            statusText = 'Day Off'
                                        } else if (isActive) {
                                            cardStyle = 'bg-primary border-primary text-white shadow-lg'
                                            statusText = `${availableCount}/${bookedCount}/${completedCount}`
                                        } else if (isPastDay) {
                                            cardStyle = 'bg-gray-50 border-gray-200 text-gray-500'
                                            statusText = `${bookedCount} booked`
                                        } else {
                                            cardStyle = 'bg-white border-gray-200 hover:border-primary'
                                            statusText = `${availableCount}/${bookedCount}/${completedCount}`
                                        }

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => setSlotIndex(index)}
                                                disabled={isBlocked || isDayOff}
                                                className={`flex-shrink-0 min-w-28 p-4 rounded-xl text-center transition-all border-2 
                                                    ${cardStyle}
                                                    ${(isBlocked || isDayOff) ? 'cursor-not-allowed' : 'cursor-pointer'}
                                                `}
                                            >
                                                {isToday && (
                                                    <p className={`text-xs font-medium mb-1 ${isActive ? 'text-white/80' : 'text-primary'}`}>Today</p>
                                                )}
                                                {isPastDay && !isToday && (
                                                    <p className={`text-xs font-medium mb-1 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>Past</p>
                                                )}
                                                <p className='text-xl font-bold'>{d.getDate()}</p>
                                                <p className='text-xs opacity-80'>{d.toLocaleString('en-US', { month: 'short' })}</p>
                                                <p className='text-xs font-semibold mt-1'>{daysOfWeek[d.getDay()]}</p>
                                                <p className={`text-xs mt-2 ${isActive ? 'text-white/70' : ''}`}>
                                                    {statusText}
                                                </p>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Stats Cards for Active Day 
                            {activeDay && !activeDay.isBlocked && !activeDay.isDayOff && (
                                <div className='flex flex-wrap gap-3 mb-6'>
                                    <div className='bg-green-50 rounded-xl px-4 py-2 min-w-20 text-center'>
                                        <p className='text-xs text-green-600 font-medium'>Available</p>
                                        <p className='text-xl font-bold text-green-700'>
                                            {activeDay.slots.filter(s => !s.isBooked && !s.isPast).length}
                                        </p>
                                    </div>
                                    <div className='bg-red-50 rounded-xl px-4 py-2 min-w-20 text-center'>
                                        <p className='text-xs text-red-600 font-medium'>Booked</p>
                                        <p className='text-xl font-bold text-red-700'>
                                            {activeDay.slots.filter(s => s.isBooked && !s.isCompleted && !s.isExpired).length}
                                        </p>
                                    </div>
                                    <div className='bg-blue-50 rounded-xl px-4 py-2 min-w-20 text-center'>
                                        <p className='text-xs text-blue-600 font-medium'>Completed</p>
                                        <p className='text-xl font-bold text-blue-700'>
                                            {activeDay.slots.filter(s => s.isCompleted).length}
                                        </p>
                                    </div>
                                    <div className='bg-yellow-50 rounded-xl px-4 py-2 min-w-20 text-center'>
                                        <p className='text-xs text-yellow-600 font-medium'>Expired</p>
                                        <p className='text-xl font-bold text-yellow-700'>
                                            {activeDay.slots.filter(s => s.isExpired).length}
                                        </p>
                                    </div>
                                    <div className='bg-gray-50 rounded-xl px-4 py-2 min-w-20 text-center'>
                                        <p className='text-xs text-gray-600 font-medium'>Total</p>
                                        <p className='text-xl font-bold text-gray-700'>
                                            {activeDay.slots.length}
                                        </p>
                                    </div>
                                </div>
                            )}*/}

                            {/* Stats Cards for Active Day */}
                            {activeDay && !activeDay.isBlocked && !activeDay.isDayOff && (
                                <div className='flex flex-wrap gap-3 mb-6'>
                                    <div className='bg-green-50 rounded-xl px-4 py-2 min-w-20 text-center'>
                                        <p className='text-xs text-green-600 font-medium'>Available</p>
                                        <p className='text-xl font-bold text-green-700'>
                                            {activeDay.slots.filter(s => !s.isBooked && !s.isPast).length}
                                        </p>
                                    </div>
                                    <div className='bg-red-50 rounded-xl px-4 py-2 min-w-20 text-center'>
                                        <p className='text-xs text-red-600 font-medium'>Booked</p>
                                        <p className='text-xl font-bold text-red-700'>
                                            {activeDay.slots.filter(s => s.isBooked || s.isCompleted || s.isExpired).length}
                                        </p>
                                    </div>
                                    <div className='bg-blue-50 rounded-xl px-4 py-2 min-w-20 text-center'>
                                        <p className='text-xs text-blue-600 font-medium'>Completed</p>
                                        <p className='text-xl font-bold text-blue-700'>
                                            {activeDay.slots.filter(s => s.isCompleted).length}
                                        </p>
                                    </div>
                                    <div className='bg-yellow-50 rounded-xl px-4 py-2 min-w-20 text-center'>
                                        <p className='text-xs text-yellow-600 font-medium'>Expired</p>
                                        <p className='text-xl font-bold text-yellow-700'>
                                            {activeDay.slots.filter(s => s.isExpired).length}
                                        </p>
                                    </div>
                                    <div className='bg-gray-50 rounded-xl px-4 py-2 min-w-20 text-center'>
                                        <p className='text-xs text-gray-600 font-medium'>Total</p>
                                        <p className='text-xl font-bold text-gray-700'>
                                            {activeDay.slots.length}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Time Slots Grid */}
                            <div>
                                <h3 className='text-sm font-semibold text-gray-600 mb-3'>Time Slots</h3>

                                {activeDay?.isBlocked ? (
                                    <div className='text-center py-12 bg-red-50 rounded-xl border-2 border-dashed border-red-200'>
                                        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                            <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' />
                                            </svg>
                                        </div>
                                        <p className='text-red-600 font-medium'>You are unavailable on this day</p>
                                        <p className='text-sm text-red-500 mt-1'>{activeDay.blockReason || 'Blocked'}</p>
                                    </div>
                                ) : activeDay?.isDayOff ? (
                                    <div className='text-center py-12 bg-orange-50 rounded-xl border-2 border-dashed border-orange-200'>
                                        <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                            <svg className='w-8 h-8 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' />
                                            </svg>
                                        </div>
                                        <p className='text-orange-600 font-medium'>This is your day off</p>
                                        <p className='text-sm text-orange-500 mt-1'>No appointments scheduled</p>
                                    </div>
                                ) : slotRows.length > 0 ? (
                                    <div className='space-y-3'>
                                        {slotRows.map((row, rIdx) => (
                                            <div key={rIdx} className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3'>
                                                {row.map((slot, idx) => {
                                                    let slotClasses = ''
                                                    let cursorClass = ''

                                                    if (slot.isCompleted) {
                                                        slotClasses = 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                                                        cursorClass = 'cursor-pointer'
                                                    } else if (slot.isExpired) {
                                                        slotClasses = 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                                                        cursorClass = 'cursor-pointer'
                                                    } else if (slot.isBooked) {
                                                        slotClasses = 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                                                        cursorClass = 'cursor-pointer'
                                                    } else if (slot.isPast) {
                                                        slotClasses = 'bg-gray-50 border-gray-200 text-gray-400'
                                                        cursorClass = 'cursor-not-allowed'
                                                    } else {
                                                        slotClasses = 'bg-green-50 border-green-300 text-green-700'
                                                        cursorClass = ''
                                                    }

                                                    return (
                                                        <div
                                                            key={idx}
                                                            onClick={() => (slot.isBooked || slot.isCompleted || slot.isExpired) && handleSlotClick(slot)}
                                                            className={`relative p-3 rounded-lg text-sm font-semibold text-center transition-all border-2 group ${slotClasses} ${cursorClass}`}
                                                        >
                                                            {slot.time}

                                                            {/* Tooltip */}
                                                            {(slot.isBooked || slot.isCompleted || slot.isExpired) && slot.bookingInfo && (
                                                                <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none'>
                                                                    <div className='flex items-center gap-2 mb-1'>
                                                                        <img
                                                                            src={slot.bookingInfo.patientImage}
                                                                            alt=""
                                                                            className='w-6 h-6 rounded-full object-cover'
                                                                        />
                                                                        <div>
                                                                            <p className='font-semibold'>{slot.bookingInfo.patientName}</p>
                                                                            <p className='text-gray-400 text-[10px]'>
                                                                                {slot.isCompleted ? 'Completed' : slot.isExpired ? 'Expired' : 'Booked'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <p className='text-[10px] text-gray-300'>Click to view details</p>
                                                                    <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
                                                                </div>
                                                            )}

                                                            {/* Status Icon */}
                                                            {slot.isCompleted && (
                                                                <div className='absolute top-1 right-1'>
                                                                    <svg className='w-3 h-3 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M5 13l4 4L19 7' />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            {slot.isExpired && (
                                                                <div className='absolute top-1 right-1'>
                                                                    <svg className='w-3 h-3 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            {slot.isBooked && !slot.isCompleted && !slot.isExpired && (
                                                                <div className='absolute top-1 right-1'>
                                                                    <svg className='w-3 h-3 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='text-center py-12 bg-gray-50 rounded-xl'>
                                        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                            <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                            </svg>
                                        </div>
                                        <p className='text-gray-500'>No time slots for this day</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className='text-center py-12'>
                            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                </svg>
                            </div>
                            <p className='text-gray-500'>
                                {viewMode === 'custom' ? 'Select a date range to view slots' : 'No slots available'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DoctorSlotsView