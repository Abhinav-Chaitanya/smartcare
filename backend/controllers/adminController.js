/*import validator from 'validator'
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from "cloudinary"
import doctorModel from '../models/doctorModel.js'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import departmentModel from '../models/departmentModel.js'
import userModel from '../models/userModel.js'
import { sendDoctorWelcomeEmail } from '../utils/emailService.js' 
import nodemailer from 'nodemailer'

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

// Helper: Format date for emails
const formatDateForEmail = (slotDate) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
} 


// ✅ UPDATED: API for adding doctor with OPTIONAL schedule
const addDoctor = async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password, 
            speciality, 
            degree, 
            experience, 
            about, 
            fees, 
            address,
            // Schedule fields
            weeklySchedule,
            slotDuration,
            advanceBookingDays,
            letDoctorSetLater  // ✅ NEW
        } = req.body
        
        const imageFile = req.file

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing data" })
        }

        // Parse weeklySchedule if it's a string
        const parsedSchedule = weeklySchedule 
            ? (typeof weeklySchedule === 'string' ? JSON.parse(weeklySchedule) : weeklySchedule)
            : null

        // ✅ UPDATED: Only validate schedule if admin is setting it (not letting doctor set later)
        const isLettingDoctorSetLater = letDoctorSetLater === 'true' || letDoctorSetLater === true

        if (!isLettingDoctorSetLater && parsedSchedule) {
            // Check if at least one working day is selected
            const hasWorkingDay = Object.values(parsedSchedule).some(day => day.isWorking && day.timeSlots && day.timeSlots.length > 0)
            if (!hasWorkingDay) {
                return res.json({ success: false, message: "Please set at least one working day with time slots, or check 'Let doctor set later'" })
            }
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter strong password" })
        }

        // Check if doctor with this email already exists
        const existingDoctor = await doctorModel.findOne({ email })
        if (existingDoctor) {
            return res.json({ success: false, message: "Doctor with this email already exists" })
        }

        // Store plain password before hashing (for email)
        const plainPassword = password

        // hashing doctor password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        // ✅ UPDATED: Default empty schedule if letting doctor set later
        const defaultEmptySchedule = {
            monday: { isWorking: false, timeSlots: [] },
            tuesday: { isWorking: false, timeSlots: [] },
            wednesday: { isWorking: false, timeSlots: [] },
            thursday: { isWorking: false, timeSlots: [] },
            friday: { isWorking: false, timeSlots: [] },
            saturday: { isWorking: false, timeSlots: [] },
            sunday: { isWorking: false, timeSlots: [] }
        }

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now(),
            isFirstLogin: true,
            isScheduleConfirmed: false,  // Always false - doctor must confirm
            weeklySchedule: isLettingDoctorSetLater ? defaultEmptySchedule : (parsedSchedule || defaultEmptySchedule),
            slotDuration: slotDuration ? Number(slotDuration) : 20,
            advanceBookingDays: advanceBookingDays ? Number(advanceBookingDays) : 7
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        // Send welcome email with credentials
        const emailResult = await sendDoctorWelcomeEmail(email, name, plainPassword)
        
        if (emailResult.success) {
            res.json({ success: true, message: "Doctor added successfully! Welcome email sent." })
        } else {
            res.json({ success: true, message: "Doctor added successfully! (Email notification failed - please share credentials manually)" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API for the admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {

            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}


// API to get all doctors list on admin panel
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })

    } catch (error) {

        console.log(error)
        res.json({ success: false, message: error.message })

    }
}


// API for Appointment cancellation
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body

        const appointment = await appointmentModel.findById(appointmentId)

        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        // update appointment status
        appointment.status = 'cancelled'
        await appointment.save()

        // release doctor slot
        const doctor = await doctorModel.findById(appointment.docId)
        const slots = doctor.slots_booked

        if (slots[appointment.slotDate]) {
            slots[appointment.slotDate] = slots[appointment.slotDate].filter(
                e => e.trim().toLowerCase() !== appointment.slotTime.trim().toLowerCase()
            )

            if (slots[appointment.slotDate].length === 0) {
                delete slots[appointment.slotDate]
            }
        }

        await doctorModel.findByIdAndUpdate(doctor._id, { slots_booked: slots })

        res.json({ success: true, message: 'Appointment cancelled' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            listAppointments: appointments.reverse().slice(0, 5)

        }

        res.json({ success: true, dashData })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ✅ UPDATED: API for Appointment cancellation with reason and email
const appointmentCancelWithReason = async (req, res) => {
    try {
        const { appointmentId, reason } = req.body

        if (!reason || reason.trim() === '') {
            return res.json({ success: false, message: "Please provide a reason for cancellation" })
        }

        const appointment = await appointmentModel.findById(appointmentId)

        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        if (appointment.status !== 'confirmed') {
            return res.json({ success: false, message: 'Only confirmed appointments can be cancelled' })
        }

        // Release doctor slot
        const doctor = await doctorModel.findById(appointment.docId)
        let slots_booked = doctor.slots_booked || {}

        if (slots_booked[appointment.slotDate]) {
            slots_booked[appointment.slotDate] = slots_booked[appointment.slotDate].filter(
                e => e.trim().toLowerCase() !== appointment.slotTime.trim().toLowerCase()
            )

            if (slots_booked[appointment.slotDate].length === 0) {
                delete slots_booked[appointment.slotDate]
            }
        }

        await doctorModel.findByIdAndUpdate(doctor._id, { slots_booked })

        // Update appointment status
        await appointmentModel.findByIdAndUpdate(appointmentId, {
            status: 'cancelled',
            cancelReason: reason,
            cancelledBy: 'admin'
        })

        // Get fresh data for email
        const updatedAppointment = await appointmentModel.findById(appointmentId)
        const patientEmail = updatedAppointment.userData.email
        const patientName = updatedAppointment.userData.name
        const doctorName = updatedAppointment.docData.name
        const doctorEmail = updatedAppointment.docData.email
        const formattedDate = formatDateForEmail(appointment.slotDate)

        // Email to Patient
        const patientMailOptions = {
            from: process.env.EMAIL_USER,
            to: patientEmail,
            subject: 'Appointment Cancelled - SmartCare Hospitals',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #EF4444;">Appointment Cancelled</h2>
                    <p>Hello ${patientName},</p>
                    <p>We regret to inform you that your appointment has been cancelled by the hospital administration.</p>
                    
                    <div style="background-color: #FEF2F2; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #EF4444;">
                        <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
                        <p><strong>Original Date:</strong> ${formattedDate}</p>
                        <p><strong>Original Time:</strong> ${appointment.slotTime}</p>
                    </div>

                    <div style="background-color: #FFF7ED; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold; color: #C2410C;">Reason for Cancellation:</p>
                        <p style="margin: 10px 0 0 0; color: #9A3412;">${reason}</p>
                    </div>
                    
                    <p>We apologize for any inconvenience. Please book a new appointment at your convenience.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/doctors" 
                           style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Book New Appointment
                        </a>
                    </div>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare Hospitals.</p>
                </div>
            `
        }

        // Email to Doctor
        const doctorMailOptions = {
            from: process.env.EMAIL_USER,
            to: doctorEmail,
            subject: 'Appointment Cancelled by Admin - SmartCare',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #EF4444;">Appointment Cancelled by Admin</h2>
                    <p>Hello Dr. ${doctorName},</p>
                    <p>An appointment has been cancelled by the hospital administration.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Patient:</strong> ${patientName}</p>
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        <p><strong>Time:</strong> ${appointment.slotTime}</p>
                        <p><strong>Cancelled By:</strong> Admin</p>
                        <p><strong>Reason:</strong> ${reason}</p>
                    </div>
                    
                    <p>The patient has been notified via email.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare.</p>
                </div>
            `
        }

        // Send emails
        await transporter.sendMail(patientMailOptions)
        await transporter.sendMail(doctorMailOptions)

        res.json({ success: true, message: 'Appointment cancelled successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ✅ NEW: API to reschedule appointment by admin
const appointmentRescheduleAdmin = async (req, res) => {
    try {
        const { appointmentId, newSlotDate, newSlotTime, reason } = req.body

        if (!reason || reason.trim() === '') {
            return res.json({ success: false, message: "Please provide a reason for rescheduling" })
        }

        if (!newSlotDate || !newSlotTime) {
            return res.json({ success: false, message: "Please select a new date and time" })
        }

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" })
        }

        if (appointmentData.status !== 'confirmed') {
            return res.json({ success: false, message: "Only confirmed appointments can be rescheduled" })
        }

        const oldSlotDate = appointmentData.slotDate
        const oldSlotTime = appointmentData.slotTime
        const docId = appointmentData.docId

        // Get doctor data
        const docData = await doctorModel.findById(docId)
        let slots_booked = docData.slots_booked || {}

        // Check if new slot is available
        if (slots_booked[newSlotDate] && slots_booked[newSlotDate].includes(newSlotTime)) {
            return res.json({ success: false, message: "Selected slot is not available" })
        }

        // Release old slot
        if (slots_booked[oldSlotDate]) {
            slots_booked[oldSlotDate] = slots_booked[oldSlotDate].filter(t => t !== oldSlotTime)
            if (slots_booked[oldSlotDate].length === 0) {
                delete slots_booked[oldSlotDate]
            }
        }

        // Book new slot
        if (!slots_booked[newSlotDate]) {
            slots_booked[newSlotDate] = []
        }
        slots_booked[newSlotDate].push(newSlotTime)

        // Update doctor's slots
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Update appointment
        await appointmentModel.findByIdAndUpdate(appointmentId, {
            slotDate: newSlotDate,
            slotTime: newSlotTime,
            rescheduleReason: reason,
            rescheduledBy: 'admin',
            previousSlotDate: oldSlotDate,
            previousSlotTime: oldSlotTime
        })

        // Get fresh data for email
        const updatedAppointment = await appointmentModel.findById(appointmentId)
        const patientEmail = updatedAppointment.userData.email
        const patientName = updatedAppointment.userData.name
        const doctorName = updatedAppointment.docData.name
        const doctorEmail = updatedAppointment.docData.email
        const oldFormattedDate = formatDateForEmail(oldSlotDate)
        const newFormattedDate = formatDateForEmail(newSlotDate)

        // Email to Patient
        const patientMailOptions = {
            from: process.env.EMAIL_USER,
            to: patientEmail,
            subject: 'Appointment Rescheduled - SmartCare Hospitals',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #F59E0B;">Appointment Rescheduled</h2>
                    <p>Hello ${patientName},</p>
                    <p>Your appointment has been rescheduled by the hospital administration.</p>
                    
                    <div style="background-color: #FEF2F2; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold; color: #991B1B;">Previous Schedule:</p>
                        <p style="margin: 5px 0; color: #DC2626; text-decoration: line-through;">
                            ${oldFormattedDate} at ${oldSlotTime}
                        </p>
                    </div>

                    <div style="background-color: #ECFDF5; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold; color: #065F46;">New Schedule:</p>
                        <p style="margin: 5px 0; color: #059669; font-size: 18px; font-weight: bold;">
                            ${newFormattedDate} at ${newSlotTime}
                        </p>
                    </div>

                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
                    </div>

                    <div style="background-color: #FFF7ED; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold; color: #C2410C;">Reason for Rescheduling:</p>
                        <p style="margin: 10px 0 0 0; color: #9A3412;">${reason}</p>
                    </div>
                    
                    <p>Please make a note of your new appointment time. We apologize for any inconvenience.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare Hospitals.</p>
                </div>
            `
        }

        // Email to Doctor
        const doctorMailOptions = {
            from: process.env.EMAIL_USER,
            to: doctorEmail,
            subject: 'Appointment Rescheduled by Admin - SmartCare',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #F59E0B;">Appointment Rescheduled by Admin</h2>
                    <p>Hello Dr. ${doctorName},</p>
                    <p>An appointment has been rescheduled by the hospital administration.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Patient:</strong> ${patientName}</p>
                        <p><strong>Previous:</strong> ${oldFormattedDate} at ${oldSlotTime}</p>
                        <p><strong>New:</strong> ${newFormattedDate} at ${newSlotTime}</p>
                        <p><strong>Rescheduled By:</strong> Admin</p>
                        <p><strong>Reason:</strong> ${reason}</p>
                    </div>
                    
                    <p>The patient has been notified via email.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare.</p>
                </div>
            `
        }

        // Send emails
        await transporter.sendMail(patientMailOptions)
        await transporter.sendMail(doctorMailOptions)

        res.json({ success: true, message: "Appointment Rescheduled Successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get single doctor details with booked appointments
const getDoctorById = async (req, res) => {
    try {
        const { docId } = req.params

        const doctor = await doctorModel.findById(docId).select('-password')

        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found' })
        }

        // Get all appointments for this doctor
        const appointments = await appointmentModel.find({ docId })

        res.json({ success: true, doctor, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all patients/users
const getAllPatients = async (req, res) => {
    try {
        const patients = await userModel.find({}).select('-password')
        
        // Get appointment counts for each patient
        const patientsWithStats = await Promise.all(
            patients.map(async (patient) => {
                const appointments = await appointmentModel.find({ userId: patient._id.toString() })
                
                const stats = {
                    total: appointments.length,
                    completed: appointments.filter(a => a.status === 'completed').length,
                    confirmed: appointments.filter(a => a.status === 'confirmed').length,
                    cancelled: appointments.filter(a => a.status === 'cancelled').length,
                    expired: appointments.filter(a => a.status === 'expired').length
                }

                // Get last appointment date
                const lastAppointment = appointments.length > 0 
                    ? appointments.sort((a, b) => b.date - a.date)[0]
                    : null

                return {
                    ...patient.toObject(),
                    appointmentStats: stats,
                    lastAppointmentDate: lastAppointment ? lastAppointment.date : null
                }
            })
        )

        res.json({ success: true, patients: patientsWithStats })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get single patient details with appointments
const getPatientById = async (req, res) => {
    try {
        const { patientId } = req.params

        const patient = await userModel.findById(patientId).select('-password')

        if (!patient) {
            return res.json({ success: false, message: 'Patient not found' })
        }

        // Get all appointments for this patient
        const appointments = await appointmentModel.find({ userId: patientId })

        // Sort appointments by date (newest first)
        const sortedAppointments = appointments.sort((a, b) => b.date - a.date)

        // Calculate stats
        const stats = {
            total: appointments.length,
            completed: appointments.filter(a => a.status === 'completed').length,
            confirmed: appointments.filter(a => a.status === 'confirmed').length,
            cancelled: appointments.filter(a => a.status === 'cancelled').length,
            expired: appointments.filter(a => a.status === 'expired').length
        }

        res.json({ 
            success: true, 
            patient, 
            appointments: sortedAppointments,
            stats 
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get analytics data for admin dashboard
const getAnalyticsData = async (req, res) => {
    try {
        const { period } = req.query // '7d', '30d', '6m', '1y', 'all'
        
        // Get all data
        const doctors = await doctorModel.find({}).select('-password')
        const patients = await userModel.find({})
        const appointments = await appointmentModel.find({})
        
        // Calculate date ranges
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        let startDate = null
        switch (period) {
            case '7d':
                startDate = new Date(today)
                startDate.setDate(startDate.getDate() - 7)
                break
            case '30d':
                startDate = new Date(today)
                startDate.setDate(startDate.getDate() - 30)
                break
            case '6m':
                startDate = new Date(today)
                startDate.setMonth(startDate.getMonth() - 6)
                break
            case '1y':
                startDate = new Date(today)
                startDate.setFullYear(startDate.getFullYear() - 1)
                break
            default:
                startDate = null // All time
        }

        // Helper function to parse slotDate
        const parseSlotDate = (slotDate) => {
            const [day, month, year] = slotDate.split('_').map(Number)
            return new Date(year, month - 1, day)
        }

        // Filter appointments by period
        const filteredAppointments = startDate
            ? appointments.filter(apt => {
                const aptDate = parseSlotDate(apt.slotDate)
                return aptDate >= startDate
            })
            : appointments

        // Today's date string
        const todayStr = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`
        
        // This month's start
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        
        // ============ OVERVIEW STATS ============
        const overviewStats = {
            totalDoctors: doctors.length,
            totalPatients: patients.length,
            totalAppointments: filteredAppointments.length,
            totalRevenue: filteredAppointments
                .filter(apt => apt.status === 'completed')
                .reduce((sum, apt) => sum + (apt.amount || 0), 0),
            todaysAppointments: appointments.filter(apt => apt.slotDate === todayStr).length,
            thisMonthAppointments: appointments.filter(apt => {
                const aptDate = parseSlotDate(apt.slotDate)
                return aptDate >= thisMonthStart
            }).length,
            availableDoctors: doctors.filter(doc => doc.available).length,
            unavailableDoctors: doctors.filter(doc => !doc.available).length
        }

        // ============ APPOINTMENT STATUS DISTRIBUTION ============
        const statusDistribution = {
            confirmed: filteredAppointments.filter(apt => apt.status === 'confirmed').length,
            completed: filteredAppointments.filter(apt => apt.status === 'completed').length,
            cancelled: filteredAppointments.filter(apt => apt.status === 'cancelled').length,
            expired: filteredAppointments.filter(apt => apt.status === 'expired').length,
            pending: filteredAppointments.filter(apt => apt.status === 'pending').length
        }

        // ============ APPOINTMENTS OVER TIME ============
        const appointmentsOverTime = []
        const revenueOverTime = []
        
        // Determine grouping based on period
        let groupBy = 'day' // 'day', 'week', 'month'
        let numPoints = 7
        
        if (period === '7d') {
            groupBy = 'day'
            numPoints = 7
        } else if (period === '30d') {
            groupBy = 'day'
            numPoints = 30
        } else if (period === '6m') {
            groupBy = 'month'
            numPoints = 6
        } else if (period === '1y') {
            groupBy = 'month'
            numPoints = 12
        } else {
            groupBy = 'month'
            numPoints = 12
        }

        if (groupBy === 'day') {
            for (let i = numPoints - 1; i >= 0; i--) {
                const date = new Date(today)
                date.setDate(date.getDate() - i)
                const dateStr = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`
                
                const dayAppointments = appointments.filter(apt => apt.slotDate === dateStr)
                const dayRevenue = dayAppointments
                    .filter(apt => apt.status === 'completed')
                    .reduce((sum, apt) => sum + (apt.amount || 0), 0)
                
                appointmentsOverTime.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    total: dayAppointments.length,
                    completed: dayAppointments.filter(apt => apt.status === 'completed').length,
                    cancelled: dayAppointments.filter(apt => apt.status === 'cancelled').length
                })
                
                revenueOverTime.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    revenue: dayRevenue
                })
            }
        } else {
            for (let i = numPoints - 1; i >= 0; i--) {
                const date = new Date(today)
                date.setMonth(date.getMonth() - i)
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
                const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
                
                const monthAppointments = appointments.filter(apt => {
                    const aptDate = parseSlotDate(apt.slotDate)
                    return aptDate >= monthStart && aptDate <= monthEnd
                })
                
                const monthRevenue = monthAppointments
                    .filter(apt => apt.status === 'completed')
                    .reduce((sum, apt) => sum + (apt.amount || 0), 0)
                
                appointmentsOverTime.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                    total: monthAppointments.length,
                    completed: monthAppointments.filter(apt => apt.status === 'completed').length,
                    cancelled: monthAppointments.filter(apt => apt.status === 'cancelled').length
                })
                
                revenueOverTime.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                    revenue: monthRevenue
                })
            }
        }

        // ============ DOCTORS BY SPECIALITY ============
        const specialityCount = {}
        doctors.forEach(doc => {
            const spec = doc.speciality || 'Other'
            specialityCount[spec] = (specialityCount[spec] || 0) + 1
        })
        const doctorsBySpeciality = Object.entries(specialityCount).map(([name, value]) => ({
            name,
            value
        }))

        // ============ TOP DOCTORS ============
        const doctorAppointmentCount = {}
        const doctorRevenueCount = {}
        
        filteredAppointments.forEach(apt => {
            if (apt.status === 'completed') {
                const docId = apt.docId
                doctorAppointmentCount[docId] = (doctorAppointmentCount[docId] || 0) + 1
                doctorRevenueCount[docId] = (doctorRevenueCount[docId] || 0) + (apt.amount || 0)
            }
        })
        
        const topDoctors = doctors
            .map(doc => ({
                id: doc._id,
                name: doc.name,
                speciality: doc.speciality,
                image: doc.image,
                completedAppointments: doctorAppointmentCount[doc._id.toString()] || 0,
                revenue: doctorRevenueCount[doc._id.toString()] || 0
            }))
            .sort((a, b) => b.completedAppointments - a.completedAppointments)
            .slice(0, 5)

        // ============ NEW PATIENT REGISTRATIONS ============
        const patientRegistrations = []
        
        if (groupBy === 'day') {
            for (let i = numPoints - 1; i >= 0; i--) {
                const date = new Date(today)
                date.setDate(date.getDate() - i)
                const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
                
                const count = patients.filter(p => {
                    const createdAt = new Date(p.createdAt || p.date || 0)
                    return createdAt >= dayStart && createdAt < dayEnd
                }).length
                
                patientRegistrations.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    count
                })
            }
        } else {
            for (let i = numPoints - 1; i >= 0; i--) {
                const date = new Date(today)
                date.setMonth(date.getMonth() - i)
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
                const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
                
                const count = patients.filter(p => {
                    const createdAt = new Date(p.createdAt || p.date || 0)
                    return createdAt >= monthStart && createdAt <= monthEnd
                }).length
                
                patientRegistrations.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                    count
                })
            }
        }

        // ============ RECENT APPOINTMENTS ============
        const recentAppointments = appointments
            .sort((a, b) => b.date - a.date)
            .slice(0, 10)
            .map(apt => ({
                id: apt._id,
                patientName: apt.userData?.name || 'Unknown',
                patientImage: apt.userData?.image || '',
                doctorName: apt.docData?.name || 'Unknown',
                doctorImage: apt.docData?.image || '',
                speciality: apt.docData?.speciality || '',
                date: apt.slotDate,
                time: apt.slotTime,
                status: apt.status,
                amount: apt.amount
            }))

        // ============ REVENUE BY DOCTOR (Top 5) ============
        const revenueByDoctor = doctors
            .map(doc => ({
                name: doc.name,
                revenue: doctorRevenueCount[doc._id.toString()] || 0
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        res.json({
            success: true,
            data: {
                overviewStats,
                statusDistribution,
                appointmentsOverTime,
                revenueOverTime,
                doctorsBySpeciality,
                topDoctors,
                patientRegistrations,
                recentAppointments,
                revenueByDoctor
            }
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ==================== DEPARTMENT FUNCTIONS ====================

// API to add new department
const addDepartment = async (req, res) => {
    try {
        const { name, description } = req.body

        // Validate name
        if (!name || name.trim() === '') {
            return res.json({ success: false, message: "Department name is required" })
        }

        // Clean the name (trim spaces, capitalize first letter of each word)
        const cleanName = name.trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')

        // Check if department already exists (case-insensitive)
        const existingDepartment = await departmentModel.findOne({ 
            name: { $regex: new RegExp(`^${cleanName}$`, 'i') } 
        })

        if (existingDepartment) {
            return res.json({ success: false, message: "Department already exists" })
        }

        // Create new department
        const newDepartment = new departmentModel({
            name: cleanName,
            description: description ? description.trim() : '',
            isActive: true
        })

        await newDepartment.save()

        res.json({ 
            success: true, 
            message: "Department added successfully",
            department: newDepartment
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all departments (with auto-sync for existing doctor specialities)
const getAllDepartments = async (req, res) => {
    try {
        // First, check if we have any departments
        let departments = await departmentModel.find({})

        // If no departments exist, auto-create from existing doctor specialities
        if (departments.length === 0) {
            console.log("No departments found. Auto-syncing from existing doctors...")

            // Get all unique specialities from doctors
            const doctors = await doctorModel.find({}).select('speciality')
            const uniqueSpecialities = [...new Set(doctors.map(doc => doc.speciality).filter(Boolean))]

            // Create departments for each unique speciality
            if (uniqueSpecialities.length > 0) {
                const departmentsToCreate = uniqueSpecialities.map(spec => ({
                    name: spec,
                    description: '',
                    isActive: true,
                    createdAt: new Date()
                }))

                // Insert all departments
                await departmentModel.insertMany(departmentsToCreate, { ordered: false })
                    .catch(err => {
                        // Ignore duplicate key errors (in case of race condition)
                        if (err.code !== 11000) {
                            console.log("Error creating departments:", err)
                        }
                    })

                console.log(`Auto-created ${uniqueSpecialities.length} departments from existing doctors`)
            }

            // Fetch again after creating
            departments = await departmentModel.find({})
        }

        // Also check for any new specialities in doctors that don't have departments yet
        const doctors = await doctorModel.find({}).select('speciality')
        const doctorSpecialities = [...new Set(doctors.map(doc => doc.speciality).filter(Boolean))]
        const existingDeptNames = departments.map(d => d.name.toLowerCase())

        // Find specialities that don't have departments
        const missingSpecialities = doctorSpecialities.filter(
            spec => !existingDeptNames.includes(spec.toLowerCase())
        )

        // Create missing departments
        if (missingSpecialities.length > 0) {
            const newDepts = missingSpecialities.map(spec => ({
                name: spec,
                description: '',
                isActive: true,
                createdAt: new Date()
            }))

            await departmentModel.insertMany(newDepts, { ordered: false })
                .catch(err => {
                    if (err.code !== 11000) {
                        console.log("Error creating missing departments:", err)
                    }
                })

            // Fetch updated list
            departments = await departmentModel.find({})
        }

        // Sort alphabetically by name
        departments.sort((a, b) => a.name.localeCompare(b.name))

        // For each department, get doctor count
        const departmentsWithCount = await Promise.all(
            departments.map(async (dept) => {
                const doctorCount = await doctorModel.countDocuments({ 
                    speciality: { $regex: new RegExp(`^${dept.name}$`, 'i') } 
                })
                return {
                    ...dept.toObject(),
                    doctorCount
                }
            })
        )

        res.json({ 
            success: true, 
            departments: departmentsWithCount 
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update department
const updateDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params
        const { name, description, isActive } = req.body

        if (!departmentId) {
            return res.json({ success: false, message: "Department ID is required" })
        }

        const department = await departmentModel.findById(departmentId)

        if (!department) {
            return res.json({ success: false, message: "Department not found" })
        }

        // If name is being changed, check for duplicates
        if (name && name.trim() !== department.name) {
            const cleanName = name.trim()
            const existingDept = await departmentModel.findOne({
                name: { $regex: new RegExp(`^${cleanName}$`, 'i') },
                _id: { $ne: departmentId }
            })

            if (existingDept) {
                return res.json({ success: false, message: "Department name already exists" })
            }

            // Update all doctors with old speciality to new speciality
            await doctorModel.updateMany(
                { speciality: { $regex: new RegExp(`^${department.name}$`, 'i') } },
                { $set: { speciality: cleanName } }
            )

            department.name = cleanName
        }

        if (description !== undefined) {
            department.description = description.trim()
        }

        if (isActive !== undefined) {
            department.isActive = isActive
        }

        await department.save()

        res.json({ 
            success: true, 
            message: "Department updated successfully",
            department 
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to delete department
const deleteDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params

        if (!departmentId) {
            return res.json({ success: false, message: "Department ID is required" })
        }

        const department = await departmentModel.findById(departmentId)

        if (!department) {
            return res.json({ success: false, message: "Department not found" })
        }

        // Check if any doctors are using this department
        const doctorCount = await doctorModel.countDocuments({
            speciality: { $regex: new RegExp(`^${department.name}$`, 'i') }
        })

        if (doctorCount > 0) {
            return res.json({ 
                success: false, 
                message: `Cannot delete. ${doctorCount} doctor(s) are assigned to this department. Please reassign them first.` 
            })
        }

        await departmentModel.findByIdAndDelete(departmentId)

        res.json({ success: true, message: "Department deleted successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard, appointmentCancelWithReason, appointmentRescheduleAdmin, getDoctorById, getAllPatients, getPatientById, getAnalyticsData,  addDepartment,
    getAllDepartments,
    updateDepartment,
    deleteDepartment}   */




