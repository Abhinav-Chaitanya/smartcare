import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Doctors = () => {

  const { speciality } = useParams()
  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const navigate = useNavigate()
  
  // ✅ UPDATED: Get departments from context
  const { doctors, departments, departmentsLoading, currencySymbol } = useContext(AppContext)

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality))
    } else {
      setFilterDoc(doctors)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])

  const handleSpecialityClick = (spec) => {
    if (speciality === spec) {
      navigate('/doctors')
    } else {
      navigate(`/doctors/${spec}`)
    }
  }

  // Get total available doctors count
  const totalAvailableDoctors = doctors.filter(doc => doc.available).length

  return (
    <div className='py-8'>
      {/* Header Section */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>
          Find Your Specialist
        </h1>
        <p className='text-gray-600'>
          Browse through our extensive list of trusted and experienced doctors
        </p>
      </div>

      <div className='flex flex-col lg:flex-row gap-6'>
        
        {/* Sidebar Filter */}
        <div className='lg:w-64 flex-shrink-0'>
          {/* Mobile Filter Toggle */}
          <button 
            className='lg:hidden w-full mb-4 py-3 px-4 bg-primary text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:bg-primary/90'
            onClick={() => setShowFilter(prev => !prev)}
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' />
            </svg>
            {showFilter ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Filter Options */}
          <div className={`${showFilter ? 'block' : 'hidden lg:block'}`}>
            <div className='bg-white rounded-lg shadow-md p-4 border border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                </svg>
                Specialties
              </h3>
              
              {/* ✅ Loading State */}
              {departmentsLoading ? (
                <div className='space-y-2'>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className='h-12 bg-gray-200 rounded-lg animate-pulse'></div>
                  ))}
                </div>
              ) : (
                <div className='space-y-2'>
                  {/* All Doctors Option */}
                  <button
                    onClick={() => navigate('/doctors')}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-between
                      ${!speciality 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <div className='flex items-center gap-3'>
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                      </svg>
                      <span>All Doctors</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      !speciality 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {totalAvailableDoctors}
                    </span>
                  </button>

                  {/* ✅ UPDATED: Dynamic Specialty Options from Database */}
                  {departments.map((dept) => (
                    <button
                      key={dept._id}
                      onClick={() => handleSpecialityClick(dept.name)}
                      className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-between
                        ${speciality === dept.name 
                          ? 'bg-primary text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      <div className='flex items-center gap-3'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        <span>{dept.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        speciality === dept.name 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {dept.doctorCount}
                      </span>
                    </button>
                  ))}

                  {/* Empty State */}
                  {departments.length === 0 && !departmentsLoading && (
                    <div className='text-center py-4 text-gray-500 text-sm'>
                      <svg className='w-8 h-8 mx-auto mb-2 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                      </svg>
                      No departments available
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className='mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100'>
              <p className='text-sm text-blue-800'>
                <span className='font-semibold'>{filterDoc.length}</span> doctor{filterDoc.length !== 1 ? 's' : ''} found
                {speciality && (
                  <span className='block mt-1 text-blue-600'>
                    in <span className='font-semibold'>{speciality}</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className='flex-1'>
          {filterDoc.length === 0 ? (
            <div className='text-center py-16'>
              <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-10 h-10 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-700 mb-2'>No doctors found</h3>
              <p className='text-gray-500 mb-4'>
                {speciality 
                  ? `No available doctors in ${speciality} department`
                  : 'Try selecting a different specialty'
                }
              </p>
              {speciality && (
                <button
                  onClick={() => navigate('/doctors')}
                  className='px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all'
                >
                  View All Doctors
                </button>
              )}
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
              {filterDoc.map((item, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/appointment/${item._id}`)}
                  className='group bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2'
                >
                  {/* Doctor Image */}
                  <div className='relative overflow-hidden bg-gradient-to-br from-blue-50 to-primary/10'>
                    <img 
                      className='w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 bg-primary' 
                      src={item.image} 
                      alt={item.name} 
                    />
                    
                    {/* Available Badge */}
                    <div className='absolute top-3 right-3'>
                      <div className={`${item.available ? 'bg-green-500' : 'bg-gray-500'} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg`}>
                        <span className={`w-2 h-2 bg-white rounded-full ${item.available ? 'animate-pulse' : ''}`}></span>
                        {item.available ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className='p-5'>
                    <h3 className='text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors'>
                      {item.name}
                    </h3>
                    
                    <div className='flex items-center gap-2 mb-3'>
                      <span className='text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full'>
                        {item.speciality}
                      </span>
                    </div>

                    <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        <span>{currencySymbol}{item.fees}</span>
                      </div>
                      
                      <button className='text-sm font-semibold text-primary group-hover:text-primary/80 flex items-center gap-1'>
                        Book Now
                        <svg className='w-4 h-4 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M14 5l7 7m0 0l-7 7m7-7H3' />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Doctors