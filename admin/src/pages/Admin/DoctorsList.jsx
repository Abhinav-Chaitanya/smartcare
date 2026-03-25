import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {

    const { doctors, aToken, getAllDoctors } = useContext(AdminContext)
    const navigate = useNavigate()
    
    const { departmentName } = useParams()
    const decodedDepartment = departmentName ? decodeURIComponent(departmentName) : null

    const [searchTerm, setSearchTerm] = useState('')
    // ✅ NEW: Status filter — 'all', 'available', 'unavailable', 'blocked'
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        if (aToken) {
            getAllDoctors()
        }
    }, [aToken])

    const getFilteredDoctors = () => {
        let filtered = [...doctors]

        // Department filter from URL
        if (decodedDepartment) {
            filtered = filtered.filter(doc => 
                doc.speciality.toLowerCase() === decodedDepartment.toLowerCase()
            )
        }

        // ✅ Status filter
        if (statusFilter === 'available') {
            filtered = filtered.filter(doc => doc.available && !doc.isBlocked)
        } else if (statusFilter === 'unavailable') {
            filtered = filtered.filter(doc => !doc.available && !doc.isBlocked)
        } else if (statusFilter === 'blocked') {
            filtered = filtered.filter(doc => doc.isBlocked)
        }
        // 'all' shows everything

        // Search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(doc =>
                doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        return filtered
    }

    const filteredDoctors = getFilteredDoctors()

    const pageTitle = decodedDepartment ? decodedDepartment : 'All Doctors'
    const pageDescription = decodedDepartment 
        ? `Doctors in ${decodedDepartment} department`
        : 'View all registered doctors'

    // ✅ Count per status for filter badges
    const baseDoctors = decodedDepartment
        ? doctors.filter(doc => doc.speciality.toLowerCase() === decodedDepartment.toLowerCase())
        : doctors

    const statusCounts = {
        all: baseDoctors.length,
        available: baseDoctors.filter(d => d.available && !d.isBlocked).length,
        unavailable: baseDoctors.filter(d => !d.available && !d.isBlocked).length,
        blocked: baseDoctors.filter(d => d.isBlocked).length
    }

    const filterButtons = [
        { key: 'all', label: 'All', color: 'gray' },
        { key: 'available', label: 'Available', color: 'green' },
        { key: 'unavailable', label: 'Unavailable', color: 'red' },
        { key: 'blocked', label: 'Blocked', color: 'gray' }
    ]

    return (
        <div className='w-full max-w-6xl m-5'>

            {/* Breadcrumb */}
            <div className='mb-4'>
                <nav className='flex items-center gap-2 text-sm'>
                    <Link to='/departments' className='text-gray-500 hover:text-primary transition-colors flex items-center gap-1'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                        </svg>
                        Departments
                    </Link>
                    <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                    </svg>
                    <span className='text-gray-800 font-medium'>{pageTitle}</span>
                </nav>
            </div>

            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800'>{pageTitle}</h1>
                    <p className='text-gray-500 text-sm mt-1'>{pageDescription}</p>
                </div>
                <button
                    onClick={() => {
                        if (decodedDepartment) {
                            navigate(`/add-doctor/${encodeURIComponent(decodedDepartment)}`)
                        } else {
                            navigate('/add-doctor')
                        }
                    }}
                    className='flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25'
                >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                    </svg>
                    Add New Doctor
                </button>
            </div>

            {/* Search + Filter Bar */}
            <div className='bg-white rounded-xl shadow-sm p-4 mb-6'>
                <div className='flex flex-col gap-4'>
                    <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
                        {/* Department Badge */}
                        {decodedDepartment && (
                            <div className='flex items-center gap-2'>
                                <span className='px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium flex items-center gap-2 text-sm'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                                    </svg>
                                    {decodedDepartment}
                                </span>
                                <Link to='/doctors' className='text-sm text-gray-500 hover:text-primary transition-colors'>
                                    View all →
                                </Link>
                            </div>
                        )}

                        {/* Search */}
                        <div className='relative flex-1 max-w-md'>
                            <input
                                type='text'
                                placeholder='Search doctor name or email...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                            />
                            <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                            </svg>
                        </div>
                    </div>

                    {/* ✅ Status Filter Buttons */}
                    <div className='flex flex-wrap items-center gap-2'>
                        <span className='text-sm text-gray-500 font-medium'>Filter:</span>
                        {filterButtons.map(({ key, label }) => {
                            const isActive = statusFilter === key
                            const count = statusCounts[key]
                            
                            let activeStyle = ''
                            let inactiveStyle = 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            
                            if (key === 'available') activeStyle = 'bg-green-500 text-white'
                            else if (key === 'unavailable') activeStyle = 'bg-red-500 text-white'
                            else if (key === 'blocked') activeStyle = 'bg-gray-800 text-white'
                            else activeStyle = 'bg-primary text-white'

                            return (
                                <button
                                    key={key}
                                    onClick={() => setStatusFilter(key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive ? activeStyle : inactiveStyle}`}
                                >
                                    {key === 'available' && (
                                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-green-500'}`}></span>
                                    )}
                                    {key === 'unavailable' && (
                                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-red-500'}`}></span>
                                    )}
                                    {key === 'blocked' && (
                                        <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636' />
                                        </svg>
                                    )}
                                    {label}
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}`}>
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Count */}
            <div className='mb-4'>
                <p className='text-sm text-gray-500'>
                    Showing <span className='font-semibold text-gray-700'>{filteredDoctors.length}</span> doctor(s)
                    {statusFilter !== 'all' && (
                        <span className='ml-1'>— <span className='font-medium capitalize'>{statusFilter}</span></span>
                    )}
                    {decodedDepartment && (
                        <span> in <span className='font-semibold text-primary'>{decodedDepartment}</span></span>
                    )}
                </p>
            </div>

            {/* Doctors Grid */}
            {filteredDoctors.length === 0 ? (
                <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                        </svg>
                    </div>
                    <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Doctors Found</h3>
                    <p className='text-gray-500 mb-4'>
                        {searchTerm ? 'Try a different search term' : 
                         statusFilter !== 'all' ? `No ${statusFilter} doctors found` :
                         decodedDepartment ? `No doctors in ${decodedDepartment} department yet` : 'No doctors registered yet'}
                    </p>
                    {statusFilter !== 'all' && (
                        <button onClick={() => setStatusFilter('all')}
                            className='text-primary font-medium hover:underline text-sm'>
                            Show all doctors
                        </button>
                    )}
                </div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
                    {filteredDoctors.map((item, index) => (
                        <div key={index}
                            className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 group ${
                                item.isBlocked ? 'border-gray-300 opacity-75' : 'border-gray-100'
                            }`}
                        >
                            {/* Doctor Image */}
                            <div className={`relative p-6 flex justify-center ${
                                item.isBlocked ? 'bg-gray-100' : 'bg-gradient-to-br from-primary/10 to-blue-50'
                            }`}>
                                <img
                                    className={`w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300 bg-primary ${
                                        item.isBlocked ? 'grayscale' : ''
                                    }`}
                                    src={item.image}
                                    alt={item.name}
                                />
                                {/* Status Badge */}
                                <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    item.isBlocked ? 'bg-gray-700 text-white' :
                                    item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    <span className={`w-2 h-2 rounded-full ${
                                        item.isBlocked ? 'bg-gray-400' :
                                        item.available ? 'bg-green-500' : 'bg-red-500'
                                    }`}></span>
                                    {item.isBlocked ? 'Blocked' : item.available ? 'Available' : 'Unavailable'}
                                </div>
                            </div>

                            {/* Doctor Info */}
                            <div className='p-5'>
                                <h3 className='text-lg font-bold text-gray-800 mb-1'>{item.name}</h3>
                                <p className='text-primary text-sm font-medium mb-3'>{item.speciality}</p>

                                <div className='space-y-2 mb-4'>
                                    <div className='flex items-center gap-2 text-sm text-gray-500'>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                        </svg>
                                        <span>{item.experience}</span>
                                    </div>
                                    <div className='flex items-center gap-2 text-sm text-gray-500'>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                                        </svg>
                                        <span>Rs. {item.fees}</span>
                                    </div>
                                </div>

                                {/* Blocked reason preview */}
                                {item.isBlocked && item.blockedReason && (
                                    <p className='text-xs text-gray-400 mb-3 italic truncate'>Reason: {item.blockedReason}</p>
                                )}

                                <button
                                    onClick={() => navigate(`/doctor-details/${item._id}`)}
                                    className='w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-primary hover:text-white transition-all duration-300'
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

export default DoctorsList