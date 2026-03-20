import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import nodemailer from 'nodemailer'

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

// OTP storage for forgot password
const doctorOtpStorage = new Map()

// Helper: Format date for emails
const formatDateForEmail = (slotDate) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
}

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body
        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: 'Availability Changed' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for doctor login
/*const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body

        const doctor = await doctorModel.findOne({ email })

        if (!doctor) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (isMatch) {
            if (doctor.isFirstLogin) {
                const tempToken = jwt.sign(
                    { id: doctor._id, purpose: 'password-change' },
                    process.env.JWT_SECRET,
                    { expiresIn: '15m' }
                )

                return res.json({
                    success: true,
                    requirePasswordChange: true,
                    tempToken,
                    message: 'Please set your new password'
                })
            }

            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
            res.json({ success: true, token })

        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}*/

// ✅ UPDATE: Login to include isScheduleConfirmed
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body

        const doctor = await doctorModel.findOne({ email })

        if (!doctor) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (isMatch) {
            if (doctor.isFirstLogin) {
                const tempToken = jwt.sign(
                    { id: doctor._id, purpose: 'password-change' },
                    process.env.JWT_SECRET,
                    { expiresIn: '15m' }
                )

                return res.json({
                    success: true,
                    requirePasswordChange: true,
                    tempToken,
                    message: 'Please set your new password'
                })
            }

            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

            // ✅ NEW: Include isScheduleConfirmed in response
            res.json({
                success: true,
                token,
                isScheduleConfirmed: doctor.isScheduleConfirmed  // ✅ NEW
            })

        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to set new password (first-time login)
const setNewPassword = async (req, res) => {
    try {
        const { newPassword } = req.body
        const { temptoken } = req.headers

        if (!temptoken) {
            return res.json({ success: false, message: 'Session expired. Please login again.' })
        }

        let decoded
        try {
            decoded = jwt.verify(temptoken, process.env.JWT_SECRET)
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.json({ success: false, message: 'Session expired. Please login again.' })
            }
            return res.json({ success: false, message: 'Invalid token' })
        }

        if (decoded.purpose !== 'password-change') {
            return res.json({ success: false, message: 'Invalid token' })
        }

        if (!newPassword || newPassword.length < 6) {
            return res.json({ success: false, message: 'Password must be at least 6 characters' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        await doctorModel.findByIdAndUpdate(decoded.id, {
            password: hashedPassword,
            isFirstLogin: false
        })

        res.json({ success: true, message: 'Password updated successfully' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to send OTP to doctor email
const sendDoctorOTP = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.json({ success: false, message: 'Email is required' })
        }

        const doctor = await doctorModel.findOne({ email })
        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found with this email' })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        doctorOtpStorage.set(email, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        })

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP - SmartCare Doctor Portal',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #4F46E5;">Doctor Portal - Password Reset</h2>
                    <p>Hello Dr. ${doctor.name},</p>
                    <p>You requested to reset your password. Use the OTP below to proceed:</p>
                    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #6b7280;">This OTP will expire in 5 minutes.</p>
                    <p>If you didn't request this, please ignore this email or contact admin.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare Doctor Portal.</p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions)

        res.json({ success: true, message: 'OTP sent to your email' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify doctor OTP
const verifyDoctorOTP = async (req, res) => {
    try {
        const { email, otp } = req.body

        if (!email || !otp) {
            return res.json({ success: false, message: 'Email and OTP are required' })
        }

        const storedData = doctorOtpStorage.get(email)

        if (!storedData) {
            return res.json({ success: false, message: 'OTP expired or not found. Please request a new one.' })
        }

        if (Date.now() > storedData.expiresAt) {
            doctorOtpStorage.delete(email)
            return res.json({ success: false, message: 'OTP expired. Please request a new one.' })
        }

        if (storedData.otp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP. Please try again.' })
        }

        res.json({ success: true, message: 'OTP verified successfully' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to reset doctor password
const resetDoctorPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body

        if (!email || !otp || !newPassword) {
            return res.json({ success: false, message: 'All fields are required' })
        }

        const storedData = doctorOtpStorage.get(email)

        if (!storedData || storedData.otp !== otp) {
            return res.json({ success: false, message: 'Invalid or expired OTP' })
        }

        if (Date.now() > storedData.expiresAt) {
            doctorOtpStorage.delete(email)
            return res.json({ success: false, message: 'OTP expired' })
        }

        if (newPassword.length < 6) {
            return res.json({ success: false, message: 'Password must be at least 6 characters' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        await doctorModel.findOneAndUpdate(
            { email },
            {
                password: hashedPassword,
                isFirstLogin: false
            }
        )

        doctorOtpStorage.delete(email)

        res.json({ success: true, message: 'Password reset successfully! Please login with your new password.' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor specific appointments
const appointmentsDoctor = async (req, res) => {
    try {
        const { docId } = req.doctor
        const appointments = await appointmentModel.find({ docId })
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ✅ UPDATED: API to mark appointment completed with email
/*const appointmentComplete = async (req, res) => {
    try {
        const { docId } = req.doctor
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.docId !== docId) {
            return res.json({ success: false, message: "Appointment not found" })
        }

        if (appointmentData.status !== 'confirmed') {
            return res.json({ success: false, message: "Only confirmed appointments can be completed" })
        }

        // Update appointment status
        await appointmentModel.findByIdAndUpdate(appointmentId, { status: "completed" })

        // Get fresh data for email
        const updatedAppointment = await appointmentModel.findById(appointmentId)
        const patientEmail = updatedAppointment.userData.email
        const patientName = updatedAppointment.userData.name
        const doctorName = updatedAppointment.docData.name
        const doctorEmail = updatedAppointment.docData.email
        const slotDate = formatDateForEmail(updatedAppointment.slotDate)
        const slotTime = updatedAppointment.slotTime

        // Email to Patient
        const patientMailOptions = {
            from: process.env.EMAIL_USER,
            to: patientEmail,
            subject: 'Appointment Completed - SmartCare Hospitals',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #10B981;">✅ Appointment Completed</h2>
                    <p>Hello ${patientName},</p>
                    <p>Your appointment has been marked as completed.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Doctor:</strong> ${doctorName}</p>
                        <p><strong>Date:</strong> ${slotDate}</p>
                        <p><strong>Time:</strong> ${slotTime}</p>
                    </div>
                    
                    <p>Thank you for choosing SmartCare Hospitals. We hope you had a great experience!</p>
                    <p>If you have any feedback, please don't hesitate to reach out.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare Hospitals.</p>
                </div>
            `
        }

        // Email to Doctor
        const doctorMailOptions = {
            from: process.env.EMAIL_USER,
            to: doctorEmail,
            subject: 'Appointment Completed Confirmation - SmartCare',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #10B981;">✅ Appointment Completed</h2>
                    <p>Hello Dr. ${doctorName},</p>
                    <p>You have successfully marked an appointment as completed.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Patient:</strong> ${patientName}</p>
                        <p><strong>Date:</strong> ${slotDate}</p>
                        <p><strong>Time:</strong> ${slotTime}</p>
                    </div>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare Doctor Portal.</p>
                </div>
            `
        }

        // Send emails
        await transporter.sendMail(patientMailOptions)
        await transporter.sendMail(doctorMailOptions)

        res.json({ success: true, message: "Appointment Completed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}*/

// ✅ UPDATED: API to mark appointment completed with diagnosis & prescription
const appointmentComplete = async (req, res) => {
    try {
        const { docId } = req.doctor
        const { appointmentId, diagnosis, prescription } = req.body

        // Validate
        if (!diagnosis || diagnosis.trim() === '') {
            return res.json({ success: false, message: "Diagnosis is required" })
        }

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.docId !== docId) {
            return res.json({ success: false, message: "Appointment not found" })
        }

        if (appointmentData.status !== 'confirmed') {
            return res.json({ success: false, message: "Only confirmed appointments can be completed" })
        }

        // Update appointment with diagnosis and prescription
        await appointmentModel.findByIdAndUpdate(appointmentId, {
            status: "completed",
            completedAt: new Date(),
            diagnosis: diagnosis.trim(),
            prescription: prescription || {
                hasMedicines: false,
                medicines: [],
                notes: ''
            }
        })

        // Get fresh data for email
        const updatedAppointment = await appointmentModel.findById(appointmentId)
        const patientEmail = updatedAppointment.userData.email
        const patientName = updatedAppointment.userData.name
        const doctorName = updatedAppointment.docData.name
        const doctorSpeciality = updatedAppointment.docData.speciality
        const doctorEmail = updatedAppointment.docData.email
        const slotDate = formatDateForEmail(updatedAppointment.slotDate)
        const slotTime = updatedAppointment.slotTime

        // Build prescription HTML for email
        let prescriptionHTML = ''
        if (prescription && prescription.hasMedicines && prescription.medicines && prescription.medicines.length > 0) {
            prescriptionHTML = `
                <div style="margin-top: 20px;">
                    <h3 style="color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">💊 Prescription</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                        <thead>
                            <tr style="background-color: #f3f4f6;">
                                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-size: 14px;">Medicine</th>
                                <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; font-size: 14px;">Times/Day</th>
                                <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; font-size: 14px;">When</th>
                                <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; font-size: 14px;">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${prescription.medicines.map((med, index) => `
                                <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 500;">${med.name}</td>
                                    <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${med.timesPerDay}x</td>
                                    <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; text-transform: capitalize;">${med.timing}</td>
                                    <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${med.duration}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `
        } else {
            prescriptionHTML = `
                <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
                    <p style="margin: 0; color: #6b7280;">💊 No medicines prescribed</p>
                </div>
            `
        }

        // Notes HTML
        let notesHTML = ''
        if (prescription && prescription.notes && prescription.notes.trim()) {
            notesHTML = `
                <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0 0 5px 0; font-weight: bold; color: #92400e;">📝 Doctor's Instructions:</p>
                    <p style="margin: 0; color: #78350f;">${prescription.notes}</p>
                </div>
            `
        }

        // Email to Patient with Prescription
        const patientMailOptions = {
            from: process.env.EMAIL_USER,
            to: patientEmail,
            subject: '✅ Appointment Completed - Your Prescription | SmartCare Hospitals',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 700px; margin: auto; background-color: #ffffff;">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">✅ Appointment Completed</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your prescription is ready</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                        
                        <p style="font-size: 16px; color: #374151;">Hello <strong>${patientName}</strong>,</p>
                        <p style="color: #6b7280;">Your appointment has been completed successfully. Please find your prescription details below.</p>
                        
                        <!-- Appointment Details -->
                        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3 style="margin: 0 0 15px 0; color: #1f2937;">📅 Appointment Details</h3>
                            <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
                            <p style="margin: 5px 0;"><strong>Speciality:</strong> ${doctorSpeciality}</p>
                            <p style="margin: 5px 0;"><strong>Date:</strong> ${slotDate}</p>
                            <p style="margin: 5px 0;"><strong>Time:</strong> ${slotTime}</p>
                        </div>
                        
                        <!-- Diagnosis -->
                        <div style="margin-top: 20px; padding: 20px; background-color: #ecfdf5; border-radius: 10px; border-left: 4px solid #10b981;">
                            <h3 style="margin: 0 0 10px 0; color: #065f46;">🩺 Diagnosis</h3>
                            <p style="margin: 0; color: #047857; font-size: 16px;">${diagnosis}</p>
                        </div>
                        
                        <!-- Prescription -->
                        ${prescriptionHTML}
                        
                        <!-- Notes -->
                        ${notesHTML}
                        
                        <!-- Footer Message -->
                        <div style="margin-top: 30px; padding: 20px; background-color: #eff6ff; border-radius: 10px;">
                            <p style="margin: 0; color: #1e40af;">
                                <strong>💡 Important:</strong> Please follow the prescription as directed. 
                                If symptoms persist or worsen, please book a follow-up appointment.
                            </p>
                        </div>
                        
                        <!-- CTA Button -->
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-appointments" 
                               style="display: inline-block; background-color: #4F46E5; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                View My Appointments
                            </a>
                        </div>
                        
                    </div>
                    
                    <!-- Footer -->
                    <div style="text-align: center; margin-top: 20px; padding: 20px;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            This is an automated email from SmartCare Hospitals.<br>
                            Please do not reply to this email.
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                            © ${new Date().getFullYear()} SmartCare Hospitals. All rights reserved.
                        </p>
                    </div>
                </div>
            `
        }

        // Email to Doctor (confirmation)
        const doctorMailOptions = {
            from: process.env.EMAIL_USER,
            to: doctorEmail,
            subject: '✅ Appointment Completed - SmartCare',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #10B981;">✅ Appointment Completed</h2>
                    <p>Hello Dr. ${doctorName},</p>
                    <p>You have successfully completed an appointment and the prescription has been sent to the patient.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Patient:</strong> ${patientName}</p>
                        <p><strong>Date:</strong> ${slotDate}</p>
                        <p><strong>Time:</strong> ${slotTime}</p>
                        <p><strong>Diagnosis:</strong> ${diagnosis}</p>
                        <p><strong>Medicines:</strong> ${prescription && prescription.hasMedicines ? prescription.medicines.length + ' prescribed' : 'None'}</p>
                    </div>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare Doctor Portal.</p>
                </div>
            `
        }

        // Send emails
        await transporter.sendMail(patientMailOptions)
        await transporter.sendMail(doctorMailOptions)

        res.json({ success: true, message: "Appointment completed successfully!" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ✅ UPDATED: API to cancel appointment with reason and email
const appointmentCancel = async (req, res) => {
    try {
        const { docId } = req.doctor
        const { appointmentId, reason } = req.body

        if (!reason || reason.trim() === '') {
            return res.json({ success: false, message: "Please provide a reason for cancellation" })
        }

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.docId !== docId) {
            return res.json({ success: false, message: "Appointment not found" })
        }

        if (appointmentData.status !== 'confirmed') {
            return res.json({ success: false, message: "Only confirmed appointments can be cancelled" })
        }

        // Release the slot
        const { slotDate, slotTime } = appointmentData
        const docData = await doctorModel.findById(docId)
        let slots_booked = docData.slots_booked || {}

        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(t => t !== slotTime)
            if (slots_booked[slotDate].length === 0) {
                delete slots_booked[slotDate]
            }
        }

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Update appointment status
        await appointmentModel.findByIdAndUpdate(appointmentId, {
            status: 'cancelled',
            cancelReason: reason,
            cancelledBy: 'doctor'
        })

        // Get fresh data for email
        const updatedAppointment = await appointmentModel.findById(appointmentId)
        const patientEmail = updatedAppointment.userData.email
        const patientName = updatedAppointment.userData.name
        const doctorName = updatedAppointment.docData.name
        const doctorEmail = updatedAppointment.docData.email
        const formattedDate = formatDateForEmail(slotDate)

        // Email to Patient
        const patientMailOptions = {
            from: process.env.EMAIL_USER,
            to: patientEmail,
            subject: 'Appointment Cancelled - SmartCare Hospitals',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #EF4444;">❌ Appointment Cancelled</h2>
                    <p>Hello ${patientName},</p>
                    <p>We regret to inform you that your appointment has been cancelled by the doctor.</p>
                    
                    <div style="background-color: #FEF2F2; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #EF4444;">
                        <p><strong>Doctor:</strong> ${doctorName}</p>
                        <p><strong>Original Date:</strong> ${formattedDate}</p>
                        <p><strong>Original Time:</strong> ${slotTime}</p>
                    </div>

                    <div style="background-color: #FFF7ED; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold; color: #C2410C;">📝 Reason for Cancellation:</p>
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
            subject: 'Appointment Cancellation Confirmation - SmartCare',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #EF4444;">❌ Appointment Cancelled</h2>
                    <p>Hello Dr. ${doctorName},</p>
                    <p>You have successfully cancelled an appointment.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Patient:</strong> ${patientName}</p>
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        <p><strong>Time:</strong> ${slotTime}</p>
                        <p><strong>Reason:</strong> ${reason}</p>
                    </div>
                    
                    <p>The patient has been notified via email.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare Doctor Portal.</p>
                </div>
            `
        }

        // Send emails
        await transporter.sendMail(patientMailOptions)
        await transporter.sendMail(doctorMailOptions)

        res.json({ success: true, message: "Appointment Cancelled" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ✅ NEW: API to reschedule appointment
const appointmentReschedule = async (req, res) => {
    try {
        const { docId } = req.doctor
        const { appointmentId, newSlotDate, newSlotTime, reason } = req.body

        if (!reason || reason.trim() === '') {
            return res.json({ success: false, message: "Please provide a reason for rescheduling" })
        }

        if (!newSlotDate || !newSlotTime) {
            return res.json({ success: false, message: "Please select a new date and time" })
        }

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.docId !== docId) {
            return res.json({ success: false, message: "Appointment not found" })
        }

        if (appointmentData.status !== 'confirmed') {
            return res.json({ success: false, message: "Only confirmed appointments can be rescheduled" })
        }

        const oldSlotDate = appointmentData.slotDate
        const oldSlotTime = appointmentData.slotTime

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
            rescheduledBy: 'doctor',
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
                    <h2 style="color: #F59E0B;">🔄 Appointment Rescheduled</h2>
                    <p>Hello ${patientName},</p>
                    <p>Your appointment has been rescheduled by the doctor.</p>
                    
                    <div style="background-color: #FEF2F2; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold; color: #991B1B;">❌ Previous Schedule:</p>
                        <p style="margin: 5px 0; color: #DC2626; text-decoration: line-through;">
                            ${oldFormattedDate} at ${oldSlotTime}
                        </p>
                    </div>

                    <div style="background-color: #ECFDF5; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold; color: #065F46;">✅ New Schedule:</p>
                        <p style="margin: 5px 0; color: #059669; font-size: 18px; font-weight: bold;">
                            ${newFormattedDate} at ${newSlotTime}
                        </p>
                    </div>

                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Doctor:</strong> ${doctorName}</p>
                    </div>

                    <div style="background-color: #FFF7ED; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold; color: #C2410C;">📝 Reason for Rescheduling:</p>
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
            subject: 'Appointment Rescheduled Confirmation - SmartCare',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #F59E0B;">🔄 Appointment Rescheduled</h2>
                    <p>Hello Dr. ${doctorName},</p>
                    <p>You have successfully rescheduled an appointment.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Patient:</strong> ${patientName}</p>
                        <p><strong>Previous:</strong> ${oldFormattedDate} at ${oldSlotTime}</p>
                        <p><strong>New:</strong> ${newFormattedDate} at ${newSlotTime}</p>
                        <p><strong>Reason:</strong> ${reason}</p>
                    </div>
                    
                    <p>The patient has been notified via email.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare Doctor Portal.</p>
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

// API to get dashboard data
const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req.doctor
        const appointments = await appointmentModel.find({ docId })

        let earnings = 0

        // ✅ FIXED: Correct condition logic
        appointments.forEach((item) => {
            if (item.status === 'confirmed' || item.status === 'completed') {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.forEach((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: [...appointments].reverse().slice(0, 5)
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor profile
const doctorProfile = async (req, res) => {
    try {
        const { docId } = req.doctor
        const profileData = await doctorModel.findById(docId).select('-password')
        res.json({ success: true, profileData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update doctor profile
const updateDoctorProfile = async (req, res) => {
    try {
        const { docId } = req.doctor
        const { fees, address, available } = req.body

        if (fees < 0) {
            return res.json({ success: false, message: 'Fees cannot be negative' })
        }

        await doctorModel.findByIdAndUpdate(docId, { fees, address, available })
        res.json({ success: true, message: 'Profile updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



// ✅ NEW: API to get doctor's schedule
const getSchedule = async (req, res) => {
    try {
        const { docId } = req.doctor

        const doctor = await doctorModel.findById(docId).select('weeklySchedule slotDuration advanceBookingDays blockedDates isScheduleConfirmed')

        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" })
        }

        res.json({
            success: true,
            schedule: {
                weeklySchedule: doctor.weeklySchedule,
                slotDuration: doctor.slotDuration,
                advanceBookingDays: doctor.advanceBookingDays,
                blockedDates: doctor.blockedDates,
                isScheduleConfirmed: doctor.isScheduleConfirmed
            }
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ✅ NEW: API to confirm schedule (first time after login)
const confirmSchedule = async (req, res) => {
    try {
        const { docId } = req.doctor
        const { weeklySchedule, slotDuration, advanceBookingDays } = req.body

        if (!weeklySchedule) {
            return res.json({ success: false, message: "Schedule data is required" })
        }

        // Validate at least one working day
        const hasWorkingDay = Object.values(weeklySchedule).some(day => day.isWorking && day.timeSlots && day.timeSlots.length > 0)
        if (!hasWorkingDay) {
            return res.json({ success: false, message: "Please set at least one working day with time slots" })
        }

        await doctorModel.findByIdAndUpdate(docId, {
            weeklySchedule,
            slotDuration: slotDuration || 20,
            advanceBookingDays: advanceBookingDays || 7,
            isScheduleConfirmed: true
        })

        res.json({ success: true, message: "Schedule confirmed successfully!" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ✅ NEW: API to update schedule (anytime from profile)
const updateSchedule = async (req, res) => {
    try {
        const { docId } = req.doctor
        const { weeklySchedule, slotDuration, advanceBookingDays } = req.body

        if (!weeklySchedule) {
            return res.json({ success: false, message: "Schedule data is required" })
        }

        // Validate at least one working day
        const hasWorkingDay = Object.values(weeklySchedule).some(day => day.isWorking && day.timeSlots && day.timeSlots.length > 0)
        if (!hasWorkingDay) {
            return res.json({ success: false, message: "Please set at least one working day with time slots" })
        }

        await doctorModel.findByIdAndUpdate(docId, {
            weeklySchedule,
            slotDuration: slotDuration || 20,
            advanceBookingDays: advanceBookingDays || 7
        })

        res.json({ success: true, message: "Schedule updated successfully!" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ✅ NEW: API to add blocked date (leave)
/*const addBlockedDate = async (req, res) => {
    try {
        const { docId } = req.doctor
        const { date, reason } = req.body
        
        if (!date) {
            return res.json({ success: false, message: "Date is required" })
        }
        
        const doctor = await doctorModel.findById(docId)
        
        // Check if date already blocked
        const alreadyBlocked = doctor.blockedDates.some(b => b.date === date)
        if (alreadyBlocked) {
            return res.json({ success: false, message: "This date is already blocked" })
        }
        
        doctor.blockedDates.push({ date, reason: reason || 'Leave' })
        await doctor.save()
        
        res.json({ success: true, message: "Date blocked successfully!" })
        
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}*/

// API to add blocked date (leave) - with appointment check
const addBlockedDate = async (req, res) => {
    try {
        const { docId } = req.doctor
        const { date, reason } = req.body

        if (!date) {
            return res.json({ success: false, message: "Date is required" })
        }

        const doctor = await doctorModel.findById(docId)

        // Check if date already blocked
        const alreadyBlocked = doctor.blockedDates.some(b => b.date === date)
        if (alreadyBlocked) {
            return res.json({ success: false, message: "This date is already blocked" })
        }

        // Check for confirmed appointments on this date
        const confirmedAppointments = await appointmentModel.find({
            docId: docId,
            slotDate: date,
            status: 'confirmed'
        })

        if (confirmedAppointments.length > 0) {
            // Return error with list of appointments
            const appointmentsList = confirmedAppointments.map(apt => ({
                id: apt._id,
                patientName: apt.userData?.name || 'Unknown',
                patientImage: apt.userData?.image || '',
                slotTime: apt.slotTime,
                status: apt.status
            }))

            return res.json({
                success: false,
                hasAppointments: true,
                message: `There are ${confirmedAppointments.length} confirmed appointment(s) on this date. Please reschedule or cancel them first.`,
                appointments: appointmentsList,
                date: date
            })
        }

        // No appointments - safe to block
        doctor.blockedDates.push({ date, reason: reason || 'Leave' })
        await doctor.save()

        res.json({ success: true, message: "Date blocked successfully!" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ✅ NEW: API to remove blocked date
const removeBlockedDate = async (req, res) => {
    try {
        const { docId } = req.doctor
        const { date } = req.body

        if (!date) {
            return res.json({ success: false, message: "Date is required" })
        }

        await doctorModel.findByIdAndUpdate(docId, {
            $pull: { blockedDates: { date } }
        })

        res.json({ success: true, message: "Blocked date removed successfully!" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor analytics data
const getDoctorAnalytics = async (req, res) => {
    try {
        const { docId } = req.doctor
        const { period } = req.query // '7d', '30d', '6m', '1y', 'all'

        // Get doctor's appointments
        const appointments = await appointmentModel.find({ docId })
        const doctor = await doctorModel.findById(docId).select('-password')

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

        // This week's start (Sunday)
        const thisWeekStart = new Date(today)
        thisWeekStart.setDate(today.getDate() - today.getDay())

        // This month's start
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        // ============ OVERVIEW STATS ============
        const totalAppointments = filteredAppointments.length
        const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed').length
        const cancelledAppointments = filteredAppointments.filter(apt => apt.status === 'cancelled').length
        const confirmedAppointments = filteredAppointments.filter(apt => apt.status === 'confirmed').length

        // Unique patients
        const uniquePatients = [...new Set(filteredAppointments.map(apt => apt.userId))]

        // Total revenue (from completed appointments)
        const totalRevenue = filteredAppointments
            .filter(apt => apt.status === 'completed')
            .reduce((sum, apt) => sum + (apt.amount || 0), 0)

        // Today's appointments
        const todaysAppointments = appointments.filter(apt =>
            apt.slotDate === todayStr && apt.status === 'confirmed'
        ).length

        // This week's appointments
        const thisWeekAppointments = appointments.filter(apt => {
            if (apt.status !== 'confirmed') return false
            const aptDate = parseSlotDate(apt.slotDate)
            return aptDate >= thisWeekStart && aptDate <= today
        }).length

        // This month's appointments
        const thisMonthAppointments = appointments.filter(apt => {
            const aptDate = parseSlotDate(apt.slotDate)
            return aptDate >= thisMonthStart
        }).length

        // Completion rate
        const completionRate = totalAppointments > 0
            ? Math.round((completedAppointments / totalAppointments) * 100)
            : 0

        const overviewStats = {
            totalAppointments,
            totalPatients: uniquePatients.length,
            totalRevenue,
            todaysAppointments,
            thisWeekAppointments,
            thisMonthAppointments,
            completionRate,
            completedAppointments,
            cancelledAppointments,
            confirmedAppointments
        }

        // ============ APPOINTMENT STATUS DISTRIBUTION ============
        const statusDistribution = {
            confirmed: confirmedAppointments,
            completed: completedAppointments,
            cancelled: cancelledAppointments,
            expired: filteredAppointments.filter(apt => apt.status === 'expired').length,
            pending: filteredAppointments.filter(apt => apt.status === 'pending').length
        }

        // ============ APPOINTMENTS OVER TIME ============
        const appointmentsOverTime = []
        const revenueOverTime = []

        // Determine grouping based on period
        let groupBy = 'day'
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

        // ============ BUSIEST DAYS (Day of Week) ============
        const dayOfWeekCount = {
            'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0
        }
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        filteredAppointments.forEach(apt => {
            const aptDate = parseSlotDate(apt.slotDate)
            const dayName = dayNames[aptDate.getDay()]
            dayOfWeekCount[dayName]++
        })

        const busiestDays = Object.entries(dayOfWeekCount).map(([day, count]) => ({
            day,
            appointments: count
        }))

        // ============ POPULAR TIME SLOTS ============
        const timeSlotCount = {}
        filteredAppointments.forEach(apt => {
            const time = apt.slotTime
            timeSlotCount[time] = (timeSlotCount[time] || 0) + 1
        })

        const popularTimeSlots = Object.entries(timeSlotCount)
            .map(([time, count]) => ({ time, appointments: count }))
            .sort((a, b) => b.appointments - a.appointments)
            .slice(0, 8) // Top 8 time slots

        // ============ NEW VS RETURNING PATIENTS ============
        const patientVisitCount = {}
        appointments.forEach(apt => {
            patientVisitCount[apt.userId] = (patientVisitCount[apt.userId] || 0) + 1
        })

        const newPatients = Object.values(patientVisitCount).filter(count => count === 1).length
        const returningPatients = Object.values(patientVisitCount).filter(count => count > 1).length

        const patientTypeDistribution = [
            { name: 'New Patients', value: newPatients },
            { name: 'Returning Patients', value: returningPatients }
        ]

        // ============ UPCOMING APPOINTMENTS ============
        const upcomingAppointments = appointments
            .filter(apt => {
                if (apt.status !== 'confirmed') return false
                const aptDate = parseSlotDate(apt.slotDate)
                return aptDate >= today
            })
            .sort((a, b) => {
                const dateA = parseSlotDate(a.slotDate)
                const dateB = parseSlotDate(b.slotDate)
                return dateA - dateB
            })
            .slice(0, 10)
            .map(apt => ({
                id: apt._id,
                patientName: apt.userData?.name || 'Unknown',
                patientImage: apt.userData?.image || '',
                patientEmail: apt.userData?.email || '',
                date: apt.slotDate,
                time: apt.slotTime,
                status: apt.status,
                amount: apt.amount
            }))

        // ============ RECENT APPOINTMENTS ============
        const recentAppointments = [...appointments]
            .sort((a, b) => b.date - a.date)
            .slice(0, 10)
            .map(apt => ({
                id: apt._id,
                patientName: apt.userData?.name || 'Unknown',
                patientImage: apt.userData?.image || '',
                patientEmail: apt.userData?.email || '',
                date: apt.slotDate,
                time: apt.slotTime,
                status: apt.status,
                amount: apt.amount,
                diagnosis: apt.diagnosis || ''
            }))

        // ============ FREQUENT PATIENTS ============
        const patientAppointmentDetails = {}
        appointments.forEach(apt => {
            if (!patientAppointmentDetails[apt.userId]) {
                patientAppointmentDetails[apt.userId] = {
                    name: apt.userData?.name || 'Unknown',
                    image: apt.userData?.image || '',
                    email: apt.userData?.email || '',
                    count: 0,
                    totalSpent: 0
                }
            }
            patientAppointmentDetails[apt.userId].count++
            if (apt.status === 'completed') {
                patientAppointmentDetails[apt.userId].totalSpent += apt.amount || 0
            }
        })

        const frequentPatients = Object.entries(patientAppointmentDetails)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        res.json({
            success: true,
            data: {
                doctorInfo: {
                    name: doctor.name,
                    speciality: doctor.speciality,
                    image: doctor.image,
                    email: doctor.email
                },
                overviewStats,
                statusDistribution,
                appointmentsOverTime,
                revenueOverTime,
                busiestDays,
                popularTimeSlots,
                patientTypeDistribution,
                upcomingAppointments,
                recentAppointments,
                frequentPatients
            }
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    changeAvailability,
    doctorList,
    loginDoctor,
    setNewPassword,
    sendDoctorOTP,
    verifyDoctorOTP,
    resetDoctorPassword,
    appointmentsDoctor,
    appointmentComplete,
    appointmentCancel,
    appointmentReschedule,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile,
    getSchedule,
    confirmSchedule,
    updateSchedule,
    addBlockedDate,
    removeBlockedDate,
    getDoctorAnalytics
}