/*import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  // ---------------- FETCH APPOINTMENTS ---------------- 
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/user/appointments',
        { headers: { token } }
      )

      if (data.success) {
        setAppointments(data.appointments)

      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // ---------------- CANCEL APPOINTMENT ---------------- 
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await getUserAppointments()
        await getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  // ---------------- UI ---------------- 
  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>
        My Appointments
      </p>

      <div>
        {appointments.map((item, index) => (
          <div
            key={index}
            className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'
          >
            
            <div>
              <img className='w-32 bg-primary rounded' src={item.docData.image} alt="" />
            </div>

          
            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-neutral-800 font-semibold mt-2'>
                {item.docData.name}
              </p>
              <p>{item.docData.speciality}</p>

              <p className='text-zinc-700 font-medium mt-2'>Address:</p>
              <p className='text-xs'>{item.docData.address.line1}</p>
              <p className='text-xs'>{item.docData.address.line2}</p>

              <p className='text-xs mt-4'>
                <span className='text-sm font-medium text-neutral-700'>
                  Date & Time:
                </span>{" "}
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>

            
            <div className='flex flex-col gap-2 justify-end sm:min-w-48'>

              
              <button className="border px-4 py-2">
                View Details
              </button>

              
              {item.status === 'confirmed' && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="border px-4 py-2 hover:bg-red-600 hover:text-white"
                >
                  Cancel Appointment
                </button>
              )}

              
              {item.status === 'cancelled' && (
                <button
                  disabled
                  className="border border-red-500 text-red-500 px-4 py-2"
                >
                  Appointment Cancelled
                </button>
              )}

              
              {item.status === 'expired' && (
                <button
                  disabled
                  className="border border-gray-400 text-gray-400 px-4 py-2"
                >
                  Payment Expired
                </button>
              )}


            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAppointments*/



/*import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  // ---------------- FETCH APPOINTMENTS ---------------- 
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/user/appointments',
        { headers: { token } }
      )

      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // ---------------- OPEN CANCEL DIALOG ---------------- 
  const openCancelDialog = (appointmentId) => {
    setSelectedAppointmentId(appointmentId)
    setShowCancelDialog(true)
  }

  // ---------------- CANCEL APPOINTMENT ---------------- 
  const cancelAppointment = async () => {
    try {
      setCancelling(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId: selectedAppointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await getUserAppointments()
        await getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
      setSelectedAppointmentId(null)
    }
  }

  // ---------------- CLOSE DIALOG ---------------- 
  const closeCancelDialog = () => {
    setShowCancelDialog(false)
    setSelectedAppointmentId(null)
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  // ---------------- UI ---------------- 
  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>
        My Appointments
      </p>

      <div>
        {appointments.map((item, index) => (
          <div
            key={index}
            className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'
          >
            
            <div>
              <img className='w-32 bg-primary rounded' src={item.docData.image} alt="" />
            </div>

            
            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-neutral-800 font-semibold mt-2'>
                {item.docData.name}
              </p>
              <p>{item.docData.speciality}</p>

              <p className='text-zinc-700 font-medium mt-2'>Address:</p>
              <p className='text-xs'>{item.docData.address.line1}</p>
              <p className='text-xs'>{item.docData.address.line2}</p>

              <p className='text-xs mt-4'>
                <span className='text-sm font-medium text-neutral-700'>
                  Date & Time:
                </span>{" "}
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>

            
            <div className='flex flex-col gap-2 justify-end sm:min-w-48'>

              
              <button className="border px-4 py-2 hover:bg-gray-100 transition-all">
                View Details
              </button>

              
              {item.status === 'confirmed' && (
                <button
                  onClick={() => openCancelDialog(item._id)}
                  className="border border-red-500 text-red-500 px-4 py-2 hover:bg-red-600 hover:text-white transition-all"
                >
                  Cancel Appointment
                </button>
              )}

              
              {item.status === 'cancelled' && (
                <button
                  disabled
                  className="border border-red-500 text-red-500 px-4 py-2 cursor-not-allowed opacity-60"
                >
                  Appointment Cancelled
                </button>
              )}

              
              {item.status === 'expired' && (
                <button
                  disabled
                  className="border border-gray-400 text-gray-400 px-4 py-2 cursor-not-allowed opacity-60"
                >
                  Payment Expired
                </button>
              )}

            </div>
          </div>
        ))}
      </div>


      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Cancel Appointment?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this appointment? The slot will be released and available for others to book.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={closeCancelDialog}
                disabled={cancelling}
                className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                No, Keep It
              </button>
              <button
                onClick={cancelAppointment}
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

export default MyAppointments*/


/*import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, currencySymbol } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  // ---------------- FETCH APPOINTMENTS ---------------- 
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/user/appointments',
        { headers: { token } }
      )

      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // ---------------- OPEN CANCEL DIALOG ---------------- 
  const openCancelDialog = (appointmentId) => {
    setSelectedAppointmentId(appointmentId)
    setShowCancelDialog(true)
  }

  // ---------------- CANCEL APPOINTMENT ---------------- 
  const cancelAppointment = async () => {
    try {
      setCancelling(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId: selectedAppointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await getUserAppointments()
        await getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
      setSelectedAppointmentId(null)
    }
  }

  //---------------- CLOSE DIALOG ---------------- 
  const closeCancelDialog = () => {
    setShowCancelDialog(false)
    setSelectedAppointmentId(null)
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  // ---------------- STATUS BADGE ---------------- 
  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '✓',
        label: 'Confirmed'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '✕',
        label: 'Cancelled'
      },
      expired: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: '⏱',
        label: 'Expired'
      }
    }

    const config = statusConfig[status] || statusConfig.confirmed

    return (
      <span className={`${config.bg} ${config.text} ${config.border} border-2 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 w-fit`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    )
  }

  // ---------------- UI ---------------- 
  return (
    <div className='py-8'>
    
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          My Appointments
        </h1>
        <p className='text-gray-600'>
          Manage and track your upcoming medical consultations
        </p>
      </div>

      
      {appointments.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-2xl shadow-md'>
          <div className='text-6xl mb-4'>📅</div>
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Appointments Yet</h3>
          <p className='text-gray-500 mb-6'>Start booking appointments with our specialists</p>
          <button 
            onClick={() => navigate('/doctors')}
            className='bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all'
          >
            Browse Doctors
          </button>
        </div>
      ) : (
        <div className='space-y-6'>
          {appointments.map((item, index) => (
            <div
              key={index}
              className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300'
            >
              <div className='flex flex-col lg:flex-row'>
                
                <div className='lg:w-48 flex-shrink-0'>
                  <img 
                    className='w-full h-full object-cover bg-primary' 
                    src={item.docData.image} 
                    alt={item.docData.name} 
                  />
                </div>

               
                <div className='flex-1 p-6'>
                  <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4'>
                    <div>
                      <h3 className='text-xl font-bold text-gray-900 mb-2'>
                        {item.docData.name}
                      </h3>
                      <span className='inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold'>
                        {item.docData.speciality}
                      </span>
                    </div>
                    
                    
                    <div>
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                    
                    <div className='flex items-start gap-3'>
                      <div className='bg-blue-100 p-2 rounded-lg'>
                        <span className='text-xl'>📅</span>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Date & Time</p>
                        <p className='text-sm font-bold text-gray-900'>
                          {slotDateFormat(item.slotDate)}
                        </p>
                        <p className='text-sm text-gray-700'>
                          {item.slotTime}
                        </p>
                      </div>
                    </div>

                   
                    <div className='flex items-start gap-3'>
                      <div className='bg-purple-100 p-2 rounded-lg'>
                        <span className='text-xl'>📍</span>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Location</p>
                        <p className='text-sm text-gray-700'>{item.docData.address.line1}</p>
                        <p className='text-sm text-gray-700'>{item.docData.address.line2}</p>
                      </div>
                    </div>
                  </div>

                 
                  <div className='flex items-center gap-2 pt-4 border-t border-gray-200'>
                    <span className='text-gray-600 font-medium'>Consultation Fee:</span>
                    <span className='text-lg font-bold text-primary'>
                      {currencySymbol}{item.docData.fees}
                    </span>
                  </div>
                </div>

                
                <div className='lg:w-56 flex-shrink-0 p-6 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-100'>
                  <div className='flex flex-col gap-3 h-full justify-center'>
                    
                    <button 
                      className='w-full bg-white border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2'
                    >
                      <span>👁️</span>
                      View Details
                    </button>

                    
                    {item.status === 'confirmed' && (
                      <button
                        onClick={() => openCancelDialog(item._id)}
                        className='w-full bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg'
                      >
                        <span>✕</span>
                        Cancel Appointment
                      </button>
                    )}

                    
                    {item.status === 'confirmed' && (
                      <button
                        className='w-full bg-primary/10 text-primary border-2 border-primary/20 px-4 py-3 rounded-lg font-semibold hover:bg-primary/20 transition-all flex items-center justify-center gap-2'
                      >
                        <span>🔄</span>
                        Reschedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-3xl'>⚠️</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Cancel Appointment?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to cancel this appointment? The slot will be released and available for others to book.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeCancelDialog}
                disabled={cancelling}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                No, Keep It
              </button>
              <button
                onClick={cancelAppointment}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {cancelling ? (
                  <span className='flex items-center justify-center gap-2'>
                    <span className='animate-spin'>⏳</span>
                    Cancelling...
                  </span>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments*/




