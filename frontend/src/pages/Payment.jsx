import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const Payment = () => {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { backendUrl, token, getDoctorsData, currencySymbol } = useContext(AppContext)

  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [appointmentData, setAppointmentData] = useState(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const formatDate = (slotDate) => {
    if (!slotDate) return ''
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get(
          `${backendUrl}/api/user/appointment-details/${appointmentId}`,
          { headers: { token } }
        )
        if (data.success) {
          if (data.appointment.paymentStatus === 'paid' || data.appointment.status === 'confirmed') {
            toast.info('Payment already completed')
            navigate('/my-appointments')
            return
          }
          setAppointmentData(data.appointment)
        } else {
          toast.error(data.message || 'Failed to load appointment')
          navigate(-1)
        }
      } catch (error) {
        console.log(error)
        toast.error('Failed to load appointment details')
        navigate(-1)
      } finally {
        setLoading(false)
      }
    }
    if (appointmentId && token) fetchAppointmentDetails()
  }, [appointmentId, token, backendUrl, navigate])

  const handlePayment = async () => {
    if (!token) { toast.warn('Please login again'); return navigate('/login') }
    try {
      setPaymentLoading(true)
      const { data } = await axios.post(
        backendUrl + '/api/user/create-razorpay-order',
        { appointmentId },
        { headers: { token } }
      )
      if (!data.success) { toast.error(data.message); setPaymentLoading(false); return }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'SmartCare Hospitals',
        description: `Appointment with ${data.appointmentData.doctorName}`,
        image: '/logo.png',
        order_id: data.order.id,
        handler: async function (response) {
          try {
            const verifyData = await axios.post(
              backendUrl + '/api/user/verify-razorpay-payment',
              {
                appointmentId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              { headers: { token } }
            )
            if (verifyData.data.success) {
              setPaymentLoading(false)
              toast.success('Payment successful!')
              navigate('/my-appointments', { replace: true })
            } else {
              setPaymentLoading(false)
              toast.error(verifyData.data.message || 'Payment verification failed')
            }
          } catch (error) {
            console.log(error)
            setPaymentLoading(false)
            toast.error('Payment verification failed')
          }
        },
        prefill: {
          name: data.appointmentData.patientName,
          email: data.appointmentData.patientEmail,
          contact: data.appointmentData.patientPhone
        },
        notes: { appointmentId },
        theme: { color: '#5f6FFF' },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false)
            toast.info('Payment cancelled')
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
      razorpay.on('payment.failed', function (response) {
        toast.error('Payment failed: ' + response.error.description)
        setPaymentLoading(false)
      })
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Something went wrong')
      setPaymentLoading(false)
    }
  }

  const handleCancelAppointment = async () => {
    try {
      setCancelling(true)
      const { data } = await axios.post(
        backendUrl + '/api/user/expire-appointment',
        { appointmentId },
        { headers: { token } }
      )
      if (data.success) {
        await getDoctorsData()
        toast.info('Booking cancelled')
        navigate(-1)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className="text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className='w-8 h-8 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-1">Complete Your Payment</h2>
          <p className="text-blue-100 text-sm">Secure payment via Razorpay</p>
        </div>

        {/* Appointment Details */}
        {appointmentData ? (
          <div className="p-6">

            {/* Doctor Card */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-4">
                <img src={appointmentData.docData.image} alt={appointmentData.docData.name}
                  className="w-20 h-20 rounded-xl object-cover shadow-md" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{appointmentData.docData.name}</h3>
                  <p className="text-primary font-medium text-sm">{appointmentData.docData.speciality}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                      {formatDate(appointmentData.slotDate)}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      {appointmentData.slotTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount Card */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-green-600">{currencySymbol}{appointmentData.amount}</p>
                </div>
                <div className='w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center'>
                  <svg className='w-7 h-7 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                </svg>
                Secure Payment Options
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Credit/Debit Card', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                  { label: 'UPI', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
                  { label: 'Net Banking', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
                  { label: 'Wallets', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                ].map(({ label, icon }) => (
                  <span key={label} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                    <svg className='w-3.5 h-3.5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d={icon} />
                    </svg>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button onClick={handlePayment} disabled={paymentLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {paymentLoading ? (
                  <><div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>Processing...</>
                ) : (
                  <>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                    </svg>
                    Pay {currencySymbol}{appointmentData.amount} Securely
                  </>
                )}
              </button>

              <button onClick={() => setShowCancelDialog(true)} disabled={paymentLoading || cancelling}
                className="w-full border-2 border-red-200 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all disabled:opacity-50">
                Cancel Booking
              </button>
            </div>

            {/* Security Badge */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
                <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                </svg>
                100% Secure Payment — Powered by Razorpay
              </p>
            </div>

          </div>
        ) : (
          <div className="p-8 text-center">
            <div className='w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        )}
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className='w-8 h-8 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Cancel Booking?</h3>
              <p className="text-gray-600 text-sm">Are you sure you want to cancel this booking? The slot will be released.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelDialog(false)} disabled={cancelling}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                No, Keep It
              </button>
              <button onClick={handleCancelAppointment} disabled={cancelling}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {cancelling ? (
                  <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>Cancelling...</>
                ) : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payment