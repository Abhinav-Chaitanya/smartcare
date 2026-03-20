/*import React, { useState } from 'react'
import {assets} from '../assets/assets'
import { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../context/DoctorContext'

const login = () => {

    const [state,setState] = useState('Admin')
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')

    const {setAToken,backendUrl} = useContext(AdminContext)
    const {setDToken} = useContext(DoctorContext)


    const onSubmitHandler = async(event) => {
        event.preventDefault()

        try{
            if(state === 'Admin'){

                const {data} = await axios.post(backendUrl + '/api/admin/login',{email,password})
                if(data.success){
                    localStorage.setItem('aToken',data.token)
                    setAToken(data.token)
                }else{
                    toast.error(data.message)
                }

            }else{

                const {data} = await axios.post(backendUrl + '/api/doctor/login',{email,password})
                if(data.success){
                    localStorage.setItem('dToken',data.token)
                    setDToken(data.token)
                    console.log(data.token);
                }else{
                    toast.error(data.message)
                }


            }

        }
        catch(error){

        }
    }




  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
        <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
            <p className='text-2xl font-semibold m-auto'><span className='text-primary'>{state}</span> Login</p>
            <div className='w-full'>
                <p>Email</p>
                <input onChange={(e)=>setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" required />
            </div>
            <div className='w-full'>
                <p>Passwoord</p>
                <input onChange={(e)=>setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" required />
            </div>
            <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>
            {
                state === 'Admin'
                ? <p>Doctor Login? <span className='text-primary underline cursor-pointer' onClick={()=>setState('Doctor')}>Click here</span></p>
                : <p>Admin Login? <span className='text-primary underline cursor-pointer' onClick={()=>setState('Admin')}>Click here</span></p>
            }
        </div>

    </form>
  )
}

export default login*/