/*import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, currencySymbol } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  // Get day, month, year separately for calendar display
  const getDateParts = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return {
      day,
      month: months[Number(month) - 1],
      fullMonth: fullMonths[Number(month) - 1],
      year
    }
  }

  // ---------------- FETCH APPOINTMENTS ---------------- 
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/user/appointments',
        { headers: { token } }
      )

      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // ---------------- OPEN CANCEL DIALOG ---------------- 
  const openCancelDialog = (appointmentId) => {
    setSelectedAppointmentId(appointmentId)
    setShowCancelDialog(true)
  }

  //---------------- CANCEL APPOINTMENT ---------------- 
  const cancelAppointment = async () => {
    try {
      setCancelling(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId: selectedAppointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await getUserAppointments()
        await getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
      setSelectedAppointmentId(null)
    }
  }

  // ---------------- CLOSE DIALOG ---------------- 
  const closeCancelDialog = () => {
    setShowCancelDialog(false)
    setSelectedAppointmentId(null)
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  // ---------------- STATUS BADGE ---------------- 
  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '✓',
        label: 'Confirmed'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '✕',
        label: 'Cancelled'
      },
      expired: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: '⏱',
        label: 'Expired'
      }
    }

    const config = statusConfig[status] || statusConfig.confirmed

    return (
      <span className={`${config.bg} ${config.text} ${config.border} border px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    )
  }

  // ---------------- UI ---------------- 
  return (
    <div className='py-8 px-4 max-w-6xl mx-auto'>
    
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          My Appointments
        </h1>
        <p className='text-gray-600'>
          Manage and track your upcoming medical consultations
        </p>
      </div>

      
      {appointments.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-2xl shadow-md'>
          <div className='text-6xl mb-4'>📅</div>
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Appointments Yet</h3>
          <p className='text-gray-500 mb-6'>Start booking appointments with our specialists</p>
          <button 
            onClick={() => navigate('/doctors')}
            className='bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all'
          >
            Browse Doctors
          </button>
        </div>
      ) : (
        <div className='space-y-5'>
          {appointments.map((item, index) => {
            const dateParts = getDateParts(item.slotDate)
            
            return (
              <div
                key={index}
                className='bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300'
              >
                <div className='flex flex-col sm:flex-row'>
                  
                  
                  <div className='sm:w-32 flex-shrink-0 bg-gradient-to-br from-gray-200 to-gray-400 text-primary p-4 flex flex-col items-center justify-center'>
                    <span className='text-sm font-medium opacity-90'>{dateParts.month}</span>
                    <span className='text-4xl font-bold leading-none my-1'>{dateParts.day}</span>
                    <span className='text-sm opacity-90'>{dateParts.year}</span>
                    <div className='mt-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full'>
                      <span className='text-sm font-semibold'>{item.slotTime}</span>
                    </div>
                  </div>

                  
                  <div className='sm:w-40 flex-shrink-0 bg-gray-100'>
                    <img 
                      className='w-full h-full object-cover min-h-[160px] bg-primary' 
                      src={item.docData.image} 
                      alt={item.docData.name} 
                    />
                  </div>

                
                  <div className='flex-1 p-5'>
                    <div className='flex flex-wrap items-start justify-between gap-3 mb-3'>
                      <div>
                        <h3 className='text-lg font-bold text-gray-900'>
                          {item.docData.name}
                        </h3>
                        <span className='inline-block bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1'>
                          {item.docData.speciality}
                        </span>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                  
                    <div className='flex flex-wrap gap-4 text-sm text-gray-600 mb-4'>
                      <div className='flex items-center gap-2'>
                        <span className='text-lg'>🕐</span>
                        <span>
                          <span className='font-medium text-gray-800'>{item.slotTime}</span>
                          <span className='mx-1'>•</span>
                          <span>{slotDateFormat(item.slotDate)}</span>
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-lg'>💰</span>
                        <span>
                          <span className='font-bold text-primary'>{currencySymbol}{item.docData.fees}</span>
                        </span>
                      </div>
                    </div>

                
                    <div className='flex flex-wrap gap-2 pt-3 border-t border-gray-100'>
                      <button 
                        className='bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all flex items-center gap-1.5'
                      >
                        <span>👁️</span>
                        View Details
                      </button>

                      {item.status === 'confirmed' && (
                        <>
                          <button
                            className='bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-all flex items-center gap-1.5'
                          >
                            <span>🔄</span>
                            Reschedule
                          </button>
                          <button
                            onClick={() => openCancelDialog(item._id)}
                            className='bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-all flex items-center gap-1.5 ml-auto'
                          >
                            <span>✕</span>
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-3xl'>⚠️</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Cancel Appointment?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to cancel this appointment? The slot will be released and available for others to book.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeCancelDialog}
                disabled={cancelling}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                No, Keep It
              </button>
              <button
                onClick={cancelAppointment}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {cancelling ? (
                  <span className='flex items-center justify-center gap-2'>
                    <span className='animate-spin'>⏳</span>
                    Cancelling...
                  </span>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments*/




