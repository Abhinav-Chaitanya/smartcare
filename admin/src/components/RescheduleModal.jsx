import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import getProfileImage from '../utils/getProfileImage'

const RescheduleModal = ({ appointment, doctorData, onClose, onSlotConfirmed }) => {

    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [newSlotTime, setNewSlotTime] = useState('')
    const [loading, setLoading] = useState(true)

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const parseTime = (timeStr) => {
        if (!timeStr) return { hours: 0, minutes: 0 }
        const [time, period] = timeStr.split(' ')
        let [hours, minutes] = time.split(':').map(Number)
        if (period === 'PM' && hours !== 12) hours += 12
        else if (period === 'AM' && hours === 12) hours = 0
        return { hours, minutes }
    }

    const roundUpToNextInterval = (date, interval) => {
        const d = new Date(date)
        const r = d.getMinutes() % interval
        if (r === 0) return d
        d.setMinutes(d.getMinutes() + (interval - r), 0, 0)
        return d
    }

    const format12 = (date) =>
        date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })

    const slotDateFormat = (slotDate) => {
        const [day, month, year] = slotDate.split('_')
        return `${day} ${months[Number(month) - 1]} ${year}`
    }

    const isDateBlocked = (date, blockedDates) => {
        if (!blockedDates || blockedDates.length === 0) return { blocked: false, reason: '' }
        const day = date.getDate(), month = date.getMonth() + 1, year = date.getFullYear()
        const dateStr = `${day}_${month}_${year}`
        const blockedEntry = blockedDates.find(b => b.date === dateStr)
        if (blockedEntry) return { blocked: true, reason: blockedEntry.reason || 'Unavailable' }
        return { blocked: false, reason: '' }
    }

    const getAvailableSlots = () => {
        if (!doctorData) return
        setLoading(true)
        const allDays = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const weeklySchedule = doctorData.weeklySchedule
        const slotDuration = doctorData.slotDuration || 20
        const advanceBookingDays = doctorData.advanceBookingDays || 7
        const blockedDates = doctorData.blockedDates || []
        const bookedSlots = doctorData.slots_booked || {}

        const hasSchedule = weeklySchedule && Object.values(weeklySchedule).some(
            day => day.isWorking && day.timeSlots && day.timeSlots.length > 0
        )

        for (let i = 0; i < advanceBookingDays; i++) {
            const dayDate = new Date(today)
            dayDate.setDate(today.getDate() + i)
            const dayIndex = dayDate.getDay()
            const dayName = dayNames[dayIndex]

            const blockInfo = isDateBlocked(dayDate, blockedDates)
            if (blockInfo.blocked) {
                allDays.push({ date: dayDate, slots: [], isBlocked: true, blockReason: blockInfo.reason })
                continue
            }

            let daySchedule = null
            if (hasSchedule && weeklySchedule[dayName]) daySchedule = weeklySchedule[dayName]

            if (!daySchedule || !daySchedule.isWorking || !daySchedule.timeSlots || daySchedule.timeSlots.length === 0) {
                allDays.push({ date: dayDate, slots: [], isDayOff: true })
                continue
            }

            const slotsForDay = []
            daySchedule.timeSlots.forEach(({ start, end }) => {
                const startTime = parseTime(start)
                const endTime = parseTime(end)
                const windowStart = new Date(dayDate)
                windowStart.setHours(startTime.hours, startTime.minutes, 0, 0)
                const windowEnd = new Date(dayDate)
                windowEnd.setHours(endTime.hours, endTime.minutes, 0, 0)
                let cursor = new Date(windowStart)

                if (i === 0) {
                    const now = new Date()
                    if (now >= windowEnd) return
                    if (now > windowStart) {
                        cursor = roundUpToNextInterval(now, slotDuration)
                        if (cursor >= windowEnd) return
                    }
                }

                while (cursor < windowEnd) {
                    const formattedTime = format12(cursor)
                    const day = cursor.getDate(), month = cursor.getMonth() + 1, year = cursor.getFullYear()
                    const slotDate = `${day}_${month}_${year}`
                    const isBooked = bookedSlots[slotDate]
                        ? bookedSlots[slotDate].some(t => t.toLowerCase().trim() === formattedTime.toLowerCase().trim())
                        : false
                    const isCurrentSlot = slotDate === appointment.slotDate &&
                        formattedTime.toLowerCase().trim() === appointment.slotTime.toLowerCase().trim()
                    if (!isBooked && !isCurrentSlot) {
                        slotsForDay.push({ datetime: new Date(cursor), time: formattedTime })
                    }
                    cursor = new Date(cursor)
                    cursor.setMinutes(cursor.getMinutes() + slotDuration)
                }
            })

            allDays.push({ date: dayDate, slots: slotsForDay, isBlocked: false, isDayOff: false })
        }

        setDocSlots(allDays)
        setLoading(false)
        const firstAvailableIndex = allDays.findIndex(day => day.slots && day.slots.length > 0 && !day.isBlocked && !day.isDayOff)
        if (firstAvailableIndex !== -1) setSlotIndex(firstAvailableIndex)
    }

    const handleConfirmSlot = () => {
        if (!newSlotTime) { toast.warn('Please select a new time slot'); return }
        const dateObj = docSlots[slotIndex].date
        const newSlotDate = `${dateObj.getDate()}_${dateObj.getMonth() + 1}_${dateObj.getFullYear()}`
        onSlotConfirmed(newSlotDate, newSlotTime)
    }

    useEffect(() => {
        if (doctorData) getAvailableSlots()
    }, [doctorData])

    const activeDay = docSlots[slotIndex]
    const chunkArray = (arr, n) => {
        const out = []
        for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
        return out
    }
    const slotRows = activeDay?.slots?.length ? chunkArray(activeDay.slots, 6) : []
    const hasAnySlots = docSlots.some(day => day.slots && day.slots.length > 0)
    const hasScheduleConfigured = doctorData?.weeklySchedule && Object.values(doctorData.weeklySchedule).some(
        day => day.isWorking && day.timeSlots && day.timeSlots.length > 0
    )

    const getScheduleSummary = () => {
        if (!doctorData?.weeklySchedule) return null
        const dayLabels = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' }
        const workingDays = Object.entries(doctorData.weeklySchedule)
            .filter(([_, s]) => s.isWorking && s.timeSlots && s.timeSlots.length > 0)
            .map(([day]) => dayLabels[day])
        return workingDays.length > 0 ? workingDays.join(', ') : null
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center'>
                            <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Reschedule Appointment</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>
                </div>

                {/* Current Appointment Info */}
                <div className="p-6 bg-blue-50 border-b border-blue-100">
                    <p className="text-sm text-gray-600 font-medium mb-3">Current Appointment:</p>
                    <div className="flex items-center gap-4">
                        <img src={getProfileImage(appointment.userData.image)} alt={appointment.userData.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
                        <div>
                            <p className="font-bold text-gray-900">{appointment.userData.name}</p>
                            <p className="text-sm text-gray-600">{appointment.userData.email}</p>
                            <div className='flex items-center gap-3 mt-1'>
                                <span className='flex items-center gap-1 text-sm font-semibold text-primary'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                    </svg>
                                    {slotDateFormat(appointment.slotDate)}
                                </span>
                                <span className='flex items-center gap-1 text-sm font-semibold text-primary'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                    {appointment.slotTime}
                                </span>
                            </div>
                        </div>
                    </div>
                    {getScheduleSummary() && (
                        <div className='mt-3 pt-3 border-t border-blue-200 flex flex-wrap items-center gap-3 text-sm'>
                            <span className='flex items-center gap-1 text-blue-700'>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                </svg>
                                Working: <strong>{getScheduleSummary()}</strong>
                            </span>
                            <span className='flex items-center gap-1 text-blue-600'>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                </svg>
                                {doctorData?.slotDuration || 20} min slots
                            </span>
                        </div>
                    )}
                </div>

                {/* Slot Content */}
                {loading ? (
                    <div className="p-12 text-center">
                        <div className='w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                        <p className='text-gray-500'>Loading available slots...</p>
                    </div>
                ) : !hasScheduleConfigured ? (
                    <div className="p-6">
                        <div className='text-center py-12 bg-yellow-50 rounded-xl border-2 border-dashed border-yellow-200'>
                            <div className='w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg className='w-7 h-7 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                                </svg>
                            </div>
                            <h3 className='text-xl font-semibold text-yellow-700 mb-2'>Schedule Not Available</h3>
                            <p className='text-yellow-600'>The working schedule hasn't been configured yet.</p>
                        </div>
                    </div>
                ) : !hasAnySlots ? (
                    <div className="p-6">
                        <div className='text-center py-12 bg-orange-50 rounded-xl border-2 border-dashed border-orange-200'>
                            <div className='w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg className='w-7 h-7 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                </svg>
                            </div>
                            <h3 className='text-xl font-semibold text-orange-700 mb-2'>No Slots Available</h3>
                            <p className='text-orange-600'>No available slots within the next {doctorData?.advanceBookingDays || 7} days.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-6 max-h-96 overflow-y-auto">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select New Date & Time</h3>

                            {/* Date Selection */}
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-3">Available Dates:</p>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {docSlots.map((dayObj, index) => {
                                        const d = dayObj.date
                                        const hasSlots = dayObj.slots && dayObj.slots.length > 0
                                        const isActive = slotIndex === index
                                        const isToday = index === 0
                                        const isDisabled = !hasSlots || dayObj.isBlocked || dayObj.isDayOff
                                        let cardStyle = '', statusText = ''
                                        if (dayObj.isBlocked) { cardStyle = 'bg-red-50 border-red-200 text-red-500'; statusText = dayObj.blockReason || 'Blocked' }
                                        else if (dayObj.isDayOff) { cardStyle = 'bg-orange-50 border-orange-200 text-orange-500'; statusText = 'Day Off' }
                                        else if (isActive && hasSlots) { cardStyle = 'bg-primary border-primary text-white shadow-lg'; statusText = `${dayObj.slots.length} slots` }
                                        else if (hasSlots) { cardStyle = 'bg-white border-gray-200 hover:border-primary'; statusText = `${dayObj.slots.length} slots` }
                                        else { cardStyle = 'bg-gray-50 border-gray-100 text-gray-400'; statusText = 'Fully Booked' }
                                        return (
                                            <button key={index} onClick={() => { if (!isDisabled) { setSlotIndex(index); setNewSlotTime('') } }}
                                                disabled={isDisabled}
                                                className={`flex-shrink-0 min-w-24 p-3 rounded-xl text-center transition-all border-2 ${cardStyle} ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                {isToday && <p className={`text-xs font-medium mb-1 ${isActive && hasSlots ? 'text-white/80' : 'text-primary'}`}>Today</p>}
                                                <p className="text-lg font-bold">{d.getDate()}</p>
                                                <p className="text-xs">{d.toLocaleString('en-US', { month: 'short' })}</p>
                                                <p className="text-xs font-semibold">{daysOfWeek[d.getDay()]}</p>
                                                <p className={`text-xs mt-1 ${isActive && hasSlots ? 'text-white/70' : ''}`}>{statusText}</p>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Time Selection */}
                            <div>
                                <p className="text-sm text-gray-600 mb-3">Available Time Slots:</p>
                                {activeDay?.isBlocked ? (
                                    <div className='text-center py-8 bg-red-50 rounded-xl border-2 border-dashed border-red-200'>
                                        <svg className='w-8 h-8 text-red-400 mx-auto mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636' />
                                        </svg>
                                        <p className="text-red-600 font-medium">Unavailable on this day</p>
                                        <p className="text-sm text-red-500 mt-1">{activeDay.blockReason || 'Please select another date'}</p>
                                    </div>
                                ) : activeDay?.isDayOff ? (
                                    <div className='text-center py-8 bg-orange-50 rounded-xl border-2 border-dashed border-orange-200'>
                                        <svg className='w-8 h-8 text-orange-400 mx-auto mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                        </svg>
                                        <p className="text-orange-600 font-medium">Day Off — please select another date</p>
                                    </div>
                                ) : slotRows.length > 0 ? (
                                    <div className="space-y-2">
                                        {slotRows.map((row, rIdx) => (
                                            <div key={rIdx} className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                                                {row.map((item, idx) => (
                                                    <button key={idx} onClick={() => setNewSlotTime(item.time)}
                                                        className={`p-2 rounded-lg text-sm font-semibold transition-all border-2 ${
                                                            newSlotTime === item.time
                                                                ? 'bg-primary border-primary text-white shadow-lg'
                                                                : 'bg-white border-gray-200 hover:border-primary hover:shadow-md'}`}>
                                                        {item.time}
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200'>
                                        <svg className='w-8 h-8 text-gray-400 mx-auto mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                        </svg>
                                        <p className="text-gray-500">All slots are booked for this day</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {newSlotTime && docSlots[slotIndex] && !docSlots[slotIndex].isBlocked && !docSlots[slotIndex].isDayOff && (
                            <div className="px-6 pb-4">
                                <div className="p-3 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-2">
                                    <svg className='w-4 h-4 text-green-600 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                                    </svg>
                                    <p className="text-sm font-bold text-green-700">
                                        {docSlots[slotIndex].date.getDate()} {months[docSlots[slotIndex].date.getMonth()]} {docSlots[slotIndex].date.getFullYear()} at {newSlotTime}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                        Cancel
                    </button>
                    <button onClick={handleConfirmSlot}
                        disabled={!newSlotTime || loading || !hasAnySlots || !hasScheduleConfigured}
                        className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        Continue
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RescheduleModal