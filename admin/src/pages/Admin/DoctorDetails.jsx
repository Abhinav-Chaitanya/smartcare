import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const DoctorDetails = () => {

    const { docId } = useParams()
    const navigate = useNavigate()

    const { aToken, getDoctorById, changeAvailability, editDoctor, blockDoctor, unblockDoctor, departments, getAllDepartments } = useContext(AdminContext)
    const { slotDateFormat } = useContext(AppContext)

    const [doctor, setDoctor] = useState(null)
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [slotIndex, setSlotIndex] = useState(0)
    const [docSlots, setDocSlots] = useState([])
    const [changingAvailability, setChangingAvailability] = useState(false)

    const [viewMode, setViewMode] = useState('upcoming')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [specificDate, setSpecificDate] = useState('')
    const [appliedCustomRange, setAppliedCustomRange] = useState({ start: '', end: '' })
    const [appliedSpecificDate, setAppliedSpecificDate] = useState('')
    const [daysToShow, setDaysToShow] = useState(7)

    // ✅ Edit modal state
    const [showEditModal, setShowEditModal] = useState(false)
    const [editForm, setEditForm] = useState({})
    const [editImageFile, setEditImageFile] = useState(null)
    const [editImagePreview, setEditImagePreview] = useState('')
    const [isEditSubmitting, setIsEditSubmitting] = useState(false)

    // ✅ Block modal state
    const [showBlockModal, setShowBlockModal] = useState(false)
    const [blockReason, setBlockReason] = useState('')
    const [isBlocking, setIsBlocking] = useState(false)

    // ✅ Unblock modal state
    const [showUnblockModal, setShowUnblockModal] = useState(false)
    const [unblockNewDept, setUnblockNewDept] = useState('')
    const [isUnblocking, setIsUnblocking] = useState(false)
    const [deptExists, setDeptExists] = useState(true)

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

    const fetchDoctorData = async () => {
        setLoading(true)
        const data = await getDoctorById(docId)
        if (data) {
            setDoctor(data.doctor)
            setAppointments(data.appointments)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (aToken && docId) {
            fetchDoctorData()
            getAllDepartments()
        }
    }, [aToken, docId])

    // Check if doctor's department still exists when loading for unblock
    useEffect(() => {
        if (doctor && departments.length > 0) {
            const exists = departments.some(
                d => d.name.toLowerCase() === doctor.speciality?.toLowerCase()
            )
            setDeptExists(exists)
        }
    }, [doctor, departments])

    // Open edit modal — prefill form
    const openEditModal = () => {
        setEditForm({
            name: doctor.name || '',
            speciality: doctor.speciality || '',
            degree: doctor.degree || '',
            experience: doctor.experience || '',
            about: doctor.about || '',
            fees: doctor.fees || '',
            addressLine1: doctor.address?.line1 || '',
            addressLine2: doctor.address?.line2 || '',
        })
        setEditImagePreview(doctor.image || '')
        setEditImageFile(null)
        setShowEditModal(true)
    }

    const handleEditImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setEditImageFile(file)
            setEditImagePreview(URL.createObjectURL(file))
        }
    }

    const handleEditSubmit = async () => {
        setIsEditSubmitting(true)
        const formData = new FormData()
        formData.append('name', editForm.name)
        formData.append('speciality', editForm.speciality)
        formData.append('degree', editForm.degree)
        formData.append('experience', editForm.experience)
        formData.append('about', editForm.about)
        formData.append('fees', editForm.fees)
        formData.append('address', JSON.stringify({ line1: editForm.addressLine1, line2: editForm.addressLine2 }))
        if (editImageFile) {
            formData.append('image', editImageFile)
        }

        const success = await editDoctor(docId, formData)
        if (success) {
            setShowEditModal(false)
            fetchDoctorData()
        }
        setIsEditSubmitting(false)
    }

    const handleBlockSubmit = async () => {
        setIsBlocking(true)
        const success = await blockDoctor(docId, blockReason)
        if (success) {
            setShowBlockModal(false)
            setBlockReason('')
            fetchDoctorData()
        }
        setIsBlocking(false)
    }

    const handleUnblockSubmit = async () => {
        // If department was deleted, require new dept selection
        if (!deptExists && !unblockNewDept) {
            return
        }
        setIsUnblocking(true)
        const success = await unblockDoctor(docId, deptExists ? '' : unblockNewDept)
        if (success) {
            setShowUnblockModal(false)
            setUnblockNewDept('')
            fetchDoctorData()
        }
        setIsUnblocking(false)
    }

    useEffect(() => {
        if (doctor) {
            if (viewMode === 'upcoming') {
                generateUpcomingSlots()
            } else if (viewMode === 'custom' && appliedCustomRange.start) {
                generateCustomSlots(appliedCustomRange.start, appliedCustomRange.end)
            } else if (viewMode === 'specific' && appliedSpecificDate) {
                generateCustomSlots(appliedSpecificDate, appliedSpecificDate)
            }
        }
    }, [doctor, appointments, viewMode, appliedCustomRange, appliedSpecificDate, daysToShow])

    const parseTime = (timeStr) => {
        if (!timeStr) return { hours: 0, minutes: 0 }
        const [time, period] = timeStr.split(' ')
        let [hours, minutes] = time.split(':').map(Number)
        if (period === 'PM' && hours !== 12) hours += 12
        else if (period === 'AM' && hours === 12) hours = 0
        return { hours, minutes }
    }

    const format12 = (date) =>
        date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })

    const roundUpToNextInterval = (date, interval) => {
        const d = new Date(date)
        const r = d.getMinutes() % interval
        if (r === 0) return d
        d.setMinutes(d.getMinutes() + (interval - r), 0, 0)
        return d
    }

    const isDateBlocked = (date, blockedDates) => {
        if (!blockedDates || blockedDates.length === 0) return { blocked: false, reason: '' }
        const day = date.getDate()
        const month = date.getMonth() + 1
        const year = date.getFullYear()
        const dateStr = `${day}_${month}_${year}`
        const blockedEntry = blockedDates.find(b => b.date === dateStr)
        if (blockedEntry) return { blocked: true, reason: blockedEntry.reason || 'Unavailable' }
        return { blocked: false, reason: '' }
    }

    const generateSlotsForDay = (dayDate, bookedSlotsMap, includePast = false) => {
        const slotsForDay = []
        const now = new Date()
        const weeklySchedule = doctor.weeklySchedule
        const slotDuration = doctor.slotDuration || 20
        const blockedDates = doctor.blockedDates || []

        const blockInfo = isDateBlocked(dayDate, blockedDates)
        if (blockInfo.blocked) return { slots: [], isBlocked: true, blockReason: blockInfo.reason }

        const dayIndex = dayDate.getDay()
        const dayName = dayNames[dayIndex]
        const hasSchedule = weeklySchedule && Object.values(weeklySchedule).some(
            day => day.isWorking && day.timeSlots && day.timeSlots.length > 0
        )

        let daySchedule = null
        if (hasSchedule && weeklySchedule[dayName]) daySchedule = weeklySchedule[dayName]

        if (!daySchedule || !daySchedule.isWorking || !daySchedule.timeSlots || daySchedule.timeSlots.length === 0) {
            return { slots: [], isDayOff: true }
        }

        daySchedule.timeSlots.forEach(({ start, end }) => {
            const startTime = parseTime(start)
            const endTime = parseTime(end)
            const windowStart = new Date(dayDate)
            windowStart.setHours(startTime.hours, startTime.minutes, 0, 0)
            const windowEnd = new Date(dayDate)
            windowEnd.setHours(endTime.hours, endTime.minutes, 0, 0)
            let cursor = new Date(windowStart)

            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const isToday = dayDate.getTime() === today.getTime()

            if (isToday && !includePast) {
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
                const slotKey = `${slotDate}_${formattedTime}`
                const bookingInfo = bookedSlotsMap[slotKey] || null
                const isBooked = bookingInfo !== null && bookingInfo.status !== 'cancelled'
                const isCompleted = bookingInfo?.status === 'completed'
                const isExpired = bookingInfo?.status === 'expired'
                const slotDateTime = new Date(cursor)
                const isPast = slotDateTime < now

                slotsForDay.push({
                    datetime: new Date(cursor), time: formattedTime, slotDate,
                    isBooked, isCompleted, isExpired, isPast, bookingInfo
                })

                cursor = new Date(cursor)
                cursor.setMinutes(cursor.getMinutes() + slotDuration)
            }
        })

        return { slots: slotsForDay, isBlocked: false, isDayOff: false }
    }

    const generateUpcomingSlots = () => {
        const allDays = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const bookedSlotsMap = {}
        appointments.forEach(apt => {
            const key = `${apt.slotDate}_${apt.slotTime}`
            bookedSlotsMap[key] = {
                patientName: apt.userData?.name || 'Unknown',
                patientEmail: apt.userData?.email || '',
                appointmentId: apt._id,
                status: apt.status
            }
        })

        for (let i = 0; i < daysToShow; i++) {
            const dayDate = new Date(today)
            dayDate.setDate(today.getDate() + i)
            const result = generateSlotsForDay(dayDate, bookedSlotsMap, true)
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

    const generateCustomSlots = (startStr, endStr) => {
        if (!startStr) return
        const allDays = []
        const bookedSlotsMap = {}
        appointments.forEach(apt => {
            const key = `${apt.slotDate}_${apt.slotTime}`
            bookedSlotsMap[key] = {
                patientName: apt.userData?.name || 'Unknown',
                patientEmail: apt.userData?.email || '',
                appointmentId: apt._id,
                status: apt.status
            }
        })

        const start = new Date(startStr)
        start.setHours(0, 0, 0, 0)
        const end = endStr ? new Date(endStr) : new Date(startStr)
        end.setHours(0, 0, 0, 0)
        if (!endStr) end.setDate(end.getDate() + 6)

        const current = new Date(start)
        while (current <= end) {
            const dayDate = new Date(current)
            const result = generateSlotsForDay(dayDate, bookedSlotsMap, true)
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

    const handleAvailabilityChange = async () => {
        setChangingAvailability(true)
        const success = await changeAvailability(docId)
        if (success) {
            setDoctor(prev => ({ ...prev, available: !prev.available }))
        }
        setChangingAvailability(false)
    }

    const handleSlotClick = (slot) => {
        if (slot.bookingInfo && slot.bookingInfo.appointmentId) {
            navigate(`/admin-appointment-details/${slot.bookingInfo.appointmentId}`)
        }
    }

    const chunkArray = (arr, n) => {
        const out = []
        for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
        return out
    }

    const getScheduleSummary = () => {
        if (!doctor?.weeklySchedule) return null
        const dayLabels = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' }
        const workingDays = Object.entries(doctor.weeklySchedule)
            .filter(([_, schedule]) => schedule.isWorking && schedule.timeSlots && schedule.timeSlots.length > 0)
            .map(([day, _]) => dayLabels[day])
        if (workingDays.length === 0) return null
        return workingDays.join(', ')
    }

    if (loading) {
        return (
            <div className='m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-500 text-sm'>Loading doctor details...</p>
                </div>
            </div>
        )
    }

    if (!doctor) {
        return (
            <div className='m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <h3 className='text-xl font-semibold text-gray-700 mb-2'>Doctor Not Found</h3>
                    <button onClick={() => navigate('/doctor-list')} className='text-primary font-medium hover:underline'>
                        Back to Doctors List
                    </button>
                </div>
            </div>
        )
    }

    const activeDay = docSlots[slotIndex]
    const slotRows = activeDay?.slots?.length ? chunkArray(activeDay.slots, 6) : []
    const hasScheduleConfigured = doctor.weeklySchedule && Object.values(doctor.weeklySchedule).some(
        day => day.isWorking && day.timeSlots && day.timeSlots.length > 0
    )

    return (
        <div className='w-full max-w-6xl m-5'>

            {/* Back Button */}
            <button
                onClick={() => navigate('/doctor-list')}
                className='flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-all'
            >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
                </svg>
                <span className='font-medium'>Back to Doctors List</span>
            </button>

            {/* ✅ Blocked Banner */}
            {doctor.isBlocked && (
                <div className='mb-6 p-4 bg-red-50 rounded-xl border-2 border-red-200 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0'>
                            <svg className='w-5 h-5 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' />
                            </svg>
                        </div>
                        <div>
                            <p className='font-bold text-red-700'>This doctor is currently blocked</p>
                            {doctor.blockedReason && (
                                <p className='text-sm text-red-600'>Reason: {doctor.blockedReason}</p>
                            )}
                            <p className='text-sm text-red-500'>Hidden from patients. All confirmed appointments were cancelled.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUnblockModal(true)}
                        className='flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-200 transition-all'
                    >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z' />
                        </svg>
                        Unblock Doctor
                    </button>
                </div>
            )}

            {/* Doctor Profile Card */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8'>
                <div className='flex flex-col lg:flex-row'>

                    {/* Doctor Image */}
                    <div className='lg:w-72 flex-shrink-0 bg-gradient-to-br from-primary/10 to-blue-50 p-8 flex flex-col items-center justify-center'>
                        <div className='relative'>
                            <img
                                className={`w-40 h-40 rounded-2xl object-cover border-4 border-white shadow-lg ${doctor.isBlocked ? 'grayscale opacity-60' : ''}`}
                                src={doctor.image}
                                alt={doctor.name}
                            />
                            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md ${
                                doctor.isBlocked ? 'bg-gray-700 text-white' :
                                doctor.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${doctor.isBlocked ? 'bg-gray-400' : doctor.available ? 'bg-white animate-pulse' : 'bg-white'}`}></span>
                                {doctor.isBlocked ? 'Blocked' : doctor.available ? 'Available' : 'Unavailable'}
                            </div>
                        </div>
                    </div>

                    {/* Doctor Info */}
                    <div className='flex-1 p-6 lg:p-8'>
                        <div className='flex flex-wrap items-start justify-between gap-4 mb-6'>
                            <div>
                                <h1 className='text-2xl font-bold text-gray-800 mb-2'>{doctor.name}</h1>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <span className='bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold'>{doctor.speciality}</span>
                                    <span className='bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium'>{doctor.degree}</span>
                                </div>
                            </div>

                            {/* ✅ Action Buttons */}
                            <div className='flex items-center gap-2 flex-wrap'>
                                {/* Edit Button */}
                                <button
                                    onClick={openEditModal}
                                    className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all'
                                >
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                                    </svg>
                                    Edit
                                </button>

                                {/* Block / Unblock Button */}
                                {!doctor.isBlocked ? (
                                    <>
                                        <button
                                            onClick={handleAvailabilityChange}
                                            disabled={changingAvailability}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                                                doctor.available ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                        >
                                            {changingAvailability ? (
                                                <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin'></div>
                                            ) : (
                                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                                                </svg>
                                            )}
                                            {doctor.available ? 'Mark Unavailable' : 'Mark Available'}
                                        </button>
                                        <button
                                            onClick={() => setShowBlockModal(true)}
                                            className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-800 text-white hover:bg-gray-900 transition-all'
                                        >
                                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' />
                                            </svg>
                                            Block Doctor
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setShowUnblockModal(true)}
                                        className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-all'
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z' />
                                        </svg>
                                        Unblock Doctor
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                            <div className='bg-gray-50 rounded-xl p-4'>
                                <div className='flex items-center gap-2 text-gray-500 text-xs font-medium mb-1'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                    </svg>
                                    EXPERIENCE
                                </div>
                                <p className='text-gray-800 font-semibold'>{doctor.experience}</p>
                            </div>
                            <div className='bg-gray-50 rounded-xl p-4'>
                                <div className='flex items-center gap-2 text-gray-500 text-xs font-medium mb-1'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                    FEES
                                </div>
                                <p className='text-primary font-bold'>Rs. {doctor.fees}</p>
                            </div>
                            <div className='bg-gray-50 rounded-xl p-4'>
                                <div className='flex items-center gap-2 text-gray-500 text-xs font-medium mb-1'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                    </svg>
                                    EMAIL
                                </div>
                                <p className='text-gray-800 font-semibold text-sm truncate'>{doctor.email}</p>
                            </div>
                            <div className='bg-gray-50 rounded-xl p-4'>
                                <div className='flex items-center gap-2 text-gray-500 text-xs font-medium mb-1'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                    </svg>
                                    ADDRESS
                                </div>
                                <p className='text-gray-800 font-semibold text-sm truncate'>{doctor.address?.line1 || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Schedule Info */}
                        {hasScheduleConfigured && (
                            <div className='mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100'>
                                <div className='flex flex-wrap items-center gap-4'>
                                    <div className='flex items-center gap-2 text-blue-700'>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                        </svg>
                                        <span className='font-medium'>Working Days:</span>
                                        <span>{getScheduleSummary()}</span>
                                    </div>
                                    <div className='flex items-center gap-2 text-blue-600'>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                        </svg>
                                        <span>Slot Duration: {doctor.slotDuration || 20} min</span>
                                    </div>
                                    <div className='flex items-center gap-2 text-blue-600'>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                        </svg>
                                        <span>Advance Booking: {doctor.advanceBookingDays || 7} days</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!hasScheduleConfigured && (
                            <div className='mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200'>
                                <div className='flex items-start gap-3'>
                                    <svg className='w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                                    </svg>
                                    <div>
                                        <p className='font-semibold text-yellow-800'>Schedule Not Configured</p>
                                        <p className='text-sm text-yellow-700'>This doctor hasn't set their working schedule yet.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>About</h3>
                            <p className='text-gray-600 leading-relaxed'>{doctor.about}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Time Slots Section — only show if not blocked */}
            {!doctor.isBlocked && (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='p-6 border-b border-gray-100'>
                        <div className='flex flex-col gap-4'>
                            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                                <div>
                                    <h2 className='text-xl font-bold text-gray-800 mb-1'>Appointment Slots</h2>
                                    <p className='text-gray-500 text-sm'>View and manage time slots based on doctor's schedule</p>
                                </div>
                                <div className='flex items-center gap-2 bg-gray-100 p-1 rounded-xl'>
                                    <button
                                        onClick={() => setViewMode('upcoming')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'upcoming' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                                    >
                                        Upcoming
                                    </button>
                                    <button
                                        onClick={() => setViewMode('specific')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'specific' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                                    >
                                        Specific Date
                                    </button>
                                    <button
                                        onClick={() => setViewMode('custom')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'custom' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                                    >
                                        Custom Range
                                    </button>
                                </div>
                            </div>

                            {viewMode === 'upcoming' && (
                                <div className='flex flex-wrap items-center gap-3'>
                                    <span className='text-sm text-gray-600'>Show next:</span>
                                    {[7, 14, 30].map(days => (
                                        <button
                                            key={days}
                                            onClick={() => setDaysToShow(days)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${daysToShow === days ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {days} days
                                        </button>
                                    ))}
                                </div>
                            )}

                            {viewMode === 'specific' && (
                                <div className='flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-xl'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-600 mb-1'>Date</label>
                                        <input type='date' value={specificDate} onChange={(e) => setSpecificDate(e.target.value)}
                                            className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' />
                                    </div>
                                    <button onClick={() => setAppliedSpecificDate(specificDate)} disabled={!specificDate}
                                        className='px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50'>
                                        View Slots
                                    </button>
                                </div>
                            )}

                            {viewMode === 'custom' && (
                                <div className='flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-xl'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-600 mb-1'>Start Date</label>
                                        <input type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                            className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-600 mb-1'>End Date</label>
                                        <input type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate}
                                            className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' />
                                    </div>
                                    <button onClick={() => setAppliedCustomRange({ start: startDate, end: endDate })} disabled={!startDate}
                                        className='px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50'>
                                        View Slots
                                    </button>
                                </div>
                            )}

                            <div className='flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-gray-100'>
                                <div className='flex items-center gap-2 text-gray-600'>
                                    <span className='text-sm font-medium'>Total Appointments: <span className='text-primary font-bold'>{appointments.length}</span></span>
                                </div>
                                <button onClick={() => navigate(`/doctor/${docId}/appointments`)}
                                    className='flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md'>
                                    View All Appointments
                                </button>
                            </div>

                            <div className='flex flex-wrap items-center gap-4'>
                                {[['green', 'Available'], ['red', 'Booked'], ['blue', 'Completed'], ['yellow', 'Expired'], ['gray', 'Past'], ['orange', 'Day Off'], ['red', 'Blocked']].map(([color, label]) => (
                                    <div key={label} className='flex items-center gap-2'>
                                        <div className={`w-3 h-3 bg-${color}-100 border-2 border-${color}-${color === 'gray' ? '300' : color === 'orange' ? '400' : '500'} rounded`}></div>
                                        <span className='text-xs text-gray-600'>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='p-6'>
                        {!hasScheduleConfigured ? (
                            <div className='text-center py-12 bg-yellow-50 rounded-xl border-2 border-dashed border-yellow-200'>
                                <p className='text-yellow-700 font-medium'>No Schedule Configured</p>
                            </div>
                        ) : docSlots.length > 0 ? (
                            <>
                                <div className='mb-6'>
                                    <h3 className='text-sm font-semibold text-gray-600 mb-3'>Select Date</h3>
                                    <div className='flex gap-3 overflow-x-auto pb-2'>
                                        {docSlots.map((dayObj, index) => {
                                            const d = dayObj.date
                                            const isActive = slotIndex === index
                                            const today = new Date(); today.setHours(0, 0, 0, 0)
                                            const isToday = d.getTime() === today.getTime()
                                            const isPastDay = d < today
                                            const isBlocked = dayObj.isBlocked
                                            const isDayOff = dayObj.isDayOff
                                            const bookedCount = dayObj.slots.filter(s => s.isBooked || s.isCompleted || s.isExpired).length
                                            const completedCount = dayObj.slots.filter(s => s.isCompleted).length
                                            const availableCount = dayObj.slots.filter(s => !s.isBooked && !s.isPast).length

                                            let cardStyle = ''
                                            let statusText = ''

                                            if (isBlocked) { cardStyle = 'bg-red-50 border-red-200 text-red-600'; statusText = dayObj.blockReason || 'Blocked' }
                                            else if (isDayOff) { cardStyle = 'bg-orange-50 border-orange-200 text-orange-600'; statusText = 'Day Off' }
                                            else if (isActive) { cardStyle = 'bg-primary border-primary text-white shadow-lg'; statusText = `${availableCount}/${bookedCount}/${completedCount}` }
                                            else if (isPastDay) { cardStyle = 'bg-gray-50 border-gray-200 text-gray-500'; statusText = `${bookedCount} booked` }
                                            else { cardStyle = 'bg-white border-gray-200 hover:border-primary'; statusText = `${availableCount}/${bookedCount}/${completedCount}` }

                                            return (
                                                <button key={index} onClick={() => setSlotIndex(index)}
                                                    disabled={isBlocked || isDayOff}
                                                    className={`flex-shrink-0 min-w-28 p-4 rounded-xl text-center transition-all border-2 ${cardStyle} ${(isBlocked || isDayOff) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    {isToday && <p className={`text-xs font-medium mb-1 ${isActive ? 'text-white/80' : 'text-primary'}`}>Today</p>}
                                                    {isPastDay && !isToday && <p className={`text-xs font-medium mb-1 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>Past</p>}
                                                    <p className='text-xl font-bold'>{d.getDate()}</p>
                                                    <p className='text-xs opacity-80'>{d.toLocaleString('en-US', { month: 'short' })}</p>
                                                    <p className='text-xs font-semibold mt-1'>{daysOfWeek[d.getDay()]}</p>
                                                    <p className={`text-xs mt-2 ${isActive ? 'text-white/70' : ''}`}>{statusText}</p>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {activeDay && !activeDay.isBlocked && !activeDay.isDayOff && (
                                    <div className='flex flex-wrap gap-3 mb-6'>
                                        {[
                                            { label: 'Available', color: 'green', count: activeDay.slots.filter(s => !s.isBooked && !s.isPast).length },
                                            { label: 'Booked', color: 'red', count: activeDay.slots.filter(s => s.isBooked || s.isCompleted || s.isExpired).length },
                                            { label: 'Completed', color: 'blue', count: activeDay.slots.filter(s => s.isCompleted).length },
                                            { label: 'Expired', color: 'yellow', count: activeDay.slots.filter(s => s.isExpired).length },
                                            { label: 'Total', color: 'gray', count: activeDay.slots.length }
                                        ].map(({ label, color, count }) => (
                                            <div key={label} className={`bg-${color}-50 rounded-xl px-4 py-2 min-w-20 text-center`}>
                                                <p className={`text-xs text-${color}-600 font-medium`}>{label}</p>
                                                <p className={`text-xl font-bold text-${color}-700`}>{count}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <h3 className='text-sm font-semibold text-gray-600 mb-3'>Time Slots</h3>
                                    {activeDay?.isBlocked ? (
                                        <div className='text-center py-12 bg-red-50 rounded-xl border-2 border-dashed border-red-200'>
                                            <p className='text-red-600 font-medium'>Blocked: {activeDay.blockReason}</p>
                                        </div>
                                    ) : activeDay?.isDayOff ? (
                                        <div className='text-center py-12 bg-orange-50 rounded-xl border-2 border-dashed border-orange-200'>
                                            <p className='text-orange-600 font-medium'>Day Off</p>
                                        </div>
                                    ) : slotRows.length > 0 ? (
                                        <div className='space-y-3'>
                                            {slotRows.map((row, rIdx) => (
                                                <div key={rIdx} className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3'>
                                                    {row.map((slot, idx) => {
                                                        let slotClasses = ''
                                                        let cursorClass = ''
                                                        if (slot.isCompleted) { slotClasses = 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'; cursorClass = 'cursor-pointer' }
                                                        else if (slot.isExpired) { slotClasses = 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100'; cursorClass = 'cursor-pointer' }
                                                        else if (slot.isBooked) { slotClasses = 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'; cursorClass = 'cursor-pointer' }
                                                        else if (slot.isPast) { slotClasses = 'bg-gray-50 border-gray-200 text-gray-400'; cursorClass = 'cursor-not-allowed' }
                                                        else { slotClasses = 'bg-green-50 border-green-300 text-green-700' }

                                                        return (
                                                            <div key={idx} onClick={() => (slot.isBooked || slot.isCompleted || slot.isExpired) && handleSlotClick(slot)}
                                                                className={`relative p-3 rounded-lg text-sm font-semibold text-center transition-all border-2 group ${slotClasses} ${cursorClass}`}
                                                            >
                                                                {slot.time}
                                                                {(slot.isBooked || slot.isCompleted || slot.isExpired) && slot.bookingInfo && (
                                                                    <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none'>
                                                                        <p className='font-semibold'>{slot.isCompleted ? 'Completed' : slot.isExpired ? 'Expired' : 'Booked'}:</p>
                                                                        <p>{slot.bookingInfo.patientName}</p>
                                                                        <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
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
                                            <p className='text-gray-500'>No time slots for this day</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className='text-center py-12'>
                                <p className='text-gray-500'>{viewMode === 'custom' ? 'Select a date range to view slots' : 'No slots available'}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ==================== EDIT DOCTOR MODAL ==================== */}
            {showEditModal && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col'>
                        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0'>
                            <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center'>
                                    <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className='text-xl font-bold text-gray-800'>Edit Doctor</h3>
                                    <p className='text-sm text-gray-500'>Update doctor information</p>
                                </div>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className='text-gray-400 hover:text-gray-600 transition-colors'>
                                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                                </svg>
                            </button>
                        </div>

                        <div className='overflow-y-auto p-6 space-y-4'>

                            {/* Profile Image */}
                            <div className='flex items-center gap-4'>
                                <img src={editImagePreview} alt='Preview' className='w-20 h-20 rounded-xl object-cover border-2 border-gray-200' />
                                <div>
                                    <p className='text-sm font-medium text-gray-700 mb-1'>Profile Image</p>
                                    <label className='cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-all'>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                        </svg>
                                        Change Image
                                        <input type='file' accept='image/*' onChange={handleEditImageChange} className='hidden' />
                                    </label>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                {/* Name */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
                                    <input type='text' value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' />
                                </div>

                                {/* Department / Speciality */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Department / Speciality</label>
                                    <select value={editForm.speciality}
                                        onChange={e => setEditForm({ ...editForm, speciality: e.target.value })}
                                        className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white'
                                    >
                                        <option value=''>Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept._id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Degree */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Degree</label>
                                    <input type='text' value={editForm.degree}
                                        onChange={e => setEditForm({ ...editForm, degree: e.target.value })}
                                        className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' />
                                </div>

                                {/* Experience */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Experience</label>
                                    <input type='text' value={editForm.experience}
                                        onChange={e => setEditForm({ ...editForm, experience: e.target.value })}
                                        placeholder='e.g. 5 Years'
                                        className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' />
                                </div>

                                {/* Fees */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Consultation Fees (Rs.)</label>
                                    <input type='number' value={editForm.fees}
                                        onChange={e => setEditForm({ ...editForm, fees: e.target.value })}
                                        className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' />
                                </div>

                                {/* Address Line 1 */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Address Line 1</label>
                                    <input type='text' value={editForm.addressLine1}
                                        onChange={e => setEditForm({ ...editForm, addressLine1: e.target.value })}
                                        className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' />
                                </div>

                                {/* Address Line 2 */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Address Line 2</label>
                                    <input type='text' value={editForm.addressLine2}
                                        onChange={e => setEditForm({ ...editForm, addressLine2: e.target.value })}
                                        className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' />
                                </div>
                            </div>

                            {/* About */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>About</label>
                                <textarea value={editForm.about}
                                    onChange={e => setEditForm({ ...editForm, about: e.target.value })}
                                    rows={3}
                                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none' />
                            </div>

                            <div className='p-3 bg-yellow-50 rounded-lg border border-yellow-200'>
                                <p className='text-xs text-yellow-700'>
                                    <span className='font-semibold'>Note:</span> Email, password, weekly schedule and slot duration can only be changed by the doctor.
                                </p>
                            </div>
                        </div>

                        <div className='flex gap-3 p-6 border-t border-gray-100 flex-shrink-0'>
                            <button onClick={() => setShowEditModal(false)} disabled={isEditSubmitting}
                                className='flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50'>
                                Cancel
                            </button>
                            <button onClick={handleEditSubmit} disabled={isEditSubmitting}
                                className='flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2'>
                                {isEditSubmitting ? (
                                    <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div> Saving...</>
                                ) : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== BLOCK MODAL ==================== */}
            {showBlockModal && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden'>
                        <div className='p-6 text-center'>
                            <div className='w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' />
                                </svg>
                            </div>
                            <h3 className='text-xl font-bold text-gray-800 mb-2'>Block Doctor?</h3>
                            <p className='text-gray-500 text-sm mb-4'>
                                Blocking <span className='font-semibold text-gray-700'>{doctor.name}</span> will:
                            </p>
                            <ul className='text-sm text-left text-gray-600 bg-gray-50 rounded-xl p-4 mb-4 space-y-2'>
                                <li className='flex items-start gap-2'>
                                    <span className='text-red-500 mt-0.5'>•</span>
                                    Hide this doctor from patients completely
                                </li>
                                <li className='flex items-start gap-2'>
                                    <span className='text-red-500 mt-0.5'>•</span>
                                    Cancel all confirmed appointments and notify patients by email
                                </li>
                                <li className='flex items-start gap-2'>
                                    <span className='text-red-500 mt-0.5'>•</span>
                                    Remove them from the department count (allowing department deletion)
                                </li>
                            </ul>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2 text-left'>
                                    Reason (optional)
                                </label>
                                <textarea value={blockReason} onChange={e => setBlockReason(e.target.value)}
                                    placeholder='Reason for blocking...'
                                    rows={2}
                                    className='w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-sm' />
                            </div>
                        </div>
                        <div className='flex border-t border-gray-100'>
                            <button onClick={() => { setShowBlockModal(false); setBlockReason('') }} disabled={isBlocking}
                                className='flex-1 py-4 text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 border-r border-gray-100'>
                                Cancel
                            </button>
                            <button onClick={handleBlockSubmit} disabled={isBlocking}
                                className='flex-1 py-4 text-red-600 font-semibold hover:bg-red-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2'>
                                {isBlocking ? 'Blocking...' : 'Block Doctor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== UNBLOCK MODAL ==================== */}
            {showUnblockModal && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden'>
                        <div className='p-6'>
                            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z' />
                                </svg>
                            </div>
                            <h3 className='text-xl font-bold text-gray-800 mb-2 text-center'>Unblock Doctor</h3>

                            {!deptExists ? (
                                <div className='mb-4'>
                                    <div className='p-3 bg-amber-50 rounded-xl border border-amber-200 mb-4'>
                                        <p className='text-sm text-amber-700'>
                                            ⚠️ The department <span className='font-bold'>"{doctor.speciality}"</span> no longer exists. Please assign a new department before unblocking.
                                        </p>
                                    </div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Assign New Department <span className='text-red-500'>*</span>
                                    </label>
                                    <select value={unblockNewDept} onChange={e => setUnblockNewDept(e.target.value)}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white'>
                                        <option value=''>Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept._id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className='p-4 bg-green-50 rounded-xl border border-green-200 mb-4'>
                                    <p className='text-sm text-green-700 text-center'>
                                        Doctor will be restored to <span className='font-bold'>{doctor.speciality}</span> department and become visible to patients.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className='flex border-t border-gray-100'>
                            <button onClick={() => { setShowUnblockModal(false); setUnblockNewDept('') }} disabled={isUnblocking}
                                className='flex-1 py-4 text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 border-r border-gray-100'>
                                Cancel
                            </button>
                            <button onClick={handleUnblockSubmit} disabled={isUnblocking || (!deptExists && !unblockNewDept)}
                                className='flex-1 py-4 text-green-600 font-semibold hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                                {isUnblocking ? 'Unblocking...' : 'Unblock Doctor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default DoctorDetails