// components/RescheduleModal.jsx

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const RescheduleModal = ({ appointment, doctorData, onClose, onSlotConfirmed }) => {

    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [newSlotTime, setNewSlotTime] = useState('')
    const [loading, setLoading] = useState(true)

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // ==================== HELPER FUNCTIONS ====================

    // Parse time string to hours and minutes
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

    // Round up to next interval
    const roundUpToNextInterval = (date, interval) => {
        const d = new Date(date)
        const r = d.getMinutes() % interval
        if (r === 0) return d
        d.setMinutes(d.getMinutes() + (interval - r), 0, 0)
        return d
    }

    // Format time to 12-hour format
    const format12 = (date) =>
        date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })

    // Format slot date for display
    const slotDateFormat = (slotDate) => {
        const [day, month, year] = slotDate.split('_')
        return `${day} ${months[Number(month) - 1]} ${year}`
    }

    // Check if a date is blocked
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

    // ==================== SLOT GENERATION ====================

    // Generate Available Slots using DYNAMIC schedule
    const getAvailableSlots = () => {
        if (!doctorData) return

        setLoading(true)
        const allDays = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Get doctor's schedule settings (with fallback to defaults)
        const weeklySchedule = doctorData.weeklySchedule
        const slotDuration = doctorData.slotDuration || 20
        const advanceBookingDays = doctorData.advanceBookingDays || 7
        const blockedDates = doctorData.blockedDates || []
        const bookedSlots = doctorData.slots_booked || {}

        // Check if doctor has schedule set
        const hasSchedule = weeklySchedule && Object.values(weeklySchedule).some(
            day => day.isWorking && day.timeSlots && day.timeSlots.length > 0
        )

        // Generate slots for each day
        for (let i = 0; i < advanceBookingDays; i++) {
            const dayDate = new Date(today)
            dayDate.setDate(today.getDate() + i)

            const dayIndex = dayDate.getDay() // 0 = Sunday, 1 = Monday, etc.
            const dayName = dayNames[dayIndex] // 'sunday', 'monday', etc.

            // Check if date is blocked (leave/holiday)
            const blockInfo = isDateBlocked(dayDate, blockedDates)
            if (blockInfo.blocked) {
                allDays.push({
                    date: dayDate,
                    slots: [],
                    isBlocked: true,
                    blockReason: blockInfo.reason
                })
                continue
            }

            // Get schedule for this day
            let daySchedule = null
            if (hasSchedule && weeklySchedule[dayName]) {
                daySchedule = weeklySchedule[dayName]
            }

            // If no schedule or not working this day
            if (!daySchedule || !daySchedule.isWorking || !daySchedule.timeSlots || daySchedule.timeSlots.length === 0) {
                allDays.push({
                    date: dayDate,
                    slots: [],
                    isDayOff: true
                })
                continue
            }

            const slotsForDay = []

            // Generate slots for each time window in the day's schedule
            daySchedule.timeSlots.forEach(({ start, end }) => {
                const startTime = parseTime(start)
                const endTime = parseTime(end)

                const windowStart = new Date(dayDate)
                windowStart.setHours(startTime.hours, startTime.minutes, 0, 0)

                const windowEnd = new Date(dayDate)
                windowEnd.setHours(endTime.hours, endTime.minutes, 0, 0)

                let cursor = new Date(windowStart)

                // For today, skip past slots
                if (i === 0) {
                    const now = new Date()
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

                    // Check if slot is already booked
                    const isBooked = bookedSlots[slotDate]
                        ? bookedSlots[slotDate].some(
                            bookedTime => bookedTime.toLowerCase().trim() === formattedTime.toLowerCase().trim()
                        )
                        : false

                    // Check if it's the current appointment slot - SKIP IT
                    const isCurrentSlot = slotDate === appointment.slotDate &&
                        formattedTime.toLowerCase().trim() === appointment.slotTime.toLowerCase().trim()

                    // Only add if NOT booked AND NOT current slot
                    if (!isBooked && !isCurrentSlot) {
                        slotsForDay.push({
                            datetime: new Date(cursor),
                            time: formattedTime
                        })
                    }

                    cursor = new Date(cursor)
                    cursor.setMinutes(cursor.getMinutes() + slotDuration)
                }
            })

            allDays.push({
                date: dayDate,
                slots: slotsForDay,
                isBlocked: false,
                isDayOff: false
            })
        }

        setDocSlots(allDays)
        setLoading(false)

        // Auto-select first day with available slots
        const firstAvailableIndex = allDays.findIndex(
            day => day.slots && day.slots.length > 0 && !day.isBlocked && !day.isDayOff
        )
        if (firstAvailableIndex !== -1) {
            setSlotIndex(firstAvailableIndex)
        }
    }

    // Handle confirm slot
    const handleConfirmSlot = () => {
        if (!newSlotTime) {
            toast.warn('Please select a new time slot')
            return
        }

        const dateObj = docSlots[slotIndex].date
        const newSlotDate = `${dateObj.getDate()}_${dateObj.getMonth() + 1}_${dateObj.getFullYear()}`

        onSlotConfirmed(newSlotDate, newSlotTime)
    }

    // Generate slots when doctorData changes
    useEffect(() => {
        if (doctorData) {
            getAvailableSlots()
        }
    }, [doctorData])

    // ==================== COMPUTED VALUES ====================

    const activeDay = docSlots[slotIndex]
    
    const chunkArray = (arr, n) => {
        const out = []
        for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
        return out
    }

    const slotRows = activeDay?.slots?.length ? chunkArray(activeDay.slots, 6) : []

    // Check if any slots are available
    const hasAnySlots = docSlots.some(day => day.slots && day.slots.length > 0)

    // Check if schedule is configured
    const hasScheduleConfigured = doctorData?.weeklySchedule && Object.values(doctorData.weeklySchedule).some(
        day => day.isWorking && day.timeSlots && day.timeSlots.length > 0
    )

    // Get schedule summary for display
    const getScheduleSummary = () => {
        if (!doctorData?.weeklySchedule) return null

        const dayLabels = {
            monday: 'Mon',
            tuesday: 'Tue',
            wednesday: 'Wed',
            thursday: 'Thu',
            friday: 'Fri',
            saturday: 'Sat',
            sunday: 'Sun'
        }

        const workingDays = Object.entries(doctorData.weeklySchedule)
            .filter(([_, schedule]) => schedule.isWorking && schedule.timeSlots && schedule.timeSlots.length > 0)
            .map(([day, _]) => dayLabels[day])

        if (workingDays.length === 0) return null

        return workingDays.join(', ')
    }

    // ==================== UI ====================

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                            🔄 Reschedule Appointment
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Current Appointment Info */}
                <div className="p-6 bg-blue-50 border-b border-blue-100">
                    <p className="text-sm text-gray-600 font-medium mb-2">Current Appointment:</p>
                    <div className="flex items-center gap-4">
                        <img
                            src={appointment.userData.image}
                            alt={appointment.userData.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                        />
                        <div>
                            <p className="font-bold text-gray-900">{appointment.userData.name}</p>
                            <p className="text-sm text-gray-600">{appointment.userData.email}</p>
                            <p className="text-sm font-semibold text-primary mt-1">
                                📅 {slotDateFormat(appointment.slotDate)} | ⏰ {appointment.slotTime}
                            </p>
                        </div>
                    </div>

                    {/* Schedule Info */}
                    {getScheduleSummary() && (
                        <div className='mt-3 pt-3 border-t border-blue-200'>
                            <div className='flex flex-wrap items-center gap-3 text-sm'>
                                <span className='text-blue-700'>
                                    📅 Working: <strong>{getScheduleSummary()}</strong>
                                </span>
                                <span className='text-blue-600'>
                                    ⏱️ {doctorData?.slotDuration || 20} min slots
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="p-12 text-center">
                        <div className='w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                        <p className='text-gray-500'>Loading available slots...</p>
                    </div>
                ) : !hasScheduleConfigured ? (
                    // No schedule configured
                    <div className="p-6">
                        <div className='text-center py-12 bg-yellow-50 rounded-xl border-2 border-dashed border-yellow-200'>
                            <div className='text-5xl mb-4'>⚠️</div>
                            <h3 className='text-xl font-semibold text-yellow-700 mb-2'>Schedule Not Available</h3>
                            <p className='text-yellow-600 max-w-md mx-auto'>
                                The working schedule hasn't been configured yet.
                                Cannot reschedule at this time.
                            </p>
                        </div>
                    </div>
                ) : !hasAnySlots ? (
                    // No slots available
                    <div className="p-6">
                        <div className='text-center py-12 bg-orange-50 rounded-xl border-2 border-dashed border-orange-200'>
                            <div className='text-5xl mb-4'>😔</div>
                            <h3 className='text-xl font-semibold text-orange-700 mb-2'>No Slots Available</h3>
                            <p className='text-orange-600 max-w-md mx-auto'>
                                There are no available slots for rescheduling within the next {doctorData?.advanceBookingDays || 7} days.
                                Please try again later.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Slot Selection */}
                        <div className="p-6 max-h-96 overflow-y-auto">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Select New Date & Time
                            </h3>

                            {/* Date Selection */}
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-3">Available Dates:</p>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {docSlots.map((dayObj, index) => {
                                        const d = dayObj.date
                                        const hasSlots = dayObj.slots && dayObj.slots.length > 0
                                        const isActive = slotIndex === index
                                        const isToday = index === 0
                                        const isBlocked = dayObj.isBlocked
                                        const isDayOff = dayObj.isDayOff
                                        const isDisabled = !hasSlots || isBlocked || isDayOff

                                        // Determine styling based on day status
                                        let cardStyle = ''
                                        let statusText = ''

                                        if (isBlocked) {
                                            cardStyle = 'bg-red-50 border-red-200 text-red-500'
                                            statusText = dayObj.blockReason || 'Blocked'
                                        } else if (isDayOff) {
                                            cardStyle = 'bg-orange-50 border-orange-200 text-orange-500'
                                            statusText = 'Day Off'
                                        } else if (isActive && hasSlots) {
                                            cardStyle = 'bg-primary border-primary text-white shadow-lg'
                                            statusText = `${dayObj.slots.length} slots`
                                        } else if (hasSlots) {
                                            cardStyle = 'bg-white border-gray-200 hover:border-primary'
                                            statusText = `${dayObj.slots.length} slots`
                                        } else {
                                            cardStyle = 'bg-gray-50 border-gray-100 text-gray-400'
                                            statusText = 'Fully Booked'
                                        }

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    if (!isDisabled) {
                                                        setSlotIndex(index)
                                                        setNewSlotTime('')
                                                    }
                                                }}
                                                disabled={isDisabled}
                                                className={`flex-shrink-0 min-w-24 p-3 rounded-xl text-center transition-all border-2
                                                    ${cardStyle}
                                                    ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                {isToday && (
                                                    <p className={`text-xs font-medium mb-1 ${isActive && hasSlots ? 'text-white/80' : 'text-primary'}`}>Today</p>
                                                )}
                                                <p className="text-lg font-bold">{d.getDate()}</p>
                                                <p className="text-xs">{d.toLocaleString('en-US', { month: 'short' })}</p>
                                                <p className="text-xs font-semibold">{daysOfWeek[d.getDay()]}</p>
                                                <p className={`text-xs mt-1 ${isActive && hasSlots ? 'text-white/70' : ''}`}>
                                                    {statusText}
                                                </p>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Time Selection */}
                            <div>
                                <p className="text-sm text-gray-600 mb-3">Available Time Slots:</p>

                                {activeDay?.isBlocked ? (
                                    // Blocked day message
                                    <div className='text-center py-8 bg-red-50 rounded-xl border-2 border-dashed border-red-200'>
                                        <div className='text-3xl mb-2'>🚫</div>
                                        <p className="text-red-600 font-medium">Unavailable on this day</p>
                                        <p className="text-sm text-red-500 mt-1">{activeDay.blockReason || 'Please select another date'}</p>
                                    </div>
                                ) : activeDay?.isDayOff ? (
                                    // Day off message
                                    <div className='text-center py-8 bg-orange-50 rounded-xl border-2 border-dashed border-orange-200'>
                                        <div className='text-3xl mb-2'>😴</div>
                                        <p className="text-orange-600 font-medium">Day Off</p>
                                        <p className="text-sm text-orange-500 mt-1">Please select another date</p>
                                    </div>
                                ) : slotRows.length > 0 ? (
                                    // Available slots grid
                                    <div className="space-y-2">
                                        {slotRows.map((row, rIdx) => (
                                            <div key={rIdx} className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                                                {row.map((item, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setNewSlotTime(item.time)}
                                                        className={`p-2 rounded-lg text-sm font-semibold transition-all border-2
                                                            ${newSlotTime === item.time
                                                                ? 'bg-primary border-primary text-white shadow-lg'
                                                                : 'bg-white border-gray-200 hover:border-primary hover:shadow-md'}`}
                                                    >
                                                        {item.time}
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // No slots available for this day
                                    <div className='text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200'>
                                        <div className='text-3xl mb-2'>📅</div>
                                        <p className="text-gray-500">All slots are booked for this day</p>
                                        <p className="text-sm text-gray-400 mt-1">Please select another date</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selected Slot Preview */}
                        {newSlotTime && docSlots[slotIndex] && !docSlots[slotIndex].isBlocked && !docSlots[slotIndex].isDayOff && (
                            <div className="px-6 pb-4">
                                <div className="p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                                    <p className="text-sm text-gray-600">New appointment will be:</p>
                                    <p className="font-bold text-green-700">
                                        📅 {docSlots[slotIndex].date.getDate()} {months[docSlots[slotIndex].date.getMonth()]} {docSlots[slotIndex].date.getFullYear()} | ⏰ {newSlotTime}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmSlot}
                            disabled={!newSlotTime || loading || !hasAnySlots || !hasScheduleConfigured}
                            className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            Continue →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RescheduleModal