import validator from 'validator'
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from "cloudinary"
import doctorModel from '../models/doctorModel.js'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import departmentModel from '../models/departmentModel.js'
import userModel from '../models/userModel.js'
import { sendDoctorWelcomeEmail } from '../utils/emailService.js' 
import nodemailer from 'nodemailer'

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

// Helper: Format date for emails
const formatDateForEmail = (slotDate) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
} 


// API for adding doctor with OPTIONAL schedule
const addDoctor = async (req, res) => {
    try {
        const { 
            name, email, password, speciality, degree, experience, about, fees, address,
            weeklySchedule, slotDuration, advanceBookingDays, letDoctorSetLater
        } = req.body
        
        const imageFile = req.file

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing data" })
        }

        const parsedSchedule = weeklySchedule 
            ? (typeof weeklySchedule === 'string' ? JSON.parse(weeklySchedule) : weeklySchedule)
            : null

        const isLettingDoctorSetLater = letDoctorSetLater === 'true' || letDoctorSetLater === true

        if (!isLettingDoctorSetLater && parsedSchedule) {
            const hasWorkingDay = Object.values(parsedSchedule).some(day => day.isWorking && day.timeSlots && day.timeSlots.length > 0)
            if (!hasWorkingDay) {
                return res.json({ success: false, message: "Please set at least one working day with time slots, or check 'Let doctor set later'" })
            }
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter strong password" })
        }

        const existingDoctor = await doctorModel.findOne({ email })
        if (existingDoctor) {
            return res.json({ success: false, message: "Doctor with this email already exists" })
        }

        const plainPassword = password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        const defaultEmptySchedule = {
            monday: { isWorking: false, timeSlots: [] },
            tuesday: { isWorking: false, timeSlots: [] },
            wednesday: { isWorking: false, timeSlots: [] },
            thursday: { isWorking: false, timeSlots: [] },
            friday: { isWorking: false, timeSlots: [] },
            saturday: { isWorking: false, timeSlots: [] },
            sunday: { isWorking: false, timeSlots: [] }
        }

        const doctorData = {
            name, email,
            image: imageUrl,
            password: hashedPassword,
            speciality, degree, experience, about, fees,
            address: JSON.parse(address),
            date: Date.now(),
            isFirstLogin: true,
            isScheduleConfirmed: false,
            isBlocked: false,
            weeklySchedule: isLettingDoctorSetLater ? defaultEmptySchedule : (parsedSchedule || defaultEmptySchedule),
            slotDuration: slotDuration ? Number(slotDuration) : 20,
            advanceBookingDays: advanceBookingDays ? Number(advanceBookingDays) : 7
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        const emailResult = await sendDoctorWelcomeEmail(email, name, plainPassword)
        
        if (emailResult.success) {
            res.json({ success: true, message: "Doctor added successfully! Welcome email sent." })
        } else {
            res.json({ success: true, message: "Doctor added successfully! (Email notification failed - please share credentials manually)" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ✅ NEW: Edit Doctor — admin can edit all fields except email, password, weeklySchedule, slotDuration
const editDoctor = async (req, res) => {
    try {
        const { docId } = req.params
        const { name, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file

        if (!docId) {
            return res.json({ success: false, message: "Doctor ID is required" })
        }

        const doctor = await doctorModel.findById(docId)
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" })
        }

        // Build update object with only provided fields
        const updateData = {}
        if (name && name.trim()) updateData.name = name.trim()
        if (speciality && speciality.trim()) updateData.speciality = speciality.trim()
        if (degree && degree.trim()) updateData.degree = degree.trim()
        if (experience && experience.trim()) updateData.experience = experience.trim()
        if (about && about.trim()) updateData.about = about.trim()
        if (fees) updateData.fees = Number(fees)
        if (address) updateData.address = typeof address === 'string' ? JSON.parse(address) : address

        // Upload new image if provided
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            updateData.image = imageUpload.secure_url
        }

        await doctorModel.findByIdAndUpdate(docId, updateData)

        res.json({ success: true, message: "Doctor details updated successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ✅ NEW: Block Doctor — blocks doctor and auto-cancels all confirmed appointments with emails
const blockDoctor = async (req, res) => {
    try {
        const { docId } = req.params
        const { reason } = req.body

        if (!docId) {
            return res.json({ success: false, message: "Doctor ID is required" })
        }

        const doctor = await doctorModel.findById(docId)
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" })
        }

        if (doctor.isBlocked) {
            return res.json({ success: false, message: "Doctor is already blocked" })
        }

        // Find all confirmed appointments for this doctor
        const confirmedAppointments = await appointmentModel.find({
            docId: docId,
            status: 'confirmed'
        })

        // Cancel each appointment and notify patients
        for (const appointment of confirmedAppointments) {
            await appointmentModel.findByIdAndUpdate(appointment._id, {
                status: 'cancelled',
                cancelReason: 'Doctor is no longer available',
                cancelledBy: 'admin'
            })

            const patientName = appointment.userData?.name || 'Patient'
            const patientEmail = appointment.userData?.email
            const doctorName = appointment.docData?.name || doctor.name
            const formattedDate = formatDateForEmail(appointment.slotDate)

            if (patientEmail) {
                const patientMailOptions = {
                    from: process.env.EMAIL_USER,
                    to: patientEmail,
                    subject: 'Appointment Cancelled - SmartCare Hospitals',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                            <h2 style="color: #EF4444;">Appointment Cancelled</h2>
                            <p>Hello ${patientName},</p>
                            <p>We regret to inform you that your appointment has been cancelled as the doctor is no longer available.</p>
                            <div style="background-color: #FEF2F2; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #EF4444;">
                                <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
                                <p><strong>Date:</strong> ${formattedDate}</p>
                                <p><strong>Time:</strong> ${appointment.slotTime}</p>
                            </div>
                            <p>We sincerely apologize for the inconvenience. Please book a new appointment with another available doctor.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/doctors"
                                   style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                    Book New Appointment
                                </a>
                            </div>
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare Hospitals.</p>
                        </div>
                    `
                }
                await transporter.sendMail(patientMailOptions).catch(err => console.log('Patient email error:', err))
            }
        }

        // Block the doctor — clear slots_booked since all confirmed are now cancelled
        await doctorModel.findByIdAndUpdate(docId, {
            isBlocked: true,
            blockedReason: reason || '',
            available: false,
            slots_booked: {}
        })

        res.json({
            success: true,
            message: `Doctor blocked. ${confirmedAppointments.length} appointment(s) cancelled and patients notified.`
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ✅ NEW: Unblock Doctor
const unblockDoctor = async (req, res) => {
    try {
        const { docId } = req.params
        const { newSpeciality } = req.body

        if (!docId) {
            return res.json({ success: false, message: "Doctor ID is required" })
        }

        const doctor = await doctorModel.findById(docId)
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" })
        }

        if (!doctor.isBlocked) {
            return res.json({ success: false, message: "Doctor is not blocked" })
        }

        const updateData = {
            isBlocked: false,
            blockedReason: '',
            available: true
        }

        // If new speciality/department provided (when old dept was deleted)
        if (newSpeciality && newSpeciality.trim()) {
            updateData.speciality = newSpeciality.trim()
        }

        await doctorModel.findByIdAndUpdate(docId, updateData)

        res.json({ success: true, message: "Doctor unblocked successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ✅ NEW: Get active (non-blocked) doctors by department — used in delete modal
const getDoctorsByDepartment = async (req, res) => {
    try {
        const { departmentName } = req.params

        const doctors = await doctorModel.find({
            speciality: { $regex: new RegExp(`^${departmentName}$`, 'i') },
            isBlocked: false
        }).select('-password')

        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ✅ NEW: Reassign doctor to a different department
const reassignDoctor = async (req, res) => {
    try {
        const { docId } = req.params
        const { newSpeciality } = req.body

        if (!newSpeciality || !newSpeciality.trim()) {
            return res.json({ success: false, message: "New department is required" })
        }

        const doctor = await doctorModel.findById(docId)
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" })
        }

        await doctorModel.findByIdAndUpdate(docId, { speciality: newSpeciality.trim() })

        res.json({ success: true, message: "Doctor reassigned successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API for the admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to get all doctors list on admin panel
const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API for Appointment cancellation
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const appointment = await appointmentModel.findById(appointmentId)

        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        appointment.status = 'cancelled'
        await appointment.save()

        const doctor = await doctorModel.findById(appointment.docId)
        const slots = doctor.slots_booked

        if (slots[appointment.slotDate]) {
            slots[appointment.slotDate] = slots[appointment.slotDate].filter(
                e => e.trim().toLowerCase() !== appointment.slotTime.trim().toLowerCase()
            )
            if (slots[appointment.slotDate].length === 0) {
                delete slots[appointment.slotDate]
            }
        }

        await doctorModel.findByIdAndUpdate(doctor._id, { slots_booked: slots })
        res.json({ success: true, message: 'Appointment cancelled' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            listAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API for Appointment cancellation with reason and email
const appointmentCancelWithReason = async (req, res) => {
    try {
        const { appointmentId, reason } = req.body

        if (!reason || reason.trim() === '') {
            return res.json({ success: false, message: "Please provide a reason for cancellation" })
        }

        const appointment = await appointmentModel.findById(appointmentId)

        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        if (appointment.status !== 'confirmed') {
            return res.json({ success: false, message: 'Only confirmed appointments can be cancelled' })
        }

        const doctor = await doctorModel.findById(appointment.docId)
        let slots_booked = doctor.slots_booked || {}

        if (slots_booked[appointment.slotDate]) {
            slots_booked[appointment.slotDate] = slots_booked[appointment.slotDate].filter(
                e => e.trim().toLowerCase() !== appointment.slotTime.trim().toLowerCase()
            )
            if (slots_booked[appointment.slotDate].length === 0) {
                delete slots_booked[appointment.slotDate]
            }
        }

        await doctorModel.findByIdAndUpdate(doctor._id, { slots_booked })

        await appointmentModel.findByIdAndUpdate(appointmentId, {
            status: 'cancelled',
            cancelReason: reason,
            cancelledBy: 'admin'
        })

        const updatedAppointment = await appointmentModel.findById(appointmentId)
        const patientEmail = updatedAppointment.userData.email
        const patientName = updatedAppointment.userData.name
        const doctorName = updatedAppointment.docData.name
        const doctorEmail = updatedAppointment.docData.email
        const formattedDate = formatDateForEmail(appointment.slotDate)

        const patientMailOptions = {
            from: process.env.EMAIL_USER,
            to: patientEmail,
            subject: 'Appointment Cancelled - SmartCare Hospitals',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #EF4444;">Appointment Cancelled</h2>
                    <p>Hello ${patientName},</p>
                    <p>We regret to inform you that your appointment has been cancelled by the hospital administration.</p>
                    <div style="background-color: #FEF2F2; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #EF4444;">
                        <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
                        <p><strong>Original Date:</strong> ${formattedDate}</p>
                        <p><strong>Original Time:</strong> ${appointment.slotTime}</p>
                    </div>
                    <div style="background-color: #FFF7ED; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold; color: #C2410C;">Reason for Cancellation:</p>
                        <p style="margin: 10px 0 0 0; color: #9A3412;">${reason}</p>
                    </div>
                    <p>We apologize for any inconvenience. Please book a new appointment at your convenience.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/doctors" 
                           style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Book New Appointment
                        </a>
                    </div>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare Hospitals.</p>
                </div>
            `
        }

        const doctorMailOptions = {
            from: process.env.EMAIL_USER,
            to: doctorEmail,
            subject: 'Appointment Cancelled by Admin - SmartCare',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #EF4444;">Appointment Cancelled by Admin</h2>
                    <p>Hello Dr. ${doctorName},</p>
                    <p>An appointment has been cancelled by the hospital administration.</p>
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Patient:</strong> ${patientName}</p>
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        <p><strong>Time:</strong> ${appointment.slotTime}</p>
                        <p><strong>Cancelled By:</strong> Admin</p>
                        <p><strong>Reason:</strong> ${reason}</p>
                    </div>
                    <p>The patient has been notified via email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare.</p>
                </div>
            `
        }

        await transporter.sendMail(patientMailOptions)
        await transporter.sendMail(doctorMailOptions)

        res.json({ success: true, message: 'Appointment cancelled successfully' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to reschedule appointment by admin
const appointmentRescheduleAdmin = async (req, res) => {
    try {
        const { appointmentId, newSlotDate, newSlotTime, reason } = req.body

        if (!reason || reason.trim() === '') {
            return res.json({ success: false, message: "Please provide a reason for rescheduling" })
        }

        if (!newSlotDate || !newSlotTime) {
            return res.json({ success: false, message: "Please select a new date and time" })
        }

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" })
        }

        if (appointmentData.status !== 'confirmed') {
            return res.json({ success: false, message: "Only confirmed appointments can be rescheduled" })
        }

        const oldSlotDate = appointmentData.slotDate
        const oldSlotTime = appointmentData.slotTime
        const docId = appointmentData.docId

        const docData = await doctorModel.findById(docId)
        let slots_booked = docData.slots_booked || {}

        if (slots_booked[newSlotDate] && slots_booked[newSlotDate].includes(newSlotTime)) {
            return res.json({ success: false, message: "Selected slot is not available" })
        }

        if (slots_booked[oldSlotDate]) {
            slots_booked[oldSlotDate] = slots_booked[oldSlotDate].filter(t => t !== oldSlotTime)
            if (slots_booked[oldSlotDate].length === 0) {
                delete slots_booked[oldSlotDate]
            }
        }

        if (!slots_booked[newSlotDate]) slots_booked[newSlotDate] = []
        slots_booked[newSlotDate].push(newSlotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        await appointmentModel.findByIdAndUpdate(appointmentId, {
            slotDate: newSlotDate,
            slotTime: newSlotTime,
            rescheduleReason: reason,
            rescheduledBy: 'admin',
            previousSlotDate: oldSlotDate,
            previousSlotTime: oldSlotTime
        })

        const updatedAppointment = await appointmentModel.findById(appointmentId)
        const patientEmail = updatedAppointment.userData.email
        const patientName = updatedAppointment.userData.name
        const doctorName = updatedAppointment.docData.name
        const doctorEmail = updatedAppointment.docData.email
        const oldFormattedDate = formatDateForEmail(oldSlotDate)
        const newFormattedDate = formatDateForEmail(newSlotDate)

        const patientMailOptions = {
            from: process.env.EMAIL_USER,
            to: patientEmail,
            subject: 'Appointment Rescheduled - SmartCare Hospitals',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #F59E0B;">Appointment Rescheduled</h2>
                    <p>Hello ${patientName},</p>
                    <p>Your appointment has been rescheduled by the hospital administration.</p>
                    <div style="background-color: #FEF2F2; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold; color: #991B1B;">Previous Schedule:</p>
                        <p style="margin: 5px 0; color: #DC2626; text-decoration: line-through;">${oldFormattedDate} at ${oldSlotTime}</p>
                    </div>
                    <div style="background-color: #ECFDF5; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold; color: #065F46;">New Schedule:</p>
                        <p style="margin: 5px 0; color: #059669; font-size: 18px; font-weight: bold;">${newFormattedDate} at ${newSlotTime}</p>
                    </div>
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
                    </div>
                    <div style="background-color: #FFF7ED; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold; color: #C2410C;">Reason for Rescheduling:</p>
                        <p style="margin: 10px 0 0 0; color: #9A3412;">${reason}</p>
                    </div>
                    <p>Please make a note of your new appointment time.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare Hospitals.</p>
                </div>
            `
        }

        const doctorMailOptions = {
            from: process.env.EMAIL_USER,
            to: doctorEmail,
            subject: 'Appointment Rescheduled by Admin - SmartCare',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #F59E0B;">Appointment Rescheduled by Admin</h2>
                    <p>Hello Dr. ${doctorName},</p>
                    <p>An appointment has been rescheduled by the hospital administration.</p>
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Patient:</strong> ${patientName}</p>
                        <p><strong>Previous:</strong> ${oldFormattedDate} at ${oldSlotTime}</p>
                        <p><strong>New:</strong> ${newFormattedDate} at ${newSlotTime}</p>
                        <p><strong>Reason:</strong> ${reason}</p>
                    </div>
                    <p>The patient has been notified via email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare.</p>
                </div>
            `
        }

        await transporter.sendMail(patientMailOptions)
        await transporter.sendMail(doctorMailOptions)

        res.json({ success: true, message: "Appointment Rescheduled Successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to get single doctor details with booked appointments
const getDoctorById = async (req, res) => {
    try {
        const { docId } = req.params
        const doctor = await doctorModel.findById(docId).select('-password')

        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found' })
        }

        const appointments = await appointmentModel.find({ docId })
        res.json({ success: true, doctor, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to get all patients/users
const getAllPatients = async (req, res) => {
    try {
        const patients = await userModel.find({}).select('-password')
        
        const patientsWithStats = await Promise.all(
            patients.map(async (patient) => {
                const appointments = await appointmentModel.find({ userId: patient._id.toString() })
                
                const stats = {
                    total: appointments.length,
                    completed: appointments.filter(a => a.status === 'completed').length,
                    confirmed: appointments.filter(a => a.status === 'confirmed').length,
                    cancelled: appointments.filter(a => a.status === 'cancelled').length,
                    expired: appointments.filter(a => a.status === 'expired').length
                }

                const lastAppointment = appointments.length > 0 
                    ? appointments.sort((a, b) => b.date - a.date)[0]
                    : null

                return {
                    ...patient.toObject(),
                    appointmentStats: stats,
                    lastAppointmentDate: lastAppointment ? lastAppointment.date : null
                }
            })
        )

        res.json({ success: true, patients: patientsWithStats })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to get single patient details with appointments
const getPatientById = async (req, res) => {
    try {
        const { patientId } = req.params
        const patient = await userModel.findById(patientId).select('-password')

        if (!patient) {
            return res.json({ success: false, message: 'Patient not found' })
        }

        const appointments = await appointmentModel.find({ userId: patientId })
        const sortedAppointments = appointments.sort((a, b) => b.date - a.date)

        const stats = {
            total: appointments.length,
            completed: appointments.filter(a => a.status === 'completed').length,
            confirmed: appointments.filter(a => a.status === 'confirmed').length,
            cancelled: appointments.filter(a => a.status === 'cancelled').length,
            expired: appointments.filter(a => a.status === 'expired').length
        }

        res.json({ success: true, patient, appointments: sortedAppointments, stats })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to get analytics data
const getAnalyticsData = async (req, res) => {
    try {
        const { period } = req.query
        
        const doctors = await doctorModel.find({}).select('-password')
        const patients = await userModel.find({})
        const appointments = await appointmentModel.find({})
        
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        let startDate = null
        switch (period) {
            case '7d': startDate = new Date(today); startDate.setDate(startDate.getDate() - 7); break
            case '30d': startDate = new Date(today); startDate.setDate(startDate.getDate() - 30); break
            case '6m': startDate = new Date(today); startDate.setMonth(startDate.getMonth() - 6); break
            case '1y': startDate = new Date(today); startDate.setFullYear(startDate.getFullYear() - 1); break
            default: startDate = null
        }

        const parseSlotDate = (slotDate) => {
            const [day, month, year] = slotDate.split('_').map(Number)
            return new Date(year, month - 1, day)
        }

        const filteredAppointments = startDate
            ? appointments.filter(apt => parseSlotDate(apt.slotDate) >= startDate)
            : appointments

        const todayStr = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        
        const overviewStats = {
            totalDoctors: doctors.length,
            totalPatients: patients.length,
            totalAppointments: filteredAppointments.length,
            totalRevenue: filteredAppointments.filter(apt => apt.status === 'completed').reduce((sum, apt) => sum + (apt.amount || 0), 0),
            todaysAppointments: appointments.filter(apt => apt.slotDate === todayStr).length,
            thisMonthAppointments: appointments.filter(apt => parseSlotDate(apt.slotDate) >= thisMonthStart).length,
            availableDoctors: doctors.filter(doc => doc.available).length,
            unavailableDoctors: doctors.filter(doc => !doc.available).length
        }

        const statusDistribution = {
            confirmed: filteredAppointments.filter(apt => apt.status === 'confirmed').length,
            completed: filteredAppointments.filter(apt => apt.status === 'completed').length,
            cancelled: filteredAppointments.filter(apt => apt.status === 'cancelled').length,
            expired: filteredAppointments.filter(apt => apt.status === 'expired').length,
            pending: filteredAppointments.filter(apt => apt.status === 'pending').length
        }

        const appointmentsOverTime = []
        const revenueOverTime = []
        
        let groupBy = 'day'
        let numPoints = 7
        
        if (period === '7d') { groupBy = 'day'; numPoints = 7 }
        else if (period === '30d') { groupBy = 'day'; numPoints = 30 }
        else if (period === '6m') { groupBy = 'month'; numPoints = 6 }
        else if (period === '1y') { groupBy = 'month'; numPoints = 12 }
        else { groupBy = 'month'; numPoints = 12 }

        if (groupBy === 'day') {
            for (let i = numPoints - 1; i >= 0; i--) {
                const date = new Date(today)
                date.setDate(date.getDate() - i)
                const dateStr = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`
                const dayAppointments = appointments.filter(apt => apt.slotDate === dateStr)
                const dayRevenue = dayAppointments.filter(apt => apt.status === 'completed').reduce((sum, apt) => sum + (apt.amount || 0), 0)
                
                appointmentsOverTime.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    total: dayAppointments.length,
                    completed: dayAppointments.filter(apt => apt.status === 'completed').length,
                    cancelled: dayAppointments.filter(apt => apt.status === 'cancelled').length
                })
                revenueOverTime.push({ date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), revenue: dayRevenue })
            }
        } else {
            for (let i = numPoints - 1; i >= 0; i--) {
                const date = new Date(today)
                date.setMonth(date.getMonth() - i)
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
                const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
                const monthAppointments = appointments.filter(apt => {
                    const aptDate = parseSlotDate(apt.slotDate)
                    return aptDate >= monthStart && aptDate <= monthEnd
                })
                const monthRevenue = monthAppointments.filter(apt => apt.status === 'completed').reduce((sum, apt) => sum + (apt.amount || 0), 0)
                
                appointmentsOverTime.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                    total: monthAppointments.length,
                    completed: monthAppointments.filter(apt => apt.status === 'completed').length,
                    cancelled: monthAppointments.filter(apt => apt.status === 'cancelled').length
                })
                revenueOverTime.push({ date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), revenue: monthRevenue })
            }
        }

        const specialityCount = {}
        doctors.forEach(doc => {
            const spec = doc.speciality || 'Other'
            specialityCount[spec] = (specialityCount[spec] || 0) + 1
        })
        const doctorsBySpeciality = Object.entries(specialityCount).map(([name, value]) => ({ name, value }))

        const doctorAppointmentCount = {}
        const doctorRevenueCount = {}
        
        filteredAppointments.forEach(apt => {
            if (apt.status === 'completed') {
                const docId = apt.docId
                doctorAppointmentCount[docId] = (doctorAppointmentCount[docId] || 0) + 1
                doctorRevenueCount[docId] = (doctorRevenueCount[docId] || 0) + (apt.amount || 0)
            }
        })
        
        const topDoctors = doctors
            .map(doc => ({
                id: doc._id, name: doc.name, speciality: doc.speciality, image: doc.image,
                completedAppointments: doctorAppointmentCount[doc._id.toString()] || 0,
                revenue: doctorRevenueCount[doc._id.toString()] || 0
            }))
            .sort((a, b) => b.completedAppointments - a.completedAppointments)
            .slice(0, 5)

        const patientRegistrations = []
        
        if (groupBy === 'day') {
            for (let i = numPoints - 1; i >= 0; i--) {
                const date = new Date(today)
                date.setDate(date.getDate() - i)
                const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
                const count = patients.filter(p => { const c = new Date(p.createdAt || p.date || 0); return c >= dayStart && c < dayEnd }).length
                patientRegistrations.push({ date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count })
            }
        } else {
            for (let i = numPoints - 1; i >= 0; i--) {
                const date = new Date(today)
                date.setMonth(date.getMonth() - i)
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
                const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
                const count = patients.filter(p => { const c = new Date(p.createdAt || p.date || 0); return c >= monthStart && c <= monthEnd }).length
                patientRegistrations.push({ date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), count })
            }
        }

        const recentAppointments = appointments
            .sort((a, b) => b.date - a.date)
            .slice(0, 10)
            .map(apt => ({
                id: apt._id,
                patientName: apt.userData?.name || 'Unknown',
                patientImage: apt.userData?.image || '',
                doctorName: apt.docData?.name || 'Unknown',
                doctorImage: apt.docData?.image || '',
                speciality: apt.docData?.speciality || '',
                date: apt.slotDate, time: apt.slotTime, status: apt.status, amount: apt.amount
            }))

        const revenueByDoctor = doctors
            .map(doc => ({ name: doc.name, revenue: doctorRevenueCount[doc._id.toString()] || 0 }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        res.json({
            success: true,
            data: { overviewStats, statusDistribution, appointmentsOverTime, revenueOverTime, doctorsBySpeciality, topDoctors, patientRegistrations, recentAppointments, revenueByDoctor }
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==================== DEPARTMENT FUNCTIONS ====================

const addDepartment = async (req, res) => {
    try {
        const { name, description } = req.body

        if (!name || name.trim() === '') {
            return res.json({ success: false, message: "Department name is required" })
        }

        const cleanName = name.trim().split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')

        const existingDepartment = await departmentModel.findOne({ 
            name: { $regex: new RegExp(`^${cleanName}$`, 'i') } 
        })

        if (existingDepartment) {
            return res.json({ success: false, message: "Department already exists" })
        }

        const newDepartment = new departmentModel({
            name: cleanName,
            description: description ? description.trim() : '',
            isActive: true
        })

        await newDepartment.save()

        res.json({ success: true, message: "Department added successfully", department: newDepartment })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ✅ UPDATED: getAllDepartments — doctorCount excludes blocked doctors
/*const getAllDepartments = async (req, res) => {
    try {
        let departments = await departmentModel.find({})

        if (departments.length === 0) {
            console.log("No departments found. Auto-syncing from existing doctors...")
            //const doctors = await doctorModel.find({}).select('speciality')
            const doctors = await doctorModel.find({ isBlocked: false }).select('speciality')
            const uniqueSpecialities = [...new Set(doctors.map(doc => doc.speciality).filter(Boolean))]

            if (uniqueSpecialities.length > 0) {
                const departmentsToCreate = uniqueSpecialities.map(spec => ({
                    name: spec, description: '', isActive: true, createdAt: new Date()
                }))
                await departmentModel.insertMany(departmentsToCreate, { ordered: false })
                    .catch(err => { if (err.code !== 11000) console.log("Error creating departments:", err) })
                console.log(`Auto-created ${uniqueSpecialities.length} departments`)
            }
            departments = await departmentModel.find({})
        }

        const doctors = await doctorModel.find({}).select('speciality')
        const doctorSpecialities = [...new Set(doctors.map(doc => doc.speciality).filter(Boolean))]
        const existingDeptNames = departments.map(d => d.name.toLowerCase())
        const missingSpecialities = doctorSpecialities.filter(
            spec => !existingDeptNames.includes(spec.toLowerCase())
        )

        if (missingSpecialities.length > 0) {
            const newDepts = missingSpecialities.map(spec => ({
                name: spec, description: '', isActive: true, createdAt: new Date()
            }))
            await departmentModel.insertMany(newDepts, { ordered: false })
                .catch(err => { if (err.code !== 11000) console.log("Error:", err) })
            departments = await departmentModel.find({})
        }

        departments.sort((a, b) => a.name.localeCompare(b.name))

        const departmentsWithCount = await Promise.all(
            departments.map(async (dept) => {
                // ✅ Active count (non-blocked only)
                const doctorCount = await doctorModel.countDocuments({ 
                    speciality: { $regex: new RegExp(`^${dept.name}$`, 'i') },
                    isBlocked: false
                })
                // ✅ Blocked count separately
                const blockedCount = await doctorModel.countDocuments({
                    speciality: { $regex: new RegExp(`^${dept.name}$`, 'i') },
                    isBlocked: true
                })
                return { ...dept.toObject(), doctorCount, blockedCount }
            })
        )

        res.json({ success: true, departments: departmentsWithCount })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}*/


const getAllDepartments = async (req, res) => {
    try {
        let departments = await departmentModel.find({})

        if (departments.length === 0) {
            console.log("No departments found. Auto-syncing from existing doctors...")
            const doctors = await doctorModel.find({ isBlocked: false }).select('speciality')
            const uniqueSpecialities = [...new Set(doctors.map(doc => doc.speciality).filter(Boolean))]

            if (uniqueSpecialities.length > 0) {
                const departmentsToCreate = uniqueSpecialities.map(spec => ({
                    name: spec, description: '', isActive: true, createdAt: new Date()
                }))
                await departmentModel.insertMany(departmentsToCreate, { ordered: false })
                    .catch(err => { if (err.code !== 11000) console.log("Error creating departments:", err) })
                console.log(`Auto-created ${uniqueSpecialities.length} departments`)
            }
            departments = await departmentModel.find({})
        }

        // ✅ FIXED: only look at non-blocked doctors when auto-creating missing departments
        const doctors = await doctorModel.find({ isBlocked: false }).select('speciality')
        const doctorSpecialities = [...new Set(doctors.map(doc => doc.speciality).filter(Boolean))]
        const existingDeptNames = departments.map(d => d.name.toLowerCase())
        const missingSpecialities = doctorSpecialities.filter(
            spec => !existingDeptNames.includes(spec.toLowerCase())
        )

        if (missingSpecialities.length > 0) {
            const newDepts = missingSpecialities.map(spec => ({
                name: spec, description: '', isActive: true, createdAt: new Date()
            }))
            await departmentModel.insertMany(newDepts, { ordered: false })
                .catch(err => { if (err.code !== 11000) console.log("Error:", err) })
            departments = await departmentModel.find({})
        }

        departments.sort((a, b) => a.name.localeCompare(b.name))

        const departmentsWithCount = await Promise.all(
            departments.map(async (dept) => {
                const doctorCount = await doctorModel.countDocuments({ 
                    speciality: { $regex: new RegExp(`^${dept.name}$`, 'i') },
                    isBlocked: false
                })
                const blockedCount = await doctorModel.countDocuments({
                    speciality: { $regex: new RegExp(`^${dept.name}$`, 'i') },
                    isBlocked: true
                })
                return { ...dept.toObject(), doctorCount, blockedCount }
            })
        )

        res.json({ success: true, departments: departmentsWithCount })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//abc
const updateDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params
        const { name, description, isActive } = req.body

        if (!departmentId) {
            return res.json({ success: false, message: "Department ID is required" })
        }

        const department = await departmentModel.findById(departmentId)
        if (!department) {
            return res.json({ success: false, message: "Department not found" })
        }

        if (name && name.trim() !== department.name) {
            const cleanName = name.trim()
            const existingDept = await departmentModel.findOne({
                name: { $regex: new RegExp(`^${cleanName}$`, 'i') },
                _id: { $ne: departmentId }
            })
            if (existingDept) {
                return res.json({ success: false, message: "Department name already exists" })
            }
            await doctorModel.updateMany(
                { speciality: { $regex: new RegExp(`^${department.name}$`, 'i') } },
                { $set: { speciality: cleanName } }
            )
            department.name = cleanName
        }

        if (description !== undefined) department.description = description.trim()
        if (isActive !== undefined) department.isActive = isActive

        await department.save()

        res.json({ success: true, message: "Department updated successfully", department })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ✅ UPDATED: deleteDepartment — only blocked active (non-blocked) doctors prevent deletion
const deleteDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params

        if (!departmentId) {
            return res.json({ success: false, message: "Department ID is required" })
        }

        const department = await departmentModel.findById(departmentId)
        if (!department) {
            return res.json({ success: false, message: "Department not found" })
        }

        // Only count NON-blocked doctors
        const activeDoctorCount = await doctorModel.countDocuments({
            speciality: { $regex: new RegExp(`^${department.name}$`, 'i') },
            isBlocked: false
        })

        if (activeDoctorCount > 0) {
            return res.json({ 
                success: false, 
                message: `Cannot delete. ${activeDoctorCount} active doctor(s) are in this department. Block or reassign them first.`
            })
        }

        await departmentModel.findByIdAndDelete(departmentId)

        res.json({ success: true, message: "Department deleted successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


export { 
    addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard, 
    appointmentCancelWithReason, appointmentRescheduleAdmin, getDoctorById, getAllPatients, 
    getPatientById, getAnalyticsData, addDepartment, getAllDepartments, updateDepartment, deleteDepartment,
    editDoctor, blockDoctor, unblockDoctor, getDoctorsByDepartment, reassignDoctor
}