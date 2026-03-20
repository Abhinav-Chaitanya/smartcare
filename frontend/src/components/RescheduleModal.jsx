/*import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const RescheduleModal = ({ appointment, onClose, onSuccess }) => {
  const { backendUrl, token, doctors } = useContext(AppContext)

  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [newSlotTime, setNewSlotTime] = useState('')
  const [loading, setLoading] = useState(false)

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Find doctor info
  const doctor = doctors.find(d => d._id === appointment.docId)

  //---------- Helper Functions ---------- 
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

  // ---------- Generate Available Slots ---------- 
  const getAvailableSlots = () => {
    if (!doctor) return

    const allDays = []
    const today = new Date()
    const interval = 20
    const windows = [
      [10, 13],
      [14, 17],
      [18, 21],
    ]

    const bookedSlots = doctor.slots_booked || {}

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(today)
      dayDate.setHours(0, 0, 0, 0)
      dayDate.setDate(today.getDate() + i)

      const slotsForDay = []

      windows.forEach(([startHour, endHour]) => {
        const windowStart = new Date(dayDate)
        windowStart.setHours(startHour, 0, 0, 0)

        const windowEnd = new Date(dayDate)
        windowEnd.setHours(endHour, 0, 0, 0)

        let cursor = new Date(windowStart)

        if (i === 0) {
          const now = new Date()
          if (now >= windowEnd) return
          if (now > windowStart) {
            cursor = roundUpToNextInterval(now, interval)
            if (cursor >= windowEnd) return
          }
        }

        while (cursor < windowEnd) {
          const formattedTime = format12(cursor)

          const day = cursor.getDate()
          const month = cursor.getMonth() + 1
          const year = cursor.getFullYear()
          const slotDate = `${day}_${month}_${year}`

          const isAvailable = bookedSlots[slotDate]
            ? !bookedSlots[slotDate].includes(formattedTime)
            : true

          if (isAvailable) {
            slotsForDay.push({
              datetime: new Date(cursor),
              time: formattedTime,
            })
          }

          cursor = new Date(cursor)
          cursor.setMinutes(cursor.getMinutes() + interval)
        }
      })

      allDays.push({
        date: dayDate,
        slots: slotsForDay,
      })
    }

    setDocSlots(allDays)
  }

  // ---------- Reschedule Appointment ---------- 
  const handleReschedule = async () => {
    if (!newSlotTime) {
      toast.warn('Please select a new time slot')
      return
    }

    try {
      setLoading(true)

      const dateObj = docSlots[slotIndex].date
      const newSlotDate = `${dateObj.getDate()}_${dateObj.getMonth() + 1}_${dateObj.getFullYear()}`

      const { data } = await axios.post(
        backendUrl + '/api/user/reschedule-appointment',
        {
          appointmentId: appointment._id,
          newSlotDate,
          newSlotTime
        },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        onSuccess()
        onClose()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAvailableSlots()
  }, [doctor])

  const activeDay = docSlots[slotIndex]
  const chunkArray = (arr, n) => {
    const out = []
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
    return out
  }

  const slotRows = activeDay?.slots?.length ? chunkArray(activeDay.slots, 7) : []

  if (!doctor) return null

  // ---------- UI ---------- 
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl">
        
      
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

        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-gray-600 font-medium mb-2">Current Appointment:</p>
          <div className="flex items-center gap-4">
            <img 
              src={doctor.image} 
              alt={doctor.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <p className="font-bold text-gray-900">{doctor.name}</p>
              <p className="text-sm text-gray-600">{doctor.speciality}</p>
              <p className="text-sm font-semibold text-primary mt-1">
                {slotDateFormat(appointment.slotDate)} | {appointment.slotTime}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Select New Date & Time
          </h3>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Available Dates:</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {docSlots.map((dayObj, index) => {
                const d = dayObj.date
                const hasSlots = dayObj.slots.length > 0
                const isActive = slotIndex === index

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (hasSlots) {
                        setSlotIndex(index)
                        setNewSlotTime('')
                      }
                    }}
                    disabled={!hasSlots}
                    className={`flex-shrink-0 min-w-20 p-3 rounded-xl text-center transition-all border-2
                      ${isActive 
                        ? 'bg-primary border-primary text-white shadow-lg' 
                        : hasSlots 
                          ? 'bg-white border-gray-200 hover:border-primary' 
                          : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    <p className="text-lg font-bold">{d.getDate()}</p>
                    <p className="text-xs">{d.toLocaleString('en-US', { month: 'short' })}</p>
                    <p className="text-xs font-semibold">{daysOfWeek[d.getDay()]}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-3">Available Time Slots:</p>
            {slotRows.length > 0 ? (
              <div className="space-y-2">
                {slotRows.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-4 lg:grid-cols-7 gap-2">
                    {row.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setNewSlotTime(item.time)}
                        className={`p-2 rounded-lg text-sm font-semibold transition-all border-2
                          ${newSlotTime === item.time
                            ? 'bg-primary border-primary text-white shadow-lg'
                            : 'bg-white border-gray-200 hover:border-primary'}`}
                      >
                        {item.time}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No slots available</p>
            )}
          </div>
        </div>

       
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReschedule}
            disabled={loading || !newSlotTime}
            className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RescheduleModal    */



