import express from 'express'
import {
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
} from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'

const doctorRouter = express.Router()

doctorRouter.get('/list', doctorList)
doctorRouter.post('/login', loginDoctor)
doctorRouter.post('/set-new-password', setNewPassword)
doctorRouter.post('/send-otp', sendDoctorOTP)
doctorRouter.post('/verify-otp', verifyDoctorOTP)
doctorRouter.post('/reset-password', resetDoctorPassword)
doctorRouter.get('/appointments', authDoctor, appointmentsDoctor)
doctorRouter.post('/complete-appointment', authDoctor, appointmentComplete)
doctorRouter.post('/cancel-appointment', authDoctor, appointmentCancel)
doctorRouter.post('/reschedule-appointment', authDoctor, appointmentReschedule)
doctorRouter.get('/dashboard', authDoctor, doctorDashboard)
doctorRouter.get('/profile', authDoctor, doctorProfile)
doctorRouter.post('/update-profile', authDoctor, updateDoctorProfile)

doctorRouter.get('/schedule', authDoctor, getSchedule)
doctorRouter.post('/confirm-schedule', authDoctor, confirmSchedule)
doctorRouter.post('/update-schedule', authDoctor, updateSchedule)
doctorRouter.post('/add-blocked-date', authDoctor, addBlockedDate)
doctorRouter.post('/remove-blocked-date', authDoctor, removeBlockedDate)
doctorRouter.get('/analytics', authDoctor, getDoctorAnalytics)

export default doctorRouter