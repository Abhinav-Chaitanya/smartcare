import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointment = () => {
    const { docId } = useParams()
    const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
    const navigate = useNavigate()

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

    const [docInfo, setDocInfo] = useState(null)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')
    const [loading, setLoading] = useState(true)

    /* ---------- helpers ---------- */
    const roundUpToNextInterval = (date, interval) => {
        const d = new Date(date)
        const r = d.getMinutes() % interval
        if (r === 0) return d
        d.setMinutes(d.getMinutes() + (interval - r), 0, 0)
        return d
    }

    const format12 = (date) =>
        date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })

    const parseTime = (timeStr) => {
        const [time, period] = timeStr.split(' ')
        let [hours, minutes] = time.split(':').map(Number)

        if (period === 'PM' && hours !== 12) {
            hours += 12
        } else if (period === 'AM' && hours === 12) {
            hours = 0
        }

        return { hours, minutes }
    }

    const isDateBlocked = (date, blockedDates) => {
        if (!blockedDates || blockedDates.length === 0) return false

        const day = date.getDate()
        const month = date.getMonth() + 1
        const year = date.getFullYear()
        const dateStr = `${day}_${month}_${year}`

        return blockedDates.some(b => b.date === dateStr)
    }

    /* ---------- Dynamic slot generation based on doctor's schedule ---------- */
    const getAvailableSlots = () => {
        if (!docInfo) return

        const allDays = []
        const today = new Date()

        const weeklySchedule = docInfo.weeklySchedule
        const slotDuration = docInfo.slotDuration || 20
        const advanceBookingDays = docInfo.advanceBookingDays || 7
        const blockedDates = docInfo.blockedDates || []
        const bookedSlots = docInfo.slots_booked || {}

        const hasSchedule = weeklySchedule && Object.values(weeklySchedule).some(
            day => day.isWorking && day.timeSlots && day.timeSlots.length > 0
        )

        for (let i = 0; i < advanceBookingDays; i++) {
            const dayDate = new Date(today)
            dayDate.setHours(0, 0, 0, 0)
            dayDate.setDate(today.getDate() + i)

            const dayIndex = dayDate.getDay()
            const dayName = dayNames[dayIndex]

            if (isDateBlocked(dayDate, blockedDates)) {
                allDays.push({
                    date: dayDate,
                    slots: [],
                    isBlocked: true,
                    blockReason: blockedDates.find(b => {
                        const d = dayDate.getDate()
                        const m = dayDate.getMonth() + 1
                        const y = dayDate.getFullYear()
                        return b.date === `${d}_${m}_${y}`
                    })?.reason || 'Unavailable'
                })
                continue
            }

            let daySchedule = null
            if (hasSchedule && weeklySchedule[dayName]) {
                daySchedule = weeklySchedule[dayName]
            }

            if (!daySchedule || !daySchedule.isWorking || !daySchedule.timeSlots || daySchedule.timeSlots.length === 0) {
                allDays.push({
                    date: dayDate,
                    slots: [],
                    isDayOff: true
                })
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

                    const day = cursor.getDate()
                    const month = cursor.getMonth() + 1
                    const year = cursor.getFullYear()
                    const slotDate = `${day}_${month}_${year}`

                    const isBooked = bookedSlots[slotDate]
                        ? bookedSlots[slotDate].some(
                            bookedTime => bookedTime.toLowerCase().trim() === formattedTime.toLowerCase().trim()
                        )
                        : false

                    if (!isBooked) {
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
            })
        }

        setDocSlots(allDays)
        setLoading(false)
    }

    /* ---------- booking ---------- */
    const bookAppointment = async () => {
        if (!token) {
            toast.warn('Please login to book appointment')
            return navigate('/login')
        }

        if (!slotTime) {
            toast.warn('Please select a time slot')
            return
        }

        try {
            const dateObj = docSlots[slotIndex].date
            const slotDate = `${dateObj.getDate()}_${dateObj.getMonth() + 1}_${dateObj.getFullYear()}`

            const { data } = await axios.post(
                backendUrl + '/api/user/book-appointment',
                { docId, slotDate, slotTime },
                { headers: { token } }
            )

            if (data.success) {
                await getDoctorsData()
                navigate(`/payment/${data.appointmentId}`)
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            console.log(err)
            toast.error(err.message)
        }
    }

    /* ---------- effects ---------- */
    useEffect(() => {
        getDoctorsData()
    }, [docId])

    useEffect(() => {
        const doc = doctors.find(d => d._id === docId)
        if (doc) {
            setDocInfo(JSON.parse(JSON.stringify(doc)))
        }
    }, [doctors, docId])

    useEffect(() => {
        if (docInfo) {
            setLoading(true)
            getAvailableSlots()
            setSlotIndex(0)
            setSlotTime('')
        }
    }, [docInfo])

    useEffect(() => {
        if (docSlots.length > 0) {
            const firstAvailableIndex = docSlots.findIndex(
                day => day.slots && day.slots.length > 0 && !day.isBlocked && !day.isDayOff
            )
            if (firstAvailableIndex !== -1 && firstAvailableIndex !== slotIndex) {
                setSlotIndex(firstAvailableIndex)
            }
        }
    }, [docSlots])

    if (!docInfo) return (
        <div className='flex items-center justify-center min-h-[60vh]'>
            <div className='text-center'>
                <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                <p className='text-gray-500'>Loading doctor details...</p>
            </div>
        </div>
    )

    const activeDay = docSlots[slotIndex]

    const chunkArray = (arr, n) => {
        const out = []
        for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
        return out
    }

    const slotRows = activeDay?.slots?.length
        ? chunkArray(activeDay.slots, 7)
        : []

    const hasAnySlots = docSlots.some(day => day.slots && day.slots.length > 0)

    const getScheduleSummary = () => {
        if (!docInfo.weeklySchedule) return null

        const workingDays = Object.entries(docInfo.weeklySchedule)
            .filter(([_, schedule]) => schedule.isWorking)
            .map(([day, _]) => day.charAt(0).toUpperCase() + day.slice(1, 3))

        if (workingDays.length === 0) return null

        return workingDays.join(', ')
    }

    /* ---------- UI ---------- */
    return (
        <div className='py-8'>
            {/* Doctor Profile Card */}
            <div className='bg-white rounded-2xl shadow-lg overflow-hidden mb-12'>
                <div className='flex flex-col lg:flex-row'>
                    {/* Doctor Image */}
                    <div className='lg:w-80 flex-shrink-0'>
                        <div className='relative h-full'>
                            <img
                                className='w-full h-full object-cover bg-primary'
                                src={docInfo.image}
                                alt={docInfo.name}
                            />
                            <div className='absolute top-4 left-4'>
                                <span className={`${docInfo.available ? 'bg-green-500' : 'bg-gray-500'} text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg`}>
                                    <span className={`w-2 h-2 bg-white rounded-full ${docInfo.available ? 'animate-pulse' : ''}`}></span>
                                    {docInfo.available ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Doctor Info */}
                    <div className='flex-1 p-8 lg:p-10'>
                        <div className='flex items-start justify-between mb-6'>
                            <div>
                                <div className='flex items-center gap-3 mb-3'>
                                    <h1 className='text-3xl font-bold text-gray-900'>
                                        {docInfo.name}
                                    </h1>
                                    <img className='w-6 h-6' src={assets.verified_icon} alt='verified' />
                                </div>

                                <div className='flex flex-wrap items-center gap-2 mb-4'>
                                    <span className='bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold'>
                                        {docInfo.speciality}
                                    </span>
                                    <span className='bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium'>
                                        {docInfo.degree}
                                    </span>
                                    <span className='bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium'>
                                        {docInfo.experience}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='mb-6'>
                            <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                                About
                            </h3>
                            <p className='text-gray-700 leading-relaxed'>
                                {docInfo.about}
                            </p>
                        </div>

                        {/* Schedule Info */}
                        {getScheduleSummary() && (
                            <div className='mb-6 p-4 bg-blue-50 rounded-xl'>
                                <div className='flex items-center gap-2 text-blue-700'>
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                    </svg>
                                    <span className='font-medium'>Available Days:</span>
                                    <span>{getScheduleSummary()}</span>
                                </div>
                            </div>
                        )}

                        <div className='flex items-center gap-2 pt-6 border-t border-gray-200'>
                            <span className='text-gray-600 font-medium'>Consultation Fee:</span>
                            <span className='text-2xl font-bold text-primary'>
                                {currencySymbol}{docInfo.fees}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Section */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-12'>
                <div className='mb-8'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                        <svg className='w-7 h-7 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        Select Appointment Slot
                    </h2>
                    <p className='text-gray-600'>
                        Choose your preferred date and time for the consultation
                    </p>
                </div>

                {loading ? (
                    <div className='flex items-center justify-center py-12'>
                        <div className='text-center'>
                            <div className='w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3'></div>
                            <p className='text-gray-500'>Loading available slots...</p>
                        </div>
                    </div>
                ) : !docInfo.available ? (
                    <div className='text-center py-12 bg-red-50 rounded-xl border-2 border-dashed border-red-200'>
                        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                        </div>
                        <h3 className='text-xl font-semibold text-gray-700 mb-2'>Doctor Unavailable</h3>
                        <p className='text-gray-500 max-w-md mx-auto'>
                            This doctor is currently not accepting new appointments. Please check back later.
                        </p>
                    </div>
                ) : !hasAnySlots ? (
                    // No slots available message
                    <div className='text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200'>
                        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                        </div>
                        <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Slots Available</h3>
                        <p className='text-gray-500 max-w-md mx-auto'>
                            This doctor currently has no available appointment slots.
                            Please check back later or try another doctor.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Date Selection */}
                        <div className='mb-8'>
                            <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                                Available Dates
                            </h3>
                            <div className='flex gap-3 overflow-x-auto pb-2 scrollbar-hide'>
                                {docSlots.map((dayObj, index) => {
                                    const d = dayObj.date
                                    const hasSlots = dayObj.slots && dayObj.slots.length > 0
                                    const isBlocked = dayObj.isBlocked
                                    const isDayOff = dayObj.isDayOff
                                    const isActive = slotIndex === index
                                    const isToday = index === 0

                                    let statusText = ''
                                    let statusColor = ''

                                    if (isBlocked) {
                                        statusText = dayObj.blockReason || 'Blocked'
                                        statusColor = 'text-red-500'
                                    } else if (isDayOff) {
                                        statusText = 'Day Off'
                                        statusColor = 'text-gray-400'
                                    } else if (!hasSlots) {
                                        statusText = 'Not Available'
                                        statusColor = 'text-orange-500'
                                    } else {
                                        statusText = `${dayObj.slots.length} slots`
                                        statusColor = 'text-green-600'
                                    }

                                    const isDisabled = !hasSlots || isBlocked || isDayOff

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (!isDisabled) {
                                                    setSlotIndex(index)
                                                    setSlotTime('')
                                                }
                                            }}
                                            disabled={isDisabled}
                                            className={`flex-shrink-0 min-w-28 p-4 rounded-xl text-center transition-all duration-200 border-2
                                                ${isActive && !isDisabled
                                                    ? 'bg-primary border-primary text-white shadow-lg scale-105'
                                                    : isDisabled
                                                        ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white border-gray-200 text-gray-800 hover:border-primary hover:shadow-md'
                                                }`}
                                        >
                                            {isToday && (
                                                <span className={`text-xs font-semibold mb-1 block ${isActive && !isDisabled ? 'text-white' : 'text-primary'}`}>
                                                    Today
                                                </span>
                                            )}
                                            <p className='text-xl font-bold mb-1'>
                                                {d.getDate()}
                                            </p>
                                            <p className='text-xs font-medium opacity-80'>
                                                {d.toLocaleString('en-US', { month: 'short' })}
                                            </p>
                                            <p className='text-xs font-semibold mt-1'>
                                                {daysOfWeek[d.getDay()]}
                                            </p>
                                            <p className={`text-xs mt-2 font-medium ${isActive && !isDisabled ? 'text-white/80' : statusColor}`}>
                                                {statusText}
                                            </p>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Time Slots */}
                        <div>
                            <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                                Available Time Slots
                            </h3>

                            {activeDay?.isBlocked ? (
                                <div className='text-center py-12 bg-red-50 rounded-xl border-2 border-dashed border-red-200'>
                                    <div className='w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                                        <svg className='w-7 h-7 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' />
                                        </svg>
                                    </div>
                                    <p className='text-red-600 font-medium'>
                                        Doctor is unavailable on this day
                                    </p>
                                    <p className='text-sm text-red-500 mt-1'>
                                        {activeDay.blockReason || 'Please select another date'}
                                    </p>
                                </div>
                            ) : activeDay?.isDayOff ? (
                                <div className='text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200'>
                                    <div className='w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                                        <svg className='w-7 h-7 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' />
                                        </svg>
                                    </div>
                                    <p className='text-gray-600 font-medium'>
                                        Doctor doesn't work on this day
                                    </p>
                                    <p className='text-sm text-gray-500 mt-1'>
                                        Please select another date
                                    </p>
                                </div>
                            ) : slotRows.length > 0 ? (
                                <div className='space-y-3'>
                                    {slotRows.map((row, rIdx) => (
                                        <div key={rIdx} className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3'>
                                            {row.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSlotTime(item.time)}
                                                    className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 border-2
                                                        ${slotTime === item.time
                                                            ? 'bg-primary border-primary text-white shadow-lg scale-105'
                                                            : 'bg-white border-gray-200 text-gray-800 hover:border-primary hover:shadow-md'
                                                        }`}
                                                >
                                                    {item.time}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='text-center py-12 bg-orange-50 rounded-xl border-2 border-dashed border-orange-200'>
                                    <div className='w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                                        <svg className='w-7 h-7 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                        </svg>
                                    </div>
                                    <p className='text-orange-600 font-medium'>
                                        All slots are booked for this day
                                    </p>
                                    <p className='text-sm text-orange-500 mt-1'>
                                        Please select another date
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Book Button */}
                        {slotTime && (
                            <div className='mt-8 pt-6 border-t border-gray-200'>
                                <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                                    <div className='text-center sm:text-left'>
                                        <p className='text-sm text-gray-600 mb-1'>Selected Slot</p>
                                        <p className='text-lg font-bold text-gray-900'>
                                            {activeDay?.date.toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric'
                                            })} at {slotTime}
                                        </p>
                                    </div>

                                    <button
                                        onClick={bookAppointment}
                                        className='w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2'
                                    >
                                        <span>Book Appointment</span>
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M14 5l7 7m0 0l-7 7m7-7H3' />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
        </div>
    )
}

export default Appointment