/*import React, { useState, useContext } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {
    const [state, setState] = useState('Admin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    // First-time password change states
    const [showPasswordChange, setShowPasswordChange] = useState(false)
    const [tempToken, setTempToken] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)

    const { setAToken, backendUrl } = useContext(AdminContext)
    const { setDToken } = useContext(DoctorContext)

    // Login Handler
    const onSubmitHandler = async (event) => {
        event.preventDefault()
        setLoading(true)

        try {
            if (state === 'Admin') {
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
                    // Check if first-time login (password change required)
                    if (data.requirePasswordChange) {
                        setTempToken(data.tempToken)
                        setShowPasswordChange(true)
                        toast.info('Please set your new password')
                    } else {
                        localStorage.setItem('dToken', data.token)
                        setDToken(data.token)
                        toast.success('Welcome Doctor!')
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

    // Password Change Handler (First-time login)
    const handlePasswordChange = async (e) => {
        e.preventDefault()

        // Validation
        if (newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters')
        }

        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match')
        }

        setChangingPassword(true)

        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/set-new-password',
                { newPassword },
                { headers: { tempToken } }
            )

            if (data.success) {
                toast.success('Password changed successfully! Please login with your new password.')
                // Reset everything
                setShowPasswordChange(false)
                setTempToken('')
                setNewPassword('')
                setConfirmPassword('')
                setPassword('')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message || 'Failed to change password')
        } finally {
            setChangingPassword(false)
        }
    }

    // Password Change Modal/Form
    if (showPasswordChange) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 p-4'>
                <div className='w-full max-w-md'>
                
                    <div className='text-center mb-8'>
                        <img className='w-44 mx-auto mb-4' src={assets.logo1} alt="Logo" />
                    </div>

                    <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
                        <div className='text-center mb-6'>
                            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <span className='text-3xl'>🔐</span>
                            </div>
                            <h2 className='text-2xl font-bold text-gray-800'>Set New Password</h2>
                            <p className='text-gray-500 mt-2 text-sm'>
                                This is your first login. Please set a new secure password.
                            </p>
                        </div>

                        <form onSubmit={handlePasswordChange} className='space-y-5'>
                            
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    New Password
                                </label>
                                <div className='relative'>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none pr-12'
                                        placeholder='Enter new password'
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                                    >
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
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Confirm Password
                                </label>
                                <div className='relative'>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none pr-12'
                                        placeholder='Confirm new password'
                                        required
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                                    >
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
                                    <p className={`text-xs mt-2 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                                        {newPassword === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                                    </p>
                                )}
                            </div>

                           
                            <div className='bg-gray-50 rounded-lg p-3'>
                                <p className='text-xs text-gray-500 font-medium mb-2'>Password must:</p>
                                <ul className='text-xs text-gray-500 space-y-1'>
                                    <li className={newPassword.length >= 6 ? 'text-green-600' : ''}>
                                        {newPassword.length >= 6 ? '✓' : '○'} Be at least 6 characters
                                    </li>
                                </ul>
                            </div>

                       
                            <button
                                type='submit'
                                disabled={changingPassword || newPassword !== confirmPassword || newPassword.length < 6}
                                className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                            >
                                {changingPassword ? (
                                    <>
                                        <svg className='animate-spin w-5 h-5' fill='none' viewBox='0 0 24 24'>
                                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                        </svg>
                                        Setting Password...
                                    </>
                                ) : (
                                    'Set Password & Continue'
                                )}
                            </button>
                        </form>

                        <button
                            onClick={() => {
                                setShowPasswordChange(false)
                                setTempToken('')
                                setNewPassword('')
                                setConfirmPassword('')
                            }}
                            className='w-full mt-4 text-gray-500 text-sm hover:text-gray-700 transition-colors'
                        >
                            ← Back to Login
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Main Login Form
    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 p-4'>
            <div className='w-full max-w-md'>
             
                <div className='text-center mb-8'>
                    <img className='w-44 mx-auto mb-4' src={assets.logo1} alt="Logo" />
                </div>

                
                <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
                  
                    <div className='text-center mb-8'>
                        <h1 className='text-2xl font-bold text-gray-800'>
                            Welcome Back
                        </h1>
                        <p className='text-gray-500 mt-2'>
                            Sign in to your <span className='text-primary font-semibold'>{state}</span> account
                        </p>
                    </div>

                
                    <div className='flex bg-gray-100 rounded-xl p-1 mb-8'>
                        <button
                            type='button'
                            onClick={() => setState('Admin')}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                                state === 'Admin'
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Admin
                        </button>
                        <button
                            type='button'
                            onClick={() => setState('Doctor')}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                                state === 'Doctor'
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Doctor
                        </button>
                    </div>

                    <form onSubmit={onSubmitHandler} className='space-y-5'>
                       
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Email Address
                            </label>
                            <div className='relative'>
                                <input
                                    type='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none pl-11'
                                    placeholder='Enter your email'
                                    required
                                />
                                <svg
                                    className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207' />
                                </svg>
                            </div>
                        </div>

                      
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Password
                            </label>
                            <div className='relative'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none pl-11 pr-12'
                                    placeholder='Enter your password'
                                    required
                                />
                                <svg
                                    className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                                </svg>
                                
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                                >
                                    {showPassword ? (
                                        // Eye Off Icon
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
                                        </svg>
                                    ) : (
                                        // Eye Icon
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        
                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25'
                        >
                            {loading ? (
                                <>
                                    <svg className='animate-spin w-5 h-5' fill='none' viewBox='0 0 24 24'>
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M14 5l7 7m0 0l-7 7m7-7H3' />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                   
                    <p className='text-center mt-6 text-gray-600 text-sm'>
                        {state === 'Admin' ? (
                            <>
                                Are you a doctor?{' '}
                                <button
                                    onClick={() => setState('Doctor')}
                                    className='text-primary font-semibold hover:underline'
                                >
                                    Login here
                                </button>
                            </>
                        ) : (
                            <>
                                Are you an admin?{' '}
                                <button
                                    onClick={() => setState('Admin')}
                                    className='text-primary font-semibold hover:underline'
                                >
                                    Login here
                                </button>
                            </>
                        )}
                    </p>
                </div>

               
                <p className='text-center mt-6 text-gray-400 text-xs'>
                    © 2025 SmartCare. All rights reserved.
                </p>
            </div>
        </div>
    )
}

export default Login   */


