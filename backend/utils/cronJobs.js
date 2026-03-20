import cron from 'node-cron'
import appointmentModel from '../models/appointmentModel.js'
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

// Helper: Parse slot time to 24-hour format
const parseSlotTime = (slotTime) => {
    // slotTime format: "10:00 AM" or "2:30 PM"
    const [time, period] = slotTime.split(' ')
    let [hours, minutes] = time.split(':').map(Number)
    
    if (period === 'PM' && hours !== 12) {
        hours += 12
    } else if (period === 'AM' && hours === 12) {
        hours = 0
    }
    
    return { hours, minutes }
}

// Helper: Check if appointment time has passed by X hours
const hasTimePassed = (slotDate, slotTime, hoursBuffer = 3) => {
    const [day, month, year] = slotDate.split('_')
    const { hours, minutes } = parseSlotTime(slotTime)
    
    const appointmentTime = new Date(year, month - 1, day, hours, minutes)
    const now = new Date()
    
    // Add buffer hours to appointment time
    const expiryTime = new Date(appointmentTime.getTime() + (hoursBuffer * 60 * 60 * 1000))
    
    return now > expiryTime
}

// Send expired email to patient
const sendExpiredEmailToPatient = async (appointment) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: appointment.userData.email,
            subject: 'Missed Appointment - SmartCare Hospitals',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #F59E0B;">Missed Appointment</h2>
                    <p>Hello ${appointment.userData.name},</p>
                    <p>We noticed that you missed your scheduled appointment.</p>
                    
                    <div style="background-color: #FEF3C7; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #F59E0B;">
                        <p><strong>Doctor:</strong> Dr. ${appointment.docData.name}</p>
                        <p><strong>Date:</strong> ${formatDateForEmail(appointment.slotDate)}</p>
                        <p><strong>Time:</strong> ${appointment.slotTime}</p>
                        <p><strong>Status:</strong> <span style="color: #D97706; font-weight: bold;">Expired (No Show)</span></p>
                    </div>

                    <div style="background-color: #FEE2E2; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0; color: #991B1B; font-size: 14px;">
                            <strong>Note:</strong> As per our policy, the consultation fee is non-refundable for missed appointments.
                        </p>
                    </div>
                    
                    <p>If you still need medical consultation, please book a new appointment at your convenience.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/doctors" 
                           style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Book New Appointment
                        </a>
                    </div>
                    
                    <p>If you believe this is an error or you had an emergency, please contact our support team.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare Hospitals.</p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions)
        console.log(`Expired email sent to patient: ${appointment.userData.email}`)
    } catch (error) {
        console.error('Error sending expired email to patient:', error)
    }
}

// Send expired email to doctor
const sendExpiredEmailToDoctor = async (appointment) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: appointment.docData.email,
            subject: 'Patient No-Show - SmartCare',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #F59E0B;">Patient No-Show Notification</h2>
                    <p>Hello Dr. ${appointment.docData.name},</p>
                    <p>A patient did not attend their scheduled appointment and it has been marked as expired.</p>
                    
                    <div style="background-color: #FEF3C7; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #F59E0B;">
                        <p><strong>Patient:</strong> ${appointment.userData.name}</p>
                        <p><strong>Email:</strong> ${appointment.userData.email}</p>
                        <p><strong>Date:</strong> ${formatDateForEmail(appointment.slotDate)}</p>
                        <p><strong>Time:</strong> ${appointment.slotTime}</p>
                        <p><strong>Status:</strong> <span style="color: #D97706; font-weight: bold;">Expired (No Show)</span></p>
                    </div>
                    
                    <p>This is for your records. No action is required from your side.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare Doctor Portal.</p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions)
        console.log(`Expired email sent to doctor: ${appointment.docData.email}`)
    } catch (error) {
        console.error('Error sending expired email to doctor:', error)
    }
}

// Main function to check and expire appointments
const expireOldAppointments = async () => {
    try {
        console.log('Running appointment expiry check...')
        
        // Find all confirmed appointments
        const confirmedAppointments = await appointmentModel.find({ status: 'confirmed' })
        
        let expiredCount = 0
        
        for (const appointment of confirmedAppointments) {
            // Check if 3 hours have passed since the slot time
            if (hasTimePassed(appointment.slotDate, appointment.slotTime, 3)) {
                // Update status to expired
                await appointmentModel.findByIdAndUpdate(appointment._id, {
                    status: 'expired'
                })
                
                // Send emails
                await sendExpiredEmailToPatient(appointment)
                await sendExpiredEmailToDoctor(appointment)
                
                expiredCount++
                console.log(`Expired appointment: ${appointment._id} - Patient: ${appointment.userData.name}`)
            }
        }
        
        console.log(`Expiry check complete. ${expiredCount} appointments marked as expired.`)
        
    } catch (error) {
        console.error('Error in expireOldAppointments:', error)
    }
}

// Initialize cron jobs
const initCronJobs = () => {
    // Run every hour at minute 0 (e.g., 1:00, 2:00, 3:00, etc.)
    cron.schedule('0 * * * *', () => {
        console.log('Hourly cron job triggered at:', new Date().toLocaleString())
        expireOldAppointments()
    })
    
    console.log('Cron jobs initialized - Appointment expiry check runs every hour')
}

export { initCronJobs, expireOldAppointments }