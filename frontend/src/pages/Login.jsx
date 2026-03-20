/*import React, { useState } from 'react'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const { backendUrl, token, setToken } = useContext(AppContext)
  const navigate = useNavigate()


  const [state,setState] = useState('Sign Up')

  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [name,setName] = useState('')

  const onSubmitHandler = async(event) => {
    event.preventDefault()

    try {

      if(state == 'Sign Up'){

        const {data} = await axios.post(backendUrl + '/api/user/register',{name,password,email})
        if(data.success){
          localStorage.setItem('token',data.token)
          setToken(data.token)
        }else{
          toast.error(data.message)
        }

      } else{
        const {data} = await axios.post(backendUrl + '/api/user/login',{password,email})
        if(data.success){
          localStorage.setItem('token',data.token)
          setToken(data.token)
        }else{
          toast.error(data.message)
        }

      }
      
    } catch (error) {
      toast.error(error.message)
      
    }
  }

  useEffect(()=>{
    if(token){
      navigate('/')
    }

  },[token])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state=== 'Sign Up' ? "Create Account" : "Login"}</p>
        <p>Please {state === 'Sign Up' ? "sign up" : "log in"} to book appointment</p>
        {
          state === "Sign Up" && <div className='w-full'>
          <p>Full Name</p>
          <input className='border border-zinc-500 rounded w-full p-2 mt-1' type="text" onChange={(e)=>setName(e.target.value)} value={name} required/>
        </div>
        }
        

        <div className='w-full'>
          <p>E-mail</p>
          <input className='border border-zinc-500 rounded w-full p-2 mt-1' type="email" onChange={(e)=>setEmail(e.target.value)} value={email} required/>
        </div>

        <div className='w-full'>
          <p>Password</p>
          <input className='border border-zinc-500 rounded w-full p-2 mt-1' type="password" onChange={(e)=>setPassword(e.target.value)} value={password} required/>
        </div>

        <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>{state === 'Sign Up' ? "Create Account" : "Login" }</button>

        {
          state === "Sign Up" 
          ? <p>Already have an account? <span onClick={()=>setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
          : <p>Don't have an account ? <span onClick={()=>setState('Sign Up')} className='text-primary underline cursor-pointer'>click here</span> </p>
        }
      </div>

    </form>
  )
}

export default Login*/


/*import React, { useState } from 'react'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const { backendUrl, token, setToken } = useContext(AppContext)
  const navigate = useNavigate()

  // ✅ FIX ISSUE 2: Default state is 'Login' instead of 'Sign Up'
  const [state, setState] = useState('Login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const onSubmitHandler = async(event) => {
    event.preventDefault()

    try {

      if(state === 'Sign Up'){

        const {data} = await axios.post(backendUrl + '/api/user/register', {name, password, email})
        
        if(data.success){
          // ✅ FIX ISSUE 3: After registration, DON'T set token
          // Just show success message and switch to Login
          toast.success('Account created successfully! Please login.')
          setState('Login')
          setName('')
          setPassword('')
          setEmail('')
        } else {
          toast.error(data.message)
        }

      } else {
        // Login
        const {data} = await axios.post(backendUrl + '/api/user/login', {password, email})
        
        if(data.success){
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Login successful!')
        } else {
          toast.error(data.message)
        }
      }
      
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Redirect to home if already logged in
  useEffect(() => {
    if(token){
      navigate('/')
    }
  }, [token])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? "Create Account" : "Login"}</p>
        <p>Please {state === 'Sign Up' ? "sign up" : "log in"} to book appointment</p>
        
        {
          state === "Sign Up" && <div className='w-full'>
            <p>Full Name</p>
            <input 
              className='border border-zinc-500 rounded w-full p-2 mt-1' 
              type="text" 
              onChange={(e) => setName(e.target.value)} 
              value={name} 
              required
            />
          </div>
        }

        <div className='w-full'>
          <p>E-mail</p>
          <input 
            className='border border-zinc-500 rounded w-full p-2 mt-1' 
            type="email" 
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
            required
          />
        </div>

        <div className='w-full'>
          <p>Password</p>
          <input 
            className='border border-zinc-500 rounded w-full p-2 mt-1' 
            type="password" 
            onChange={(e) => setPassword(e.target.value)} 
            value={password} 
            required
          />
        </div>

        <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>
          {state === 'Sign Up' ? "Create Account" : "Login"}
        </button>

        {
          state === "Sign Up" 
          ? <p>Already have an account? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
          : <p>Don't have an account? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>Click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login*/


