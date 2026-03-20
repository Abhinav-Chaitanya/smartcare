/*import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const Payment = () => {

  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { backendUrl, token } = useContext(AppContext)

  // 5 minutes = 300 seconds
  const [timeLeft, setTimeLeft] = useState(300)
  const [loading, setLoading] = useState(false)

  // countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          toast.error('Payment session expired')
          navigate('/my-appointments')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handlePayment = async () => {
    if (!token) {
      toast.warn('Please login again')
      return navigate('/login')
    }

    try {
      setLoading(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/confirm-payment',
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
        navigate('/my-appointments')
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, '0')

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Complete Payment
        </h2>

        <p className="text-gray-600 mb-2">
          Please complete your payment within:
        </p>

        <p className="text-lg font-bold text-red-600 mb-6">
          {minutes}:{seconds}
        </p>

        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full py-3 rounded text-white transition-all
            ${loading ? 'bg-gray-400' : 'bg-primary hover:bg-primary-dark'}
          `}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          This is a mock payment for project demonstration.
        </p>

      </div>
    </div>
  )
}

export default Payment*/

//----------------------------------------------------------   best version--------------------------------------------------------
/*import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const Payment = () => {

  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { backendUrl, token } = useContext(AppContext)

  // ⏱ 1 minute for demo
  const [timeLeft, setTimeLeft] = useState(60)
  const [loading, setLoading] = useState(false)

  //---------- TIMER ---------- 
  useEffect(() => {
    if (!appointmentId) return

    const countdown = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    const expiry = setTimeout(async () => {
      try {
        await axios.post(
          backendUrl + '/api/user/expire-appointment',
          { appointmentId },
          { headers: { token } }
        )



        toast.error('Session expired')
        navigate(-1)
        await getDoctorsData() // go back to appointment page
      } catch (err) {
        console.log(err)
      }
    }, 60000) // 1 minute

    return () => {
      clearInterval(countdown)
      clearTimeout(expiry)
    }
  }, [appointmentId])

  //---------- PAYMENT ---------- 
  const handlePayment = async () => {
    if (!token) {
      toast.warn('Please login again')
      return navigate('/login')
    }

    try {
      setLoading(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/confirm-payment',
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success('Payment successful')
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, '0')

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">

        <h2 className="text-xl font-semibold mb-4">
          Complete Payment
        </h2>

        <p className="mb-2 text-gray-600">
          Please complete payment within:
        </p>

        <p className="text-lg font-bold text-red-600 mb-6">
          {minutes}:{seconds}
        </p>

        <button
          onClick={handlePayment}
          disabled={loading || timeLeft <= 0}
          className={`w-full py-3 rounded text-white
            ${loading ? 'bg-gray-400' : 'bg-primary'}
          `}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Mock payment (demo purpose)
        </p>

      </div>
    </div>
  )
}

export default Payment*/
//---------------------------------------------------------------------------------------       best working one before appointment details--------------------------------------------


/*import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const Payment = () => {

  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)

  // ⏱ 1 minute for demo
  const [timeLeft, setTimeLeft] = useState(60)
  const [loading, setLoading] = useState(false)

  //---------- TIMER ---------- 
  useEffect(() => {
    if (!appointmentId) return

    const countdown = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    const expiry = setTimeout(async () => {
      try {
        // ✅ FIRST: Expire the appointment and release slot
        await axios.post(
          backendUrl + '/api/user/expire-appointment',
          { appointmentId },
          { headers: { token } }
        )

        // ✅ SECOND: Refresh doctor data
        await getDoctorsData()

        // ✅ THIRD: Show message and navigate
        toast.error('Session expired')
        navigate(-1)
        
      } catch (err) {
        console.log(err)
      }
    }, 60000) // 1 minute

    return () => {
      clearInterval(countdown)
      clearTimeout(expiry)
    }
  }, [appointmentId, backendUrl, token, getDoctorsData, navigate])

  //---------- PAYMENT ---------- 
  const handlePayment = async () => {
    if (!token) {
      toast.warn('Please login again')
      return navigate('/login')
    }

    try {
      setLoading(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/confirm-payment',
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success('Payment successful')
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, '0')

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">

        <h2 className="text-xl font-semibold mb-4">
          Complete Payment
        </h2>

        <p className="mb-2 text-gray-600">
          Please complete payment within:
        </p>

        <p className="text-lg font-bold text-red-600 mb-6">
          {minutes}:{seconds}
        </p>

        <button
          onClick={handlePayment}
          disabled={loading || timeLeft <= 0}
          className={`w-full py-3 rounded text-white
            ${loading ? 'bg-gray-400' : 'bg-primary'}
          `}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Mock payment (demo purpose)
        </p>

      </div>
    </div>
  )
}

export default Payment*/


