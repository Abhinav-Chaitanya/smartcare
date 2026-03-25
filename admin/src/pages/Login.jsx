import React, { useState, useContext, useEffect } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {

    // ✅ Step 1: role selection — null means not selected yet
    const [selectedRole, setSelectedRole] = useState(null)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    // First-time password change
    const [showPasswordChange, setShowPasswordChange] = useState(false)
    const [tempToken, setTempToken] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)

    // Forgot Password
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [forgotStep, setForgotStep] = useState(1)
    const [forgotEmail, setForgotEmail] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [forgotNewPassword, setForgotNewPassword] = useState('')
    const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
    const [showForgotNewPassword, setShowForgotNewPassword] = useState(false)
    const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false)
    const [otpLoading, setOtpLoading] = useState(false)
    const [otpTimer, setOtpTimer] = useState(0)
    const [resendTimer, setResendTimer] = useState(0)

    const { setAToken, backendUrl } = useContext(AdminContext)
    const { setDToken, setProfileData, setRequiresScheduleConfirmation } = useContext(DoctorContext)
    const navigate = useNavigate()

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        setLoading(true)

        try {
            if (selectedRole === 'Admin') {
                const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
                if (data.success) {
                    localStorage.setItem('aToken', data.token)
                    setAToken(data.token)
                    toast.success('Welcome Admin!')
                } else {
                    toast.error(data.message)
                }
            } else {
                const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
                if (data.success) {
                    if (data.requirePasswordChange) {
                        setTempToken(data.tempToken)
                        setShowPasswordChange(true)
                        toast.info('Please set your new password')
                    } else {
                        setProfileData(false)
                        localStorage.setItem('dToken', data.token)
                        setDToken(data.token)

                        if (data.isScheduleConfirmed === false) {
                            setRequiresScheduleConfirmation(true)
                            localStorage.setItem('requiresScheduleConfirmation', 'true')
                            toast.info('Please confirm your availability schedule')
                            navigate('/confirm-schedule')
                        } else {
                            setRequiresScheduleConfirmation(false)
                            localStorage.removeItem('requiresScheduleConfirmation')
                            try {
                                const profileRes = await axios.get(
                                    backendUrl + '/api/doctor/profile',
                                    { headers: { dToken: data.token } }
                                )
                                if (profileRes.data.success) setProfileData(profileRes.data.profileData)
                            } catch (err) { console.log('Profile fetch error:', err) }
                            toast.success('Welcome Doctor!')
                        }
                    }
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        if (newPassword.length < 6) return toast.error('Password must be at least 6 characters')
        if (newPassword !== confirmPassword) return toast.error('Passwords do not match')
        setChangingPassword(true)
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/set-new-password',
                { newPassword },
                { headers: { temptoken: tempToken } }
            )
            if (data.success) {
                toast.success('Password changed! Please login with your new password.')
                setShowPasswordChange(false)
                setTempToken(''); setNewPassword(''); setConfirmPassword(''); setPassword('')
            } else { toast.error(data.message) }
        } catch (error) { toast.error(error.message || 'Failed to change password') }
        finally { setChangingPassword(false) }
    }

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return
        const newOtp = [...otp]; newOtp[index] = element.value; setOtp(newOtp)
        if (element.value && index < 5) document.getElementById(`forgot-otp-${index + 1}`).focus()
    }

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0)
            document.getElementById(`forgot-otp-${index - 1}`).focus()
    }

    const handleOtpPaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, 6)
        if (!/^\d+$/.test(pastedData)) return
        const newOtp = pastedData.split('')
        setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')])
        document.getElementById(`forgot-otp-${Math.min(pastedData.length - 1, 5)}`).focus()
    }

    const clearOtpBoxes = () => {
        setOtp(['', '', '', '', '', ''])
        setTimeout(() => { document.getElementById('forgot-otp-0')?.focus() }, 100)
    }

    const handleSendOTP = async () => {
        if (!forgotEmail) { toast.warn('Please enter your email'); return }
        try {
            setOtpLoading(true)
            const { data } = await axios.post(backendUrl + '/api/doctor/send-otp', { email: forgotEmail })
            if (data.success) { toast.success(data.message); setForgotStep(2); setOtpTimer(300); setResendTimer(30); setOtp(['', '', '', '', '', '']) }
            else toast.error(data.message)
        } catch (error) { toast.error(error.message) }
        finally { setOtpLoading(false) }
    }

    const handleResendOTP = async () => {
        try {
            setOtpLoading(true)
            const { data } = await axios.post(backendUrl + '/api/doctor/send-otp', { email: forgotEmail })
            if (data.success) { toast.success('New OTP sent!'); setOtpTimer(300); setResendTimer(30); clearOtpBoxes() }
            else toast.error(data.message)
        } catch (error) { toast.error(error.message) }
        finally { setOtpLoading(false) }
    }

    useEffect(() => {
        if (otpTimer > 0) {
            const i = setInterval(() => setOtpTimer(p => p <= 1 ? 0 : p - 1), 1000)
            return () => clearInterval(i)
        }
    }, [otpTimer])

    useEffect(() => {
        if (resendTimer > 0) {
            const i = setInterval(() => setResendTimer(p => p <= 1 ? 0 : p - 1), 1000)
            return () => clearInterval(i)
        }
    }, [resendTimer])

    const handleVerifyOTP = async () => {
        const otpString = otp.join('')
        if (otpString.length !== 6) { toast.warn('Please enter complete 6-digit OTP'); return }
        try {
            setOtpLoading(true)
            const { data } = await axios.post(backendUrl + '/api/doctor/verify-otp', { email: forgotEmail, otp: otpString })
            if (data.success) { toast.success(data.message); setForgotStep(3) }
            else { toast.error(data.message); clearOtpBoxes() }
        } catch (error) { toast.error(error.message); clearOtpBoxes() }
        finally { setOtpLoading(false) }
    }

    const handleResetPassword = async () => {
        if (!forgotNewPassword || !forgotConfirmPassword) { toast.warn('Please fill all fields'); return }
        if (forgotNewPassword !== forgotConfirmPassword) { toast.error('Passwords do not match'); return }
        if (forgotNewPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
        try {
            setOtpLoading(true)
            const { data } = await axios.post(backendUrl + '/api/doctor/reset-password', {
                email: forgotEmail, otp: otp.join(''), newPassword: forgotNewPassword
            })
            if (data.success) { toast.success(data.message); handleCloseForgotModal() }
            else toast.error(data.message)
        } catch (error) { toast.error(error.message) }
        finally { setOtpLoading(false) }
    }

    const handleCloseForgotModal = () => {
        setShowForgotPassword(false); setForgotStep(1); setForgotEmail('')
        setOtp(['', '', '', '', '', '']); setForgotNewPassword(''); setForgotConfirmPassword('')
        setOtpTimer(0); setResendTimer(0)
    }

    const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
    const isOtpComplete = otp.join('').length === 6

    // ==================== FIRST-TIME PASSWORD CHANGE ====================
    if (showPasswordChange) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 p-4'>
                <div className='w-full max-w-md'>
                    <div className='text-center mb-8'>
                        <img className='w-44 mx-auto' src={assets.logo1} alt="Logo" />
                    </div>
                    <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
                        <div className='text-center mb-6'>
                            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg className='w-8 h-8 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                                </svg>
                            </div>
                            <h2 className='text-2xl font-bold text-gray-800'>Set New Password</h2>
                            <p className='text-gray-500 mt-2 text-sm'>This is your first login. Please set a new secure password.</p>
                        </div>

                        <form onSubmit={handlePasswordChange} className='space-y-5'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>New Password</label>
                                <div className='relative'>
                                    <input type={showNewPassword ? 'text' : 'password'} value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none pr-12'
                                        placeholder='Enter new password' required minLength={6} />
                                    <button type='button' onClick={() => setShowNewPassword(!showNewPassword)}
                                        className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                                        {showNewPassword ? (
                                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
                                            </svg>
                                        ) : (
                                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Confirm Password</label>
                                <div className='relative'>
                                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none pr-12'
                                        placeholder='Confirm new password' required />
                                    <button type='button' onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                                        {showConfirmPassword ? (
                                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
                                            </svg>
                                        ) : (
                                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {confirmPassword && (
                                    <p className={`text-xs mt-2 flex items-center gap-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                                        {newPassword === confirmPassword ? (
                                            <><svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M5 13l4 4L19 7' /></svg>Passwords match</>
                                        ) : (
                                            <><svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M6 18L18 6M6 6l12 12' /></svg>Passwords do not match</>
                                        )}
                                    </p>
                                )}
                            </div>
                            <div className='bg-gray-50 rounded-lg p-3'>
                                <p className='text-xs text-gray-500 font-medium mb-1'>Password must:</p>
                                <p className={`text-xs flex items-center gap-1 ${newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                                    <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d={newPassword.length >= 6 ? 'M5 13l4 4L19 7' : 'M12 6v6m0 0v6m0-6h6m-6 0H6'} />
                                    </svg>
                                    Be at least 6 characters
                                </p>
                            </div>
                            <button type='submit'
                                disabled={changingPassword || newPassword !== confirmPassword || newPassword.length < 6}
                                className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                                {changingPassword ? (
                                    <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>Setting Password...</>
                                ) : 'Set Password & Continue'}
                            </button>
                        </form>
                        <button onClick={() => { setShowPasswordChange(false); setTempToken(''); setNewPassword(''); setConfirmPassword('') }}
                            className='w-full mt-4 text-gray-500 text-sm hover:text-gray-700 transition-colors flex items-center justify-center gap-1'>
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                            </svg>
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ==================== ROLE SELECTION SCREEN ====================
    if (!selectedRole) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 p-4'>
                <div className='w-full max-w-lg'>
                    <div className='text-center mb-10'>
                        <img className='w-44 mx-auto mb-6' src={assets.logo1} alt="Logo" />
                        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Welcome Back</h1>
                        <p className='text-gray-500'>Select your role to continue</p>
                    </div>

                    <div className='grid grid-cols-2 gap-5'>
                        {/* Admin Card */}
                        <button
                            onClick={() => setSelectedRole('Admin')}
                            className='group bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-primary/30 p-8 flex flex-col items-center gap-4 transition-all duration-300 hover:-translate-y-1'
                        >
                            <div className='w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300'>
                                <svg className='w-10 h-10 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                                </svg>
                            </div>
                            <div className='text-center'>
                                <p className='text-xl font-bold text-gray-800 mb-1'>Admin</p>
                                <p className='text-sm text-gray-500'>Manage the hospital system</p>
                            </div>
                            <div className='flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300'>
                                <span>Continue</span>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                                </svg>
                            </div>
                        </button>

                        {/* Doctor Card */}
                        <button
                            onClick={() => setSelectedRole('Doctor')}
                            className='group bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-primary/30 p-8 flex flex-col items-center gap-4 transition-all duration-300 hover:-translate-y-1'
                        >
                            <div className='w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-all duration-300'>
                                <svg className='w-10 h-10 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                                </svg>
                            </div>
                            <div className='text-center'>
                                <p className='text-xl font-bold text-gray-800 mb-1'>Doctor</p>
                                <p className='text-sm text-gray-500'>Access your appointments</p>
                            </div>
                            <div className='flex items-center gap-1 text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300'>
                                <span>Continue</span>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                                </svg>
                            </div>
                        </button>
                    </div>

                    <p className='text-center mt-8 text-gray-400 text-xs'>© 2025 SmartCare. All rights reserved.</p>
                </div>
            </div>
        )
    }

    // ==================== LOGIN FORM ====================
    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 p-4'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-8'>
                    <img className='w-44 mx-auto mb-4' src={assets.logo1} alt="Logo" />
                </div>

                <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>

                    {/* Selected Role Header */}
                    <div className='flex items-center justify-between mb-8'>
                        <button onClick={() => { setSelectedRole(null); setEmail(''); setPassword('') }}
                            className='flex items-center gap-1 text-gray-500 hover:text-primary transition-colors text-sm'>
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                            </svg>
                            Back
                        </button>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                            selectedRole === 'Admin' ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-blue-700'
                        }`}>
                            {selectedRole === 'Admin' ? (
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                                </svg>
                            ) : (
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                                </svg>
                            )}
                            {selectedRole}
                        </div>
                        <div className='w-12'></div>{/* spacer for centering */}
                    </div>

                    <div className='text-center mb-6'>
                        <h1 className='text-2xl font-bold text-gray-800'>Sign In</h1>
                        <p className='text-gray-500 text-sm mt-1'>
                            Enter your <span className={`font-semibold ${selectedRole === 'Admin' ? 'text-primary' : 'text-blue-600'}`}>{selectedRole}</span> credentials
                        </p>
                    </div>

                    <form onSubmit={onSubmitHandler} className='space-y-5'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
                            <div className='relative'>
                                <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                                    <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                    </svg>
                                </div>
                                <input type='email' value={email} onChange={(e) => setEmail(e.target.value)}
                                    className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none'
                                    placeholder='Enter your email' required />
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
                            <div className='relative'>
                                <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                                    <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                                    </svg>
                                </div>
                                <input type={showPassword ? 'text' : 'password'} value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none'
                                    placeholder='Enter your password' required />
                                <button type='button' onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'>
                                    {showPassword ? (
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
                                        </svg>
                                    ) : (
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {selectedRole === 'Doctor' && (
                                <button type='button' onClick={() => setShowForgotPassword(true)}
                                    className='text-xs text-primary hover:underline mt-2 flex items-center gap-1'>
                                    <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' />
                                    </svg>
                                    Forgot Password?
                                </button>
                            )}
                        </div>

                        <button type='submit' disabled={loading}
                            className={`w-full text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg ${
                                selectedRole === 'Admin'
                                    ? 'bg-primary hover:bg-primary/90 shadow-primary/25'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
                            }`}>
                            {loading ? (
                                <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>Signing in...</>
                            ) : (
                                <>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' />
                                    </svg>
                                    Sign In as {selectedRole}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className='text-center mt-6 text-gray-400 text-xs'>© 2025 SmartCare. All rights reserved.</p>
            </div>

            {/* ==================== FORGOT PASSWORD MODAL ==================== */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' />
                                </svg>
                                Reset Password
                            </h3>
                            <button onClick={handleCloseForgotModal} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg">
                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            {forgotStep === 1 && (
                                <div className="space-y-4">
                                    <p className="text-gray-600 text-sm">Enter your registered email to receive an OTP.</p>
                                    <div>
                                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Email Address</label>
                                        <input className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all'
                                            type="email" onChange={(e) => setForgotEmail(e.target.value)} value={forgotEmail} placeholder="Enter your email" />
                                    </div>
                                    <button onClick={handleSendOTP} disabled={otpLoading}
                                        className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2'>
                                        {otpLoading ? <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>Sending...</> : 'Send OTP'}
                                    </button>
                                </div>
                            )}

                            {forgotStep === 2 && (
                                <div className="space-y-4">
                                    <p className="text-gray-600 text-center text-sm">OTP sent to <strong>{forgotEmail}</strong></p>
                                    <div className={`${otpTimer > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2 rounded-xl p-4 text-center`}>
                                        {otpTimer > 0 ? (
                                            <div>
                                                <p className='text-sm text-gray-600 mb-1'>OTP expires in</p>
                                                <p className='text-3xl font-bold text-green-600'>{formatTime(otpTimer)}</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className='text-sm text-red-600 font-semibold'>OTP Expired</p>
                                                <p className='text-xs text-gray-500 mt-1'>Please request a new OTP</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className='flex justify-center gap-2 sm:gap-3'>
                                        {otp.map((digit, index) => (
                                            <input key={index} id={`forgot-otp-${index}`} type='text' inputMode='numeric'
                                                maxLength='1' value={digit}
                                                onChange={(e) => handleOtpChange(e.target, index)}
                                                onKeyDown={(e) => handleOtpKeyDown(e, index)} onPaste={handleOtpPaste}
                                                className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 rounded-lg transition-all
                                                    ${digit ? 'border-primary bg-primary/5' : 'border-gray-300'}
                                                    focus:border-primary focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                                disabled={otpLoading || otpTimer === 0}
                                            />
                                        ))}
                                    </div>

                                    <button onClick={handleVerifyOTP} disabled={otpLoading || otpTimer === 0 || !isOtpComplete}
                                        className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                                        {otpLoading ? <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>Verifying...</> : 'Verify OTP'}
                                    </button>

                                    <div className='text-center'>
                                        {resendTimer > 0 ? (
                                            <p className='text-xs text-gray-500'>Resend in <span className='font-semibold text-primary'>{resendTimer}s</span></p>
                                        ) : (
                                            <button onClick={handleResendOTP} disabled={otpLoading}
                                                className='text-xs text-primary hover:underline font-medium disabled:opacity-50'>
                                                Resend OTP
                                            </button>
                                        )}
                                    </div>
                                    <button onClick={() => { setForgotStep(1); setOtpTimer(0); setResendTimer(0); setOtp(['', '', '', '', '', '']) }}
                                        className='w-full text-gray-500 text-sm hover:text-gray-700 flex items-center justify-center gap-1'>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                                        </svg>
                                        Back to Email
                                    </button>
                                </div>
                            )}

                            {forgotStep === 3 && (
                                <div className="space-y-4">
                                    <div className='text-center'>
                                        <div className='w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                                            <svg className='w-7 h-7 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                                            </svg>
                                        </div>
                                        <p className="text-gray-600 text-sm">OTP verified! Create a new password.</p>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold text-gray-700 mb-2'>New Password</label>
                                        <div className='relative'>
                                            <input className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all pr-12'
                                                type={showForgotNewPassword ? 'text' : 'password'} onChange={(e) => setForgotNewPassword(e.target.value)}
                                                value={forgotNewPassword} placeholder="Enter new password" />
                                            <button type='button' onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                                                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d={showForgotNewPassword ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'} />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Confirm Password</label>
                                        <div className='relative'>
                                            <input className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all pr-12'
                                                type={showForgotConfirmPassword ? 'text' : 'password'} onChange={(e) => setForgotConfirmPassword(e.target.value)}
                                                value={forgotConfirmPassword} placeholder="Confirm new password" />
                                            <button type='button' onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                                                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d={showForgotConfirmPassword ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'} />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className='text-xs text-gray-500'>Password must be at least 6 characters</p>
                                    <button onClick={handleResetPassword} disabled={otpLoading}
                                        className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2'>
                                        {otpLoading ? <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>Resetting...</> : 'Reset Password'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Login