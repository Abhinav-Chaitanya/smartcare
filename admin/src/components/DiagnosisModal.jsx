import React, { useState } from 'react'
import { toast } from 'react-toastify'

const DiagnosisModal = ({ appointment, onClose, onSubmit, isProcessing, slotDateFormat }) => {

    // Diagnosis state
    const [diagnosis, setDiagnosis] = useState('')
    
    // Prescription state
    const [hasMedicines, setHasMedicines] = useState(false)
    const [medicines, setMedicines] = useState([
        { name: '', timesPerDay: 1, timing: 'after food', duration: '' }
    ])
    const [notes, setNotes] = useState('')

    // Add new medicine row
    const addMedicine = () => {
        if (medicines.length >= 10) {
            toast.warn('Maximum 10 medicines can be added')
            return
        }
        setMedicines([
            ...medicines,
            { name: '', timesPerDay: 1, timing: 'after food', duration: '' }
        ])
    }

    // Remove medicine row
    const removeMedicine = (index) => {
        if (medicines.length === 1) {
            toast.warn('At least one medicine is required when prescribing')
            return
        }
        setMedicines(medicines.filter((_, i) => i !== index))
    }

    // Update medicine field
    const updateMedicine = (index, field, value) => {
        const updated = [...medicines]
        updated[index][field] = value
        setMedicines(updated)
    }

    // Validate and submit
    const handleSubmit = () => {
        // Validate diagnosis
        if (!diagnosis.trim()) {
            toast.error('Please enter a diagnosis')
            return
        }

        if (diagnosis.trim().length < 5) {
            toast.error('Diagnosis should be at least 5 characters')
            return
        }

        // Validate medicines if prescribing
        if (hasMedicines) {
            for (let i = 0; i < medicines.length; i++) {
                if (!medicines[i].name.trim()) {
                    toast.error(`Please enter medicine name for Medicine ${i + 1}`)
                    return
                }
                if (!medicines[i].duration.trim()) {
                    toast.error(`Please enter duration for ${medicines[i].name}`)
                    return
                }
            }
        }

        // Prepare data
        const data = {
            diagnosis: diagnosis.trim(),
            prescription: {
                hasMedicines,
                medicines: hasMedicines ? medicines.map(m => ({
                    name: m.name.trim(),
                    timesPerDay: m.timesPerDay,
                    timing: m.timing,
                    duration: m.duration.trim()
                })) : [],
                notes: notes.trim()
            }
        }

        onSubmit(data)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl max-h-[90vh] flex flex-col">

                {/* Header - Fixed */}
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                                <span className='text-2xl'>📋</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Complete Appointment
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Enter diagnosis and prescription details
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Patient Info - Fixed */}
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <img
                            src={appointment.userData.image}
                            alt={appointment.userData.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                        />
                        <div>
                            <p className="font-bold text-gray-900">{appointment.userData.name}</p>
                            <p className="text-sm text-gray-600">{appointment.userData.email}</p>
                            <p className="text-sm text-primary font-semibold mt-1">
                                📅 {slotDateFormat(appointment.slotDate)} | ⏰ {appointment.slotTime}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Diagnosis Section */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📋 Diagnosis <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder="Enter diagnosis (e.g., Mild cough with cold, Viral fever, etc.)"
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary resize-none h-24"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">
                            {diagnosis.length}/500 characters
                        </p>
                    </div>

                    {/* Prescription Toggle */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            💊 Prescribe Medicines?
                        </label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setHasMedicines(false)}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all border-2 ${
                                    !hasMedicines
                                        ? 'bg-gray-100 border-gray-400 text-gray-800'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                ❌ No Medicines
                            </button>
                            <button
                                type="button"
                                onClick={() => setHasMedicines(true)}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all border-2 ${
                                    hasMedicines
                                        ? 'bg-green-100 border-green-400 text-green-800'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                ✅ Yes, Prescribe
                            </button>
                        </div>
                    </div>

                    {/* Medicines List */}
                    {hasMedicines && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold text-gray-700">
                                    💊 Medicines ({medicines.length})
                                </label>
                                <button
                                    type="button"
                                    onClick={addMedicine}
                                    className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                                >
                                    <span>➕</span> Add Medicine
                                </button>
                            </div>

                            <div className="space-y-4">
                                {medicines.map((medicine, index) => (
                                    <div 
                                        key={index} 
                                        className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-semibold text-gray-600">
                                                Medicine {index + 1}
                                            </span>
                                            {medicines.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMedicine(index)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                >
                                                    🗑️ Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {/* Medicine Name */}
                                            <div className="md:col-span-2">
                                                <label className="block text-xs text-gray-500 mb-1">
                                                    Medicine Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={medicine.name}
                                                    onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                                    placeholder="e.g., Paracetamol 500mg"
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                                />
                                            </div>

                                            {/* Times Per Day */}
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">
                                                    Times Per Day
                                                </label>
                                                <select
                                                    value={medicine.timesPerDay}
                                                    onChange={(e) => updateMedicine(index, 'timesPerDay', Number(e.target.value))}
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white"
                                                >
                                                    <option value={1}>Once a day (1)</option>
                                                    <option value={2}>Twice a day (2)</option>
                                                    <option value={3}>Thrice a day (3)</option>
                                                    <option value={4}>Four times a day (4)</option>
                                                </select>
                                            </div>

                                            {/* Timing */}
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">
                                                    When to Take
                                                </label>
                                                <select
                                                    value={medicine.timing}
                                                    onChange={(e) => updateMedicine(index, 'timing', e.target.value)}
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white"
                                                >
                                                    <option value="before food">Before Food</option>
                                                    <option value="after food">After Food</option>
                                                    <option value="with food">With Food</option>
                                                    <option value="empty stomach">Empty Stomach</option>
                                                    <option value="bedtime">Bedtime</option>
                                                </select>
                                            </div>

                                            {/* Duration */}
                                            <div className="md:col-span-2">
                                                <label className="block text-xs text-gray-500 mb-1">
                                                    Duration *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={medicine.duration}
                                                    onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                                    placeholder="e.g., 5 days, 1 week, 10 days"
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Additional Notes */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📝 Additional Notes / Instructions (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Drink warm water, take rest, avoid cold drinks, come for follow-up after 1 week..."
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary resize-none h-20"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">
                            {notes.length}/500 characters
                        </p>
                    </div>

                    {/* Quick Notes Suggestions */}
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Quick add notes:</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                'Drink plenty of water',
                                'Take rest',
                                'Avoid cold drinks',
                                'Avoid spicy food',
                                'Follow-up after 1 week'
                            ].map((note, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setNotes(prev => prev ? `${prev}, ${note}` : note)}
                                    className="text-xs px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-all text-gray-600"
                                >
                                    + {note}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer - Fixed */}
                <div className="p-6 border-t border-gray-200 flex-shrink-0">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isProcessing || !diagnosis.trim()}
                            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <span className='animate-spin'>⏳</span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <span>✓</span>
                                    Save & Complete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DiagnosisModal