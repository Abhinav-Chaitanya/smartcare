/*import React from 'react'
import { assets } from '../../assets/assets'
import { useState } from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {



    const [docImg,setDocImg] = useState(false)
    const [name,setName] = useState('')
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [experience,setExperience] = useState('1 Year')
    const [fees,setFees] = useState('')
    const [about,setAbout] = useState('')
    const [speciality,setSpeciality] = useState('General physician')
    const [degree,setDegree] = useState('')
    const [address1,setAddress1] = useState('')
    const [address2,setAddress2] = useState('')


    const {backendUrl, aToken} = useContext(AdminContext)


    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try{
            if(!docImg){
                return toast.error('Image Not Selected')
            }

            const formData = new FormData()

            formData.append('image',docImg)
            formData.append('name',name)
            formData.append('email',email)
            formData.append('password',password)
            formData.append('experience',experience)
            formData.append('fees',Number(fees))
            formData.append('about',about)
            formData.append('speciality',speciality)
            formData.append('degree',degree)
            formData.append('address',JSON.stringify({line1:address1,line2:address2}))


            // console log form data
            formData.forEach((value,key)=>{
                console.log(`${key}:${value}`);
            })

            const {data} = await axios.post(backendUrl + '/api/admin/add-doctor',formData,{headers:{aToken}})

            if(data.success){
                toast.success(data.message)
                setDocImg(false)
                setName('')
                setPassword('')
                setEmail('')
                setAddress1('')
                setAddress2('')
                setDegree('')
                setAbout('')
                setFees('')
            }
            else{
                toast.error(data.message)
            }
        }
        catch(error){
            toast.error(error.message)
            console.log(error)

        }
    }




    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>

            <p className='mb-3 text-lg font-medium'>Add Doctor</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
                <div className='flex items-center gap-4 mb-8 text-gray-500'>
                    <label htmlFor="doc-img">
                        <img className='w-16 bg-gray-100 rounded-full cursor-pointer' src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} alt="" />
                    </label>
                    <input onChange={(e)=> setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
                    <p>Upload doctor <br /> picture</p>
                </div>

                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Doctor Name:</p>
                            <input onChange={(e)=> setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder='Name' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Doctor Email:</p>
                            <input onChange={(e)=> setEmail(e.target.value)} value={email} className='border rounded px-3 py-2' type="email" placeholder='Email' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Doctor Password:</p>
                            <input onChange={(e)=> setPassword(e.target.value)} value={password} className='border rounded px-3 py-2' type="password" placeholder='password' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Experience:</p>
                            <select onChange={(e)=> setExperience(e.target.value)} value={experience} className='border rounded px-3 py-2' name="" id="">
                                <option value="1 Year">1 Year</option>
                                <option value="2 Year">2 Year</option>
                                <option value="3 Year">3 Year</option>
                                <option value="4 Year">4 Year</option>
                                <option value="5 Year">5 Year</option>
                                <option value="6 Year">6 Year</option>
                                <option value="7 Year">7 Year</option>
                                <option value="8 Year">8 Year</option>
                                <option value="9 Year">9 Year</option>
                                <option value="10 Year">10 Year</option>
                            </select>
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Fees:</p>
                            <input onChange={(e)=> setFees(e.target.value)} value={fees} className='border rounded px-3 py-2' type="number" placeholder='fees' required />
                        </div>

                    </div>


                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Speciality</p>
                            <select onChange={(e)=> setSpeciality(e.target.value)} value={speciality} className='border rounded px-3 py-2' name="" id="">
                                <option value="General physician">General physician</option>
                                <option value="Gynecologist">Gynecologist</option>
                                <option value="Dermatologist">Dermatologist</option>
                                <option value="Pediatricians">Pediatricians</option>
                                <option value="Neurologist">Neurologist</option>
                                <option value="Gastroenterologist">Gastroenterologist</option>
                            </select>
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Education:</p>
                            <input onChange={(e)=> setDegree(e.target.value)} value={degree} className='border rounded px-3 py-2' type="text" placeholder='Education' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Address:</p>
                            <input onChange={(e)=> setAddress1(e.target.value)} value={address1} className='border rounded px-3 py-2' type="text" placeholder='address 1' required />
                            <input onChange={(e)=> setAddress2(e.target.value)} value={address2} className='border rounded px-3 py-2' type="text" placeholder='address 2' required />
                        </div>

                    </div>
                </div>

                <div>
                    <p className='mt-4 mb-2'>About Doctor:</p>
                    <textarea onChange={(e)=> setAbout(e.target.value)} value={about} className='w-full px-4 pt-2 border rounded' placeholder='write about doctor' rows={5} required />
                </div>

                <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full'>Add doctor</button>



            </div>

        </form>

    )
}

export default AddDoctor   */