/*import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, currencySymbol } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  // ---------------- FETCH APPOINTMENTS ---------------- 
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/user/appointments',
        { headers: { token } }
      )

      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // ---------------- OPEN CANCEL DIALOG ---------------- 
  const openCancelDialog = (appointmentId) => {
    setSelectedAppointmentId(appointmentId)
    setShowCancelDialog(true)
  }

  // ---------------- CANCEL APPOINTMENT ---------------- 
  const cancelAppointment = async () => {
    try {
      setCancelling(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId: selectedAppointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await getUserAppointments()
        await getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
      setSelectedAppointmentId(null)
    }
  }

  //---------------- CLOSE DIALOG ---------------- 
  const closeCancelDialog = () => {
    setShowCancelDialog(false)
    setSelectedAppointmentId(null)
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  // ---------------- STATUS BADGE ---------------- 
  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '✓',
        label: 'Confirmed'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '✕',
        label: 'Cancelled'
      },
      expired: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: '⏱',
        label: 'Expired'
      }
    }

    const config = statusConfig[status] || statusConfig.confirmed

    return (
      <span className={`${config.bg} ${config.text} ${config.border} border-2 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 w-fit`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    )
  }

  // ---------------- UI ---------------- 
  return (
    <div className='py-8'>
    
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          My Appointments
        </h1>
        <p className='text-gray-600'>
          Manage and track your upcoming medical consultations
        </p>
      </div>

      
      {appointments.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-2xl shadow-md'>
          <div className='text-6xl mb-4'>📅</div>
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Appointments Yet</h3>
          <p className='text-gray-500 mb-6'>Start booking appointments with our specialists</p>
          <button 
            onClick={() => navigate('/doctors')}
            className='bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all'
          >
            Browse Doctors
          </button>
        </div>
      ) : (
        <div className='space-y-6'>
          {appointments.map((item, index) => (
            <div
              key={index}
              className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 relative'
            >
       
              <div className='absolute top-4 right-4 z-10'>
                {getStatusBadge(item.status)}
              </div>

              <div className='flex flex-col lg:flex-row'>
                
                <div className='lg:w-48 flex-shrink-0'>
                  <img 
                    className='w-full h-full object-cover bg-primary' 
                    src={item.docData.image} 
                    alt={item.docData.name} 
                  />
                </div>

               
                <div className='flex-1 p-6'>
                  <div className='mb-4 pr-36'>
                    <h3 className='text-xl font-bold text-gray-900 mb-2'>
                      {item.docData.name}
                    </h3>
                    <span className='inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold'>
                      {item.docData.speciality}
                    </span>
                  </div>

                  
                  <div className='flex items-start gap-3 mb-4'>
                    <div className='bg-blue-100 p-2 rounded-lg'>
                      <span className='text-xl'>📅</span>
                    </div>
                    <div className='flex flex-wrap items-center gap-x-6 gap-y-1'>
                      <div>
                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Date</p>
                        <p className='text-sm font-bold text-gray-900'>
                          {slotDateFormat(item.slotDate)}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Time</p>
                        <p className='text-sm font-bold text-gray-900'>
                          {item.slotTime}
                        </p>
                      </div>
                    </div>
                  </div>

                 
                  <div className='flex items-center gap-2 pt-4 border-t border-gray-200'>
                    <span className='text-gray-600 font-medium'>Consultation Fee:</span>
                    <span className='text-lg font-bold text-primary'>
                      {currencySymbol}{item.docData.fees}
                    </span>
                  </div>
                </div>

                
                <div className='lg:w-56 flex-shrink-0 p-6 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-100'>
                  <div className='flex flex-col gap-3 h-full justify-center'>
                    
                    <button 
                      className='w-full bg-white border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2'
                    >
                      <span>👁️</span>
                      View Details
                    </button>

                    
                    {item.status === 'confirmed' && (
                      <button
                        onClick={() => openCancelDialog(item._id)}
                        className='w-full bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg'
                      >
                        <span>✕</span>
                        Cancel Appointment
                      </button>
                    )}

                    
                    {item.status === 'confirmed' && (
                      <button
                        className='w-full bg-primary/10 text-primary border-2 border-primary/20 px-4 py-3 rounded-lg font-semibold hover:bg-primary/20 transition-all flex items-center justify-center gap-2'
                      >
                        <span>🔄</span>
                        Reschedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-3xl'>⚠️</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Cancel Appointment?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to cancel this appointment? The slot will be released and available for others to book.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeCancelDialog}
                disabled={cancelling}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                No, Keep It
              </button>
              <button
                onClick={cancelAppointment}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {cancelling ? (
                  <span className='flex items-center justify-center gap-2'>
                    <span className='animate-spin'>⏳</span>
                    Cancelling...
                  </span>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments*/



/*import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, currencySymbol } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  // ---------------- FETCH APPOINTMENTS ---------------- 
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/user/appointments',
        { headers: { token } }
      )

      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // ---------------- OPEN CANCEL DIALOG ---------------- 
  const openCancelDialog = (appointmentId) => {
    setSelectedAppointmentId(appointmentId)
    setShowCancelDialog(true)
  }

  // ---------------- CANCEL APPOINTMENT ---------------- 
  const cancelAppointment = async () => {
    try {
      setCancelling(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId: selectedAppointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await getUserAppointments()
        await getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
      setSelectedAppointmentId(null)
    }
  }

  //---------------- CLOSE DIALOG ---------------- 
  const closeCancelDialog = () => {
    setShowCancelDialog(false)
    setSelectedAppointmentId(null)
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  // ---------------- STATUS BADGE ---------------- 
  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '✓',
        label: 'Confirmed'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '✕',
        label: 'Cancelled'
      },
      expired: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: '⏱',
        label: 'Expired'
      }
    }

    const config = statusConfig[status] || statusConfig.confirmed

    return (
      <span className={`${config.bg} ${config.text} ${config.border} border-2 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 w-fit`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    )
  }

  // ---------------- UI ---------------- 
  return (
    <div className='py-8'>
    
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          My Appointments
        </h1>
        <p className='text-gray-600'>
          Manage and track your upcoming medical consultations
        </p>
      </div>

      
      {appointments.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-2xl shadow-md'>
          <div className='text-6xl mb-4'>📅</div>
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Appointments Yet</h3>
          <p className='text-gray-500 mb-6'>Start booking appointments with our specialists</p>
          <button 
            onClick={() => navigate('/doctors')}
            className='bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all'
          >
            Browse Doctors
          </button>
        </div>
      ) : (
        <div className='space-y-6'>
          {appointments.map((item, index) => (
            <div
              key={index}
              className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 relative'
            >
       
              
              {item.status !== 'confirmed' && (
                <div className='absolute top-4 right-4 z-10'>
                  {getStatusBadge(item.status)}
                </div>
              )}

              <div className='flex flex-col lg:flex-row'>
                
                <div className='lg:w-48 flex-shrink-0'>
                  <img 
                    className='w-full h-full object-cover bg-primary' 
                    src={item.docData.image} 
                    alt={item.docData.name} 
                  />
                </div>

               
                <div className='flex-1 p-6'>
                  <div className='mb-4 pr-36'>
                    <h3 className='text-xl font-bold text-gray-900 mb-2'>
                      {item.docData.name}
                    </h3>
                    <span className='inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold'>
                      {item.docData.speciality}
                    </span>
                  </div>

                  
                  <div className='flex items-start gap-3 mb-4'>
                    <div className='bg-blue-100 p-2 rounded-lg'>
                      <span className='text-xl'>📅</span>
                    </div>
                    <div className='flex flex-wrap items-center gap-x-6 gap-y-1'>
                      <div>
                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Date</p>
                        <p className='text-sm font-bold text-gray-900'>
                          {slotDateFormat(item.slotDate)}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Time</p>
                        <p className='text-sm font-bold text-gray-900'>
                          {item.slotTime}
                        </p>
                      </div>
                    </div>
                  </div>

                 
                  <div className='flex items-center gap-2 pt-4 border-t border-gray-200'>
                    <span className='text-gray-600 font-medium'>Consultation Fee:</span>
                    <span className='text-lg font-bold text-primary'>
                      {currencySymbol}{item.docData.fees}
                    </span>
                  </div>
                </div>

                
                <div className='lg:w-56 flex-shrink-0 p-6 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-100'>
                  <div className='flex flex-col gap-3 h-full justify-center'>
                    
                   
                    {item.status === 'confirmed' ? (
                      <>
                        
                        <div className='flex gap-2'>
                          <button 
                            className='flex-1 bg-white border-2 border-gray-300 text-gray-700 px-2 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-1 text-sm'
                          >
                            <span>👁️</span>
                            View
                          </button>
                          <button
                            onClick={() => openCancelDialog(item._id)}
                            className='flex-1 bg-red-500 text-white px-2 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-1 shadow-md hover:shadow-lg text-sm'
                          >
                            <span>✕</span>
                            Cancel
                          </button>
                        </div>
                        
                       
                        <button
                          className='w-full bg-primary/10 text-primary border-2 border-primary/20 px-4 py-3 rounded-lg font-semibold hover:bg-primary/20 transition-all flex items-center justify-center gap-2'
                        >
                          <span>🔄</span>
                          Reschedule
                        </button>
                      </>
                    ) : (
                      // Cancelled/Expired: Only View Details button 
                      <button 
                        className='w-full bg-white border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2'
                      >
                        <span>👁️</span>
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-3xl'>⚠️</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Cancel Appointment?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to cancel this appointment? The slot will be released and available for others to book.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeCancelDialog}
                disabled={cancelling}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                No, Keep It
              </button>
              <button
                onClick={cancelAppointment}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {cancelling ? (
                  <span className='flex items-center justify-center gap-2'>
                    <span className='animate-spin'>⏳</span>
                    Cancelling...
                  </span>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments*/




/*import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, currencySymbol } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  // ---------------- FETCH APPOINTMENTS ---------------- 
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/user/appointments',
        { headers: { token } }
      )

      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // ---------------- OPEN CANCEL DIALOG ---------------- 
  const openCancelDialog = (appointmentId) => {
    setSelectedAppointmentId(appointmentId)
    setShowCancelDialog(true)
  }

  // ---------------- CANCEL APPOINTMENT ---------------- 
  const cancelAppointment = async () => {
    try {
      setCancelling(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId: selectedAppointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await getUserAppointments()
        await getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
      setSelectedAppointmentId(null)
    }
  }

  //---------------- CLOSE DIALOG ---------------- 
  const closeCancelDialog = () => {
    setShowCancelDialog(false)
    setSelectedAppointmentId(null)
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  // ---------------- STATUS BADGE ---------------- 
  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '✓',
        label: 'Confirmed'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '✕',
        label: 'Cancelled'
      },
      expired: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: '⏱',
        label: 'Expired'
      }
    }

    const config = statusConfig[status] || statusConfig.confirmed

    return (
      <span className={`${config.bg} ${config.text} ${config.border} border-2 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 w-fit`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    )
  }

  // ---------------- UI ---------------- 
  return (
    <div className='py-8'>
    
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          My Appointments
        </h1>
        <p className='text-gray-600'>
          Manage and track your upcoming medical consultations
        </p>
      </div>

      
      {appointments.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-2xl shadow-md'>
          <div className='text-6xl mb-4'>📅</div>
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Appointments Yet</h3>
          <p className='text-gray-500 mb-6'>Start booking appointments with our specialists</p>
          <button 
            onClick={() => navigate('/doctors')}
            className='bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all'
          >
            Browse Doctors
          </button>
        </div>
      ) : (
        <div className='space-y-6'>
          {appointments.map((item, index) => (
            <div
              key={index}
              className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 relative'
            >
       
              
              <div className='absolute top-4 right-4 z-10'>
                {getStatusBadge(item.status)}
              </div>

              <div className='flex flex-col lg:flex-row'>
                
                <div className='lg:w-48 flex-shrink-0'>
                  <img 
                    className='w-full h-full object-cover bg-primary' 
                    src={item.docData.image} 
                    alt={item.docData.name} 
                  />
                </div>

               
                <div className='flex-1 p-6'>
                  <div className='mb-4 pr-36'>
                    <h3 className='text-xl font-bold text-gray-900 mb-2'>
                      {item.docData.name}
                    </h3>
                    <span className='inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold'>
                      {item.docData.speciality}
                    </span>
                  </div>

                  
                  <div className='flex items-start gap-3 mb-4'>
                    <div className='bg-blue-100 p-2 rounded-lg'>
                      <span className='text-xl'>📅</span>
                    </div>
                    <div className='flex flex-wrap items-center gap-x-6 gap-y-1'>
                      <div>
                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Date</p>
                        <p className='text-sm font-bold text-gray-900'>
                          {slotDateFormat(item.slotDate)}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Time</p>
                        <p className='text-sm font-bold text-gray-900'>
                          {item.slotTime}
                        </p>
                      </div>
                    </div>
                  </div>

                 
                  <div className='flex items-center gap-2 pt-4 border-t border-gray-200'>
                    <span className='text-gray-600 font-medium'>Consultation Fee:</span>
                    <span className='text-lg font-bold text-primary'>
                      {currencySymbol}{item.docData.fees}
                    </span>
                  </div>
                </div>

                
                <div className='lg:w-56 flex-shrink-0 p-6 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-100'>
                  <div className='flex flex-col gap-3 h-full justify-center'>
                    
              
                    {item.status === 'confirmed' ? (
                      <>
                      
                        <div className='flex gap-2 mt-10'>
                          <button 
                            className='flex-1 bg-white border-2 border-gray-300 text-gray-700 px-2 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-1 text-sm'
                          >
                            <span>👁️</span>
                            View
                          </button>
                          <button
                            onClick={() => openCancelDialog(item._id)}
                            className='flex-1 bg-red-500 text-white px-2 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-1 shadow-md hover:shadow-lg text-sm'
                          >
                            <span>✕</span>
                            Cancel
                          </button>
                        </div>
                        
                   
                        <button
                          className='w-full mt-2 bg-primary/10 text-primary border-2 border-primary/20 px-4 py-3 rounded-lg font-semibold hover:bg-primary/20 transition-all flex items-center justify-center gap-2'
                        >
                          <span>🔄</span>
                          Reschedule
                        </button>
                      </>
                    ) : (
                      // Cancelled/Expired: Only View Details button 
                      <button 
                        className='w-full bg-white border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2'
                      >
                        <span>👁️</span>
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-3xl'>⚠️</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Cancel Appointment?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to cancel this appointment? The slot will be released and available for others to book.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeCancelDialog}
                disabled={cancelling}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                No, Keep It
              </button>
              <button
                onClick={cancelAppointment}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {cancelling ? (
                  <span className='flex items-center justify-center gap-2'>
                    <span className='animate-spin'>⏳</span>
                    Cancelling...
                  </span>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments*/



/*import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, currencySymbol } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  // ---------------- FETCH APPOINTMENTS ---------------- 
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/user/appointments',
        { headers: { token } }
      )

      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // ---------------- OPEN CANCEL DIALOG ---------------- 
  const openCancelDialog = (appointmentId) => {
    setSelectedAppointmentId(appointmentId)
    setShowCancelDialog(true)
  }

  // ---------------- CANCEL APPOINTMENT ---------------- 
  const cancelAppointment = async () => {
    try {
      setCancelling(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId: selectedAppointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await getUserAppointments()
        await getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
      setSelectedAppointmentId(null)
    }
  }

  //---------------- CLOSE DIALOG ---------------- 
  const closeCancelDialog = () => {
    setShowCancelDialog(false)
    setSelectedAppointmentId(null)
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  // ---------------- STATUS BADGE ---------------- 
  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '✓',
        label: 'Confirmed'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '✕',
        label: 'Cancelled'
      },
      expired: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: '⏱',
        label: 'Expired'
      }
    }

    const config = statusConfig[status] || statusConfig.confirmed

    return (
      <span className={`${config.bg} ${config.text} ${config.border} border-2 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 w-fit`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    )
  }

  // ---------------- UI ---------------- 
  return (
    <div className='py-8'>

      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          My Appointments
        </h1>
        <p className='text-gray-600'>
          Manage and track your upcoming medical consultations
        </p>
      </div>

     
      {appointments.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-2xl shadow-md'>
          <div className='text-6xl mb-4'>📅</div>
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Appointments Yet</h3>
          <p className='text-gray-500 mb-6'>Start booking appointments with our specialists</p>
          <button 
            onClick={() => navigate('/doctors')}
            className='bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all'
          >
            Browse Doctors
          </button>
        </div>
      ) : (
        <div className='space-y-6'>
          {appointments.map((item, index) => (
            <div
              key={index}
              className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300'
            >
              <div className='flex flex-col lg:flex-row'>
           
                <div className='lg:w-48 flex-shrink-0'>
                  <img 
                    className='w-full h-full object-cover' 
                    src={item.docData.image} 
                    alt={item.docData.name} 
                  />
                </div>

             
                <div className='flex-1 p-6'>
                  <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4'>
                    <div>
                      <h3 className='text-xl font-bold text-gray-900 mb-2'>
                        {item.docData.name}
                      </h3>
                      <span className='inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold'>
                        {item.docData.speciality}
                      </span>
                    </div>
                    
                 
                    <div>
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

             
                  <div className='flex items-start gap-3 mb-4'>
                    <div className='bg-blue-100 p-3 rounded-xl'>
                      <span className='text-2xl'>📅</span>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500 font-medium uppercase tracking-wide mb-1'>Appointment Scheduled</p>
                      <p className='text-lg font-bold text-gray-900'>
                        {slotDateFormat(item.slotDate)}
                      </p>
                      <p className='text-base font-semibold text-primary mt-1'>
                        {item.slotTime}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 pt-4 border-t border-gray-200'>
                    <span className='text-gray-600 font-medium'>Consultation Fee:</span>
                    <span className='text-lg font-bold text-primary'>
                      {currencySymbol}{item.docData.fees}
                    </span>
                  </div>
                </div>

                
                <div className='lg:w-56 flex-shrink-0 p-6 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-100'>
                  <div className='flex flex-col gap-3 h-full justify-center'>
            
                    <button 
                      className='w-full bg-white border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2'
                    >
                      <span>👁️</span>
                      View Details
                    </button>

                   
                    {item.status === 'confirmed' && (
                      <button
                        onClick={() => openCancelDialog(item._id)}
                        className='w-full bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg'
                      >
                        <span>✕</span>
                        Cancel Appointment
                      </button>
                    )}

                  
                    {item.status === 'confirmed' && (
                      <button
                        className='w-full bg-primary/10 text-primary border-2 border-primary/20 px-4 py-3 rounded-lg font-semibold hover:bg-primary/20 transition-all flex items-center justify-center gap-2'
                      >
                        <span>🔄</span>
                        Reschedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-3xl'>⚠️</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Cancel Appointment?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to cancel this appointment? The slot will be released and available for others to book.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeCancelDialog}
                disabled={cancelling}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                No, Keep It
              </button>
              <button
                onClick={cancelAppointment}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {cancelling ? (
                  <span className='flex items-center justify-center gap-2'>
                    <span className='animate-spin'>⏳</span>
                    Cancelling...
                  </span>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments*/



/*import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, currencySymbol } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  // ---------------- FETCH APPOINTMENTS ---------------- 
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/user/appointments',
        { headers: { token } }
      )

      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // ---------------- OPEN CANCEL DIALOG ---------------- 
  const openCancelDialog = (appointmentId) => {
    setSelectedAppointmentId(appointmentId)
    setShowCancelDialog(true)
  }

  // ---------------- CANCEL APPOINTMENT ---------------- 
  const cancelAppointment = async () => {
    try {
      setCancelling(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId: selectedAppointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await getUserAppointments()
        await getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
      setSelectedAppointmentId(null)
    }
  }

  // ---------------- CLOSE DIALOG ---------------- 
  const closeCancelDialog = () => {
    setShowCancelDialog(false)
    setSelectedAppointmentId(null)
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  // ---------------- STATUS BADGE ---------------- 
  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '✓',
        label: 'Confirmed'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '✕',
        label: 'Cancelled'
      },
      expired: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: '⏱',
        label: 'Expired'
      }
    }

    const config = statusConfig[status] || statusConfig.confirmed

    return (
      <span className={`${config.bg} ${config.text} ${config.border} border-2 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 w-fit`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    )
  }

  // ---------------- UI ---------------- 
  return (
    <div className='py-8'>
     
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          My Appointments
        </h1>
        <p className='text-gray-600'>
          Manage and track your upcoming medical consultations
        </p>
      </div>

      
      {appointments.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-2xl shadow-md'>
          <div className='text-6xl mb-4'>📅</div>
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Appointments Yet</h3>
          <p className='text-gray-500 mb-6'>Start booking appointments with our specialists</p>
          <button 
            onClick={() => navigate('/doctors')}
            className='bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all'
          >
            Browse Doctors
          </button>
        </div>
      ) : (
        <div className='space-y-6'>
          {appointments.map((item, index) => (
            <div
              key={index}
              className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300'
            >
              <div className='flex flex-col lg:flex-row'>
               
                <div className='lg:w-48 flex-shrink-0'>
                  <img 
                    className='w-full h-full object-cover bg-primary' 
                    src={item.docData.image} 
                    alt={item.docData.name} 
                  />
                </div>

                
                <div className='flex-1 p-6'>
                  <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4'>
                    <div>
                      <h3 className='text-xl font-bold text-gray-900 mb-2'>
                        {item.docData.name}
                      </h3>
                      <span className='inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold'>
                        {item.docData.speciality}
                      </span>
                    </div>
                    
                  
                    <div>
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  
                  <div className='flex items-start gap-3 mb-4'>
                    <div className='bg-blue-100 p-3 rounded-xl'>
                      <span className='text-2xl'>📅</span>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500 font-medium uppercase tracking-wide mb-1'>Appointment Scheduled</p>
                      <div className='flex items-center gap-3'>
                        <p className='text-lg font-bold text-gray-900'>
                          {slotDateFormat(item.slotDate)}
                        </p>
                        <span className='text-gray-400'>|</span>
                        <p className='text-base font-semibold text-primary'>
                          {item.slotTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 pt-4 border-t border-gray-200'>
                    <span className='text-gray-600 font-medium'>Consultation Fee:</span>
                    <span className='text-lg font-bold text-primary'>
                      {currencySymbol}{item.docData.fees}
                    </span>
                  </div>
                </div>

               
                <div className='lg:w-56 flex-shrink-0 p-6 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-100'>
                  <div className='flex flex-col gap-3 h-full justify-center'>
                 
                    <button 
                      className='w-full bg-white border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2'
                    >
                      <span>👁️</span>
                      View Details
                    </button>

                    
                    {item.status === 'confirmed' && (
                      <button
                        onClick={() => openCancelDialog(item._id)}
                        className='w-full bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg'
                      >
                        <span>✕</span>
                        Cancel Appointment
                      </button>
                    )}

                    
                    {item.status === 'confirmed' && (
                      <button
                        className='w-full bg-primary/10 text-primary border-2 border-primary/20 px-4 py-3 rounded-lg font-semibold hover:bg-primary/20 transition-all flex items-center justify-center gap-2'
                      >
                        <span>🔄</span>
                        Reschedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-3xl'>⚠️</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Cancel Appointment?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to cancel this appointment? The slot will be released and available for others to book.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeCancelDialog}
                disabled={cancelling}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                No, Keep It
              </button>
              <button
                onClick={cancelAppointment}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {cancelling ? (
                  <span className='flex items-center justify-center gap-2'>
                    <span className='animate-spin'>⏳</span>
                    Cancelling...
                  </span>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments*/



/*import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import RescheduleModal from '../components/RescheduleModal'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, currencySymbol } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  // ---------------- FETCH APPOINTMENTS ---------------- 
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/user/appointments',
        { headers: { token } }
      )

      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  /---------------- OPEN CANCEL DIALOG ---------------- 
  const openCancelDialog = (appointmentId) => {
    setSelectedAppointmentId(appointmentId)
    setShowCancelDialog(true)
  }

  /---------------- CANCEL APPOINTMENT ---------------- 
  const cancelAppointment = async () => {
    try {
      setCancelling(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId: selectedAppointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await getUserAppointments()
        await getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
      setSelectedAppointmentId(null)
    }
  }

  / ---------------- CLOSE DIALOG ---------------- 
  const closeCancelDialog = () => {
    setShowCancelDialog(false)
    setSelectedAppointmentId(null)
  }

  / ---------------- OPEN RESCHEDULE MODAL ---------------- 
  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment)
    setShowRescheduleModal(true)
  }

  / ---------------- CLOSE RESCHEDULE MODAL ---------------- 
  const closeRescheduleModal = () => {
    setShowRescheduleModal(false)
    setSelectedAppointment(null)
  }

  / ---------------- RESCHEDULE SUCCESS ---------------- 
  const handleRescheduleSuccess = async () => {
    await getUserAppointments()
    await getDoctorsData()
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  / ---------------- STATUS BADGE ---------------- 
  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '✓',
        label: 'Confirmed'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '✕',
        label: 'Cancelled'
      },
      expired: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: '⏱',
        label: 'Expired'
      }
    }

    const config = statusConfig[status] || statusConfig.confirmed

    return (
      <span className={`${config.bg} ${config.text} ${config.border} border-2 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 w-fit`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    )
  }

  /---------------- UI ---------------- 
  return (
    <div className='py-8'>
      
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          My Appointments
        </h1>
        <p className='text-gray-600'>
          Manage and track your upcoming medical consultations
        </p>
      </div>

      
      {appointments.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-2xl shadow-md'>
          <div className='text-6xl mb-4'>📅</div>
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Appointments Yet</h3>
          <p className='text-gray-500 mb-6'>Start booking appointments with our specialists</p>
          <button 
            onClick={() => navigate('/doctors')}
            className='bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all'
          >
            Browse Doctors
          </button>
        </div>
      ) : (
        <div className='space-y-6'>
          {appointments.map((item, index) => (
            <div
              key={index}
              className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300'
            >
              <div className='flex flex-col lg:flex-row'>
              
                <div className='lg:w-48 flex-shrink-0'>
                  <img 
                    className='w-full h-full object-cover bg-primary' 
                    src={item.docData.image} 
                    alt={item.docData.name} 
                  />
                </div>

                
                <div className='flex-1 p-6'>
                  <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4'>
                    <div>
                      <h3 className='text-xl font-bold text-gray-900 mb-2'>
                        {item.docData.name}
                      </h3>
                      <span className='inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold'>
                        {item.docData.speciality}
                      </span>
                    </div>
                    
                    
                    <div>
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                 
                  <div className='flex items-start gap-3 mb-4'>
                    <div className='bg-blue-100 p-3 rounded-xl'>
                      <span className='text-2xl'>📅</span>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500 font-medium uppercase tracking-wide mb-1'>Appointment Scheduled</p>
                      <div className='flex items-center gap-3'>
                        <p className='text-lg font-bold text-gray-900'>
                          {slotDateFormat(item.slotDate)}
                        </p>
                        <span className='text-gray-400'>|</span>
                        <p className='text-base font-semibold text-primary'>
                          {item.slotTime}
                        </p>
                      </div>
                    </div>
                  </div>

              
                  <div className='flex items-center gap-2 pt-4 border-t border-gray-200'>
                    <span className='text-gray-600 font-medium'>Consultation Fee:</span>
                    <span className='text-lg font-bold text-primary'>
                      {currencySymbol}{item.docData.fees}
                    </span>
                  </div>
                </div>

                <div className='lg:w-56 flex-shrink-0 p-6 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-100'>
                  <div className='flex flex-col gap-3 h-full justify-center'>
                    
                    <button 
                      className='w-full bg-white border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2'
                    >
                      <span>👁️</span>
                      View Details
                    </button>

                   
                    {item.status === 'confirmed' && (
                      <button
                        onClick={() => openCancelDialog(item._id)}
                        className='w-full bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg'
                      >
                        <span>✕</span>
                        Cancel Appointment
                      </button>
                    )}

                    
                    {item.status === 'confirmed' && (
                      <button
                        onClick={() => openRescheduleModal(item)}
                        className='w-full bg-primary/10 text-primary border-2 border-primary/20 px-4 py-3 rounded-lg font-semibold hover:bg-primary/20 transition-all flex items-center justify-center gap-2'
                      >
                        <span>🔄</span>
                        Reschedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-3xl'>⚠️</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Cancel Appointment?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to cancel this appointment? The slot will be released and available for others to book.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeCancelDialog}
                disabled={cancelling}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                No, Keep It
              </button>
              <button
                onClick={cancelAppointment}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {cancelling ? (
                  <span className='flex items-center justify-center gap-2'>
                    <span className='animate-spin'>⏳</span>
                    Cancelling...
                  </span>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showRescheduleModal && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          onClose={closeRescheduleModal}
          onSuccess={handleRescheduleSuccess}
        />
      )}
    </div>
  )
}

export default MyAppointments*/


/*import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import RescheduleModal from '../components/RescheduleModal'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, currencySymbol } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [showRescheduleConfirm, setShowRescheduleConfirm] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  // ---------------- FETCH APPOINTMENTS ---------------- 
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/user/appointments',
        { headers: { token } }
      )

      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // ---------------- OPEN CANCEL DIALOG ---------------- 
  const openCancelDialog = (appointmentId) => {
    setSelectedAppointmentId(appointmentId)
    setShowCancelDialog(true)
  }

  // ---------------- CANCEL APPOINTMENT ---------------- 
  const cancelAppointment = async () => {
    try {
      setCancelling(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId: selectedAppointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await getUserAppointments()
        await getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
      setSelectedAppointmentId(null)
    }
  }

  // ---------------- CLOSE DIALOG ---------------- 
  const closeCancelDialog = () => {
    setShowCancelDialog(false)
    setSelectedAppointmentId(null)
  }

  // ---------------- OPEN RESCHEDULE CONFIRM DIALOG ---------------- 
  const openRescheduleConfirm = (appointment) => {
    setSelectedAppointment(appointment)
    setShowRescheduleConfirm(true)
  }

  // ---------------- CLOSE RESCHEDULE CONFIRM ---------------- 
  const closeRescheduleConfirm = () => {
    setShowRescheduleConfirm(false)
    setSelectedAppointment(null)
  }

  // ---------------- CONFIRM AND OPEN RESCHEDULE MODAL ---------------- 
  const proceedToReschedule = () => {
    setShowRescheduleConfirm(false)
    setShowRescheduleModal(true)
  }

  // ---------------- CLOSE RESCHEDULE MODAL ---------------- 
  const closeRescheduleModal = () => {
    setShowRescheduleModal(false)
    setSelectedAppointment(null)
  }

  // ---------------- RESCHEDULE SUCCESS ---------------- 
  const handleRescheduleSuccess = async () => {
    await getUserAppointments()
    await getDoctorsData()
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  //--------------- STATUS BADGE ---------------- 
  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '✓',
        label: 'Confirmed'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '✕',
        label: 'Cancelled'
      },
      expired: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: '⏱',
        label: 'Expired'
      }
    }

    const config = statusConfig[status] || statusConfig.confirmed

    return (
      <span className={`${config.bg} ${config.text} ${config.border} border-2 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 w-fit`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    )
  }

  // ---------------- UI ---------------- 
  return (
    <div className='py-8'>
      
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          My Appointments
        </h1>
        <p className='text-gray-600'>
          Manage and track your upcoming medical consultations
        </p>
      </div>

     
      {appointments.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-2xl shadow-md'>
          <div className='text-6xl mb-4'>📅</div>
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Appointments Yet</h3>
          <p className='text-gray-500 mb-6'>Start booking appointments with our specialists</p>
          <button 
            onClick={() => navigate('/doctors')}
            className='bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all'
          >
            Browse Doctors
          </button>
        </div>
      ) : (
        <div className='space-y-6'>
          {appointments.map((item, index) => (
            <div
              key={index}
              className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300'
            >
              <div className='flex flex-col lg:flex-row'>
               
                <div className='lg:w-48 flex-shrink-0'>
                  <img 
                    className='w-full h-full object-cover bg-primary' 
                    src={item.docData.image} 
                    alt={item.docData.name} 
                  />
                </div>

               
                <div className='flex-1 p-6'>
                  <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4'>
                    <div>
                      <h3 className='text-xl font-bold text-gray-900 mb-2'>
                        {item.docData.name}
                      </h3>
                      <span className='inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold'>
                        {item.docData.speciality}
                      </span>
                    </div>
                    
                    
                    <div>
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                 
                  <div className='flex items-start gap-3 mb-4'>
                    <div className='bg-blue-100 p-3 rounded-xl'>
                      <span className='text-2xl'>📅</span>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500 font-medium uppercase tracking-wide mb-1'>Appointment Scheduled</p>
                      <div className='flex items-center gap-3'>
                        <p className='text-lg font-bold text-gray-900'>
                          {slotDateFormat(item.slotDate)}
                        </p>
                        <span className='text-gray-400'>|</span>
                        <p className='text-base font-semibold text-primary'>
                          {item.slotTime}
                        </p>
                      </div>
                    </div>
                  </div>

                
                  <div className='flex items-center gap-2 pt-4 border-t border-gray-200'>
                    <span className='text-gray-600 font-medium'>Consultation Fee:</span>
                    <span className='text-lg font-bold text-primary'>
                      {currencySymbol}{item.docData.fees}
                    </span>
                  </div>
                </div>

                
                <div className='lg:w-56 flex-shrink-0 p-6 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-100'>
                  <div className='flex flex-col gap-3 h-full justify-center'>
               
                    <button 
                      className='w-full bg-white border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2'
                    >
                      <span>👁️</span>
                      View Details
                    </button>

                   
                    {item.status === 'confirmed' && (
                      <button
                        onClick={() => openCancelDialog(item._id)}
                        className='w-full bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg'
                      >
                        <span>✕</span>
                        Cancel Appointment
                      </button>
                    )}

                   
                    {item.status === 'confirmed' && (
                      <button
                        onClick={() => openRescheduleConfirm(item)}
                        className='w-full bg-primary/10 text-primary border-2 border-primary/20 px-4 py-3 rounded-lg font-semibold hover:bg-primary/20 transition-all flex items-center justify-center gap-2'
                      >
                        <span>🔄</span>
                        Reschedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

     
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-3xl'>⚠️</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Cancel Appointment?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to cancel this appointment? The slot will be released and available for others to book.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeCancelDialog}
                disabled={cancelling}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                No, Keep It
              </button>
              <button
                onClick={cancelAppointment}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {cancelling ? (
                  <span className='flex items-center justify-center gap-2'>
                    <span className='animate-spin'>⏳</span>
                    Cancelling...
                  </span>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

     
      {showRescheduleConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-3xl'>🔄</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Reschedule Appointment?
              </h3>
              <p className="text-gray-600">
                Do you want to reschedule this appointment? You can choose a new date and time with the same doctor.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeRescheduleConfirm}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                No, Go Back
              </button>
              <button
                onClick={proceedToReschedule}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
              >
                Yes, Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showRescheduleModal && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          onClose={closeRescheduleModal}
          onSuccess={handleRescheduleSuccess}
        />
      )}
    </div>
  )
}

export default MyAppointments*/