/*import React, { useState } from 'react'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const { backendUrl, token, setToken } = useContext(AppContext)
  const navigate = useNavigate()

  const [state, setState] = useState('Login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async(event) => {
    event.preventDefault()
    setLoading(true)

    try {

      if(state === 'Sign Up'){

        const {data} = await axios.post(backendUrl + '/api/user/register', {name, password, email})
        
        if(data.success){
          toast.success('Account created successfully! Please login.')
          setState('Login')
          setName('')
          setPassword('')
          setEmail('')
        } else {
          toast.error(data.message)
        }

      } else {
        const {data} = await axios.post(backendUrl + '/api/user/login', {password, email})
        
        if(data.success){
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Login successful!')
        } else {
          toast.error(data.message)
        }
      }
      
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if(token){
      navigate('/')
    }
  }, [token])

  return (
    <div className='min-h-[85vh] flex items-center justify-center py-12 px-4'>
      <div className='w-full max-w-md'>
        
        
        <div className='bg-white rounded-2xl shadow-2xl overflow-hidden'>
          
         
          <div className='bg-gradient-to-r from-primary to-blue-600 p-8 text-center'>
            <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
              <span className='text-4xl'>🏥</span>
            </div>
            <h2 className='text-3xl font-bold text-white mb-2'>
              {state === 'Sign Up' ? "Create Account" : "Welcome Back"}
            </h2>
            <p className='text-blue-100'>
              {state === 'Sign Up' 
                ? "Sign up to book your appointment" 
                : "Login to access your account"}
            </p>
          </div>

          
          <form onSubmit={onSubmitHandler} className='p-8'>
            <div className='space-y-5'>
              
             
              {state === "Sign Up" && (
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    👤 Full Name
                  </label>
                  <input 
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all' 
                    type="text" 
                    onChange={(e) => setName(e.target.value)} 
                    value={name} 
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  📧 Email Address
                </label>
                <input 
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all' 
                  type="email" 
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email} 
                  placeholder="Enter your email"
                  required
                />
              </div>

              
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  🔒 Password
                </label>
                <input 
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all' 
                  type="password" 
                  onChange={(e) => setPassword(e.target.value)} 
                  value={password} 
                  placeholder="Enter your password"
                  required
                />
                {state === 'Sign Up' && (
                  <p className='text-xs text-gray-500 mt-2'>
                    Password must be at least 8 characters
                  </p>
                )}
              </div>

              
              <button 
                type='submit' 
                disabled={loading}
                className='w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {loading ? (
                  <>
                    <span className='animate-spin'>⏳</span>
                    {state === 'Sign Up' ? 'Creating Account...' : 'Logging in...'}
                  </>
                ) : (
                  <>
                    {state === 'Sign Up' ? ' Create Account' : ' Login'}
                  </>
                )}
              </button>

              
              <div className='text-center pt-4 border-t border-gray-200'>
                {state === "Sign Up" ? (
                  <p className='text-gray-600'>
                    Already have an account?{' '}
                    <button
                      type='button'
                      onClick={() => {
                        setState('Login')
                        setName('')
                        setEmail('')
                        setPassword('')
                      }}
                      className='text-primary font-semibold hover:underline'
                    >
                      Login here
                    </button>
                  </p>
                ) : (
                  <p className='text-gray-600'>
                    Don't have an account?{' '}
                    <button
                      type='button'
                      onClick={() => {
                        setState('Sign Up')
                        setEmail('')
                        setPassword('')
                      }}
                      className='text-primary font-semibold hover:underline'
                    >
                      Sign up now
                    </button>
                  </p>
                )}
              </div>
            </div>
          </form>

         
          <div className='bg-gray-50 px-8 py-4 text-center border-t border-gray-200'>
            <p className='text-xs text-gray-500'>
              🔒 Your information is secure and encrypted
            </p>
          </div>
        </div>

      
        <p className='text-center text-gray-600 mt-6 text-sm'>
          {state === 'Sign Up' 
            ? 'By signing up, you agree to our Terms of Service' 
            : 'Having trouble? Contact support'}
        </p>
      </div>
    </div>
  )
}

export default Login*/