import React, { useState, useContext, useEffect } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [state, setState] = useState('Admin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    // First-time password change states
    const [showPasswordChange, setShowPasswordChange] = useState(false)
    const [tempToken, setTempToken] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)

    // Forgot Password states
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

    // ✅ UPDATED Login Handler
    const onSubmitHandler = async (event) => {
        event.preventDefault()
        setLoading(true)

        try {
            if (state === 'Admin') {
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
                        // First time login - needs password change
                        setTempToken(data.tempToken)
                        setShowPasswordChange(true)
                        toast.info('Please set your new password')
                    } else {
                        // Clear old profile data first
                        setProfileData(false)
                        
                        // Set new token
                        localStorage.setItem('dToken', data.token)
                        setDToken(data.token)
                        
                        // ✅ NEW: Check if schedule needs confirmation
                        if (data.isScheduleConfirmed === false) {
                            setRequiresScheduleConfirmation(true)
                            localStorage.setItem('requiresScheduleConfirmation', 'true')
                            toast.info('Please confirm your availability schedule')
                            navigate('/confirm-schedule')
                        } else {
                            setRequiresScheduleConfirmation(false)
                            localStorage.removeItem('requiresScheduleConfirmation')
                            
                            // Fetch profile data
                            try {
                                const profileRes = await axios.get(
                                    backendUrl + '/api/doctor/profile', 
                                    { headers: { dToken: data.token } }
                                )
                                if (profileRes.data.success) {
                                    setProfileData(profileRes.data.profileData)
                                }
                            } catch (err) {
                                console.log('Profile fetch error:', err)
                            }
                            
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

    // Password Change Handler (First-time login)
    const handlePasswordChange = async (e) => {
        e.preventDefault()

        if (newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters')
        }

        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match')
        }

        setChangingPassword(true)

        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/set-new-password',
                { newPassword },
                { headers: { temptoken: tempToken } }
            )

            if (data.success) {
                toast.success('Password changed successfully! Please login with your new password.')
                setShowPasswordChange(false)
                setTempToken('')
                setNewPassword('')
                setConfirmPassword('')
                setPassword('')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message || 'Failed to change password')
        } finally {
            setChangingPassword(false)
        }
    }

    // ==================== FORGOT PASSWORD HANDLERS ====================

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return

        const newOtp = [...otp]
        newOtp[index] = element.value
        setOtp(newOtp)

        if (element.value && index < 5) {
            document.getElementById(`forgot-otp-${index + 1}`).focus()
        }
    }

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`forgot-otp-${index - 1}`).focus()
        }
    }

    const handleOtpPaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, 6)

        if (!/^\d+$/.test(pastedData)) return

        const newOtp = pastedData.split('')
        setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')])

        const lastIndex = Math.min(pastedData.length - 1, 5)
        document.getElementById(`forgot-otp-${lastIndex}`).focus()
    }

    const clearOtpBoxes = () => {
        setOtp(['', '', '', '', '', ''])
        setTimeout(() => {
            const firstBox = document.getElementById('forgot-otp-0')
            if (firstBox) firstBox.focus()
        }, 100)
    }

    const handleSendOTP = async () => {
        if (!forgotEmail) {
            toast.warn('Please enter your email')
            return
        }

        try {
            setOtpLoading(true)
            const { data } = await axios.post(backendUrl + '/api/doctor/send-otp', { email: forgotEmail })

            if (data.success) {
                toast.success(data.message)
                setForgotStep(2)
                setOtpTimer(300)
                setResendTimer(30)
                setOtp(['', '', '', '', '', ''])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setOtpLoading(false)
        }
    }

    const handleResendOTP = async () => {
        try {
            setOtpLoading(true)
            const { data } = await axios.post(backendUrl + '/api/doctor/send-otp', { email: forgotEmail })

            if (data.success) {
                toast.success('New OTP sent successfully!')
                setOtpTimer(300)
                setResendTimer(30)
                clearOtpBoxes()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setOtpLoading(false)
        }
    }

    useEffect(() => {
        if (otpTimer > 0) {
            const interval = setInterval(() => {
                setOtpTimer(prev => prev <= 1 ? 0 : prev - 1)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [otpTimer])

    useEffect(() => {
        if (resendTimer > 0) {
            const interval = setInterval(() => {
                setResendTimer(prev => prev <= 1 ? 0 : prev - 1)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [resendTimer])

    const handleVerifyOTP = async () => {
        const otpString = otp.join('')

        if (otpString.length !== 6) {
            toast.warn('Please enter complete 6-digit OTP')
            return
        }

        try {
            setOtpLoading(true)
            const { data } = await axios.post(backendUrl + '/api/doctor/verify-otp', {
                email: forgotEmail,
                otp: otpString
            })

            if (data.success) {
                toast.success(data.message)
                setForgotStep(3)
            } else {
                toast.error(data.message)
                clearOtpBoxes()
            }
        } catch (error) {
            toast.error(error.message)
            clearOtpBoxes()
        } finally {
            setOtpLoading(false)
        }
    }

    const handleResetPassword = async () => {
        if (!forgotNewPassword || !forgotConfirmPassword) {
            toast.warn('Please fill all fields')
            return
        }

        if (forgotNewPassword !== forgotConfirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (forgotNewPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        try {
            setOtpLoading(true)
            const otpString = otp.join('')

            const { data } = await axios.post(backendUrl + '/api/doctor/reset-password', {
                email: forgotEmail,
                otp: otpString,
                newPassword: forgotNewPassword
            })

            if (data.success) {
                toast.success(data.message)
                handleCloseForgotModal()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setOtpLoading(false)
        }
    }

    const handleCloseForgotModal = () => {
        setShowForgotPassword(false)
        setForgotStep(1)
        setForgotEmail('')
        setOtp(['', '', '', '', '', ''])
        setForgotNewPassword('')
        setForgotConfirmPassword('')
        setOtpTimer(0)
        setResendTimer(0)
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${String(secs).padStart(2, '0')}`
    }

    const isOtpComplete = otp.join('').length === 6

    // ==================== FIRST-TIME PASSWORD CHANGE UI ====================
    if (showPasswordChange) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 p-4'>
                <div className='w-full max-w-md'>
                    <div className='text-center mb-8'>
                        <img className='w-44 mx-auto mb-4' src={assets.logo1} alt="Logo" />
                    </div>

                    <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
                        <div className='text-center mb-6'>
                            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <span className='text-3xl'>🔐</span>
                            </div>
                            <h2 className='text-2xl font-bold text-gray-800'>Set New Password</h2>
                            <p className='text-gray-500 mt-2 text-sm'>
                                This is your first login. Please set a new secure password.
                            </p>
                        </div>

                        <form onSubmit={handlePasswordChange} className='space-y-5'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    New Password
                                </label>
                                <div className='relative'>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none pr-12'
                                        placeholder='Enter new password'
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                                    >
                                        {showNewPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Confirm Password
                                </label>
                                <div className='relative'>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none pr-12'
                                        placeholder='Confirm new password'
                                        required
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                                    >
                                        {showConfirmPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {confirmPassword && (
                                    <p className={`text-xs mt-2 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                                        {newPassword === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                                    </p>
                                )}
                            </div>

                            <div className='bg-gray-50 rounded-lg p-3'>
                                <p className='text-xs text-gray-500 font-medium mb-2'>Password must:</p>
                                <ul className='text-xs text-gray-500 space-y-1'>
                                    <li className={newPassword.length >= 6 ? 'text-green-600' : ''}>
                                        {newPassword.length >= 6 ? '✓' : '○'} Be at least 6 characters
                                    </li>
                                </ul>
                            </div>

                            <button
                                type='submit'
                                disabled={changingPassword || newPassword !== confirmPassword || newPassword.length < 6}
                                className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                            >
                                {changingPassword ? (
                                    <>
                                        <span className='animate-spin'>⏳</span>
                                        Setting Password...
                                    </>
                                ) : (
                                    'Set Password & Continue'
                                )}
                            </button>
                        </form>

                        <button
                            onClick={() => {
                                setShowPasswordChange(false)
                                setTempToken('')
                                setNewPassword('')
                                setConfirmPassword('')
                            }}
                            className='w-full mt-4 text-gray-500 text-sm hover:text-gray-700 transition-colors'
                        >
                            ← Back to Login
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ==================== MAIN LOGIN UI ====================
    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 p-4'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-8'>
                    <img className='w-44 mx-auto mb-4' src={assets.logo1} alt="Logo" />
                </div>

                <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
                    <div className='text-center mb-8'>
                        <h1 className='text-2xl font-bold text-gray-800'>
                            Welcome Back
                        </h1>
                        <p className='text-gray-500 mt-2'>
                            Sign in to your <span className='text-primary font-semibold'>{state}</span> account
                        </p>
                    </div>

                    {/* Role Toggle */}
                    <div className='flex bg-gray-100 rounded-xl p-1 mb-8'>
                        <button
                            type='button'
                            onClick={() => setState('Admin')}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${state === 'Admin'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Admin
                        </button>
                        <button
                            type='button'
                            onClick={() => setState('Doctor')}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${state === 'Doctor'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Doctor
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmitHandler} className='space-y-5'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Email Address
                            </label>
                            <input
                                type='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none'
                                placeholder='Enter your email'
                                required
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Password
                            </label>
                            <div className='relative'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none pr-12'
                                    placeholder='Enter your password'
                                    required
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {/* Forgot Password - Only for Doctor */}
                            {state === 'Doctor' && (
                                <button
                                    type='button'
                                    onClick={() => setShowForgotPassword(true)}
                                    className='text-xs text-primary hover:underline mt-2'
                                >
                                    Forgot Password?
                                </button>
                            )}
                        </div>

                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25'
                        >
                            {loading ? (
                                <>
                                    <span className='animate-spin'>⏳</span>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className='text-center mt-6 text-gray-600 text-sm'>
                        {state === 'Admin' ? (
                            <>
                                Are you a doctor?{' '}
                                <button
                                    onClick={() => setState('Doctor')}
                                    className='text-primary font-semibold hover:underline'
                                >
                                    Login here
                                </button>
                            </>
                        ) : (
                            <>
                                Are you an admin?{' '}
                                <button
                                    onClick={() => setState('Admin')}
                                    className='text-primary font-semibold hover:underline'
                                >
                                    Login here
                                </button>
                            </>
                        )}
                    </p>
                </div>

                <p className='text-center mt-6 text-gray-400 text-xs'>
                    © 2025 SmartCare. All rights reserved.
                </p>
            </div>

            {/* ==================== FORGOT PASSWORD MODAL ==================== */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    🔑 Reset Password
                                </h3>
                                <button
                                    onClick={handleCloseForgotModal}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">

                            {/* Step 1: Enter Email */}
                            {forgotStep === 1 && (
                                <div className="space-y-4">
                                    <p className="text-gray-600">
                                        Enter your registered email address and we'll send you an OTP to reset your password.
                                    </p>
                                    <div>
                                        <label className='block text-sm font-semibold text-gray-700 mb-2'>
                                            Email Address
                                        </label>
                                        <input
                                            className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all'
                                            type="email"
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            value={forgotEmail}
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendOTP}
                                        disabled={otpLoading}
                                        className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50'
                                    >
                                        {otpLoading ? 'Sending...' : 'Send OTP'}
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Enter OTP */}
                            {forgotStep === 2 && (
                                <div className="space-y-4">
                                    <p className="text-gray-600 text-center">
                                        We've sent a 6-digit OTP to <strong>{forgotEmail}</strong>
                                    </p>

                                    {/* Timer Display */}
                                    <div className={`${otpTimer > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2 rounded-xl p-4 text-center`}>
                                        {otpTimer > 0 ? (
                                            <div>
                                                <p className='text-sm text-gray-600 mb-1'>⏰ OTP expires in</p>
                                                <p className='text-3xl font-bold text-green-600'>
                                                    {formatTime(otpTimer)}
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className='text-sm text-red-600 font-semibold'>⏰ OTP Expired</p>
                                                <p className='text-xs text-gray-500 mt-1'>Please request a new OTP</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* 6-Box OTP Input */}
                                    <div>
                                        <label className='block text-sm font-semibold text-gray-700 mb-3 text-center'>
                                            Enter OTP
                                        </label>
                                        <div className='flex justify-center gap-2 sm:gap-3'>
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    id={`forgot-otp-${index}`}
                                                    type='text'
                                                    inputMode='numeric'
                                                    maxLength='1'
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(e.target, index)}
                                                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                                    onPaste={handleOtpPaste}
                                                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 rounded-lg transition-all
                                                        ${digit ? 'border-primary bg-primary/5' : 'border-gray-300'}
                                                        focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                                                        disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                                    disabled={otpLoading || otpTimer === 0}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Verify OTP Button */}
                                    <button
                                        onClick={handleVerifyOTP}
                                        disabled={otpLoading || otpTimer === 0 || !isOtpComplete}
                                        className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {otpLoading ? (
                                            <span className='flex items-center justify-center gap-2'>
                                                <span className='animate-spin'>⏳</span>
                                                Verifying...
                                            </span>
                                        ) : (
                                            'Verify OTP'
                                        )}
                                    </button>

                                    {/* Resend OTP */}
                                    <div className='text-center'>
                                        {resendTimer > 0 ? (
                                            <p className='text-xs text-gray-500'>
                                                Resend OTP in <span className='font-semibold text-primary'>{resendTimer}s</span>
                                            </p>
                                        ) : (
                                            <p className='text-xs text-gray-800'>
                                                Didn't receive OTP?
                                                <button
                                                    onClick={handleResendOTP}
                                                    disabled={otpLoading}
                                                    className='text-xs text-primary hover:underline pl-1 font-medium disabled:opacity-50'
                                                >
                                                    Resend OTP
                                                </button>
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => {
                                            setForgotStep(1)
                                            setOtpTimer(0)
                                            setResendTimer(0)
                                            setOtp(['', '', '', '', '', ''])
                                        }}
                                        className='w-full text-primary font-semibold text-sm'
                                    >
                                        ← Back to Email
                                    </button>
                                </div>
                            )}

                            {/* Step 3: New Password */}
                            {forgotStep === 3 && (
                                <div className="space-y-4">
                                    <div className='text-center mb-2'>
                                        <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                                            <span className='text-3xl'>✅</span>
                                        </div>
                                        <p className="text-gray-600">
                                            OTP verified! Create a new password for your account
                                        </p>
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className='block text-sm font-semibold text-gray-700 mb-2'>
                                            New Password
                                        </label>
                                        <div className='relative'>
                                            <input
                                                className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all pr-12'
                                                type={showForgotNewPassword ? 'text' : 'password'}
                                                onChange={(e) => setForgotNewPassword(e.target.value)}
                                                value={forgotNewPassword}
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type='button'
                                                onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                                                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                                            >
                                                {showForgotNewPassword ? '🙈' : '👁️'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className='block text-sm font-semibold text-gray-700 mb-2'>
                                            Confirm Password
                                        </label>
                                        <div className='relative'>
                                            <input
                                                className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all pr-12'
                                                type={showForgotConfirmPassword ? 'text' : 'password'}
                                                onChange={(e) => setForgotConfirmPassword(e.target.value)}
                                                value={forgotConfirmPassword}
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type='button'
                                                onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                                                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                                            >
                                                {showForgotConfirmPassword ? '🙈' : '👁️'}
                                            </button>
                                        </div>
                                    </div>

                                    <p className='text-xs text-gray-500'>
                                        Password must be at least 6 characters
                                    </p>

                                    <button
                                        onClick={handleResetPassword}
                                        disabled={otpLoading}
                                        className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50'
                                    >
                                        {otpLoading ? (
                                            <span className='flex items-center justify-center gap-2'>
                                                <span className='animate-spin'>⏳</span>
                                                Resetting...
                                            </span>
                                        ) : (
                                            '🔐 Reset Password'
                                        )}
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