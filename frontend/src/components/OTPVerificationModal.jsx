import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const OTPVerificationModal = ({ 
  isOpen, 
  onClose, 
  onVerified, 
  action, // 'cancel' or 'reschedule'
  appointmentId 
}) => {
  const { backendUrl, token } = useContext(AppContext)
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  
  // ✅ UPDATED: Separate timers for OTP expiration and Resend
  const [otpTimer, setOtpTimer] = useState(300)    // 5 minutes for OTP expiration
  const [resendTimer, setResendTimer] = useState(30) // 30 seconds for resend enable

  // Auto-send OTP when modal opens
  useEffect(() => {
    if (isOpen) {
      sendOTP()
    }
    // Reset states when modal closes
    if (!isOpen) {
      setOtp(['', '', '', '', '', ''])
      setOtpTimer(300)
      setResendTimer(30)
    }
  }, [isOpen])

  // ✅ UPDATED: OTP Expiration Timer countdown (5 minutes)
  useEffect(() => {
    if (!isOpen || otpTimer <= 0) return

    const timer = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, otpTimer])

  // ✅ NEW: Resend Timer countdown (30 seconds)
  useEffect(() => {
    if (!isOpen || resendTimer <= 0) return

    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, resendTimer])

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Send OTP
  const sendOTP = async () => {
    try {
      setSendingOtp(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/send-appointment-otp',
        { action },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        // ✅ UPDATED: Reset both timers
        setOtpTimer(300)      // Reset OTP expiration to 5 minutes
        setResendTimer(30)    // Reset resend timer to 30 seconds
        setOtp(['', '', '', '', '', '']) // Clear OTP
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setSendingOtp(false)
    }
  }

  // Handle OTP input change
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return

    const newOtp = [...otp]
    newOtp[index] = element.value
    setOtp(newOtp)

    // Auto-focus next input
    if (element.value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus()
    }
  }

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus()
    }
  }

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split('')
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')])
    
    // Focus last filled input
    const lastIndex = Math.min(pastedData.length - 1, 5)
    document.getElementById(`otp-${lastIndex}`).focus()
  }

  // ✅ NEW: Clear OTP boxes and focus first
  const clearOtpBoxes = () => {
    setOtp(['', '', '', '', '', ''])
    setTimeout(() => {
      const firstBox = document.getElementById('otp-0')
      if (firstBox) firstBox.focus()
    }, 100)
  }

  // Verify OTP
  const verifyOTP = async () => {
    const otpString = otp.join('')

    if (otpString.length !== 6) {
      toast.warn('Please enter complete OTP')
      return
    }

    try {
      setLoading(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/verify-appointment-otp',
        { otp: otpString, action },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        onVerified() // Proceed with cancel/reschedule
        onClose()
      } else {
        toast.error(data.message)
        // ✅ Clear OTP on error
        clearOtpBoxes()
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
      clearOtpBoxes()
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResend = () => {
    clearOtpBoxes()
    sendOTP()
  }

  if (!isOpen) return null

  const actionText = action === 'cancel' ? 'Cancel' : 'Reschedule'
  const isOtpComplete = otp.join('').length === 6

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
        
        {/* Header */}
        <div className='text-center mb-6'>
          <div className={`w-16 h-16 ${action === 'cancel' ? 'bg-red-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <svg className={`w-8 h-8 ${action === 'cancel' ? 'text-red-600' : 'text-blue-600'}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-gray-900">
            Verify {actionText} Request
          </h3>
          <p className="text-gray-600 text-sm">
            We've sent a 6-digit OTP to your registered email
          </p>
        </div>

        {/* ✅ UPDATED: OTP Expiration Timer (5 minutes) */}
        <div className={`${otpTimer > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2 rounded-lg p-3 mb-6 text-center`}>
          <p className='text-sm text-gray-600 mb-1 flex items-center justify-center gap-1'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            {otpTimer > 0 ? 'OTP expires in' : 'OTP expired'}
          </p>
          <p className={`text-2xl font-bold ${otpTimer > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatTime(otpTimer)}
          </p>
        </div>

        {/* OTP Input */}
        <div className='mb-6'>
          <label className='block text-sm font-semibold text-gray-700 mb-3 text-center'>
            Enter OTP
          </label>
          <div className='flex justify-center gap-2 sm:gap-3'>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type='text'
                inputMode='numeric'
                maxLength='1'
                value={digit}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 rounded-lg transition-all
                  ${digit ? 'border-primary bg-primary/5' : 'border-gray-300'}
                  focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                  disabled:bg-gray-100 disabled:cursor-not-allowed`}
                disabled={loading || sendingOtp || otpTimer === 0}
              />
            ))}
          </div>
        </div>

        {/* ✅ NEW: Resend OTP - Small text with 30 second timer */}
        <div className='text-center mb-6'>
          {resendTimer > 0 ? (
            <p className='text-xs text-gray-500'>
              Resend OTP in <span className='font-semibold text-primary'>{resendTimer}s</span>
            </p>
          ) : (
            <p className='text-xs text-gray-800'>
              Didn't receive OTP?
              <button
                onClick={handleResend}
                disabled={sendingOtp}
                className='text-xs text-primary pl-1 hover:underline font-medium disabled:opacity-50'
              >
                {sendingOtp ? 'Sending...' : 'Resend OTP'}
              </button>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={verifyOTP}
            disabled={loading || !isOtpComplete || otpTimer === 0}
            className={`flex-1 py-3 ${action === 'cancel' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'} text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
          >
            {loading ? (
              <span className='flex items-center justify-center gap-2'>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                Verifying...
              </span>
            ) : (
              'Verify & Proceed'
            )}
          </button>
        </div>

        {/* Info */}
        <p className='text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1'>
          <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
          </svg>
          This verification ensures the security of your appointment
        </p>
      </div>
    </div>
  )
}

export default OTPVerificationModal