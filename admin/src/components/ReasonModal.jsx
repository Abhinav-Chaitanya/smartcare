// components/ReasonModal.jsx

import React, { useState } from 'react'
import { toast } from 'react-toastify'

const ReasonModal = ({ type, appointment, newSlotData, onClose, onSubmit, isProcessing, slotDateFormat }) => {

    const [reason, setReason] = useState('')

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const formatNewSlotDate = (slotDate) => {
        if (!slotDate) return ''
        const [day, month, year] = slotDate.split('_')
        return `${day} ${months[Number(month) - 1]} ${year}`
    }

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast.warn(`Please provide a reason for ${type === 'cancel' ? 'cancellation' : 'rescheduling'}`)
            return
        }

        if (reason.trim().length < 10) {
            toast.warn('Please provide a more detailed reason (at least 10 characters)')
            return
        }

        onSubmit(reason.trim())
    }

    const isCancel = type === 'cancel'

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">

                {/* Header */}
                <div className={`p-6 border-b ${isCancel ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${isCancel ? 'bg-red-100' : 'bg-orange-100'} rounded-full flex items-center justify-center`}>
                            <span className='text-2xl'>{isCancel ? '❌' : '🔄'}</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {isCancel ? 'Cancellation Reason' : 'Rescheduling Reason'}
                            </h3>
                            <p className="text-sm text-gray-600">
                                This will be sent to the patient via email
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">

                    {/* Appointment Info */}
                    <div className='bg-gray-50 rounded-xl p-4 mb-4'>
                        <div className='flex items-center gap-3'>
                            <img
                                src={appointment.userData.image}
                                alt={appointment.userData.name}
                                className='w-12 h-12 rounded-full object-cover'
                            />
                            <div>
                                <p className='font-semibold text-gray-800'>{appointment.userData.name}</p>
                                <p className='text-sm text-gray-500'>
                                    {isCancel ? (
                                        <>📅 {slotDateFormat(appointment.slotDate)} at {appointment.slotTime}</>
                                    ) : (
                                        <>
                                            <span className='line-through text-red-500'>
                                                {slotDateFormat(appointment.slotDate)} at {appointment.slotTime}
                                            </span>
                                            <br />
                                            <span className='text-green-600 font-medium'>
                                                → {formatNewSlotDate(newSlotData?.date)} at {newSlotData?.time}
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reason Input */}
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>
                            📝 Reason for {isCancel ? 'Cancellation' : 'Rescheduling'} *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={isCancel
                                ? 'e.g., Due to an emergency, I am cancelling this appointment. Sorry for inconvience... '
                                : 'e.g., Due to a schedule conflict, I am rescheduling this appointment. Sorry for inconvience...  '
                            }
                            className='w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary resize-none h-32'
                            maxLength={500}
                        />
                        <p className='text-xs text-gray-400 mt-1 text-right'>
                            {reason.length}/500 characters
                        </p>
                    </div>

                    {/* Quick Reasons */}
                    <div className='mt-4'>
                        <p className='text-xs text-gray-500 mb-2'>Quick select:</p>
                        <div className='flex flex-wrap gap-2'>
                            {isCancel ? (
                                <>
                                    <button
                                        onClick={() => setReason('Due to an unexpected emergency, I am unable to attend this appointment.')}
                                        className='text-xs px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-all'
                                    >
                                        Emergency
                                    </button>
                                    <button
                                        onClick={() => setReason('I am feeling unwell and cannot conduct consultations today.')}
                                        className='text-xs px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-all'
                                    >
                                        Feeling Unwell
                                    </button>
                                    <button
                                        onClick={() => setReason('Due to a personal matter, I need to cancel this appointment.')}
                                        className='text-xs px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-all'
                                    >
                                        Personal Matter
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setReason('Due to a schedule conflict, I need to reschedule this appointment to the new time.')}
                                        className='text-xs px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-all'
                                    >
                                        Schedule Conflict
                                    </button>
                                    <button
                                        onClick={() => setReason('Due to an unexpected meeting, I need to move this appointment.')}
                                        className='text-xs px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-all'
                                    >
                                        Meeting Conflict
                                    </button>
                                    <button
                                        onClick={() => setReason('To better accommodate your needs, I am rescheduling to a more suitable time.')}
                                        className='text-xs px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-all'
                                    >
                                        Better Time
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isProcessing || !reason.trim()}
                            className={`flex-1 py-3 ${isCancel ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'} text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                        >
                            {isProcessing ? (
                                <>
                                    <span className='animate-spin'>⏳</span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {isCancel ? '❌ Cancel Appointment' : '🔄 Reschedule'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReasonModal