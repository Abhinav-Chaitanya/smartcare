import nodemailer from 'nodemailer'
import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import departmentModel from '../models/departmentModel.js'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const otpStorage = new Map()

// ✅ Helper: Format date for emails
const formatDateForEmail = (slotDate) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const [day, month, year] = slotDate.split('_')
  return `${day} ${months[Number(month) - 1]} ${year}`
}

// ✅ Helper: Generate Receipt HTML
const generateReceiptHTML = (appointment, paymentId) => {
  const formattedDate = formatDateForEmail(appointment.slotDate)
  const bookingDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🏥 SmartCare Hospitals</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Appointment Confirmation & Receipt</p>
      </div>

      <!-- Success Badge -->
      <div style="background-color: #ECFDF5; padding: 20px; text-align: center; border-bottom: 1px solid #D1FAE5;">
        <div style="display: inline-block; background-color: #10B981; color: white; padding: 10px 25px; border-radius: 25px; font-weight: bold;">
          ✅ BOOKING CONFIRMED
        </div>
      </div>

      <!-- Patient Details -->
      <div style="padding: 25px;">
        <h3 style="color: #374151; margin-top: 0; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">
          📋 Appointment Details
        </h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; color: #6B7280; width: 40%;">Patient Name</td>
            <td style="padding: 12px 0; color: #111827; font-weight: 600;">${appointment.userData.name}</td>
          </tr>
          <tr style="background-color: #F9FAFB;">
            <td style="padding: 12px; color: #6B7280;">Doctor</td>
            <td style="padding: 12px; color: #111827; font-weight: 600;">Dr. ${appointment.docData.name}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #6B7280;">Speciality</td>
            <td style="padding: 12px 0; color: #111827;">${appointment.docData.speciality}</td>
          </tr>
          <tr style="background-color: #F9FAFB;">
            <td style="padding: 12px; color: #6B7280;">Appointment Date</td>
            <td style="padding: 12px; color: #111827; font-weight: 600;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #6B7280;">Appointment Time</td>
            <td style="padding: 12px 0; color: #111827; font-weight: 600;">${appointment.slotTime}</td>
          </tr>
        </table>

        <!-- Payment Details -->
        <h3 style="color: #374151; margin-top: 25px; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">
          💳 Payment Details
        </h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #F9FAFB;">
            <td style="padding: 12px; color: #6B7280;">Amount Paid</td>
            <td style="padding: 12px; color: #10B981; font-weight: 700; font-size: 18px;">₹${appointment.amount}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #6B7280;">Payment ID</td>
            <td style="padding: 12px 0; color: #111827; font-family: monospace; font-size: 12px;">${paymentId}</td>
          </tr>
          <tr style="background-color: #F9FAFB;">
            <td style="padding: 12px; color: #6B7280;">Payment Status</td>
            <td style="padding: 12px; color: #10B981; font-weight: 600;">✓ Paid</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #6B7280;">Booking Date</td>
            <td style="padding: 12px 0; color: #111827;">${bookingDate}</td>
          </tr>
        </table>

        <!-- Download Receipt Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            📥 Download Receipt
          </a>
          <p style="color: #9CA3AF; font-size: 12px; margin-top: 10px;">
            (Receipt download will be available after deployment)
          </p>
        </div>

        <!-- Important Notes -->
        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p style="margin: 0; color: #92400E; font-weight: 600;">📌 Important Notes:</p>
          <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400E;">
            <li>Please arrive 10 minutes before your scheduled time</li>
            <li>Bring a valid ID proof and this confirmation</li>
            <li>For rescheduling or cancellation, visit your dashboard</li>
          </ul>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #F3F4F6; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
        <p style="margin: 0; color: #6B7280; font-size: 14px;">
          Need help? Contact us at <a href="mailto:support@smartcare.com" style="color: #4F46E5;">support@smartcare.com</a>
        </p>
        <p style="margin: 10px 0 0 0; color: #9CA3AF; font-size: 12px;">
          © ${new Date().getFullYear()} SmartCare Hospitals. All rights reserved.
        </p>
      </div>
    </div>
  `
}

// ✅ Helper: Send email to doctor about new appointment
const sendDoctorNewAppointmentEmail = async (appointment, doctor) => {
  const formattedDate = formatDateForEmail(appointment.slotDate)

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: doctor.email,
    subject: '📅 New Appointment Booked - SmartCare',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 25px; text-align: center;">
          <h2 style="margin: 0;">🏥 SmartCare Hospitals</h2>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">New Appointment Notification</p>
        </div>

        <!-- Content -->
        <div style="padding: 25px;">
          <h3 style="color: #111827; margin-top: 0;">Hello Dr. ${doctor.name},</h3>
          
          <p style="color: #4B5563; line-height: 1.6;">
            A new appointment has been booked with you. Here are the details:
          </p>

          <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Patient Name</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${appointment.userData.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Email</td>
                <td style="padding: 8px 0; color: #111827;">${appointment.userData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Date</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Time</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${appointment.slotTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Consultation Fee</td>
                <td style="padding: 8px 0; color: #10B981; font-weight: 600;">₹${appointment.amount}</td>
              </tr>
            </table>
          </div>

          <p style="color: #6B7280; font-size: 14px;">
            Please ensure you are available at the scheduled time. You can view all your appointments in your dashboard.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #F3F4F6; padding: 15px; text-align: center; border-top: 1px solid #E5E7EB;">
          <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
            © ${new Date().getFullYear()} SmartCare Hospitals. All rights reserved.
          </p>
        </div>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('✅ Doctor notification email sent successfully')
  } catch (error) {
    console.log('❌ Failed to send doctor notification email:', error)
  }
}

// ✅ Helper: Send cancellation emails to user and doctor
const sendCancellationEmails = async (appointment, doctor) => {
  const formattedDate = formatDateForEmail(appointment.slotDate)

  // Email to User
  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: appointment.userData.email,
    subject: '❌ Appointment Cancelled - SmartCare Hospitals',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 25px; text-align: center;">
          <h2 style="margin: 0;">🏥 SmartCare Hospitals</h2>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Appointment Cancellation</p>
        </div>

        <!-- Content -->
        <div style="padding: 25px;">
          <h3 style="color: #111827; margin-top: 0;">Hello ${appointment.userData.name},</h3>
          
          <p style="color: #4B5563; line-height: 1.6;">
            Your appointment has been successfully cancelled as per your request.
          </p>

          <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #991B1B; font-weight: 600;">Cancelled Appointment Details:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Doctor</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">Dr. ${doctor.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Speciality</td>
                <td style="padding: 8px 0; color: #111827;">${doctor.speciality}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Date</td>
                <td style="padding: 8px 0; color: #111827; text-decoration: line-through;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Time</td>
                <td style="padding: 8px 0; color: #111827; text-decoration: line-through;">${appointment.slotTime}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #92400E; font-size: 14px;">
              💡 <strong>Need to rebook?</strong> You can schedule a new appointment anytime from our website.
            </p>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/doctors" 
               style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Book New Appointment
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #F3F4F6; padding: 15px; text-align: center; border-top: 1px solid #E5E7EB;">
          <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
            © ${new Date().getFullYear()} SmartCare Hospitals. All rights reserved.
          </p>
        </div>
      </div>
    `
  }

  // Email to Doctor
  const doctorMailOptions = {
    from: process.env.EMAIL_USER,
    to: doctor.email,
    subject: '❌ Appointment Cancelled by Patient - SmartCare',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 25px; text-align: center;">
          <h2 style="margin: 0;">🏥 SmartCare Hospitals</h2>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Appointment Cancellation Notice</p>
        </div>

        <!-- Content -->
        <div style="padding: 25px;">
          <h3 style="color: #111827; margin-top: 0;">Hello  ${doctor.name},</h3>
          
          <p style="color: #4B5563; line-height: 1.6;">
            A patient has cancelled their appointment with you.
          </p>

          <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Patient Name</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${appointment.userData.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Email</td>
                <td style="padding: 8px 0; color: #111827;">${appointment.userData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Date</td>
                <td style="padding: 8px 0; color: #DC2626; text-decoration: line-through;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Time</td>
                <td style="padding: 8px 0; color: #DC2626; text-decoration: line-through;">${appointment.slotTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Cancelled By</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">Patient</td>
              </tr>
            </table>
          </div>

          <p style="color: #6B7280; font-size: 14px;">
            The time slot has been freed up and is now available for other bookings.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #F3F4F6; padding: 15px; text-align: center; border-top: 1px solid #E5E7EB;">
          <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
            © ${new Date().getFullYear()} SmartCare Hospitals. All rights reserved.
          </p>
        </div>
      </div>
    `
  }

  try {
    await transporter.sendMail(userMailOptions)
    await transporter.sendMail(doctorMailOptions)
    console.log('✅ Cancellation emails sent successfully')
  } catch (error) {
    console.log('❌ Failed to send cancellation emails:', error)
  }
}

// ✅ Helper: Send reschedule emails to user and doctor
const sendRescheduleEmails = async (appointment, doctor, oldSlotDate, oldSlotTime) => {
  const oldFormattedDate = formatDateForEmail(oldSlotDate)
  const newFormattedDate = formatDateForEmail(appointment.slotDate)

  // Email to User
  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: appointment.userData.email,
    subject: '🔄 Appointment Rescheduled - SmartCare Hospitals',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 25px; text-align: center;">
          <h2 style="margin: 0;">🏥 SmartCare Hospitals</h2>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Appointment Rescheduled</p>
        </div>

        <!-- Content -->
        <div style="padding: 25px;">
          <h3 style="color: #111827; margin-top: 0;">Hello ${appointment.userData.name},</h3>
          
          <p style="color: #4B5563; line-height: 1.6;">
            Your appointment has been successfully rescheduled. Here are the updated details:
          </p>

          <!-- Old Schedule -->
          <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #991B1B; font-weight: 600;">❌ Previous Schedule (Cancelled):</p>
            <p style="margin: 0; color: #DC2626; text-decoration: line-through;">
              ${oldFormattedDate} at ${oldSlotTime}
            </p>
          </div>

          <!-- New Schedule -->
          <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #065F46; font-weight: 600;">✅ New Schedule:</p>
            <p style="margin: 0; color: #059669; font-size: 18px; font-weight: bold;">
              ${newFormattedDate} at ${appointment.slotTime}
            </p>
          </div>

          <!-- Doctor Info -->
          <div style="background-color: #F3F4F6; border-radius: 10px; padding: 15px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Doctor</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">Dr. ${doctor.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Speciality</td>
                <td style="padding: 8px 0; color: #111827;">${doctor.speciality}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #92400E; font-size: 14px;">
              📌 <strong>Reminder:</strong> Please arrive 10 minutes before your scheduled time.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #F3F4F6; padding: 15px; text-align: center; border-top: 1px solid #E5E7EB;">
          <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
            © ${new Date().getFullYear()} SmartCare Hospitals. All rights reserved.
          </p>
        </div>
      </div>
    `
  }

  // Email to Doctor
  const doctorMailOptions = {
    from: process.env.EMAIL_USER,
    to: doctor.email,
    subject: '🔄 Appointment Rescheduled by Patient - SmartCare',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 25px; text-align: center;">
          <h2 style="margin: 0;">🏥 SmartCare Hospitals</h2>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Appointment Rescheduled Notice</p>
        </div>

        <!-- Content -->
        <div style="padding: 25px;">
          <h3 style="color: #111827; margin-top: 0;">Hello ${doctor.name},</h3>
          
          <p style="color: #4B5563; line-height: 1.6;">
            A patient has rescheduled their appointment with you.
          </p>

          <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Patient Name</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${appointment.userData.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Email</td>
                <td style="padding: 8px 0; color: #111827;">${appointment.userData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Previous Schedule</td>
                <td style="padding: 8px 0; color: #DC2626; text-decoration: line-through;">${oldFormattedDate} at ${oldSlotTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">New Schedule</td>
                <td style="padding: 8px 0; color: #059669; font-weight: 600;">${newFormattedDate} at ${appointment.slotTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Rescheduled By</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">Patient</td>
              </tr>
            </table>
          </div>

          <p style="color: #6B7280; font-size: 14px;">
            Please update your schedule accordingly. The previous time slot has been freed up.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #F3F4F6; padding: 15px; text-align: center; border-top: 1px solid #E5E7EB;">
          <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
            © ${new Date().getFullYear()} SmartCare Hospitals. All rights reserved.
          </p>
        </div>
      </div>
    `
  }

  try {
    await transporter.sendMail(userMailOptions)
    await transporter.sendMail(doctorMailOptions)
    console.log('✅ Reschedule emails sent successfully')
  } catch (error) {
    console.log('❌ Failed to send reschedule emails:', error)
  }
}


// APT for register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" })
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" })
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const userData = {
      name,
      email,
      password: hashedPassword
    }

    const newUser = new userModel(userData)
    const user = await newUser.save()

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

    res.json({ success: true, token })

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// APT for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: "User does not exist" })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: "Invalid credentials" })
    }

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// API to get users profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.user
    const userData = await userModel.findById(userId).select('-password')
    res.json({ success: true, userData })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API for updating user profile
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user
    const { name, phone, address, dob, gender } = req.body
    const imageFile = req.file

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" })
    }

    await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
      const imageURL = imageUpload.secure_url
      await userModel.findByIdAndUpdate(userId, { image: imageURL })
    }

    res.json({ success: true, message: "Profile Updated.." })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const bookAppointment = async (req, res) => {
  try {
    const { userId } = req.user
    const { docId, slotDate, slotTime } = req.body

    const doctor = await doctorModel.findById(docId)

    if (!doctor || !doctor.available) {
      return res.json({ success: false, message: "Doctor not available" })
    }

    let slots = doctor.slots_booked || {}

    if (slots[slotDate]?.includes(slotTime)) {
      return res.json({ success: false, message: "Slot already booked" })
    }

    if (!slots[slotDate]) slots[slotDate] = []
    slots[slotDate].push(slotTime)

    await doctorModel.findByIdAndUpdate(docId, { slots_booked: slots })

    const userData = await userModel.findById(userId).select('-password')
    const docData = { ...doctor._doc }
    delete docData.slots_booked

    const appointment = await appointmentModel.create({
      userId,
      docId,
      slotDate,
      slotTime,
      userData,
      docData,
      amount: doctor.fees,
      date: Date.now(),
      status: 'pending',
      paymentExpiresAt: new Date(Date.now() + 1 * 60 * 1000)
    })

    res.json({
      success: true,
      appointmentId: appointment._id
    })

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

const confirmPayment = async (req, res) => {
  try {
    const { userId } = req.user
    const { appointmentId } = req.body

    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" })
    }

    if (appointment.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized action" })
    }

    if (Date.now() > appointment.paymentExpiresAt) {
      appointment.status = 'expired'
      await appointment.save()
      return res.json({ success: false, message: "Payment session expired" })
    }

    appointment.status = 'confirmed'
    await appointment.save()

    res.json({ success: true, message: "Payment successful" })

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

const expireAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body

    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) {
      return res.json({ success: true })
    }

    if (appointment.status === 'confirmed') {
      return res.json({ success: true })
    }

    const doctor = await doctorModel.findById(appointment.docId)

    if (doctor?.slots_booked?.[appointment.slotDate]) {
      const normalizeTime = (time) => time.trim().toLowerCase()
      const appointmentTime = normalizeTime(appointment.slotTime)

      console.log('🔍 Trying to release slot:', appointmentTime)
      console.log('📋 Current slots:', doctor.slots_booked[appointment.slotDate])

      doctor.slots_booked[appointment.slotDate] =
        doctor.slots_booked[appointment.slotDate].filter(
          t => normalizeTime(t) !== appointmentTime
        )

      console.log('✅ Slots after filter:', doctor.slots_booked[appointment.slotDate])

      if (doctor.slots_booked[appointment.slotDate].length === 0) {
        delete doctor.slots_booked[appointment.slotDate]
      }

      doctor.markModified('slots_booked')
      await doctor.save()

      console.log('💾 Doctor saved successfully')
    }

    await appointmentModel.findByIdAndDelete(appointmentId)

    res.json({ success: true })

  } catch (error) {
    console.log('❌ Error in expireAppointment:', error)
    res.json({ success: false, message: error.message })
  }
}

const listAppointment = async (req, res) => {
  const { userId } = req.user

  const appointments = await appointmentModel.find({
    userId,
    status: { $in: ['confirmed', 'cancelled', 'completed', 'expired'] }
  }).sort({ date: -1 })

  res.json({ success: true, appointments })
}

const getAppointmentDetails = async (req, res) => {
  try {
    const { userId } = req.user
    const { appointmentId } = req.params

    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (appointment.userId !== userId) {
      return res.json({ success: false, message: 'Unauthorized' })
    }

    res.json({ success: true, appointment })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ✅ UPDATED: Cancel Appointment with Email Notifications
const cancelAppointment = async (req, res) => {
  try {
    const { userId } = req.user
    const { appointmentId } = req.body

    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (appointment.userId !== userId) {
      return res.json({ success: false, message: 'Unauthorized action' })
    }

    // Get doctor details for email
    const doctor = await doctorModel.findById(appointment.docId)

    // Update appointment status
    appointment.status = 'cancelled'
    appointment.cancelledBy = 'patient'
    await appointment.save()

    // Release doctor slot
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

    // ✅ Send cancellation emails to both user and doctor
    await sendCancellationEmails(appointment, doctor)

    res.json({ success: true, message: 'Appointment cancelled successfully' })

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// ✅ UPDATED: Reschedule Appointment with Email Notifications
const rescheduleAppointment = async (req, res) => {
  try {
    const { userId } = req.user
    const { appointmentId, newSlotDate, newSlotTime } = req.body

    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (appointment.userId !== userId) {
      return res.json({ success: false, message: 'Unauthorized action' })
    }

    if (appointment.status !== 'confirmed') {
      return res.json({ success: false, message: 'Only confirmed appointments can be rescheduled' })
    }

    const doctor = await doctorModel.findById(appointment.docId)

    if (!doctor || !doctor.available) {
      return res.json({ success: false, message: 'Doctor not available' })
    }

    if (appointment.slotDate === newSlotDate && appointment.slotTime === newSlotTime) {
      return res.json({ success: false, message: 'Please select a different time slot' })
    }

    let slots = doctor.slots_booked || {}

    if (slots[newSlotDate]?.includes(newSlotTime)) {
      return res.json({ success: false, message: 'This slot is already booked' })
    }

    // Store old slot details for email
    const oldSlotDate = appointment.slotDate
    const oldSlotTime = appointment.slotTime

    // Release OLD slot
    const normalizeTime = (time) => time.trim().toLowerCase()
    const oldSlotTimeNormalized = normalizeTime(oldSlotTime)

    if (slots[oldSlotDate]) {
      slots[oldSlotDate] = slots[oldSlotDate].filter(
        t => normalizeTime(t) !== oldSlotTimeNormalized
      )

      if (slots[oldSlotDate].length === 0) {
        delete slots[oldSlotDate]
      }
    }

    // Book NEW slot
    if (!slots[newSlotDate]) {
      slots[newSlotDate] = []
    }
    slots[newSlotDate].push(newSlotTime)

    // Update doctor's slots_booked
    doctor.slots_booked = slots
    doctor.markModified('slots_booked')
    await doctor.save()

    // Update appointment
    appointment.slotDate = newSlotDate
    appointment.slotTime = newSlotTime
    appointment.rescheduledBy = 'patient'
    appointment.previousSlotDate = oldSlotDate
    appointment.previousSlotTime = oldSlotTime
    await appointment.save()

    // ✅ Send reschedule emails to both user and doctor
    await sendRescheduleEmails(appointment, doctor, oldSlotDate, oldSlotTime)

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully'
    })

  } catch (error) {
    console.log('❌ Error in rescheduleAppointment:', error)
    res.json({ success: false, message: error.message })
  }
}

// API to send OTP to email
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.json({ success: false, message: 'Email is required' })
    }

    const user = await userModel.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    otpStorage.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - SmartCare Hospitals',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested to reset your password. Use the OTP below to proceed:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280;">This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px;">This is an automated email. Please do not reply.</p>
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

// API to verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.json({ success: false, message: 'Email and OTP are required' })
    }

    const storedData = otpStorage.get(email)

    if (!storedData) {
      return res.json({ success: false, message: 'OTP expired or not found' })
    }

    if (Date.now() > storedData.expiresAt) {
      otpStorage.delete(email)
      return res.json({ success: false, message: 'OTP expired' })
    }

    if (storedData.otp !== otp) {
      return res.json({ success: false, message: 'Invalid OTP' })
    }

    res.json({ success: true, message: 'OTP verified successfully' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to reset password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.json({ success: false, message: 'All fields are required' })
    }

    const storedData = otpStorage.get(email)

    if (!storedData || storedData.otp !== otp) {
      return res.json({ success: false, message: 'Invalid or expired OTP' })
    }

    if (Date.now() > storedData.expiresAt) {
      otpStorage.delete(email)
      return res.json({ success: false, message: 'OTP expired' })
    }

    if (newPassword.length < 8) {
      return res.json({ success: false, message: 'Password must be at least 8 characters' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    await userModel.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    )

    otpStorage.delete(email)

    res.json({ success: true, message: 'Password reset successfully' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to send OTP for appointment actions (cancel/reschedule)
const sendAppointmentOTP = async (req, res) => {
  try {
    const { userId } = req.user
    const { action } = req.body

    const user = await userModel.findById(userId).select('email name')
    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const otpKey = `${userId}_${action}`
    otpStorage.set(otpKey, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    })

    const actionText = action === 'cancel' ? 'Cancel Appointment' : 'Reschedule Appointment'
    const actionColor = action === 'cancel' ? '#EF4444' : '#4F46E5'

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `${actionText} - Verification Required`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: ${actionColor}; margin: 0;">🏥 SmartCare Hospitals</h2>
          </div>
          
          <h3 style="color: #1f2937;">Hello ${user.name},</h3>
          
          <p style="color: #4b5563; line-height: 1.6;">
            You requested to <strong>${action}</strong> your appointment. 
            Please use the OTP below to verify this action:
          </p>
          
          <div style="background: linear-gradient(135deg, ${actionColor}15 0%, ${actionColor}25 100%); 
                      padding: 25px; 
                      text-align: center; 
                      border-radius: 10px; 
                      margin: 25px 0;">
            <div style="font-size: 36px; 
                        font-weight: bold; 
                        letter-spacing: 10px; 
                        color: ${actionColor};">
              ${otp}
            </div>
          </div>
          
          <div style="background-color: #fef3c7; 
                      padding: 15px; 
                      border-left: 4px solid #f59e0b; 
                      border-radius: 5px; 
                      margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              ⏰ This OTP will expire in <strong>5 minutes</strong>
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            If you didn't request this action, please ignore this email and your appointment will remain unchanged.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            This is an automated email. Please do not reply.<br>
            © ${new Date().getFullYear()} SmartCare Hospitals. All rights reserved.
          </p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)

    res.json({ success: true, message: 'OTP sent to your registered email' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to verify OTP for appointment actions
const verifyAppointmentOTP = async (req, res) => {
  try {
    const { userId } = req.user
    const { otp, action } = req.body

    if (!otp || !action) {
      return res.json({ success: false, message: 'OTP and action are required' })
    }

    const otpKey = `${userId}_${action}`
    const storedData = otpStorage.get(otpKey)

    if (!storedData) {
      return res.json({ success: false, message: 'OTP expired or not found. Please request a new OTP.' })
    }

    if (Date.now() > storedData.expiresAt) {
      otpStorage.delete(otpKey)
      return res.json({ success: false, message: 'OTP expired. Please request a new OTP.' })
    }

    if (storedData.otp !== otp) {
      return res.json({ success: false, message: 'Invalid OTP. Please try again.' })
    }

    otpStorage.delete(otpKey)

    res.json({ success: true, message: 'OTP verified successfully' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to create Razorpay order
const createRazorpayOrder = async (req, res) => {
  try {
    const { userId } = req.user
    const { appointmentId } = req.body

    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (appointment.userId !== userId) {
      return res.json({ success: false, message: 'Unauthorized action' })
    }

    if (appointment.paymentStatus === 'paid') {
      return res.json({ success: false, message: 'Payment already completed' })
    }

    const options = {
      amount: appointment.amount * 100,
      currency: 'INR',
      receipt: `receipt_${appointmentId}`,
      notes: {
        appointmentId: appointmentId,
        doctorName: appointment.docData.name,
        patientName: appointment.userData.name
      }
    }

    const order = await razorpayInstance.orders.create(options)

    appointment.razorpayOrderId = order.id
    await appointment.save()

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      key: process.env.RAZORPAY_KEY_ID,
      appointmentData: {
        doctorName: appointment.docData.name,
        patientName: appointment.userData.name,
        patientEmail: appointment.userData.email,
        patientPhone: appointment.userData.phone || ''
      }
    })

  } catch (error) {
    console.log('❌ Razorpay Order Error:', error)
    res.json({ success: false, message: error.message })
  }
}

// ✅ UPDATED: Verify Razorpay Payment with Email to Both User and Doctor
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { userId } = req.user
    const { appointmentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (appointment.userId !== userId) {
      return res.json({ success: false, message: 'Unauthorized action' })
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex')

    const isAuthentic = expectedSignature === razorpay_signature

    if (!isAuthentic) {
      appointment.paymentStatus = 'failed'
      await appointment.save()
      return res.json({ success: false, message: 'Payment verification failed' })
    }

    // Payment verified successfully
    appointment.razorpayPaymentId = razorpay_payment_id
    appointment.razorpaySignature = razorpay_signature
    appointment.paymentStatus = 'paid'
    appointment.status = 'confirmed'
    await appointment.save()

    // Get doctor details for email
    const doctor = await doctorModel.findById(appointment.docId)

    // ✅ Send confirmation email to USER with receipt
    try {
      const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: appointment.userData.email,
        subject: '✅ Appointment Confirmed - SmartCare Hospitals',
        html: generateReceiptHTML(appointment, razorpay_payment_id)
      }

      await transporter.sendMail(userMailOptions)
      console.log('✅ User confirmation email sent successfully')
    } catch (emailError) {
      console.log('❌ Failed to send user confirmation email:', emailError)
    }

    // ✅ Send notification email to DOCTOR
    if (doctor) {
      await sendDoctorNewAppointmentEmail(appointment, doctor)
    }

    res.json({
      success: true,
      message: 'Payment successful! Appointment confirmed.'
    })

  } catch (error) {
    console.log('❌ Payment Verification Error:', error)
    res.json({ success: false, message: error.message })
  }
}

// API to get public departments
const getPublicDepartments = async (req, res) => {
  try {
    let departments = await departmentModel.find({ isActive: true })

    if (departments.length === 0) {
      const doctors = await doctorModel.find({}).select('speciality')
      const uniqueSpecialities = [...new Set(doctors.map(doc => doc.speciality).filter(Boolean))]

      if (uniqueSpecialities.length > 0) {
        const departmentsToCreate = uniqueSpecialities.map(spec => ({
          name: spec,
          description: '',
          isActive: true,
          createdAt: new Date()
        }))

        await departmentModel.insertMany(departmentsToCreate, { ordered: false })
          .catch(err => {
            if (err.code !== 11000) {
              console.log("Error creating departments:", err)
            }
          })

        departments = await departmentModel.find({ isActive: true })
      }
    }

    departments.sort((a, b) => a.name.localeCompare(b.name))

    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const doctorCount = await doctorModel.countDocuments({
          speciality: { $regex: new RegExp(`^${dept.name}$`, 'i') },
          available: true
        })
        return {
          _id: dept._id,
          name: dept.name,
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

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  confirmPayment,
  expireAppointment,
  listAppointment,
  getAppointmentDetails,
  cancelAppointment,
  rescheduleAppointment,
  sendOTP,
  verifyOTP,
  resetPassword,
  sendAppointmentOTP,
  verifyAppointmentOTP,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPublicDepartments
}