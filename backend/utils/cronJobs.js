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

// Send generic reminder email
const sendReminderEmail = async (appointment, type, isDoctor = false) => {
    try {
        const recipientName = isDoctor ? `Dr. ${appointment.docData.name}` : appointment.userData.name;
        const recipientEmail = isDoctor ? appointment.docData.email : appointment.userData.email;
        const subject = type === 'daily' 
            ? `Reminder: Appointment Today - SmartCare`
            : `Reminder: Appointment in 1 Hour - SmartCare`;
            
        const titleMessage = type === 'daily'
            ? `You have an appointment scheduled for today.`
            : `You have an appointment starting in 1 hour.`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
                    <h2 style="color: #10B981;">Appointment Reminder</h2>
                    <p>Hello ${recipientName},</p>
                    <p>${titleMessage}</p>
                    
                    <div style="background-color: #ECFDF5; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10B981;">
                        <p><strong>${isDoctor ? 'Patient' : 'Doctor'}:</strong> ${isDoctor ? appointment.userData.name : 'Dr. ' + appointment.docData.name}</p>
                        <p><strong>Date:</strong> ${formatDateForEmail(appointment.slotDate)}</p>
                        <p><strong>Time:</strong> ${appointment.slotTime}</p>
                    </div>
                    
                    ${!isDoctor ? '<p>Please ensure you are ready 10 minutes early.</p>' : '<p>Please ensure you are prepared for the consultation.</p>'}
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px;">This is an automated email from SmartCare Hospitals.</p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions)
        console.log(`Sent ${type} reminder to ${isDoctor ? 'doctor' : 'patient'}: ${recipientEmail}`)
    } catch (error) {
        console.error(`Error sending ${type} reminder:`, error)
    }
}

// Process 7 AM Daily Reminders
const processDailyReminders = async () => {
    try {
        console.log('Running daily 7 AM reminder check...')
        const today = new Date();
        const todayStr = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
        
        // Find all confirmed appointments for today
        const appointments = await appointmentModel.find({ 
            status: 'confirmed', 
            slotDate: todayStr 
        })
        
        for (const appointment of appointments) {
             await sendReminderEmail(appointment, 'daily', false);
             await sendReminderEmail(appointment, 'daily', true);
        }
        console.log(`Daily reminders sent for ${appointments.length} appointments.`)
    } catch (error) {
         console.error('Error in processDailyReminders:', error)
    }
}

// Process 1-Hour Prior Reminders
const processOneHourReminders = async () => {
    try {
        console.log('Running 1-hour prior reminder check...')
        const today = new Date();
        const todayStr = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
        
        // Find today's appointments
        const appointments = await appointmentModel.find({ 
            status: 'confirmed', 
            slotDate: todayStr 
        })
        
        let count = 0;
        for (const appointment of appointments) {
            const { hours, minutes } = parseSlotTime(appointment.slotTime)
            const appointmentTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes)
            const now = new Date()
            
            // Difference in minutes
            const diffMins = (appointmentTime - now) / (1000 * 60);
            
            // If appointment is between 45 and 60 minutes away
            if (diffMins > 45 && diffMins <= 60) {
                 await sendReminderEmail(appointment, '1-hour', false);
                 await sendReminderEmail(appointment, '1-hour', true);
                 count++;
            }
        }
        console.log(`1-hour reminders sent for ${count} appointments.`)
    } catch (error) {
         console.error('Error in processOneHourReminders:', error)
    }
}

// Initialize cron jobs
const initCronJobs = () => {
    // 1. Expiry Check: Run every hour at minute 0
    cron.schedule('0 * * * *', () => {
        console.log('Hourly cron job triggered at:', new Date().toLocaleString())
        expireOldAppointments()
    })
    
    // 2. Daily Reminders: Run every day at 7:00 AM
    cron.schedule('0 7 * * *', () => {
        console.log('Daily 7 AM reminder cron triggered at:', new Date().toLocaleString());
        processDailyReminders();
    });

    // 3. 1-Hour Reminders: Run every 15 minutes
    cron.schedule('*/15 * * * *', () => {
        console.log('15-minute 1-hour prior reminder cron triggered at:', new Date().toLocaleString());
        processOneHourReminders();
    });
    
    console.log('Cron jobs initialized:');
    console.log('- Appointment expiry check (Hourly)');
    console.log('- Daily Reminders (Every day at 7:00 AM)');
    console.log('- 1-Hour Prior Reminders (Every 15 minutes)');
}

export { initCronJobs, expireOldAppointments, processDailyReminders, processOneHourReminders }