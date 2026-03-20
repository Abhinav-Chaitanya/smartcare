import express from 'express'
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, confirmPayment, expireAppointment, listAppointment, getAppointmentDetails, cancelAppointment, rescheduleAppointment, sendOTP, verifyOTP, resetPassword, sendAppointmentOTP, verifyAppointmentOTP, createRazorpayOrder, verifyRazorpayPayment, getPublicDepartments  } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)

userRouter.post('/send-otp', sendOTP)
userRouter.post('/verify-otp', verifyOTP)
userRouter.post('/reset-password', resetPassword)

userRouter.post('/send-appointment-otp', authUser, sendAppointmentOTP)
userRouter.post('/verify-appointment-otp', authUser, verifyAppointmentOTP)

userRouter.get('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile)
userRouter.post('/book-appointment', authUser, bookAppointment)
userRouter.post('/confirm-payment', authUser, confirmPayment)
userRouter.post('/expire-appointment',authUser,expireAppointment)
userRouter.get('/appointments', authUser, listAppointment)
userRouter.get('/appointment-details/:appointmentId', authUser, getAppointmentDetails)
userRouter.post('/cancel-appointment', authUser, cancelAppointment)
userRouter.post('/reschedule-appointment', authUser, rescheduleAppointment)  

userRouter.post('/create-razorpay-order', authUser, createRazorpayOrder)
userRouter.post('/verify-razorpay-payment', authUser, verifyRazorpayPayment)

userRouter.get('/departments', getPublicDepartments)



export default userRouter