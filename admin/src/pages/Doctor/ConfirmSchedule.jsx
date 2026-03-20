import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const ConfirmSchedule = () => {

    const navigate = useNavigate()
    const { dToken, backendUrl, setRequiresScheduleConfirmation, getProfileData } = useContext(DoctorContext)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [slotDuration, setSlotDuration] = useState(20)
    const [advanceBookingDays, setAdvanceBookingDays] = useState(7)
    const [weeklySchedule, setWeeklySchedule] = useState({
        monday: { isWorking: false, timeSlots: [] },
        tuesday: { isWorking: false, timeSlots: [] },
        wednesday: { isWorking: false, timeSlots: [] },
        thursday: { isWorking: false, timeSlots: [] },
        friday: { isWorking: false, timeSlots: [] },
        saturday: { isWorking: false, timeSlots: [] },
        sunday: { isWorking: false, timeSlots: [] }
    })

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayLabels = {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
    }

    // Time options for dropdown
    const timeOptions = []
    for (let hour = 8; hour <= 22; hour++) {
        for (let min = 0; min < 60; min += 30) {
            if (hour === 22 && min > 0) break
            const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
            const ampm = hour >= 12 ? 'PM' : 'AM'
            const timeStr = `${h}:${min.toString().padStart(2, '0')} ${ampm}`
            timeOptions.push(timeStr)
        }
    }

    // Fetch existing schedule set by admin
    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const { data } = await axios.get(backendUrl + '/api/doctor/schedule', {
                    headers: { dToken }
                })

                if (data.success) {
                    setWeeklySchedule(data.schedule.weeklySchedule || weeklySchedule)
                    setSlotDuration(data.schedule.slotDuration || 20)
                    setAdvanceBookingDays(data.schedule.advanceBookingDays || 7)
                }
            } catch (error) {
                console.log(error)
                toast.error('Failed to load schedule')
            } finally {
                setLoading(false)
            }
        }

        if (dToken) {
            fetchSchedule()
        }
    }, [dToken])

    // Toggle working day
    const toggleWorkingDay = (day) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                isWorking: !prev[day].isWorking,
                timeSlots: !prev[day].isWorking ? [{ start: '10:00 AM', end: '1:00 PM' }] : []
            }
        }))
    }

    // Add time slot
    const addTimeSlot = (day) => {
        if (weeklySchedule[day].timeSlots.length >= 3) {
            toast.warn('Maximum 3 time slots per day')
            return
        }
        setWeeklySchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                timeSlots: [...prev[day].timeSlots, { start: '2:00 PM', end: '5:00 PM' }]
            }
        }))
    }

    // Remove time slot
    const removeTimeSlot = (day, index) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                timeSlots: prev[day].timeSlots.filter((_, i) => i !== index)
            }
        }))
    }

    // Update time slot
    const updateTimeSlot = (day, index, field, value) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                timeSlots: prev[day].timeSlots.map((slot, i) =>
                    i === index ? { ...slot, [field]: value } : slot
                )
            }
        }))
    }

    // Validate schedule
    const validateSchedule = () => {
        const workingDays = daysOfWeek.filter(day => weeklySchedule[day].isWorking)

        if (workingDays.length === 0) {
            toast.error('Please select at least one working day')
            return false
        }

        for (const day of workingDays) {
            if (weeklySchedule[day].timeSlots.length === 0) {
                toast.error(`Please add at least one time slot for ${dayLabels[day]}`)
                return false
            }
        }

        return true
    }

    // Confirm schedule
    const handleConfirm = async () => {
        if (!validateSchedule()) return

        setSaving(true)

        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/confirm-schedule',
                { weeklySchedule, slotDuration, advanceBookingDays },
                { headers: { dToken } }
            )

            if (data.success) {
                toast.success('Schedule confirmed successfully!')
                setRequiresScheduleConfirmation(false)
                localStorage.removeItem('requiresScheduleConfirmation')
                await getProfileData()
                navigate('/doctor-dashboard')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setSaving(false)
        }
    }

    const workingDaysCount = daysOfWeek.filter(day => weeklySchedule[day].isWorking).length

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10'>
                <div className='text-center'>
                    <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-500'>Loading your schedule...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 py-8 px-4'>
            <div className='max-w-4xl mx-auto'>

                {/* Header 
                <div className='text-center mb-8'>
                    <div className='w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <span className='text-4xl'>📅</span>
                    </div>
                    <h1 className='text-3xl font-bold text-gray-800 mb-2'>Confirm Your Schedule</h1>
                    <p className='text-gray-600 max-w-lg mx-auto'>
                        The admin has set an initial schedule for you. Please review and make any necessary changes, then confirm to start receiving appointments.
                    </p>
                </div>*/}

                {/* Header */}
                <div className='text-center mb-8'>
                    <div className='w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <span className='text-4xl'>📅</span>
                    </div>
                    <h1 className='text-3xl font-bold text-gray-800 mb-2'>
                        {/* ✅ Different title based on whether schedule was set by admin */}
                        {workingDaysCount > 0 ? 'Confirm Your Schedule' : 'Set Your Schedule'}
                    </h1>
                    <p className='text-gray-600 max-w-lg mx-auto'>
                        {workingDaysCount > 0
                            ? 'The admin has set an initial schedule for you. Please review and make any necessary changes, then confirm to start receiving appointments.'
                            : 'Please set your working schedule to start receiving appointments. Select your working days and time slots below.'
                        }
                    </p>
                </div>

                {/* Schedule Card */}
                <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>

                    {/* Settings */}
                    <div className='p-6 border-b border-gray-100 bg-gray-50'>
                        <h2 className='text-lg font-semibold text-gray-800 mb-4'>⚙️ Appointment Settings</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <label className='text-sm font-medium text-gray-700'>Slot Duration</label>
                                <select
                                    value={slotDuration}
                                    onChange={(e) => setSlotDuration(Number(e.target.value))}
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white'
                                >
                                    <option value={10}>10 minutes</option>
                                    <option value={15}>15 minutes</option>
                                    <option value={20}>20 minutes</option>
                                </select>
                            </div>

                            <div className='space-y-2'>
                                <label className='text-sm font-medium text-gray-700'>Advance Booking</label>
                                <select
                                    value={advanceBookingDays}
                                    onChange={(e) => setAdvanceBookingDays(Number(e.target.value))}
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white'
                                >
                                    <option value={7}>7 days</option>
                                    <option value={14}>14 days</option>
                                    <option value={21}>21 days</option>
                                    <option value={30}>30 days</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Days */}
                    <div className='p-6'>
                        <h2 className='text-lg font-semibold text-gray-800 mb-4'>📆 Working Days & Hours</h2>

                        <div className='space-y-4'>
                            {daysOfWeek.map(day => (
                                <div key={day} className={`border rounded-xl overflow-hidden transition-all ${weeklySchedule[day].isWorking ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>

                                    {/* Day Header */}
                                    <div
                                        className='flex items-center justify-between p-4 cursor-pointer'
                                        onClick={() => toggleWorkingDay(day)}
                                    >
                                        <div className='flex items-center gap-3'>
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${weeklySchedule[day].isWorking ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                                                {weeklySchedule[day].isWorking && (
                                                    <svg className='w-3 h-3 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M5 13l4 4L19 7' />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className={`font-semibold ${weeklySchedule[day].isWorking ? 'text-primary' : 'text-gray-700'}`}>
                                                {dayLabels[day]}
                                            </span>
                                        </div>

                                        <span className={`text-sm ${weeklySchedule[day].isWorking ? 'text-primary' : 'text-gray-400'}`}>
                                            {weeklySchedule[day].isWorking
                                                ? `${weeklySchedule[day].timeSlots.length} slot(s)`
                                                : 'Day Off'
                                            }
                                        </span>
                                    </div>

                                    {/* Time Slots */}
                                    {weeklySchedule[day].isWorking && (
                                        <div className='px-4 pb-4 space-y-3'>
                                            {weeklySchedule[day].timeSlots.map((slot, index) => (
                                                <div key={index} className='flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100'>
                                                    <span className='text-xs font-medium text-gray-500 w-16'>Slot {index + 1}</span>

                                                    <select
                                                        value={slot.start}
                                                        onChange={(e) => updateTimeSlot(day, index, 'start', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className='flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white'
                                                    >
                                                        {timeOptions.map(time => (
                                                            <option key={time} value={time}>{time}</option>
                                                        ))}
                                                    </select>

                                                    <span className='text-gray-400'>to</span>

                                                    <select
                                                        value={slot.end}
                                                        onChange={(e) => updateTimeSlot(day, index, 'end', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className='flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white'
                                                    >
                                                        {timeOptions.map(time => (
                                                            <option key={time} value={time}>{time}</option>
                                                        ))}
                                                    </select>

                                                    <button
                                                        type='button'
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeTimeSlot(day, index)
                                                        }}
                                                        className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all'
                                                    >
                                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}

                                            {weeklySchedule[day].timeSlots.length < 3 && (
                                                <button
                                                    type='button'
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        addTimeSlot(day)
                                                    }}
                                                    className='w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2'
                                                >
                                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                                                    </svg>
                                                    Add Time Slot
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        {workingDaysCount > 0 && (
                            <div className='mt-6 p-4 bg-green-50 rounded-xl border border-green-100'>
                                <p className='text-sm text-green-700'>
                                    <span className='font-semibold'>📅 Summary:</span> You will work{' '}
                                    <span className='font-bold'>{workingDaysCount} day(s)</span> per week with{' '}
                                    <span className='font-bold'>{slotDuration}-minute</span> appointments.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Button */}
                    <div className='p-6 bg-gray-50 border-t border-gray-100'>
                        <button
                            onClick={handleConfirm}
                            disabled={saving || workingDaysCount === 0}
                            className='w-full py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                        >
                            {saving ? (
                                <>
                                    <span className='animate-spin'>⏳</span>
                                    Confirming...
                                </>
                            ) : (
                                <>
                                    <span>✓</span>
                                    Confirm Schedule & Continue
                                </>
                            )}
                        </button>
                        <p className='text-center text-gray-500 text-sm mt-3'>
                            You can change your schedule anytime from your profile
                        </p>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default ConfirmSchedule