import React, { useState } from 'react'
import { toast } from 'react-toastify'

const DiagnosisModal = ({ appointment, onClose, onSubmit, isProcessing, slotDateFormat }) => {

    const [diagnosis, setDiagnosis] = useState('')
    const [hasMedicines, setHasMedicines] = useState(false)
    const [medicines, setMedicines] = useState([
        { name: '', timesPerDay: 1, timing: 'after food', duration: '' }
    ])
    const [notes, setNotes] = useState('')

    const addMedicine = () => {
        if (medicines.length >= 10) { toast.warn('Maximum 10 medicines can be added'); return }
        setMedicines([...medicines, { name: '', timesPerDay: 1, timing: 'after food', duration: '' }])
    }

    const removeMedicine = (index) => {
        if (medicines.length === 1) { toast.warn('At least one medicine is required when prescribing'); return }
        setMedicines(medicines.filter((_, i) => i !== index))
    }

    const updateMedicine = (index, field, value) => {
        const updated = [...medicines]
        updated[index][field] = value
        setMedicines(updated)
    }

    const handleSubmit = () => {
        if (!diagnosis.trim()) { toast.error('Please enter a diagnosis'); return }
        if (diagnosis.trim().length < 5) { toast.error('Diagnosis should be at least 5 characters'); return }
        if (hasMedicines) {
            for (let i = 0; i < medicines.length; i++) {
                if (!medicines[i].name.trim()) { toast.error(`Please enter medicine name for Medicine ${i + 1}`); return }
                if (!medicines[i].duration.trim()) { toast.error(`Please enter duration for ${medicines[i].name}`); return }
            }
        }
        onSubmit({
            diagnosis: diagnosis.trim(),
            prescription: {
                hasMedicines,
                medicines: hasMedicines ? medicines.map(m => ({
                    name: m.name.trim(), timesPerDay: m.timesPerDay, timing: m.timing, duration: m.duration.trim()
                })) : [],
                notes: notes.trim()
            }
        })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                            <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Complete Appointment</h2>
                            <p className="text-sm text-gray-500">Enter diagnosis and prescription details</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isProcessing}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50">
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>
                </div>

                {/* Patient Info */}
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <img src={appointment.userData.image} alt={appointment.userData.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
                        <div>
                            <p className="font-bold text-gray-900">{appointment.userData.name}</p>
                            <p className="text-sm text-gray-600">{appointment.userData.email}</p>
                            <div className='flex items-center gap-3 mt-1'>
                                <span className='flex items-center gap-1 text-sm font-semibold text-primary'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                    </svg>
                                    {slotDateFormat(appointment.slotDate)}
                                </span>
                                <span className='flex items-center gap-1 text-sm font-semibold text-primary'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                    {appointment.slotTime}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Diagnosis */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <svg className='w-4 h-4 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                            </svg>
                            Diagnosis <span className="text-red-500">*</span>
                        </label>
                        <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder="Enter diagnosis (e.g., Mild cough with cold, Viral fever, etc.)"
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary resize-none h-24"
                            maxLength={500} />
                        <p className="text-xs text-gray-400 mt-1 text-right">{diagnosis.length}/500</p>
                    </div>

                    {/* Prescription Toggle */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <svg className='w-4 h-4 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' />
                            </svg>
                            Prescribe Medicines?
                        </label>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setHasMedicines(false)}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all border-2 flex items-center justify-center gap-2 ${
                                    !hasMedicines ? 'bg-gray-100 border-gray-400 text-gray-800' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                                </svg>
                                No Medicines
                            </button>
                            <button type="button" onClick={() => setHasMedicines(true)}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all border-2 flex items-center justify-center gap-2 ${
                                    hasMedicines ? 'bg-green-100 border-green-400 text-green-800' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                                </svg>
                                Yes, Prescribe
                            </button>
                        </div>
                    </div>

                    {/* Medicines List */}
                    {hasMedicines && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' />
                                    </svg>
                                    Medicines ({medicines.length})
                                </label>
                                <button type="button" onClick={addMedicine}
                                    className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                                    </svg>
                                    Add Medicine
                                </button>
                            </div>
                            <div className="space-y-4">
                                {medicines.map((medicine, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-semibold text-gray-600">Medicine {index + 1}</span>
                                            {medicines.length > 1 && (
                                                <button type="button" onClick={() => removeMedicine(index)}
                                                    className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium">
                                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                                    </svg>
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="md:col-span-2">
                                                <label className="block text-xs text-gray-500 mb-1">Medicine Name *</label>
                                                <input type="text" value={medicine.name}
                                                    onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                                    placeholder="e.g., Paracetamol 500mg"
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Times Per Day</label>
                                                <select value={medicine.timesPerDay}
                                                    onChange={(e) => updateMedicine(index, 'timesPerDay', Number(e.target.value))}
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white">
                                                    <option value={1}>Once a day (1)</option>
                                                    <option value={2}>Twice a day (2)</option>
                                                    <option value={3}>Thrice a day (3)</option>
                                                    <option value={4}>Four times a day (4)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">When to Take</label>
                                                <select value={medicine.timing}
                                                    onChange={(e) => updateMedicine(index, 'timing', e.target.value)}
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white">
                                                    <option value="before food">Before Food</option>
                                                    <option value="after food">After Food</option>
                                                    <option value="with food">With Food</option>
                                                    <option value="empty stomach">Empty Stomach</option>
                                                    <option value="bedtime">Bedtime</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs text-gray-500 mb-1">Duration *</label>
                                                <input type="text" value={medicine.duration}
                                                    onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                                    placeholder="e.g., 5 days, 1 week, 10 days"
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <svg className='w-4 h-4 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                            </svg>
                            Additional Notes / Instructions <span className='text-gray-400 font-normal'>(Optional)</span>
                        </label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Drink warm water, take rest, avoid cold drinks, come for follow-up after 1 week..."
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary resize-none h-20"
                            maxLength={500} />
                        <p className="text-xs text-gray-400 mt-1 text-right">{notes.length}/500</p>
                    </div>

                    {/* Quick Notes */}
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Quick add:</p>
                        <div className="flex flex-wrap gap-2">
                            {['Drink plenty of water', 'Take rest', 'Avoid cold drinks', 'Avoid spicy food', 'Follow-up after 1 week'].map((note, idx) => (
                                <button key={idx} type="button"
                                    onClick={() => setNotes(prev => prev ? `${prev}, ${note}` : note)}
                                    className="text-xs px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-all text-gray-600">
                                    + {note}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex-shrink-0 flex gap-3">
                    <button onClick={onClose} disabled={isProcessing}
                        className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isProcessing || !diagnosis.trim()}
                        className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {isProcessing ? (
                            <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>Saving...</>
                        ) : (
                            <><svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' /></svg>Save & Complete</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DiagnosisModal