import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import { generatePrescriptionPDF } from '../../utils/generatePrescriptionPDF'
import { generateAppointmentPDF } from '../../utils/generateAppointmentPDF'
import { assets } from '../../assets/assets.js'
import getProfileImage from '../../utils/getProfileImage'

const AdminAppointmentDetails = () => {

    const { appointmentId } = useParams()
    const navigate = useNavigate()

    const { aToken, appointments, getAllAppointments } = useContext(AdminContext)
    const { slotDateFormat, currency } = useContext(AppContext)

    const [appointment, setAppointment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [downloadingPDF, setDownloadingPDF] = useState(false)
    const [downloadingAppointmentPDF, setDownloadingAppointmentPDF] = useState(false)

    useEffect(() => {
        if (aToken && appointments.length === 0) {
            getAllAppointments()
        }
    }, [aToken])

    useEffect(() => {
        if (appointments.length > 0) {
            const found = appointments.find(apt => apt._id === appointmentId)
            setAppointment(found)
            setLoading(false)
        }
    }, [appointments, appointmentId])

    const calculateAge = (dob) => {
        if (!dob || dob === 'Not Selected') return 'N/A'
        const today = new Date()
        const birthDate = new Date(dob)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
        return age + ' years'
    }

    const getStatusBadge = (status) => {
        const config = {
            confirmed: {
                bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed',
                icon: (<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' /></svg>)
            },
            completed: {
                bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed',
                icon: (<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>)
            },
            cancelled: {
                bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled',
                icon: (<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' /></svg>)
            },
            pending: {
                bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending',
                icon: (<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>)
            },
            expired: {
                bg: 'bg-orange-100', text: 'text-orange-700', label: 'Expired',
                icon: (<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>)
            }
        }
        const { bg, text, label, icon } = config[status] || config.pending
        return (
            <span className={`${bg} ${text} px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5`}>
                {icon}{label}
            </span>
        )
    }

    const formatCompletedDate = (date) => {
        if (!date) return 'N/A'
        return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    const formatBookingDate = (timestamp) => {
        if (!timestamp) return 'N/A'
        return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    const getActionByText = (by) => {
        switch (by) {
            case 'doctor': return 'Doctor'
            case 'admin': return 'Admin'
            case 'patient': return 'Patient'
            default: return 'Unknown'
        }
    }

    const handleDownloadPDF = async () => {
        if (!appointment) return
        setDownloadingPDF(true)
        try {
            await generatePrescriptionPDF(appointment, assets.logo1)
            toast.success('Prescription downloaded successfully!')
        } catch (error) {
            console.error('Error generating PDF:', error)
            toast.error('Failed to generate PDF. Please try again.')
        } finally {
            setDownloadingPDF(false)
        }
    }

    const handleDownloadAppointmentPDF = async () => {
        if (!appointment) return
        setDownloadingAppointmentPDF(true)
        try {
            await generateAppointmentPDF(appointment, assets.logo1)
            toast.success('Booking receipt downloaded successfully!')
        } catch (error) {
            console.error('Error generating appointment PDF:', error)
            toast.error('Failed to generate PDF. Please try again.')
        } finally {
            setDownloadingAppointmentPDF(false)
        }
    }

    if (loading) {
        return (
            <div className='m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-500 text-sm'>Loading appointment details...</p>
                </div>
            </div>
        )
    }

    if (!appointment) {
        return (
            <div className='m-5 flex items-center justify-center min-h-[60vh]'>
                <div className='text-center'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                    </div>
                    <h3 className='text-xl font-semibold text-gray-700 mb-2'>Appointment Not Found</h3>
                    <button onClick={() => navigate('/all-appointments')} className='text-primary font-medium hover:underline flex items-center gap-1 justify-center'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' /></svg>
                        Back to All Appointments
                    </button>
                </div>
            </div>
        )
    }

    const { userData, docData, slotDate, slotTime, status, diagnosis, prescription, completedAt, amount } = appointment

    return (
        <div className='w-full max-w-4xl m-5'>

            {/* Back Button */}
            <button onClick={() => navigate('/all-appointments')} className='flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-all group'>
                <svg className='w-5 h-5 group-hover:-translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                </svg>
                <span className='font-medium'>Back to All Appointments</span>
            </button>

            {/* Header */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'>
                <div className='p-6 bg-gradient-to-r from-primary/5 to-blue-50'>
                    <div className='flex items-center justify-between flex-wrap gap-4'>
                        <h1 className='text-2xl font-bold text-gray-800'>Appointment Details</h1>
                        {getStatusBadge(status)}
                    </div>
                </div>
            </div>

            {/* Patient Information */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'>
                <div className='p-6 border-b border-gray-100'>
                    <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                        </svg>
                        Patient Information
                    </h2>
                </div>
                <div className='p-6'>
                    <div className='flex items-start gap-6 flex-wrap'>
                        <img
                            src={getProfileImage(userData.image)}
                            alt={userData.name}
                            className='w-24 h-24 rounded-xl object-cover border-4 border-gray-100 shadow-md'
                        />
                        <div className='flex-1 min-w-[250px]'>
                            <h3 className='text-xl font-bold text-gray-800 mb-3'>{userData.name}</h3>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                <div>
                                    <p className='text-xs text-gray-400 uppercase font-medium'>Age</p>
                                    <p className='text-sm font-semibold text-gray-700'>{calculateAge(userData.dob)}</p>
                                </div>
                                <div>
                                    <p className='text-xs text-gray-400 uppercase font-medium'>Gender</p>
                                    <p className='text-sm font-semibold text-gray-700 capitalize'>{userData.gender || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className='text-xs text-gray-400 uppercase font-medium'>Email</p>
                                    <p className='text-sm font-semibold text-gray-700'>{userData.email}</p>
                                </div>
                                <div>
                                    <p className='text-xs text-gray-400 uppercase font-medium'>Phone</p>
                                    <p className='text-sm font-semibold text-gray-700'>{userData.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Doctor Information */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'>
                <div className='p-6 border-b border-gray-100'>
                    <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        Doctor Information
                    </h2>
                </div>
                <div className='p-6'>
                    <div className='flex items-start gap-6 flex-wrap'>
                        <img
                            src={docData.image}
                            alt={docData.name}
                            className='w-24 h-24 rounded-xl object-cover border-4 border-gray-100 shadow-md bg-primary/10'
                        />
                        <div className='flex-1 min-w-[250px]'>
                            <h3 className='text-xl font-bold text-gray-800 mb-1'>{docData.name}</h3>
                            <p className='text-primary font-medium mb-3'>{docData.speciality}</p>
                            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                                <div>
                                    <p className='text-xs text-gray-400 uppercase font-medium'>Fees</p>
                                    <p className='text-sm font-semibold text-gray-700'>{currency}{docData.fees || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointment Summary Section */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'>
                <div className='p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4'>
                    <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' />
                        </svg>
                        Appointment Summary
                    </h2>
                    <button
                        onClick={handleDownloadAppointmentPDF}
                        disabled={downloadingAppointmentPDF}
                        className='flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {downloadingAppointmentPDF ? (
                            <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>Generating...</>
                        ) : (
                            <><svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' /></svg>Download Booking Receipt</>
                        )}
                    </button>
                </div>
                <div className='p-6'>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                        <div className='bg-blue-50 rounded-xl p-4'>
                            <p className='text-xs text-blue-600 uppercase font-medium mb-1'>Appointment Date</p>
                            <p className='text-lg font-bold text-blue-800'>{slotDateFormat(slotDate)}</p>
                        </div>
                        <div className='bg-green-50 rounded-xl p-4'>
                            <p className='text-xs text-green-600 uppercase font-medium mb-1'>Time Slot</p>
                            <p className='text-lg font-bold text-green-800'>{slotTime}</p>
                        </div>
                        <div className='bg-purple-50 rounded-xl p-4'>
                            <p className='text-xs text-purple-600 uppercase font-medium mb-1'>Amount</p>
                            <p className='text-lg font-bold text-purple-800'>{currency}{amount}</p>
                        </div>
                        <div className='bg-orange-50 rounded-xl p-4'>
                            <p className='text-xs text-orange-600 uppercase font-medium mb-1'>Payment Status</p>
                            <p className='text-lg font-bold text-orange-800'>
                                {appointment.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                            </p>
                        </div>
                    </div>
                    <div className='bg-gray-50 rounded-xl p-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <p className='text-xs text-gray-500 uppercase font-medium'>Appointment ID</p>
                                <p className='text-sm font-mono text-gray-700 mt-1'>{appointment._id}</p>
                            </div>
                            <div>
                                <p className='text-xs text-gray-500 uppercase font-medium'>Booked On</p>
                                <p className='text-sm text-gray-700 mt-1'>{formatBookingDate(appointment.date)}</p>
                            </div>
                            {appointment.razorpayPaymentId && (
                                <div>
                                    <p className='text-xs text-gray-500 uppercase font-medium'>Payment ID</p>
                                    <p className='text-sm font-mono text-gray-700 mt-1'>{appointment.razorpayPaymentId}</p>
                                </div>
                            )}
                            {status === 'completed' && completedAt && (
                                <div>
                                    <p className='text-xs text-gray-500 uppercase font-medium'>Completed On</p>
                                    <p className='text-sm text-green-700 font-medium mt-1'>{formatCompletedDate(completedAt)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Diagnosis Section */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'>
                <div className='p-6 border-b border-gray-100'>
                    <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                        Diagnosis
                    </h2>
                </div>
                <div className='p-6'>
                    {status === 'completed' && diagnosis ? (
                        <div className='p-4 bg-green-50 rounded-xl border border-green-200'>
                            <p className='text-gray-800 text-lg'>{diagnosis}</p>
                        </div>
                    ) : (
                        <div className='p-6 bg-gray-50 rounded-xl text-center'>
                            <p className='text-gray-400'>
                                {status === 'completed' ? 'No diagnosis recorded' : 'Diagnosis will appear after appointment is completed'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Prescription Section */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'>
                <div className='p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4'>
                    <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' />
                        </svg>
                        Prescription
                    </h2>
                    {status === 'completed' && prescription?.hasMedicines && (
                        <button onClick={handleDownloadPDF} disabled={downloadingPDF}
                            className='flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed'>
                            {downloadingPDF ? (
                                <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>Generating...</>
                            ) : (
                                <><svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' /></svg>Download Prescription</>
                            )}
                        </button>
                    )}
                </div>
                <div className='p-6'>
                    {status === 'completed' && prescription?.hasMedicines && prescription.medicines?.length > 0 ? (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='bg-gray-50'>
                                        <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Medicine</th>
                                        <th className='px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider'>Times/Day</th>
                                        <th className='px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider'>When</th>
                                        <th className='px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider'>Duration</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                    {prescription.medicines.map((med, index) => (
                                        <tr key={index} className='hover:bg-gray-50'>
                                            <td className='px-4 py-4 font-semibold text-gray-800'>{med.name}</td>
                                            <td className='px-4 py-4 text-center'><span className='bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium'>{med.timesPerDay}x daily</span></td>
                                            <td className='px-4 py-4 text-center capitalize text-gray-600'>{med.timing}</td>
                                            <td className='px-4 py-4 text-center font-medium text-gray-700'>{med.duration}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : status === 'completed' ? (
                        <div className='p-6 bg-gray-50 rounded-xl text-center'>
                            <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                                <svg className='w-6 h-6 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' /></svg>
                            </div>
                            <p className='text-gray-500'>No medicines prescribed</p>
                        </div>
                    ) : (
                        <div className='p-6 bg-gray-50 rounded-xl text-center'>
                            <p className='text-gray-400'>Prescription will appear after appointment is completed</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Doctor's Notes Section */}
            {status === 'completed' && prescription?.notes && (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'>
                    <div className='p-6 border-b border-gray-100'>
                        <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                            <svg className='w-5 h-5 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                            </svg>
                            Doctor's Notes
                        </h2>
                    </div>
                    <div className='p-6'>
                        <div className='p-4 bg-yellow-50 rounded-xl border border-yellow-200'>
                            <p className='text-gray-800'>{prescription.notes}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Info */}
            {appointment.rescheduleReason && appointment.previousSlotDate && (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'>
                    <div className='p-6 border-b border-orange-100 bg-orange-50'>
                        <h2 className='text-lg font-bold text-orange-800 flex items-center gap-2'>
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                            </svg>
                            Reschedule Details
                        </h2>
                    </div>
                    <div className='p-6'>
                        <div className='space-y-3'>
                            <div className='flex items-center gap-2'>
                                <span className='text-sm text-gray-500'>Rescheduled by:</span>
                                <span className='font-semibold text-gray-800'>{getActionByText(appointment.rescheduledBy)}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='text-sm text-gray-500'>Previous Schedule:</span>
                                <span className='font-semibold text-gray-800'>
                                    {slotDateFormat(appointment.previousSlotDate)} at {appointment.previousSlotTime}
                                </span>
                            </div>
                            <div className='p-3 bg-orange-50 rounded-lg border border-orange-200'>
                                <p className='text-sm text-orange-600 font-medium mb-1'>Reason:</p>
                                <p className='text-gray-800'>{appointment.rescheduleReason}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancellation Info */}
            {status === 'cancelled' && appointment.cancelReason && (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'>
                    <div className='p-6 border-b border-red-100 bg-red-50'>
                        <h2 className='text-lg font-bold text-red-800 flex items-center gap-2'>
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                            Cancellation Details
                        </h2>
                    </div>
                    <div className='p-6'>
                        <div className='space-y-3'>
                            <div className='flex items-center gap-2'>
                                <span className='text-sm text-gray-500'>Cancelled by:</span>
                                <span className='font-semibold text-gray-800'>{getActionByText(appointment.cancelledBy)}</span>
                            </div>
                            <div className='p-3 bg-red-50 rounded-lg border border-red-200'>
                                <p className='text-sm text-red-600 font-medium mb-1'>Reason:</p>
                                <p className='text-gray-800'>{appointment.cancelReason}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default AdminAppointmentDetails