/*import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const { backendUrl, token, setToken } = useContext(AppContext)
  const navigate = useNavigate()

  const [state, setState] = useState('Login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false)

  // Forgot Password states
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotStep, setForgotStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)

  const onSubmitHandler = async(event) => {
    event.preventDefault()
    setLoading(true)

    try {

      if(state === 'Sign Up'){

        const {data} = await axios.post(backendUrl + '/api/user/register', {name, password, email})
        
        if(data.success){
          toast.success('Account created successfully! Please login.')
          setState('Login')
          setName('')
          setPassword('')
          setEmail('')
        } else {
          toast.error(data.message)
        }

      } else {
        const {data} = await axios.post(backendUrl + '/api/user/login', {password, email})
        
        if(data.success){
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Login successful!')
        } else {
          toast.error(data.message)
        }
      }
      
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Send OTP
  const handleSendOTP = async() => {
    if (!forgotEmail) {
      toast.warn('Please enter your email')
      return
    }

    try {
      setOtpLoading(true)
      const {data} = await axios.post(backendUrl + '/api/user/send-otp', { email: forgotEmail })
      
      if (data.success) {
        toast.success(data.message)
        setForgotStep(2)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setOtpLoading(false)
    }
  }

  // Verify OTP
  const handleVerifyOTP = async() => {
    if (!otp) {
      toast.warn('Please enter OTP')
      return
    }

    try {
      setOtpLoading(true)
      const {data} = await axios.post(backendUrl + '/api/user/verify-otp', { 
        email: forgotEmail, 
        otp 
      })
      
      if (data.success) {
        toast.success(data.message)
        setForgotStep(3)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setOtpLoading(false)
    }
  }

  // Reset Password
  const handleResetPassword = async() => {
    if (!newPassword || !confirmPassword) {
      toast.warn('Please fill all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      setOtpLoading(true)
      const {data} = await axios.post(backendUrl + '/api/user/reset-password', { 
        email: forgotEmail, 
        otp,
        newPassword 
      })
      
      if (data.success) {
        toast.success(data.message)
        // Reset everything
        setShowForgotPassword(false)
        setForgotStep(1)
        setForgotEmail('')
        setOtp('')
        setNewPassword('')
        setConfirmPassword('')
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
    if(token){
      navigate('/')
    }
  }, [token])

  return (
    <div className='min-h-[85vh] flex items-center justify-center py-12 px-4'>
      <div className='w-full max-w-md'>
        
        
        <div className='bg-white rounded-2xl shadow-2xl overflow-hidden'>
          
          
          <div className='bg-gradient-to-r from-primary to-blue-600 p-8 text-center'>
            <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
              <span className='text-4xl'>🏥</span>
            </div>
            <h2 className='text-3xl font-bold text-white mb-2'>
              {state === 'Sign Up' ? "Create Account" : "Welcome Back"}
            </h2>
            <p className='text-blue-100'>
              {state === 'Sign Up' 
                ? "Sign up to book your appointment" 
                : "Login to access your account"}
            </p>
          </div>

          
          <form onSubmit={onSubmitHandler} className='p-8'>
            <div className='space-y-5'>
              
              {state === "Sign Up" && (
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    👤 Full Name
                  </label>
                  <input 
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all' 
                    type="text" 
                    onChange={(e) => setName(e.target.value)} 
                    value={name} 
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

             
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  📧 Email Address
                </label>
                <input 
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all' 
                  type="email" 
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email} 
                  placeholder="Enter your email"
                  required
                />
              </div>

         
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  🔒 Password
                </label>
                <div className='relative'>
                  <input 
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all pr-12' 
                    type={showPassword ? 'text' : 'password'}
                    onChange={(e) => setPassword(e.target.value)} 
                    value={password} 
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {state === 'Sign Up' && (
                  <p className='text-xs text-gray-500 mt-2'>
                    Password must be at least 8 characters
                  </p>
                )}
                {state === 'Login' && (
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
                className='w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {loading ? (
                  <>
                    <span className='animate-spin'>⏳</span>
                    {state === 'Sign Up' ? 'Creating Account...' : 'Logging in...'}
                  </>
                ) : (
                  <>
                    {state === 'Sign Up' ? 'Create Account' : 'Login'}
                  </>
                )}
              </button>

             
              <div className='text-center pt-4 border-t border-gray-200'>
                {state === "Sign Up" ? (
                  <p className='text-gray-600'>
                    Already have an account?{' '}
                    <button
                      type='button'
                      onClick={() => {
                        setState('Login')
                        setName('')
                        setEmail('')
                        setPassword('')
                      }}
                      className='text-primary font-semibold hover:underline'
                    >
                      Login here
                    </button>
                  </p>
                ) : (
                  <p className='text-gray-600'>
                    Don't have an account?{' '}
                    <button
                      type='button'
                      onClick={() => {
                        setState('Sign Up')
                        setEmail('')
                        setPassword('')
                      }}
                      className='text-primary font-semibold hover:underline'
                    >
                      Sign up now
                    </button>
                  </p>
                )}
              </div>
            </div>
          </form>

          
          <div className='bg-gray-50 px-8 py-4 text-center border-t border-gray-200'>
            <p className='text-xs text-gray-500'>
              🔒 Your information is secure and encrypted
            </p>
          </div>
        </div>

        
        <p className='text-center text-gray-600 mt-6 text-sm'>
          {state === 'Sign Up' 
            ? 'By signing up, you agree to our Terms of Service' 
            : 'Having trouble? Contact support'}
        </p>
      </div>

     
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            
          
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  🔑 Reset Password
                </h3>
                <button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setForgotStep(1)
                    setForgotEmail('')
                    setOtp('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

           
            <div className="p-6">
              
              
              {forgotStep === 1 && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Enter your email address and we'll send you an OTP to reset your password.
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

             
              {forgotStep === 2 && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    We've sent a 6-digit OTP to <strong>{forgotEmail}</strong>
                  </p>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Enter OTP
                    </label>
                    <input 
                      className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all text-center text-2xl tracking-widest' 
                      type="text" 
                      onChange={(e) => setOtp(e.target.value)} 
                      value={otp} 
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={otpLoading}
                    className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50'
                  >
                    {otpLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button
                    onClick={() => setForgotStep(1)}
                    className='w-full text-primary font-semibold'
                  >
                    ← Back
                  </button>
                </div>
              )}

         
              {forgotStep === 3 && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Create a new password for your account
                  </p>
                  
             
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      New Password
                    </label>
                    <div className='relative'>
                      <input 
                        className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all pr-12' 
                        type={showNewPassword ? 'text' : 'password'}
                        onChange={(e) => setNewPassword(e.target.value)} 
                        value={newPassword} 
                        placeholder="Enter new password"
                      />
                      <button
                        type='button'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                      >
                        {showNewPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Confirm Password
                    </label>
                    <div className='relative'>
                      <input 
                        className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all pr-12' 
                        type={showConfirmPassword ? 'text' : 'password'}
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        value={confirmPassword} 
                        placeholder="Confirm new password"
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <p className='text-xs text-gray-500'>
                    Password must be at least 8 characters
                  </p>

                  <button
                    onClick={handleResetPassword}
                    disabled={otpLoading}
                    className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50'
                  >
                    {otpLoading ? 'Resetting...' : 'Reset Password'}
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

export default Login   */