import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import RescheduleModal from '../components/RescheduleModal'
import OTPVerificationModal from '../components/OTPVerificationModal'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, currencySymbol } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter & Search states
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Modal states
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false)
  const [showRescheduleConfirmModal, setShowRescheduleConfirmModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)

  // Selected appointment & action
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [otpAction, setOtpAction] = useState(null) // 'cancel' or 'reschedule'
  const [rescheduleData, setRescheduleData] = useState(null) // { slotDate, slotTime }

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  /* ---------------- FETCH APPOINTMENTS ---------------- 
  const getUserAppointments = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(
        backendUrl + '/api/user/appointments',
        { headers: { token } }
      )

      if (data.success) {
        setAppointments(data.appointments.reverse())
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }*/
  /* ---------------- FETCH APPOINTMENTS ---------------- */
  const getUserAppointments = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(
        backendUrl + '/api/user/appointments',
        { headers: { token } }
      )

      if (data.success) {
        // Sort by 'date' field (creation timestamp) - newest first
        const sortedAppointments = data.appointments.sort((a, b) => b.date - a.date)
        setAppointments(sortedAppointments)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  /* ---------------- FILTER APPOINTMENTS ---------------- */
  const getFilteredAppointments = () => {
    let filtered = [...appointments]

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (activeFilter) {
      case 'today':
        filtered = filtered.filter(apt => {
          const [day, month, year] = apt.slotDate.split('_')
          const aptDate = new Date(year, month - 1, day)
          aptDate.setHours(0, 0, 0, 0)
          return aptDate.getTime() === today.getTime() && apt.status === 'confirmed'
        })
        break
      case 'upcoming':
        filtered = filtered.filter(apt => {
          const [day, month, year] = apt.slotDate.split('_')
          const aptDate = new Date(year, month - 1, day)
          aptDate.setHours(0, 0, 0, 0)
          return aptDate.getTime() >= today.getTime() && apt.status === 'confirmed'
        })
        break
      case 'completed':
        filtered = filtered.filter(apt => apt.status === 'completed')
        break
      case 'cancelled':
        filtered = filtered.filter(apt => apt.status === 'cancelled')
        break
      default:
        break
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(apt =>
        apt.docData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.docData.speciality.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const filteredAppointments = getFilteredAppointments()

  /* ---------------- STATUS BADGE ---------------- */
  const getStatusBadge = (status) => {
    const config = {
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Confirmed',
        icon: (
          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M5 13l4 4L19 7' />
          </svg>
        )
      },
      completed: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: 'Completed',
        icon: (
          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M5 13l4 4L19 7' />
          </svg>
        )
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: 'Cancelled',
        icon: (
          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
          </svg>
        )
      },
      expired: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        label: 'Expired',
        icon: (
          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
        )
      }
    }

    const { bg, text, label, icon } = config[status] || config.confirmed

    return (
      <span className={`${bg} ${text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit`}>
        {icon}
        {label}
      </span>
    )
  }

  /* ---------------- FILTER ICONS ---------------- */
  const filterIcons = {
    all: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
      </svg>
    ),
    today: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
      </svg>
    ),
    upcoming: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
      </svg>
    ),
    completed: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
      </svg>
    ),
    cancelled: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' />
      </svg>
    )
  }

  /* ================== CANCEL FLOW ================== */

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment)
    setShowCancelConfirmModal(true)
  }

  const handleCancelConfirm = () => {
    setShowCancelConfirmModal(false)
    setOtpAction('cancel')
    setShowOTPModal(true)
  }

  const executeCancelAppointment = async () => {
    try {
      setIsProcessing(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId: selectedAppointment._id },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await getUserAppointments()
        await getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsProcessing(false)
      closeAllModals()
    }
  }

  /* ================== RESCHEDULE FLOW ================== */

  const handleRescheduleClick = (appointment) => {
    setSelectedAppointment(appointment)
    setShowRescheduleConfirmModal(true)
  }

  const handleRescheduleConfirm = () => {
    setShowRescheduleConfirmModal(false)
    setShowRescheduleModal(true)
  }

  const handleSlotConfirmed = (slotDate, slotTime) => {
    setRescheduleData({ slotDate, slotTime })
    setShowRescheduleModal(false)
    setOtpAction('reschedule')
    setShowOTPModal(true)
  }

  const executeRescheduleAppointment = async () => {
    if (!rescheduleData || !selectedAppointment) {
      toast.error('Something went wrong. Please try again.')
      return
    }

    try {
      setIsProcessing(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/reschedule-appointment',
        {
          appointmentId: selectedAppointment._id,
          newSlotDate: rescheduleData.slotDate,
          newSlotTime: rescheduleData.slotTime
        },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message || 'Appointment rescheduled successfully!')
        await getUserAppointments()
        await getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsProcessing(false)
      closeAllModals()
    }
  }

  /* ================== OTP HANDLING ================== */

  const handleOTPVerified = () => {
    if (otpAction === 'cancel') {
      executeCancelAppointment()
    } else if (otpAction === 'reschedule') {
      executeRescheduleAppointment()
    }
  }

  /* ================== VIEW DETAILS ================== 

  const handleViewDetails = (appointment) => {
    // TODO: Navigate to appointment details page
    navigate(`/appointment/${appointment._id}`)
  }*/

  const handleViewDetails = (appointment) => {
    navigate(`/appointment-details/${appointment._id}`)
  }

  /* ================== CLOSE MODALS ================== */

  const closeAllModals = () => {
    setShowCancelConfirmModal(false)
    setShowRescheduleConfirmModal(false)
    setShowRescheduleModal(false)
    setShowOTPModal(false)
    setSelectedAppointment(null)
    setOtpAction(null)
    setRescheduleData(null)
  }

  /* ================== UI ================== */

  return (
    <div className='w-full max-w-6xl mx-auto px-4 py-8'>

      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>My Appointments</h1>
        <p className='text-gray-500 text-sm mt-1'>Manage and track your medical consultations</p>
      </div>

      {/* Filters & Search */}
      <div className='bg-white rounded-xl shadow-sm p-4 mb-6'>
        <div className='flex flex-col lg:flex-row gap-4 justify-between'>

          {/* Filter Tabs */}
          <div className='flex flex-wrap gap-2'>
            {[
              { key: 'all', label: 'All' },
              { key: 'today', label: 'Today' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                  ${activeFilter === filter.key
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {filterIcons[filter.key]}
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className='relative'>
            <input
              type='text'
              placeholder='Search doctor name or speciality...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full lg:w-72 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
            />
            <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
            </svg>
          </div>
        </div>
      </div>

      {/* Appointments Count */}
      <div className='mb-4'>
        <p className='text-sm text-gray-500'>
          Showing <span className='font-semibold text-gray-700'>{filteredAppointments.length}</span> appointments
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
          <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-500'>Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        /* Empty State */
        <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
            </svg>
          </div>
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Appointments Found</h3>
          <p className='text-gray-500 mb-6'>
            {searchTerm ? 'Try a different search term' : appointments.length === 0 ? 'Start booking appointments with our specialists' : 'No appointments match the selected filter'}
          </p>
          {appointments.length === 0 && (
            <button
              onClick={() => navigate('/doctors')}
              className='bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all'
            >
              Browse Doctors
            </button>
          )}
        </div>
      ) : (
        /* Appointments List */
        <div className='space-y-4'>
          {filteredAppointments.map((item, index) => (
            <div
              key={index}
              className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all'
            >
              <div className='flex flex-col lg:flex-row'>

                {/* Doctor Image */}
                <div className='lg:w-32 flex-shrink-0 bg-primary/5 flex items-center justify-center p-4'>
                  <img
                    className='w-20 h-20 rounded-full object-cover border-4 border-white shadow-md bg-primary'
                    src={item.docData.image}
                    alt={item.docData.name}
                  />
                </div>

                {/* Appointment Details */}
                <div className='flex-1 p-5'>
                  <div className='flex flex-wrap items-start justify-between gap-3 mb-3'>
                    <div>
                      <h3 className='text-lg font-bold text-gray-800'>
                        {item.docData.name}
                      </h3>
                      <span className='inline-block bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold mt-1'>
                        {item.docData.speciality}
                      </span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Info Grid */}
                  <div className='flex flex-wrap items-center gap-4 mb-4'>
                    <div>
                      <p className='text-xs text-gray-400 uppercase font-medium'>Date</p>
                      <p className='text-sm font-semibold text-gray-700'>
                        {slotDateFormat(item.slotDate)}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-400 uppercase font-medium'>Time</p>
                      <p className='text-sm font-semibold text-gray-700'>
                        {item.slotTime}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-400 uppercase font-medium'>Fee</p>
                      <p className='text-sm font-semibold text-primary'>
                        {currencySymbol}{item.docData.fees}
                      </p>
                    </div>
                    <div className='flex-1'></div>

                    {/* View Details Button */}
                    <button
                      onClick={() => handleViewDetails(item)}
                      className='flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-all'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                      </svg>
                      View Details
                    </button>
                  </div>

                  {/* Diagnosis Preview for Completed */}
                  {item.status === 'completed' && item.diagnosis && (
                    <div className='bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3'>
                      <p className='text-xs text-blue-600 font-medium mb-1 flex items-center gap-1'>
                        <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                        Diagnosis:
                      </p>
                      <p className='text-sm text-blue-800'>{item.diagnosis}</p>
                      {item.prescription?.hasMedicines && (
                        <p className='text-xs text-blue-600 mt-2 flex items-center gap-1'>
                          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' />
                          </svg>
                          {item.prescription.medicines.length} medicine(s) prescribed
                        </p>
                      )}
                    </div>
                  )}

                  {/* Cancellation Reason */}
                  {item.cancelReason && item.status === 'cancelled' && (
                    <div className='bg-red-50 border border-red-100 rounded-lg p-3 mb-3'>
                      <p className='text-xs text-red-600 font-medium flex items-center gap-1'>
                        <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                        </svg>
                        Cancelled {item.cancelledBy === 'patient' ? 'by you' : 'by doctor'}
                        {item.cancelReason && `:  ${item.cancelReason}`}
                      </p>
                    </div>
                  )}

                  {/* Reschedule Info */}
                  {item.rescheduleReason && item.previousSlotDate && (
                    <div className='bg-orange-50 border border-orange-100 rounded-lg p-3 mb-3'>
                      <p className='text-xs text-orange-600 font-medium flex items-center gap-1'>
                        <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                        </svg>
                        Rescheduled {item.rescheduledBy === 'patient' ? 'by you' : 'by doctor'}
                      </p>
                      <p className='text-sm text-orange-700 mt-1'>
                        From {slotDateFormat(item.previousSlotDate)} at {item.previousSlotTime}
                      </p>
                      {item.rescheduleReason && (
                        <p className='text-sm text-orange-700'>Reason: {item.rescheduleReason}</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons - Only for confirmed */}
                  {item.status === 'confirmed' && (
                    <div className='flex flex-wrap gap-2 pt-3 border-t border-gray-100'>
                      <button
                        onClick={() => handleRescheduleClick(item)}
                        className='flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-all shadow-sm'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                        </svg>
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancelClick(item)}
                        className='flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all shadow-sm'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirmModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 text-center">
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cancel Appointment?
              </h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to cancel your appointment with <strong>Dr. {selectedAppointment.docData.name}</strong>?
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {slotDateFormat(selectedAppointment.slotDate)} at {selectedAppointment.slotTime}
              </p>
              <p className="text-xs text-gray-400 mb-6">
                You'll receive an OTP on your email for verification.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closeAllModals}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleCancelConfirm}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                  </svg>
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Confirmation Modal */}
      {showRescheduleConfirmModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 text-center">
              <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Reschedule Appointment?
              </h3>
              <p className="text-gray-600 mb-2">
                Do you want to reschedule your appointment with <strong>Dr. {selectedAppointment.docData.name}</strong>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Current: {slotDateFormat(selectedAppointment.slotDate)} at {selectedAppointment.slotTime}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closeAllModals}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleConfirm}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                  </svg>
                  Select New Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal - Slot Selection */}
      {showRescheduleModal && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          onClose={closeAllModals}
          onSlotConfirmed={handleSlotConfirmed}
        />
      )}

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={closeAllModals}
        onVerified={handleOTPVerified}
        action={otpAction}
        appointmentId={selectedAppointment?._id}
      />

    </div>
  )
}

export default MyAppointments