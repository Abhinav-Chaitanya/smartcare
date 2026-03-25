import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext'
import getProfileImage from '../../utils/getProfileImage'

const PatientsList = () => {

    const navigate = useNavigate()
    const { aToken, patients, getAllPatients } = useContext(AdminContext)

    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (aToken) {
            loadPatients()
        }
    }, [aToken])

    const loadPatients = async () => {
        setLoading(true)
        await getAllPatients()
        setLoading(false)
    }

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
    )

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A'
        return new Date(timestamp).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    }

    return (
        <div className='w-full max-w-6xl m-5'>

            {/* Header */}
            <div className='mb-6'>
                <h1 className='text-2xl font-bold text-gray-800'>All Patients</h1>
                <p className='text-gray-500 text-sm mt-1'>Manage and view all registered patients</p>
            </div>

            {/* Search & Stats Bar */}
            <div className='bg-white rounded-xl shadow-sm p-4 mb-6'>
                <div className='flex flex-col sm:flex-row gap-4 justify-between items-center'>

                    {/* Search */}
                    <div className='relative w-full sm:w-80'>
                        <input
                            type='text'
                            placeholder='Search by name, email or phone...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500'
                        />
                        <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                        </svg>
                    </div>

                    {/* Total Count */}
                    <div className='flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg'>
                        <svg className='w-5 h-5 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                        </svg>
                        <span className='text-sm font-semibold text-purple-700'>
                            {filteredPatients.length} Patient{filteredPatients.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>

            {/* Patients List */}
            {loading ? (
                <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
                    <div className='w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-500'>Loading patients...</p>
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                        </svg>
                    </div>
                    <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Patients Found</h3>
                    <p className='text-gray-500'>
                        {searchTerm ? 'Try a different search term' : 'No patients have registered yet'}
                    </p>
                </div>
            ) : (
                <div className='grid gap-4'>
                    {filteredPatients.map((patient, index) => (
                        <div
                            key={index}
                            className='bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all'
                        >
                            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>

                                {/* Patient Image */}
                                <img
                                    src={getProfileImage(patient.image)}
                                    alt={patient.name}
                                    className='w-16 h-16 rounded-xl object-cover border-2 border-gray-100'
                                />

                                {/* Patient Info */}
                                <div className='flex-1 min-w-0'>
                                    <h3 className='text-lg font-bold text-gray-800 truncate'>{patient.name}</h3>
                                    <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-1'>
                                        <p className='text-sm text-gray-500 flex items-center gap-1'>
                                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                            </svg>
                                            {patient.email}
                                        </p>
                                        <p className='text-sm text-gray-500 flex items-center gap-1'>
                                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                            </svg>
                                            {patient.phone}
                                        </p>
                                    </div>
                                </div>

                                {/* Appointment Stats */}
                                <div className='flex items-center gap-3'>
                                    <div className='text-center px-3 py-2 bg-gray-50 rounded-lg'>
                                        <p className='text-xl font-bold text-gray-800'>{patient.appointmentStats?.total || 0}</p>
                                        <p className='text-xs text-gray-500'>Total</p>
                                    </div>
                                    <div className='text-center px-3 py-2 bg-green-50 rounded-lg'>
                                        <p className='text-xl font-bold text-green-600'>{patient.appointmentStats?.completed || 0}</p>
                                        <p className='text-xs text-gray-500'>Completed</p>
                                    </div>
                                    <div className='text-center px-3 py-2 bg-blue-50 rounded-lg'>
                                        <p className='text-xl font-bold text-blue-600'>{patient.appointmentStats?.confirmed || 0}</p>
                                        <p className='text-xs text-gray-500'>Upcoming</p>
                                    </div>
                                </div>

                                {/* View Button */}
                                <button
                                    onClick={() => navigate(`/patient/${patient._id}`)}
                                    className='flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-all'
                                >
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                                    </svg>
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default PatientsList