import React, { useState, useContext, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {

    // ✅ NEW: Get department from URL if provided
    const { departmentName } = useParams()
    const decodedDepartment = departmentName ? decodeURIComponent(departmentName) : null
    const navigate = useNavigate()

    const [docImg, setDocImg] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [fees, setFees] = useState('')
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('')
    const [degree, setDegree] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')

    // Schedule States
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

    // Toggle to let doctor set schedule later
    const [letDoctorSetLater, setLetDoctorSetLater] = useState(false)

    // Apply to all days modal
    const [showApplyAllModal, setShowApplyAllModal] = useState(false)
    const [applyFromDay, setApplyFromDay] = useState('')

    // ✅ Get context values
    const { backendUrl, aToken, departments, departmentsLoading, getAllDepartments } = useContext(AdminContext)

    // ✅ Fetch departments on component mount
    useEffect(() => {
        if (aToken) {
            getAllDepartments()
        }
    }, [aToken])

    // ✅ NEW: Set speciality when coming from specific department
    useEffect(() => {
        if (decodedDepartment) {
            setSpeciality(decodedDepartment)
        }
    }, [decodedDepartment])

    // Time options for dropdown (30-min intervals from 8 AM to 10 PM)
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

    // Add time slot to a day
    const addTimeSlot = (day) => {
        if (weeklySchedule[day].timeSlots.length >= 3) {
            toast.warn('Maximum 3 time slots per day allowed')
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

    // Remove time slot from a day
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

    // Apply schedule to all selected working days
    const applyToAllDays = () => {
        if (!applyFromDay) return

        const sourceSlots = weeklySchedule[applyFromDay].timeSlots

        setWeeklySchedule(prev => {
            const updated = { ...prev }
            daysOfWeek.forEach(day => {
                if (updated[day].isWorking && day !== applyFromDay) {
                    updated[day] = {
                        ...updated[day],
                        timeSlots: JSON.parse(JSON.stringify(sourceSlots))
                    }
                }
            })
            return updated
        })

        setShowApplyAllModal(false)
        setApplyFromDay('')
        toast.success('Schedule applied to all working days!')
    }

    // Validate schedule (only if admin is setting it)
    const validateSchedule = () => {
        if (letDoctorSetLater) return true

        const workingDays = daysOfWeek.filter(day => weeklySchedule[day].isWorking)

        if (workingDays.length === 0) {
            toast.error('Please select at least one working day or check "Let doctor set later"')
            return false
        }

        for (const day of workingDays) {
            if (weeklySchedule[day].timeSlots.length === 0) {
                toast.error(`Please add at least one time slot for ${dayLabels[day]}`)
                return false
            }

            for (const slot of weeklySchedule[day].timeSlots) {
                if (!slot.start || !slot.end) {
                    toast.error(`Please set start and end time for all slots in ${dayLabels[day]}`)
                    return false
                }
            }
        }

        return true
    }

    // Get schedule data for submission
    const getScheduleData = () => {
        if (letDoctorSetLater) {
            return {
                monday: { isWorking: false, timeSlots: [] },
                tuesday: { isWorking: false, timeSlots: [] },
                wednesday: { isWorking: false, timeSlots: [] },
                thursday: { isWorking: false, timeSlots: [] },
                friday: { isWorking: false, timeSlots: [] },
                saturday: { isWorking: false, timeSlots: [] },
                sunday: { isWorking: false, timeSlots: [] }
            }
        }
        return weeklySchedule
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            if (!docImg) {
                return toast.error('Image Not Selected')
            }

            // ✅ Validate speciality
            if (!speciality) {
                return toast.error('Please select a speciality/department')
            }

            // Validate schedule
            if (!validateSchedule()) {
                return
            }

            const formData = new FormData()

            formData.append('image', docImg)
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            formData.append('experience', experience)
            formData.append('fees', Number(fees))
            formData.append('about', about)
            formData.append('speciality', speciality)
            formData.append('degree', degree)
            formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))

            // Add schedule data
            formData.append('weeklySchedule', JSON.stringify(getScheduleData()))
            formData.append('slotDuration', slotDuration)
            formData.append('advanceBookingDays', advanceBookingDays)
            formData.append('letDoctorSetLater', letDoctorSetLater)

            const { data } = await axios.post(backendUrl + '/api/admin/add-doctor', formData, { headers: { aToken } })

            if (data.success) {
                toast.success(data.message)
                // Reset form
                setDocImg(false)
                setName('')
                setPassword('')
                setEmail('')
                setAddress1('')
                setAddress2('')
                setDegree('')
                setAbout('')
                setFees('')
                if (!decodedDepartment) {
                    setSpeciality('')
                }
                setSlotDuration(20)
                setAdvanceBookingDays(7)
                setLetDoctorSetLater(false)
                setWeeklySchedule({
                    monday: { isWorking: false, timeSlots: [] },
                    tuesday: { isWorking: false, timeSlots: [] },
                    wednesday: { isWorking: false, timeSlots: [] },
                    thursday: { isWorking: false, timeSlots: [] },
                    friday: { isWorking: false, timeSlots: [] },
                    saturday: { isWorking: false, timeSlots: [] },
                    sunday: { isWorking: false, timeSlots: [] }
                })

                // ✅ NEW: If coming from department, navigate back to that department's doctors
                if (decodedDepartment) {
                    setTimeout(() => {
                        navigate(`/doctors/${encodeURIComponent(decodedDepartment)}`)
                    }, 1500)
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    // Get count of working days
    const workingDaysCount = daysOfWeek.filter(day => weeklySchedule[day].isWorking).length

    return (
        <div className='w-full max-w-[1200px] mx-auto p-6'>

            {/* ✅ NEW: Breadcrumb when coming from specific department */}
            {decodedDepartment && (
                <div className='mb-4'>
                    <nav className='flex items-center gap-2 text-sm'>
                        <button 
                            onClick={() => navigate('/departments')}
                            className='text-gray-500 hover:text-primary transition-colors flex items-center gap-1'
                        >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                            </svg>
                            Departments
                        </button>
                        <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                        </svg>
                        <button 
                            onClick={() => navigate(`/doctors/${encodeURIComponent(decodedDepartment)}`)}
                            className='text-gray-500 hover:text-primary transition-colors'
                        >
                            {decodedDepartment}
                        </button>
                        <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                        </svg>
                        <span className='text-gray-800 font-medium'>Add Doctor</span>
                    </nav>
                </div>
            )}

            {/* Header Section */}
            <div className='mb-6'>
                <div className='flex items-center gap-3 mb-2'>
                    <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center'>
                        <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' />
                        </svg>
                    </div>
                    <div>
                        <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>
                            {decodedDepartment ? `Add Doctor to ${decodedDepartment}` : 'Add New Doctor'}
                        </h1>
                        <p className='text-gray-500 text-sm'>
                            {decodedDepartment 
                                ? `Fill in the details to add a new doctor to ${decodedDepartment} department`
                                : 'Fill in the details to add a new doctor to the system'
                            }
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={onSubmitHandler}>
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>

                    {/* Profile Image Section */}
                    <div className='bg-gradient-to-r from-primary/5 to-blue-50 px-8 py-6 border-b border-gray-100'>
                        <div className='flex items-center gap-6'>
                            <label htmlFor="doc-img" className='cursor-pointer group'>
                                <div className='relative'>
                                    <img
                                        className='w-24 h-24 rounded-2xl object-cover bg-white border-2 border-dashed border-gray-300 group-hover:border-primary transition-all'
                                        src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                                        alt=""
                                    />
                                    <div className='absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform'>
                                        <svg className='w-4 h-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                                        </svg>
                                    </div>
                                </div>
                            </label>
                            <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
                            <div>
                                <p className='font-semibold text-gray-800'>Upload Doctor Photo</p>
                                <p className='text-sm text-gray-500 mt-1'>JPG, PNG or GIF. Max size 2MB</p>
                                <p className='text-xs text-primary mt-2 font-medium'>Click on the image to upload</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className='p-8'>

                        {/* Personal Information Section */}
                        <div className='mb-8'>
                            <div className='flex items-center gap-2 mb-5'>
                                <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                                    <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                    </svg>
                                </div>
                                <h2 className='text-lg font-semibold text-gray-800'>Personal Information</h2>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Full Name</label>
                                    <input
                                        onChange={(e) => setName(e.target.value)}
                                        value={name}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                        type="text"
                                        placeholder='Dr. John Doe'
                                        required
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Email Address</label>
                                    <input
                                        onChange={(e) => setEmail(e.target.value)}
                                        value={email}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                        type="email"
                                        placeholder='doctor@example.com'
                                        required
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Password</label>
                                    <input
                                        onChange={(e) => setPassword(e.target.value)}
                                        value={password}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                        type="password"
                                        placeholder='••••••••'
                                        required
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Education / Degree</label>
                                    <input
                                        onChange={(e) => setDegree(e.target.value)}
                                        value={degree}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                        type="text"
                                        placeholder='MBBS, MD'
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Information Section */}
                        <div className='mb-8'>
                            <div className='flex items-center gap-2 mb-5'>
                                <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                                    <svg className='w-4 h-4 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                    </svg>
                                </div>
                                <h2 className='text-lg font-semibold text-gray-800'>Professional Information</h2>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                                {/* ✅ UPDATED: Speciality Dropdown - Hidden if coming from specific department */}
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>
                                        Speciality / Department
                                        {departmentsLoading && <span className='text-xs text-gray-400 ml-2'>(Loading...)</span>}
                                    </label>
                                    
                                    {/* If coming from specific department, show as badge (non-editable) */}
                                    {decodedDepartment ? (
                                        <div className='flex items-center gap-2'>
                                            <span className='px-4 py-3 bg-primary/10 text-primary rounded-xl font-semibold flex items-center gap-2 w-full'>
                                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                                                </svg>
                                                {decodedDepartment}
                                            </span>
                                        </div>
                                    ) : (
                                        /* Normal dropdown for general add doctor */
                                        <select
                                            onChange={(e) => setSpeciality(e.target.value)}
                                            value={speciality}
                                            className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white cursor-pointer'
                                            required
                                            disabled={departmentsLoading}
                                        >
                                            <option value="">
                                                {departmentsLoading ? 'Loading departments...' : 'Select Department'}
                                            </option>
                                            {departments
                                                .filter(dept => dept.isActive)
                                                .map((dept) => (
                                                    <option key={dept._id} value={dept.name}>
                                                        {dept.name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    )}
                                    {departments.length === 0 && !departmentsLoading && !decodedDepartment && (
                                        <p className='text-xs text-amber-600'>
                                            No departments found. Please add a department first.
                                        </p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Experience</label>
                                    <select
                                        onChange={(e) => setExperience(e.target.value)}
                                        value={experience}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white cursor-pointer'
                                    >
                                        <option value="1 Year">1 Year</option>
                                        <option value="2 Years">2 Years</option>
                                        <option value="3 Years">3 Years</option>
                                        <option value="4 Years">4 Years</option>
                                        <option value="5 Years">5 Years</option>
                                        <option value="6 Years">6 Years</option>
                                        <option value="7 Years">7 Years</option>
                                        <option value="8 Years">8 Years</option>
                                        <option value="9 Years">9 Years</option>
                                        <option value="10+ Years">10+ Years</option>
                                    </select>
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Consultation Fees</label>
                                    <div className='relative'>
                                        <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium'>₹</span>
                                        <input
                                            onChange={(e) => setFees(e.target.value)}
                                            value={fees}
                                            className='w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                            type="number"
                                            placeholder='500'
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className='mb-8'>
                            <div className='flex items-center gap-2 mb-5'>
                                <div className='w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center'>
                                    <svg className='w-4 h-4 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                    </svg>
                                </div>
                                <h2 className='text-lg font-semibold text-gray-800'>Address</h2>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Address Line 1</label>
                                    <input
                                        onChange={(e) => setAddress1(e.target.value)}
                                        value={address1}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                        type="text"
                                        placeholder='Building, Street Name'
                                        required
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Address Line 2</label>
                                    <input
                                        onChange={(e) => setAddress2(e.target.value)}
                                        value={address2}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                        type="text"
                                        placeholder='City, State, PIN'
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className='mb-8'>
                            <div className='flex items-center gap-2 mb-5'>
                                <div className='w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center'>
                                    <svg className='w-4 h-4 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                                    </svg>
                                </div>
                                <h2 className='text-lg font-semibold text-gray-800'>About Doctor</h2>
                            </div>

                            <textarea
                                onChange={(e) => setAbout(e.target.value)}
                                value={about}
                                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none'
                                placeholder='Write a brief description about the doctor...'
                                rows={4}
                                required
                            />
                        </div>

                        {/* Schedule Section */}
                        <div className='mb-8'>
                            <div className='flex items-center justify-between mb-5'>
                                <div className='flex items-center gap-2'>
                                    <div className='w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center'>
                                        <svg className='w-4 h-4 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className='text-lg font-semibold text-gray-800'>Working Schedule</h2>
                                        <p className='text-xs text-gray-500'>Set the doctor's availability</p>
                                    </div>
                                </div>

                                <label className='flex items-center gap-3 cursor-pointer bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all'>
                                    <span className='text-sm font-medium text-gray-700'>Let doctor set later</span>
                                    <div
                                        onClick={() => setLetDoctorSetLater(!letDoctorSetLater)}
                                        className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${letDoctorSetLater ? 'bg-primary' : 'bg-gray-300'}`}
                                    >
                                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${letDoctorSetLater ? 'right-1' : 'left-1'}`}></span>
                                    </div>
                                </label>
                            </div>

                            {letDoctorSetLater ? (
                                <div className='p-6 bg-yellow-50 rounded-xl border border-yellow-200'>
                                    <div className='flex items-start gap-3'>
                                        <div className='w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0'>
                                            <span className='text-xl'>ℹ️</span>
                                        </div>
                                        <div>
                                            <h3 className='font-semibold text-yellow-800 mb-1'>Doctor Will Set Schedule</h3>
                                            <p className='text-sm text-yellow-700'>
                                                The doctor will be required to set their working schedule on their first login.
                                                They won't be able to receive appointments until they confirm their schedule.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Schedule Settings */}
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                                        <div className='space-y-2'>
                                            <label className='text-sm font-medium text-gray-700'>Slot Duration</label>
                                            <select
                                                value={slotDuration}
                                                onChange={(e) => setSlotDuration(Number(e.target.value))}
                                                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white cursor-pointer'
                                            >
                                                <option value={10}>10 minutes</option>
                                                <option value={15}>15 minutes</option>
                                                <option value={20}>20 minutes</option>
                                            </select>
                                        </div>

                                        <div className='space-y-2'>
                                            <label className='text-sm font-medium text-gray-700'>Advance Booking Days</label>
                                            <select
                                                value={advanceBookingDays}
                                                onChange={(e) => setAdvanceBookingDays(Number(e.target.value))}
                                                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white cursor-pointer'
                                            >
                                                <option value={7}>7 days</option>
                                                <option value={14}>14 days</option>
                                                <option value={21}>21 days</option>
                                                <option value={30}>30 days</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Apply to all button */}
                                    {workingDaysCount > 1 && (
                                        <div className='flex justify-end mb-4'>
                                            <button
                                                type='button'
                                                onClick={() => {
                                                    const firstWorkingDay = daysOfWeek.find(day => weeklySchedule[day].isWorking && weeklySchedule[day].timeSlots.length > 0)
                                                    if (firstWorkingDay) {
                                                        setApplyFromDay(firstWorkingDay)
                                                        setShowApplyAllModal(true)
                                                    } else {
                                                        toast.warn('Please set time slots for at least one day first')
                                                    }
                                                }}
                                                className='text-sm text-primary font-medium hover:underline flex items-center gap-1'
                                            >
                                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                                                </svg>
                                                Apply to all days
                                            </button>
                                        </div>
                                    )}

                                    {/* Days Selection */}
                                    <div className='space-y-4'>
                                        {daysOfWeek.map(day => (
                                            <div key={day} className={`border rounded-xl overflow-hidden transition-all ${weeklySchedule[day].isWorking ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
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

                                                {weeklySchedule[day].isWorking && (
                                                    <div className='px-4 pb-4 space-y-3'>
                                                        {weeklySchedule[day].timeSlots.map((slot, index) => (
                                                            <div key={index} className='flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100'>
                                                                <span className='text-xs font-medium text-gray-500 w-16'>Slot {index + 1}</span>

                                                                <select
                                                                    value={slot.start}
                                                                    onChange={(e) => updateTimeSlot(day, index, 'start', e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className='flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white'
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
                                                                    className='flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white'
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

                                    {workingDaysCount > 0 && (
                                        <div className='mt-4 p-4 bg-green-50 rounded-xl border border-green-100'>
                                            <p className='text-sm text-green-700'>
                                                <span className='font-semibold'>📅 Schedule Summary:</span> Doctor will work{' '}
                                                <span className='font-bold'>{workingDaysCount} day(s)</span> per week with{' '}
                                                <span className='font-bold'>{slotDuration}-minute</span> appointments,{' '}
                                                bookable up to <span className='font-bold'>{advanceBookingDays} days</span> in advance.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className='flex items-center justify-end gap-4 pt-4 border-t border-gray-100'>
                            <button
                                type='button'
                                onClick={() => {
                                    if (decodedDepartment) {
                                        navigate(`/doctors/${encodeURIComponent(decodedDepartment)}`)
                                    } else {
                                        navigate('/departments')
                                    }
                                }}
                                className='px-6 py-3 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all'
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                className='px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2'
                            >
                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                                </svg>
                                Add Doctor
                            </button>
                        </div>

                    </div>
                </div>
            </form>

            {/* Info Card */}
            <div className='mt-6 bg-blue-50 rounded-2xl p-5 border border-blue-100'>
                <div className='flex items-start gap-4'>
                    <div className='w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0'>
                        <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                    </div>
                    <div>
                        <h3 className='font-semibold text-blue-800 mb-1'>Important Note</h3>
                        <p className='text-sm text-blue-700'>
                            After adding the doctor, they will receive an email with login credentials.
                            On first login, they will need to change their password and {letDoctorSetLater ? 'set' : 'confirm'} their schedule.
                            {!letDoctorSetLater && ' The doctor can modify the schedule you set here.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Apply to All Modal */}
            {showApplyAllModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                        <div className="p-6">
                            <div className='text-center mb-4'>
                                <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                                    <svg className='w-8 h-8 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Apply Schedule to All Days</h3>
                                <p className="text-gray-600 text-sm">
                                    Copy time slots from one day to all other working days
                                </p>
                            </div>

                            <div className='mb-6'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Copy slots from:</label>
                                <select
                                    value={applyFromDay}
                                    onChange={(e) => setApplyFromDay(e.target.value)}
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white'
                                >
                                    {daysOfWeek.filter(day => weeklySchedule[day].isWorking && weeklySchedule[day].timeSlots.length > 0).map(day => (
                                        <option key={day} value={day}>{dayLabels[day]}</option>
                                    ))}
                                </select>
                            </div>

                            <div className='flex gap-3'>
                                <button
                                    type='button'
                                    onClick={() => setShowApplyAllModal(false)}
                                    className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    onClick={applyToAllDays}
                                    className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all"
                                >
                                    Apply to All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default AddDoctor