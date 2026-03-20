import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'


const DoctorProfile = () => {

  const { dToken, profileData, setProfileData, getProfileData, backendUrl, getScheduleData, updateSchedule, addBlockedDate, removeBlockedDate } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)
  const navigate = useNavigate()
  const [isEdit, setIsEdit] = useState(false)
  const [loading, setLoading] = useState(false)

  // Schedule management states
  const [activeTab, setActiveTab] = useState('profile') // 'profile' or 'schedule'
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [savingSchedule, setSavingSchedule] = useState(false)
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
  const [blockedDates, setBlockedDates] = useState([])
  const [showBlockDateModal, setShowBlockDateModal] = useState(false)
  const [newBlockDate, setNewBlockDate] = useState('')
  const [newBlockReason, setNewBlockReason] = useState('')
  // Add these new states after existing states
  const [blockDateError, setBlockDateError] = useState(null)
  const [conflictingAppointments, setConflictingAppointments] = useState([])

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

  // Time options
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

  // Fetch schedule when tab changes
  useEffect(() => {
    if (activeTab === 'schedule' && dToken) {
      fetchSchedule()
    }
  }, [activeTab, dToken])

  const fetchSchedule = async () => {
    setScheduleLoading(true)
    try {
      const { data } = await axios.get(backendUrl + '/api/doctor/schedule', { headers: { dToken } })
      if (data.success) {
        setWeeklySchedule(data.schedule.weeklySchedule || weeklySchedule)
        setSlotDuration(data.schedule.slotDuration || 20)
        setAdvanceBookingDays(data.schedule.advanceBookingDays || 7)
        setBlockedDates(data.schedule.blockedDates || [])
      }
    } catch (error) {
      console.log(error)
    } finally {
      setScheduleLoading(false)
    }
  }

  const updateProfile = async () => {
    try {
      setLoading(true)

      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available
      }

      const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, { headers: { dToken } })

      if (data.success) {
        toast.success(data.message)
        setIsEdit(false)
        getProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setIsEdit(false)
    getProfileData()
  }

  // Schedule functions
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

  const removeTimeSlot = (day, index) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.filter((_, i) => i !== index)
      }
    }))
  }

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

  const handleSaveSchedule = async () => {
    const workingDays = daysOfWeek.filter(day => weeklySchedule[day].isWorking)
    if (workingDays.length === 0) {
      toast.error('Please select at least one working day')
      return
    }

    setSavingSchedule(true)
    const success = await updateSchedule(weeklySchedule, slotDuration, advanceBookingDays)
    setSavingSchedule(false)

    if (success) {
      fetchSchedule()
    }
  }

  /*const handleAddBlockedDate = async () => {
    if (!newBlockDate) {
      toast.warn('Please select a date')
      return
    }

    // Convert date to format: day_month_year
    const dateObj = new Date(newBlockDate)
    const formattedDate = `${dateObj.getDate()}_${dateObj.getMonth() + 1}_${dateObj.getFullYear()}`

    const success = await addBlockedDate(formattedDate, newBlockReason || 'Leave')

    if (success) {
      setShowBlockDateModal(false)
      setNewBlockDate('')
      setNewBlockReason('')
      fetchSchedule()
    }
  }*/

  const handleAddBlockedDate = async () => {
    if (!newBlockDate) {
      toast.warn('Please select a date')
      return
    }

    // Convert date to format: day_month_year
    const dateObj = new Date(newBlockDate)
    const formattedDate = `${dateObj.getDate()}_${dateObj.getMonth() + 1}_${dateObj.getFullYear()}`

    // Reset error state
    setBlockDateError(null)
    setConflictingAppointments([])

    try {
      const { data } = await axios.post(
        backendUrl + '/api/doctor/add-blocked-date',
        { date: formattedDate, reason: newBlockReason || 'Leave' },
        { headers: { dToken } }
      )

      if (data.success) {
        toast.success(data.message)
        setShowBlockDateModal(false)
        setNewBlockDate('')
        setNewBlockReason('')
        fetchSchedule()
      } else if (data.hasAppointments) {
        // Show conflicting appointments
        setBlockDateError(data.message)
        setConflictingAppointments(data.appointments || [])
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Add this new function to handle navigation to appointments
  const handleViewConflictingAppointments = () => {
    if (!newBlockDate) return

    const dateObj = new Date(newBlockDate)
    const formattedDate = `${dateObj.getDate()}_${dateObj.getMonth() + 1}_${dateObj.getFullYear()}`

    // Close modal and navigate
    setShowBlockDateModal(false)
    setNewBlockDate('')
    setNewBlockReason('')
    setBlockDateError(null)
    setConflictingAppointments([])

    // Navigate to appointments page with date filter
    navigate(`/doctor-appointments?filterDate=${formattedDate}`)
  }

  // Add this function to close and reset modal
  const closeBlockDateModal = () => {
    setShowBlockDateModal(false)
    setNewBlockDate('')
    setNewBlockReason('')
    setBlockDateError(null)
    setConflictingAppointments([])
  }

  const handleRemoveBlockedDate = async (date) => {
    const success = await removeBlockedDate(date)
    if (success) {
      fetchSchedule()
    }
  }

  // Format blocked date for display
  const formatBlockedDate = (dateStr) => {
    const [day, month, year] = dateStr.split('_')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${day} ${months[parseInt(month) - 1]} ${year}`
  }

  useEffect(() => {
    if (dToken) {
      getProfileData()
    }
  }, [dToken])

  const workingDaysCount = daysOfWeek.filter(day => weeklySchedule[day].isWorking).length

  if (!profileData) {
    return (
      <div className='w-full max-w-[1000px] mx-auto p-6 flex items-center justify-center min-h-[60vh]'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-500 text-sm'>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-[1000px] mx-auto p-6'>

      {/* Page Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>My Profile</h1>
          <p className='text-gray-500 text-sm mt-1'>Manage your profile and schedule</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='flex bg-gray-100 rounded-xl p-1 mb-6'>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'profile'
            ? 'bg-white text-primary shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
          </svg>
          Profile Info
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'schedule'
            ? 'bg-white text-primary shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
          </svg>
          My Schedule
        </button>
      </div>

      {/* ==================== PROFILE TAB ==================== */}
      {activeTab === 'profile' && (
        <>
          {/* Edit Button */}
          <div className='flex justify-end mb-4'>
            {!isEdit ? (
              <button
                onClick={() => setIsEdit(true)}
                className='px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
                </svg>
                Edit Profile
              </button>
            ) : (
              <div className='flex gap-2'>
                <button
                  onClick={cancelEdit}
                  className='px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all'
                >
                  Cancel
                </button>
                <button
                  onClick={updateProfile}
                  disabled={loading}
                  className='px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50'
                >
                  {loading ? (
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  ) : (
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                    </svg>
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

            {/* Left Column - Profile Card */}
            <div className='lg:col-span-1'>
              <div className='bg-white rounded-xl border border-gray-200 p-6 text-center'>
                <img
                  className='w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-100 bg-primary'
                  src={profileData.image}
                  alt={profileData.name}
                />
                <h2 className='text-xl font-bold text-gray-800 mt-4'>{profileData.name}</h2>
                <p className='text-primary font-medium mt-1'>{profileData.speciality}</p>

                <div className='flex items-center justify-center gap-2 mt-3'>
                  <span className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm'>
                    {profileData.degree}
                  </span>
                  <span className='px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm'>
                    {profileData.experience}
                  </span>
                </div>

                {/* Availability Status */}
                <div className={`mt-6 p-4 rounded-lg ${profileData.available ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className='flex items-center justify-between'>
                    <span className={`font-medium ${profileData.available ? 'text-green-700' : 'text-gray-600'}`}>
                      {profileData.available ? 'Available' : 'Unavailable'}
                    </span>
                    {isEdit ? (
                      <button
                        onClick={() => setProfileData(prev => ({ ...prev, available: !prev.available }))}
                        className={`w-12 h-6 rounded-full transition-all relative ${profileData.available ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${profileData.available ? 'right-1' : 'left-1'}`}></span>
                      </button>
                    ) : (
                      <span className={`w-3 h-3 rounded-full ${profileData.available ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className='lg:col-span-2 space-y-6'>

              {/* About */}
              <div className='bg-white rounded-xl border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-800 mb-3'>About</h3>
                <p className='text-gray-600 leading-relaxed'>{profileData.about}</p>
              </div>

              {/* Contact & Fee */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>

                {/* Email */}
                <div className='bg-white rounded-xl border border-gray-200 p-6'>
                  <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>Email</h3>
                  <p className='text-gray-800'>{profileData.email}</p>
                </div>

                {/* Consultation Fee */}
                <div className='bg-white rounded-xl border border-gray-200 p-6'>
                  <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>Consultation Fee</h3>
                  {isEdit ? (
                    <div className='flex items-center gap-2'>
                      <span className='text-gray-500'>{currency}</span>
                      <input
                        type="number"
                        value={profileData.fees}
                        onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                      />
                    </div>
                  ) : (
                    <p className='text-2xl font-bold text-primary'>{currency} {profileData.fees}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className='bg-white rounded-xl border border-gray-200 p-6'>
                <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3'>Address</h3>
                {isEdit ? (
                  <div className='space-y-3'>
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={profileData.address?.line1 || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                      className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2"
                      value={profileData.address?.line2 || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                      className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    />
                  </div>
                ) : (
                  <div className='flex items-start gap-3'>
                    <svg className='w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                    </svg>
                    <div>
                      <p className='text-gray-800'>{profileData.address?.line1}</p>
                      <p className='text-gray-500'>{profileData.address?.line2}</p>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </>
      )}

      {/* ==================== SCHEDULE TAB ==================== */}
      {activeTab === 'schedule' && (
        <div className='space-y-6'>

          {scheduleLoading ? (
            <div className='flex items-center justify-center py-20'>
              <div className='text-center'>
                <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                <p className='text-gray-500'>Loading schedule...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Schedule Settings */}
              <div className='bg-white rounded-xl border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                  <svg className='w-5 h-5 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                  </svg>
                  Appointment Settings
                </h3>
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

              {/* Weekly Schedule */}
              <div className='bg-white rounded-xl border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                  <svg className='w-5 h-5 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                  </svg>
                  Weekly Schedule
                </h3>

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

                {/* Save Button */}
                <div className='mt-6 flex justify-end'>
                  <button
                    onClick={handleSaveSchedule}
                    disabled={savingSchedule || workingDaysCount === 0}
                    className='px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2'
                  >
                    {savingSchedule ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4' />
                        </svg>
                        Save Schedule
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Blocked Dates */}
              <div className='bg-white rounded-xl border border-gray-200 p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                    <svg className='w-5 h-5 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' />
                    </svg>
                    Blocked Dates (Leave/Holiday)
                  </h3>
                  <button
                    onClick={() => setShowBlockDateModal(true)}
                    className='px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all flex items-center gap-2'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                    </svg>
                    Block Date
                  </button>
                </div>

                {blockedDates.length === 0 ? (
                  <div className='text-center py-8 text-gray-500'>
                    <svg className='w-12 h-12 text-gray-300 mx-auto mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                    </svg>
                    <p>No blocked dates</p>
                    <p className='text-sm mt-1'>Block dates when you're on leave</p>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {blockedDates.map((item, index) => (
                      <div key={index} className='flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100'>
                        <div>
                          <p className='font-medium text-red-700'>{formatBlockedDate(item.date)}</p>
                          <p className='text-sm text-red-600'>{item.reason}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveBlockedDate(item.date)}
                          className='p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all'
                        >
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      )}

      {/* Block Date Modal 
      {showBlockDateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className='text-center mb-4'>
                <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Block a Date</h3>
                <p className='text-gray-600 text-sm'>
                  Block a date when you're not available for appointments
                </p>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Select Date</label>
                  <input
                    type='date'
                    value={newBlockDate}
                    onChange={(e) => setNewBlockDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Reason (Optional)</label>
                  <input
                    type='text'
                    value={newBlockReason}
                    onChange={(e) => setNewBlockReason(e.target.value)}
                    placeholder='e.g., Personal Leave, Holiday'
                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  />
                </div>
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  onClick={() => {
                    setShowBlockDateModal(false)
                    setNewBlockDate('')
                    setNewBlockReason('')
                  }}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBlockedDate}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
                >
                  Block Date
                </button>
              </div>
            </div>
          </div>
        </div>
      )}*/}
      {/* Block Date Modal */}
      {showBlockDateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">

              {/* Header */}
              <div className='text-center mb-4'>
                <div className={`w-16 h-16 ${conflictingAppointments.length > 0 ? 'bg-yellow-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {conflictingAppointments.length > 0 ? (
                    <svg className='w-8 h-8 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                    </svg>
                  ) : (
                    <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {conflictingAppointments.length > 0 ? 'Cannot Block This Date' : 'Block a Date'}
                </h3>
                <p className='text-gray-600 text-sm'>
                  {conflictingAppointments.length > 0
                    ? 'There are confirmed appointments that need to be handled first.'
                    : "Block a date when you're not available for appointments"
                  }
                </p>
              </div>

              {/* Show conflicting appointments if any */}
              {conflictingAppointments.length > 0 ? (
                <div className='space-y-4'>
                  {/* Warning Message */}
                  <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-xl'>
                    <p className='text-sm text-yellow-800 font-medium'>
                      {conflictingAppointments.length} confirmed appointment{conflictingAppointments.length > 1 ? 's' : ''} found on this date.
                      Please reschedule or cancel them before blocking.
                    </p>
                  </div>

                  {/* Appointments List */}
                  <div className='space-y-2 max-h-60 overflow-y-auto'>
                    {conflictingAppointments.map((apt, index) => (
                      <div key={index} className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100'>
                        <img
                          src={apt.patientImage}
                          alt={apt.patientName}
                          className='w-10 h-10 rounded-full object-cover border-2 border-white shadow'
                        />
                        <div className='flex-1 min-w-0'>
                          <p className='font-semibold text-gray-800 text-sm truncate'>{apt.patientName}</p>
                          <p className='text-xs text-gray-500'>{apt.slotTime}</p>
                        </div>
                        <span className='px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium'>
                          Confirmed
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className='flex gap-3 pt-2'>
                    <button
                      onClick={closeBlockDateModal}
                      className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={handleViewConflictingAppointments}
                      className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                      View Appointments
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal Block Date Form */
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Select Date</label>
                    <input
                      type='date'
                      value={newBlockDate}
                      onChange={(e) => {
                        setNewBlockDate(e.target.value)
                        setBlockDateError(null)
                        setConflictingAppointments([])
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Reason (Optional)</label>
                    <input
                      type='text'
                      value={newBlockReason}
                      onChange={(e) => setNewBlockReason(e.target.value)}
                      placeholder='e.g., Personal Leave, Holiday'
                      className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    />
                  </div>

                  {/* Error Message */}
                  {blockDateError && (
                    <div className='p-3 bg-red-50 border border-red-200 rounded-xl'>
                      <p className='text-sm text-red-600'>{blockDateError}</p>
                    </div>
                  )}

                  <div className='flex gap-3 pt-2'>
                    <button
                      onClick={closeBlockDateModal}
                      className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddBlockedDate}
                      className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
                    >
                      Block Date
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default DoctorProfile