import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const RescheduleModal = ({ appointment, onClose, onSlotConfirmed }) => {
  const { doctors, getDoctorsData } = useContext(AppContext)

  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [newSlotTime, setNewSlotTime] = useState('')
  const [loading, setLoading] = useState(true)

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Find doctor info
  const doctor = doctors.find(d => d._id === appointment.docId)

  // ✅ Refresh doctor data on mount to get latest schedule
  useEffect(() => {
    const refreshData = async () => {
      setLoading(true)
      await getDoctorsData()
    }
    refreshData()
  }, [])

  // ✅ Generate slots when doctor data is available
  useEffect(() => {
    if (doctor) {
      getAvailableSlots()
    }
  }, [doctor])

  //---------- Helper Functions ---------- 

  // ✅ Parse time string to hours and minutes
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

  // ✅ Check if a date is blocked
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

  // ✅ UPDATED: Generate Available Slots using DYNAMIC schedule
  const getAvailableSlots = () => {
    if (!doctor) return

    setLoading(true)
    const allDays = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // ✅ Get doctor's schedule settings (with fallback to defaults)
    const weeklySchedule = doctor.weeklySchedule
    const slotDuration = doctor.slotDuration || 20
    const advanceBookingDays = doctor.advanceBookingDays || 7
    const blockedDates = doctor.blockedDates || []
    const bookedSlots = doctor.slots_booked || {}

    // ✅ Check if doctor has schedule set
    const hasSchedule = weeklySchedule && Object.values(weeklySchedule).some(
      day => day.isWorking && day.timeSlots && day.timeSlots.length > 0
    )

    // ✅ Generate slots for each day
    for (let i = 0; i < advanceBookingDays; i++) {
      const dayDate = new Date(today)
      dayDate.setDate(today.getDate() + i)

      const dayIndex = dayDate.getDay() // 0 = Sunday, 1 = Monday, etc.
      const dayName = dayNames[dayIndex] // 'sunday', 'monday', etc.

      // ✅ Check if date is blocked (leave/holiday)
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

      // ✅ Get schedule for this day
      let daySchedule = null
      if (hasSchedule && weeklySchedule[dayName]) {
        daySchedule = weeklySchedule[dayName]
      }

      // ✅ If no schedule or not working this day
      if (!daySchedule || !daySchedule.isWorking || !daySchedule.timeSlots || daySchedule.timeSlots.length === 0) {
        allDays.push({
          date: dayDate,
          slots: [],
          isDayOff: true
        })
        continue
      }

      const slotsForDay = []

      // ✅ Generate slots for each time window in the day's schedule
      daySchedule.timeSlots.forEach(({ start, end }) => {
        const startTime = parseTime(start)
        const endTime = parseTime(end)

        const windowStart = new Date(dayDate)
        windowStart.setHours(startTime.hours, startTime.minutes, 0, 0)

        const windowEnd = new Date(dayDate)
        windowEnd.setHours(endTime.hours, endTime.minutes, 0, 0)

        let cursor = new Date(windowStart)

        // ✅ For today, skip past slots
        if (i === 0) {
          const now = new Date()
          if (now >= windowEnd) return // Skip this entire window
          if (now > windowStart) {
            cursor = roundUpToNextInterval(now, slotDuration)
            if (cursor >= windowEnd) return
          }
        }

        // ✅ Generate individual slots
        while (cursor < windowEnd) {
          const formattedTime = format12(cursor)

          const day = cursor.getDate()
          const month = cursor.getMonth() + 1
          const year = cursor.getFullYear()
          const slotDate = `${day}_${month}_${year}`

          // ✅ Check if slot is already booked
          const isBooked = bookedSlots[slotDate]
            ? bookedSlots[slotDate].some(
              bookedTime => bookedTime.toLowerCase().trim() === formattedTime.toLowerCase().trim()
            )
            : false

          // ✅ Check if it's the current appointment slot - SKIP IT
          const isCurrentSlot = slotDate === appointment.slotDate &&
            formattedTime.toLowerCase().trim() === appointment.slotTime.toLowerCase().trim()

          // ✅ Only add if NOT booked AND NOT current slot
          if (!isBooked && !isCurrentSlot) {
            slotsForDay.push({
              datetime: new Date(cursor),
              time: formattedTime,
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

    // ✅ Auto-select first day with available slots
    const firstAvailableIndex = allDays.findIndex(
      day => day.slots && day.slots.length > 0 && !day.isBlocked && !day.isDayOff
    )
    if (firstAvailableIndex !== -1) {
      setSlotIndex(firstAvailableIndex)
    }
  }

  // ✅ Handle slot confirmation
  const handleConfirmSlot = () => {
    if (!newSlotTime) {
      toast.warn('Please select a new time slot')
      return
    }

    const dateObj = docSlots[slotIndex].date
    const newSlotDate = `${dateObj.getDate()}_${dateObj.getMonth() + 1}_${dateObj.getFullYear()}`

    // ✅ Pass the selected slot to parent component
    onSlotConfirmed(newSlotDate, newSlotTime)
  }

  const activeDay = docSlots[slotIndex]
  const chunkArray = (arr, n) => {
    const out = []
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
    return out
  }

  const slotRows = activeDay?.slots?.length ? chunkArray(activeDay.slots, 6) : []

  // ✅ Check if any slots are available
  const hasAnySlots = docSlots.some(day => day.slots && day.slots.length > 0)

  // ✅ Check if schedule is configured
  const hasScheduleConfigured = doctor?.weeklySchedule && Object.values(doctor.weeklySchedule).some(
    day => day.isWorking && day.timeSlots && day.timeSlots.length > 0
  )

  // ✅ Get schedule summary for display
  const getScheduleSummary = () => {
    if (!doctor?.weeklySchedule) return null

    const dayLabels = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    }

    const workingDays = Object.entries(doctor.weeklySchedule)
      .filter(([_, schedule]) => schedule.isWorking && schedule.timeSlots && schedule.timeSlots.length > 0)
      .map(([day, _]) => dayLabels[day])

    if (workingDays.length === 0) return null

    return workingDays.join(', ')
  }

  if (!doctor) return null

  // ---------- UI ---------- 
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl">

        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <svg className='w-6 h-6 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
              </svg>
              Reschedule Appointment
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-all"
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Current Appointment Info */}
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-gray-600 font-medium mb-2">Current Appointment:</p>
          <div className="flex items-center gap-4">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-16 h-16 rounded-lg object-cover bg-primary"
            />
            <div>
              <p className="font-bold text-gray-900">{doctor.name}</p>
              <p className="text-sm text-gray-600">{doctor.speciality}</p>
              <p className="text-sm font-semibold text-primary mt-1 flex items-center gap-2">
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                </svg>
                {slotDateFormat(appointment.slotDate)}
                <span className='text-gray-400'>|</span>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                {appointment.slotTime}
              </p>
            </div>
          </div>

          {/* ✅ Schedule Info */}
          {getScheduleSummary() && (
            <div className='mt-3 pt-3 border-t border-blue-200'>
              <div className='flex flex-wrap items-center gap-3 text-sm'>
                <span className='text-blue-700 flex items-center gap-1'>
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                  </svg>
                  Working: <strong>{getScheduleSummary()}</strong>
                </span>
                <span className='text-blue-600 flex items-center gap-1'>
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  {doctor.slotDuration || 20} min slots
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
          // ✅ No schedule configured
          <div className="p-6">
            <div className='text-center py-12 bg-yellow-50 rounded-xl border-2 border-dashed border-yellow-200'>
              <div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-yellow-700 mb-2'>Schedule Not Available</h3>
              <p className='text-yellow-600 max-w-md mx-auto'>
                This doctor hasn't configured their working schedule yet.
                Please try again later or contact support.
              </p>
            </div>
          </div>
        ) : !hasAnySlots ? (
          // ✅ No slots available
          <div className="p-6">
            <div className='text-center py-12 bg-orange-50 rounded-xl border-2 border-dashed border-orange-200'>
              <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-orange-700 mb-2'>No Slots Available</h3>
              <p className='text-orange-600 max-w-md mx-auto'>
                There are no available slots for rescheduling within the next {doctor.advanceBookingDays || 7} days.
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

                    // ✅ Determine styling based on day status
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
                  // ✅ Blocked day message
                  <div className='text-center py-8 bg-red-50 rounded-xl border-2 border-dashed border-red-200'>
                    <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                      <svg className='w-6 h-6 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' />
                      </svg>
                    </div>
                    <p className="text-red-600 font-medium">Doctor is unavailable on this day</p>
                    <p className="text-sm text-red-500 mt-1">{activeDay.blockReason || 'Please select another date'}</p>
                  </div>
                ) : activeDay?.isDayOff ? (
                  // ✅ Day off message
                  <div className='text-center py-8 bg-orange-50 rounded-xl border-2 border-dashed border-orange-200'>
                    <div className='w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                      <svg className='w-6 h-6 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' />
                      </svg>
                    </div>
                    <p className="text-orange-600 font-medium">Doctor doesn't work on this day</p>
                    <p className="text-sm text-orange-500 mt-1">Please select another date</p>
                  </div>
                ) : slotRows.length > 0 ? (
                  // ✅ Available slots grid
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
                  // ✅ No slots available for this day
                  <div className='text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200'>
                    <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                      <svg className='w-6 h-6 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                    </div>
                    <p className="text-gray-500">All slots are booked for this day</p>
                    <p className="text-sm text-gray-400 mt-1">Please select another date</p>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Selected Slot Preview */}
            {newSlotTime && docSlots[slotIndex] && !docSlots[slotIndex].isBlocked && !docSlots[slotIndex].isDayOff && (
              <div className="px-6 pb-2">
                <div className="p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                  <p className="text-sm text-gray-600">New appointment will be:</p>
                  <p className="font-bold text-green-700 flex items-center gap-2 mt-1">
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                    </svg>
                    {docSlots[slotIndex].date.getDate()} {months[docSlots[slotIndex].date.getMonth()]} {docSlots[slotIndex].date.getFullYear()}
                    <span className='text-gray-400'>|</span>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    {newSlotTime}
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
              className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            >
              Continue to Verify
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M14 5l7 7m0 0l-7 7m7-7H3' />
              </svg>
            </button>
          </div>

          {/* ✅ Info text */}
          <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
            <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
            </svg>
            You'll need to verify with OTP to complete rescheduling
          </p>
        </div>
      </div>
    </div>
  )
}

export default RescheduleModal