import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const { backendUrl, token, setToken } = useContext(AppContext)
  const navigate = useNavigate()

  const [state, setState] = useState('Login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false)

  // Forgot Password states
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotStep, setForgotStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('')

  // OTP as array of 6 digits
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)

  // Separate timers for OTP expiration and Resend
  const [otpTimer, setOtpTimer] = useState(0)
  const [resendTimer, setResendTimer] = useState(0)

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {

      if (state === 'Sign Up') {

        const { data } = await axios.post(backendUrl + '/api/user/register', { name, password, email })

        if (data.success) {
          toast.success('Account created successfully! Please login.')
          setState('Login')
          setName('')
          setPassword('')
          setEmail('')
        } else {
          toast.error(data.message)
        }

      } else {
        const { data } = await axios.post(backendUrl + '/api/user/login', { password, email })

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Login successful!')
        } else {
          toast.error(data.message)
        }
      }

    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP input change
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return

    const newOtp = [...otp]
    newOtp[index] = element.value
    setOtp(newOtp)

    if (element.value && index < 5) {
      document.getElementById(`forgot-otp-${index + 1}`).focus()
    }
  }

  // Handle backspace
  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`forgot-otp-${index - 1}`).focus()
    }
  }

  // Handle paste
  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)

    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split('')
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')])

    const lastIndex = Math.min(pastedData.length - 1, 5)
    document.getElementById(`forgot-otp-${lastIndex}`).focus()
  }

  // Clear OTP boxes and focus first
  const clearOtpBoxes = () => {
    setOtp(['', '', '', '', '', ''])
    setTimeout(() => {
      const firstBox = document.getElementById('forgot-otp-0')
      if (firstBox) firstBox.focus()
    }, 100)
  }

  // Send OTP
  const handleSendOTP = async () => {
    if (!forgotEmail) {
      toast.warn('Please enter your email')
      return
    }

    try {
      setOtpLoading(true)
      const { data } = await axios.post(backendUrl + '/api/user/send-otp', { email: forgotEmail })

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

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      setOtpLoading(true)
      const { data } = await axios.post(backendUrl + '/api/user/send-otp', { email: forgotEmail })

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

  // OTP Expiration Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [otpTimer])

  // Resend Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [resendTimer])

  // Verify OTP
  const handleVerifyOTP = async () => {
    const otpString = otp.join('')

    if (otpString.length !== 6) {
      toast.warn('Please enter complete 6-digit OTP')
      return
    }

    try {
      setOtpLoading(true)
      const { data } = await axios.post(backendUrl + '/api/user/verify-otp', {
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

  // Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.warn('Please fill all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      setOtpLoading(true)
      const otpString = otp.join('')

      const { data } = await axios.post(backendUrl + '/api/user/reset-password', {
        email: forgotEmail,
        otp: otpString,
        newPassword
      })

      if (data.success) {
        toast.success(data.message)
        setShowForgotPassword(false)
        setForgotStep(1)
        setForgotEmail('')
        setOtp(['', '', '', '', '', ''])
        setNewPassword('')
        setConfirmPassword('')
        setOtpTimer(0)
        setResendTimer(0)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setOtpLoading(false)
    }
  }

  // Reset modal state when closing
  const handleCloseModal = () => {
    setShowForgotPassword(false)
    setForgotStep(1)
    setForgotEmail('')
    setOtp(['', '', '', '', '', ''])
    setNewPassword('')
    setConfirmPassword('')
    setOtpTimer(0)
    setResendTimer(0)
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])

  // Helper function to format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  // Check if OTP is complete
  const isOtpComplete = otp.join('').length === 6

  return (
    <div className='min-h-[85vh] flex items-center justify-center py-12 px-4'>
      <div className='w-full max-w-md'>

        {/* Login/Signup Card */}
        <div className='bg-white rounded-2xl shadow-2xl overflow-hidden'>

          {/* Header with Gradient */}
          <div className='bg-gradient-to-r from-primary to-blue-600 p-8 text-center'>
            {/*<div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
              <svg className='w-10 h-10 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
              </svg>
            </div>*/}
            <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
              <span className='text-4xl'>🏥</span>
            </div>
            <h2 className='text-3xl font-bold text-white mb-2'>
              {state === 'Sign Up' ? "Create Account" : "Welcome Back"}
            </h2>
            <p className='text-blue-100'>
              {state === 'Sign Up'
                ? "Sign up to book your appointment"
                : "Login to access your account"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler} className='p-8'>
            <div className='space-y-5'>

              {/* Full Name Field - Only for Sign Up */}
              {state === "Sign Up" && (
                <div>
                  <label className='text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                    <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                    Full Name
                  </label>
                  <input
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all'
                    type="text"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className='text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                  <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                  Email Address
                </label>
                <input
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all'
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label className='text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                  <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                  </svg>
                  Password
                </label>
                <div className='relative'>
                  <input
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all pr-12'
                    type={showPassword ? 'text' : 'password'}
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                  >
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
                {state === 'Sign Up' && (
                  <p className='text-xs text-gray-500 mt-2'>
                    Password must be at least 8 characters
                  </p>
                )}
                {state === 'Login' && (
                  <button
                    type='button'
                    onClick={() => setShowForgotPassword(true)}
                    className='text-xs text-primary hover:underline mt-2'
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={loading}
                className='w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {loading ? (
                  <>
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    {state === 'Sign Up' ? 'Creating Account...' : 'Logging in...'}
                  </>
                ) : (
                  <>
                    {state === 'Sign Up' ? 'Create Account' : 'Login'}
                  </>
                )}
              </button>

              {/* Toggle between Login/Signup */}
              <div className='text-center pt-4 border-t border-gray-200'>
                {state === "Sign Up" ? (
                  <p className='text-gray-600'>
                    Already have an account?{' '}
                    <button
                      type='button'
                      onClick={() => {
                        setState('Login')
                        setName('')
                        setEmail('')
                        setPassword('')
                      }}
                      className='text-primary font-semibold hover:underline'
                    >
                      Login here
                    </button>
                  </p>
                ) : (
                  <p className='text-gray-600'>
                    Don't have an account?{' '}
                    <button
                      type='button'
                      onClick={() => {
                        setState('Sign Up')
                        setEmail('')
                        setPassword('')
                      }}
                      className='text-primary font-semibold hover:underline'
                    >
                      Sign up now
                    </button>
                  </p>
                )}
              </div>
            </div>
          </form>

          {/* Footer Info */}
          <div className='bg-gray-50 px-8 py-4 text-center border-t border-gray-200'>
            <p className='text-xs text-gray-500 flex items-center justify-center gap-1'>
              <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
              </svg>
              Your information is secure and encrypted
            </p>
          </div>
        </div>

        {/* Additional Help Text */}
        <p className='text-center text-gray-600 mt-6 text-sm'>
          {state === 'Sign Up'
            ? 'By signing up, you agree to our Terms of Service'
            : 'Having trouble? Contact support'}
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className='w-6 h-6 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' />
                  </svg>
                  Reset Password
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">

              {/* Step 1: Enter Email */}
              {forgotStep === 1 && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Enter your email address and we'll send you an OTP to reset your password.
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
                    className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2'
                  >
                    {otpLoading ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        Sending...
                      </>
                    ) : (
                      'Send OTP'
                    )}
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
                        <p className='text-sm text-gray-600 mb-1 flex items-center justify-center gap-1'>
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                          </svg>
                          OTP expires in
                        </p>
                        <p className='text-3xl font-bold text-green-600'>
                          {formatTime(otpTimer)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className='text-sm text-red-600 font-semibold flex items-center justify-center gap-1'>
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                          </svg>
                          OTP Expired
                        </p>
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
                    className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                  >
                    {otpLoading ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        Verifying...
                      </>
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
                    className='w-full text-primary font-semibold text-sm flex items-center justify-center gap-1'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                    </svg>
                    Back to Email
                  </button>
                </div>
              )}

              {/* Step 3: New Password */}
              {forgotStep === 3 && (
                <div className="space-y-4">
                  <div className='text-center mb-2'>
                    <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                      <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
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
                        type={showNewPassword ? 'text' : 'password'}
                        onChange={(e) => setNewPassword(e.target.value)}
                        value={newPassword}
                        placeholder="Enter new password"
                      />
                      <button
                        type='button'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
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

                  {/* Confirm Password */}
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Confirm Password
                    </label>
                    <div className='relative'>
                      <input
                        className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all pr-12'
                        type={showConfirmPassword ? 'text' : 'password'}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        value={confirmPassword}
                        placeholder="Confirm new password"
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
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
                  </div>

                  <p className='text-xs text-gray-500'>
                    Password must be at least 8 characters
                  </p>

                  <button
                    onClick={handleResetPassword}
                    disabled={otpLoading}
                    className='w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2'
                  >
                    {otpLoading ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        Resetting...
                      </>
                    ) : (
                      <>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                        </svg>
                        Reset Password
                      </>
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