// ---------------------------------------------------------------        best version with appointment details------------------------------

/*import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const Payment = () => {

  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { backendUrl, token, getDoctorsData, currencySymbol } = useContext(AppContext)

  const [timeLeft, setTimeLeft] = useState(60)
  const [loading, setLoading] = useState(false)
  const [appointmentData, setAppointmentData] = useState(null)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  //---------- FETCH APPOINTMENT DETAILS ----------
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/user/appointment-details/${appointmentId}`,
          { headers: { token } }
        )
        
        if (data.success) {
          setAppointmentData(data.appointment)
        }
      } catch (error) {
        console.log(error)
      }
    }

    if (appointmentId && token) {
      fetchAppointmentDetails()
    }
  }, [appointmentId, token, backendUrl])

  //---------- TIMER ---------- 
  useEffect(() => {
    if (!appointmentId) return

    const countdown = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    const expiry = setTimeout(async () => {
      try {
        await axios.post(
          backendUrl + '/api/user/expire-appointment',
          { appointmentId },
          { headers: { token } }
        )

        await getDoctorsData()
        toast.error('Session expired')
        navigate(-1)
        
      } catch (err) {
        console.log(err)
      }
    }, 60000)

    return () => {
      clearInterval(countdown)
      clearTimeout(expiry)
    }
  }, [appointmentId, backendUrl, token, getDoctorsData, navigate])

  //---------- PAYMENT ---------- 
  const handlePayment = async () => {
    if (!token) {
      toast.warn('Please login again')
      return navigate('/login')
    }

    try {
      setLoading(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/confirm-payment',
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success('Payment successful')
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, '0')

  // Format date
  const formatDate = (slotDate) => {
    if (!slotDate) return ''
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Complete Your Payment
        </h2>

        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 text-center mb-2">
            ⏰ Complete payment within:
          </p>
          <p className="text-3xl font-bold text-red-600 text-center">
            {minutes}:{seconds}
          </p>
        </div>

        
        {appointmentData ? (
          <div className="border rounded-lg p-6 mb-6 bg-gray-50">
            <h3 className="font-semibold text-lg mb-4 text-gray-700">
              Appointment Details
            </h3>
            
            <div className="space-y-3">
              
              <div className="flex items-start gap-3">
                <img 
                  src={appointmentData.docData.image} 
                  alt={appointmentData.docData.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {appointmentData.docData.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {appointmentData.docData.speciality}
                  </p>
                </div>
              </div>

              <div className="border-t pt-3 mt-3">
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-800">
                    {formatDate(appointmentData.slotDate)}
                  </span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium text-gray-800">
                    {appointmentData.slotTime}
                  </span>
                </div>

               
                <div className="flex justify-between pt-3 mt-3 border-t">
                  <span className="text-gray-600 font-medium">Amount:</span>
                  <span className="font-bold text-xl text-primary">
                    {currencySymbol}{appointmentData.amount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading appointment details...</p>
          </div>
        )}

       
        <button
          onClick={handlePayment}
          disabled={loading || timeLeft <= 0 || !appointmentData}
          className={`w-full py-4 rounded-lg text-white font-semibold text-lg transition-all
            ${loading || !appointmentData
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-primary hover:bg-primary/90 active:scale-95'}
          `}
        >
          {loading ? 'Processing...' : `Pay ${currencySymbol}${appointmentData?.amount || '...'}`}
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          🔒 This is a mock payment for demonstration purposes
        </p>

      </div>
    </div>
  )
}

export default Payment*/



/*import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const Payment = () => {

  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { backendUrl, token, getDoctorsData, currencySymbol } = useContext(AppContext)

  const [timeLeft, setTimeLeft] = useState(60)
  const [loading, setLoading] = useState(false)
  const [appointmentData, setAppointmentData] = useState(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  //---------- FETCH APPOINTMENT DETAILS ----------
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/user/appointment-details/${appointmentId}`,
          { headers: { token } }
        )
        
        if (data.success) {
          setAppointmentData(data.appointment)
        }
      } catch (error) {
        console.log(error)
      }
    }

    if (appointmentId && token) {
      fetchAppointmentDetails()
    }
  }, [appointmentId, token, backendUrl])

  //---------- TIMER ---------- 
  useEffect(() => {
    if (!appointmentId) return

    const countdown = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    const expiry = setTimeout(async () => {
      try {
        await axios.post(
          backendUrl + '/api/user/expire-appointment',
          { appointmentId },
          { headers: { token } }
        )

        await getDoctorsData()
        toast.error('Session expired')
        navigate(-1)
        
      } catch (err) {
        console.log(err)
      }
    }, 60000)

    return () => {
      clearInterval(countdown)
      clearTimeout(expiry)
    }
  }, [appointmentId, backendUrl, token, getDoctorsData, navigate])

  //---------- PAYMENT ---------- 
  const handlePayment = async () => {
    if (!token) {
      toast.warn('Please login again')
      return navigate('/login')
    }

    try {
      setLoading(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/confirm-payment',
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success('Payment successful')
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  //---------- CANCEL APPOINTMENT ----------
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
        toast.info('Appointment cancelled')
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

  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, '0')

  // Format date
  const formatDate = (slotDate) => {
    if (!slotDate) return ''
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Complete Your Payment
        </h2>

        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 text-center mb-2">
            ⏰ Complete payment within:
          </p>
          <p className="text-3xl font-bold text-red-600 text-center">
            {minutes}:{seconds}
          </p>
        </div>

     
        {appointmentData ? (
          <div className="border rounded-lg p-6 mb-6 bg-gray-50">
            <h3 className="font-semibold text-lg mb-4 text-gray-700">
              Appointment Details
            </h3>
            
            <div className="space-y-3">
             
              <div className="flex items-start gap-3">
                <img 
                  src={appointmentData.docData.image} 
                  alt={appointmentData.docData.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {appointmentData.docData.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {appointmentData.docData.speciality}
                  </p>
                </div>
              </div>

              <div className="border-t pt-3 mt-3">
               
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-800">
                    {formatDate(appointmentData.slotDate)}
                  </span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium text-gray-800">
                    {appointmentData.slotTime}
                  </span>
                </div>

           
                <div className="flex justify-between pt-3 mt-3 border-t">
                  <span className="text-gray-600 font-medium">Amount:</span>
                  <span className="font-bold text-xl text-primary">
                    {currencySymbol}{appointmentData.amount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading appointment details...</p>
          </div>
        )}

       
        <div className="flex gap-3">
          <button
            onClick={handlePayment}
            disabled={loading || timeLeft <= 0 || !appointmentData}
            className={`flex-1 py-4 rounded-lg text-white font-semibold text-lg transition-all
              ${loading || !appointmentData
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary/90 active:scale-95'}
            `}
          >
            {loading ? 'Processing...' : `Pay ${currencySymbol}${appointmentData?.amount || '...'}`}
          </button>

          <button
            onClick={() => setShowCancelDialog(true)}
            disabled={loading || cancelling}
            className="px-6 py-4 rounded-lg border-2 border-red-500 text-red-500 font-semibold hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          🔒 This is a mock payment for demonstration purposes
        </p>

      </div>


      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Cancel Appointment?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this appointment? The slot will be released and available for others.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={cancelling}
                className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payment*/



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

  // Format date
  const formatDate = (slotDate) => {
    if (!slotDate) return ''
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  //---------- FETCH APPOINTMENT DETAILS ----------
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get(
          `${backendUrl}/api/user/appointment-details/${appointmentId}`,
          { headers: { token } }
        )
        
        if (data.success) {
          // If already paid, redirect to appointments
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

    if (appointmentId && token) {
      fetchAppointmentDetails()
    }
  }, [appointmentId, token, backendUrl, navigate])

  //---------- RAZORPAY PAYMENT ----------
  const handlePayment = async () => {
    if (!token) {
      toast.warn('Please login again')
      return navigate('/login')
    }

    try {
      setPaymentLoading(true)

      // Step 1: Create Razorpay order
      const { data } = await axios.post(
        backendUrl + '/api/user/create-razorpay-order',
        { appointmentId },
        { headers: { token } }
      )

      if (!data.success) {
        toast.error(data.message)
        setPaymentLoading(false)
        return
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'SmartCare Hospitals',
        description: `Appointment with ${data.appointmentData.doctorName}`,
        image: '/logo.png', // Your logo URL
        order_id: data.order.id,
        handler: async function (response) {
          // Step 3: Verify payment
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
              toast.success('Payment successful! 🎉')
              await getDoctorsData()
              navigate('/my-appointments')
            } else {
              toast.error(verifyData.data.message || 'Payment verification failed')
            }
          } catch (error) {
            console.log(error)
            toast.error('Payment verification failed')
          }
        },
        prefill: {
          name: data.appointmentData.patientName,
          email: data.appointmentData.patientEmail,
          contact: data.appointmentData.patientPhone
        },
        notes: {
          appointmentId: appointmentId
        },
        theme: {
          color: '#5f6FFF' // Your primary color
        },
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

  //---------- CANCEL APPOINTMENT ----------
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
          <div className="animate-spin text-5xl mb-4">⏳</div>
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
            <span className="text-3xl">💳</span>
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
                <img 
                  src={appointmentData.docData.image} 
                  alt={appointmentData.docData.name}
                  className="w-20 h-20 rounded-xl object-cover shadow-md"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">
                    {appointmentData.docData.name}
                  </h3>
                  <p className="text-primary font-medium text-sm">
                    {appointmentData.docData.speciality}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      📅 {formatDate(appointmentData.slotDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      ⏰ {appointmentData.slotTime}
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
                  <p className="text-3xl font-bold text-green-600">
                    {currencySymbol}{appointmentData.amount}
                  </p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>

            {/* Payment Methods Info */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                🔒 Secure Payment Options
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                  💳 Credit/Debit Card
                </span>
                <span className="bg-white px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                  📱 UPI
                </span>
                <span className="bg-white px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                  🏦 Net Banking
                </span>
                <span className="bg-white px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                  👛 Wallets
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paymentLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>🔐</span>
                    Pay {currencySymbol}{appointmentData.amount} Securely
                  </>
                )}
              </button>

              <button
                onClick={() => setShowCancelDialog(true)}
                disabled={paymentLoading || cancelling}
                className="w-full border-2 border-red-200 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all disabled:opacity-50"
              >
                Cancel Booking
              </button>
            </div>

            {/* Security Badge */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <span>🔒</span>
                100% Secure Payment | Powered by Razorpay
              </p>
            </div>

          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-500">Loading...</p>
          </div>
        )}

      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Cancel Booking?
              </h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to cancel this booking? The slot will be released.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={cancelling}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payment






































/*import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const Payment = () => {
    const { appointmentId } = useParams()
    const navigate = useNavigate()
    const { backendUrl, token, getDoctorsData } = useContext(AppContext)

    // ⏱ 1 minute demo timer
    const [timeLeft, setTimeLeft] = useState(60)
    const [loading, setLoading] = useState(false)

    const expiredRef = useRef(false) // 🔒 prevents double execution*/

    // ---------------- TIMER ---------------- 
    /*useEffect(() => {
      if (!appointmentId) return
  
      const interval = setInterval(async () => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval)
  
            if (!expiredRef.current) {
              expiredRef.current = true
  
              // 🔥 expire appointment in backend
              axios.post(
                backendUrl + '/api/user/expire-appointment',
                { appointmentId },
                { headers: { token } }
              ).catch(err => console.log(err))
  
              await getDoctorsData()
  
         
  
  
              toast.error('Session expired')
              navigate(-1) // back to appointment page
            }
  
            return 0
          }
  
          return prev - 1
        })
      }, 1000)
  
      return () => clearInterval(interval)
    }, [appointmentId])*/


    /*useEffect(() => {
        if (!appointmentId) return

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        // ⏰ handle expiry OUTSIDE setState
        const expiryWatcher = setTimeout(async () => {
            if (expiredRef.current) return
            expiredRef.current = true

            try {
                await axios.post(
                    backendUrl + '/api/user/expire-appointment',
                    { appointmentId },
                    { headers: { token } }
                )

                // 🔥 refresh doctor slots
                await getDoctorsData()

                toast.error('Session expired')
                navigate(-1)
            } catch (err) {
                console.log(err)
            }
        }, 60000)

        return () => {
            clearInterval(interval)
            clearTimeout(expiryWatcher)
        }
    }, [appointmentId])


    //---------------- PAYMENT ---------------- 
    const handlePayment = async () => {
        if (!token) {
            toast.warn('Please login again')
            return navigate('/login')
        }

        if (timeLeft <= 0) {
            toast.error('Session already expired')
            return
        }

        try {
            setLoading(true)

            const { data } = await axios.post(
                backendUrl + '/api/user/confirm-payment',
                { appointmentId },
                { headers: { token } }
            )

            if (data.success) {
                toast.success('Payment successful')
                navigate('/my-appointments')
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const minutes = Math.floor(timeLeft / 60)
    const seconds = String(timeLeft % 60).padStart(2, '0')

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">

                <h2 className="text-xl font-semibold mb-4">
                    Complete Payment
                </h2>

                <p className="text-gray-600 mb-2">
                    Please complete payment within:
                </p>

                <p className="text-lg font-bold text-red-600 mb-6">
                    {minutes}:{seconds}
                </p>

                <button
                    onClick={handlePayment}
                    disabled={loading || timeLeft === 0}
                    className={`w-full py-3 rounded text-white
            ${loading || timeLeft === 0 ? 'bg-gray-400' : 'bg-primary'}
          `}
                >
                    {loading ? 'Processing...' : 'Pay Now'}
                </button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                    Mock payment (demo)
                </p>
            </div>
        </div>
    )
}

export default Payment*/


/*import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const Payment = () => {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const { backendUrl, token, getDoctorsData } = useContext(AppContext)

  // doctor id passed from appointment page
  const { docId } = location.state || {}

  // ⏱ 1 minute timer
  const [timeLeft, setTimeLeft] = useState(60)
  const [loading, setLoading] = useState(false)

  const expiredRef = useRef(false)

  // ---------------- TIMER ---------------- 
  useEffect(() => {
    //if (!appointmentId || !docId) return
    if (!appointmentId) return


    // UI countdown
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // expiry handler (async, OUTSIDE state update)
    const expiryWatcher = setTimeout(async () => {
      if (expiredRef.current) return
      expiredRef.current = true

      try {
        await axios.post(
          backendUrl + '/api/user/expire-appointment',
          { appointmentId },
          { headers: { token } }
        )

        // 🔥 refresh doctor slots
        await getDoctorsData()

        toast.error('Session expired')

        // 🔁 go back to SAME doctor page
        navigate(`/appointment/${docId}`)
      } catch (err) {
        console.log(err)
      }
    }, 60000)

    return () => {
      clearInterval(interval)
      clearTimeout(expiryWatcher)
    }
  }, [appointmentId])

  // ---------------- PAYMENT ---------------- 
  const handlePayment = async () => {
    if (!token) {
      toast.warn('Please login again')
      return navigate('/login')
    }

    if (timeLeft <= 0) {
      toast.error('Session already expired')
      return
    }

    try {
      setLoading(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/confirm-payment',
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success('Payment successful')
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, '0')

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          Complete Payment
        </h2>

        <p className="text-gray-600 mb-2">
          Please complete payment within:
        </p>

        <p className="text-lg font-bold text-red-600 mb-6">
          {minutes}:{seconds}
        </p>

        <button
          onClick={handlePayment}
          disabled={loading || timeLeft === 0}
          className={`w-full py-3 rounded text-white
            ${loading || timeLeft === 0 ? 'bg-gray-400' : 'bg-primary'}
          `}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Mock payment (demo)
        </p>
      </div>
    </div>
  )
}

export default Payment*/  




/*import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const Payment = () => {
  const { appointmentId } = useParams()
  const navigate = useNavigate()

  const { backendUrl, token, getDoctorsData } = useContext(AppContext)

  const [timeLeft, setTimeLeft] = useState(60)
  const [loading, setLoading] = useState(false)

  const expiredRef = useRef(false)

  // ---------------- TIMER ---------------- 
  useEffect(() => {
    if (!appointmentId) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    const expiryWatcher = setTimeout(async () => {
      if (expiredRef.current) return
      expiredRef.current = true

      try {
        const { data } = await axios.post(
          backendUrl + '/api/user/expire-appointment',
          { appointmentId },
          { headers: { token } }
        )

        await getDoctorsData()

        toast.error('Session expired')

        // ✅ docId comes from backend (ALWAYS defined)
        navigate(`/appointment/${data.docId}`)
      } catch (err) {
        console.log(err)
      }
    }, 60000)

    return () => {
      clearInterval(interval)
      clearTimeout(expiryWatcher)
    }
  }, [appointmentId])

  // ---------------- PAYMENT ---------------- 
  const handlePayment = async () => {
    if (!token) {
      toast.warn('Please login again')
      return navigate('/login')
    }

    if (timeLeft <= 0) {
      toast.error('Session already expired')
      return
    }

    try {
      setLoading(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/confirm-payment',
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success('Payment successful')
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, '0')

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Complete Payment</h2>

        <p className="text-gray-600 mb-2">
          Please complete payment within:
        </p>

        <p className="text-lg font-bold text-red-600 mb-6">
          {minutes}:{seconds}
        </p>

        <button
          onClick={handlePayment}
          disabled={loading || timeLeft === 0}
          className={`w-full py-3 rounded text-white
            ${loading || timeLeft === 0 ? 'bg-gray-400' : 'bg-primary'}
          `}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Mock payment (demo)
        </p>
      </div>
    </div>
  )
}

export default Payment */


