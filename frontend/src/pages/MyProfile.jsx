import React, { useState } from 'react'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import getProfileImage from '../utils/getProfileImage'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyProfile = () => {

  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)
  const [saving, setSaving] = useState(false)

  const updateUserProfileData = async () => {
    try {
      setSaving(true)

      const formData = new FormData()
      formData.append('name', userData.name)
      formData.append('phone', userData.phone)
      formData.append('address', JSON.stringify(userData.address))
      formData.append('gender', userData.gender)
      formData.append('dob', userData.dob)
      image && formData.append('image', image)

      const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })

      if (data.success) {
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Not Selected') return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // ✅ Check which fields are missing
  const missingFields = []
  if (!userData?.phone || userData.phone === '0000000000') missingFields.push('phone number')
  if (!userData?.gender || userData.gender === 'Not Selected') missingFields.push('gender')
  if (!userData?.dob || userData.dob === 'Not Selected') missingFields.push('date of birth')

  const isIncomplete = !userData?.isProfileComplete && missingFields.length > 0

  return userData && (
    <div className='w-full max-w-4xl m-5'>

      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>My Profile</h1>
        <p className='text-gray-500 text-sm mt-1'>Manage your personal information and account settings</p>
      </div>

      {/* ✅ Incomplete Profile Banner */}
      {isIncomplete && !isEdit && (
        <div className='mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div className='flex items-start gap-3'>
            <div className='w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5'>
              <svg className='w-5 h-5 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
              </svg>
            </div>
            <div>
              <p className='font-semibold text-amber-800'>Your profile is incomplete</p>
              <p className='text-sm text-amber-700 mt-0.5'>
                Missing: <span className='font-medium'>{missingFields.join(', ')}</span>
              </p>
              <p className='text-xs text-amber-600 mt-1'>
                Complete your profile so we can serve you better and contact you if needed.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEdit(true)}
            className='flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600 transition-all shadow-sm'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
            </svg>
            Complete Now
          </button>
        </div>
      )}

      {/* Profile Card */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>

        {/* Profile Header with Cover */}
        <div className='relative h-36 bg-gradient-to-r from-primary via-primary/90 to-blue-600'>
          <div className='absolute inset-0 opacity-10'>
            <svg className='w-full h-full' viewBox='0 0 100 100' preserveAspectRatio='none'>
              <defs>
                <pattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'>
                  <path d='M 10 0 L 0 0 0 10' fill='none' stroke='white' strokeWidth='0.5' />
                </pattern>
              </defs>
              <rect width='100' height='100' fill='url(#grid)' />
            </svg>
          </div>

          {isEdit && (
            <div className='absolute top-4 right-4'>
              <span className='bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                </svg>
                Edit Mode
              </span>
            </div>
          )}

          <div className='absolute -bottom-14 left-8'>
            {isEdit ? (
              <label htmlFor='image' className='cursor-pointer group block'>
                <div className='relative'>
                  <img
                    className='w-28 h-28 rounded-2xl border-4 border-white shadow-lg object-cover group-hover:opacity-80 transition-all duration-200'
                    src={image ? URL.createObjectURL(image) : getProfileImage(userData.image)}
                    alt='Profile'
                  />
                  <div className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-200'>
                    <div className='text-center text-white'>
                      <svg className='w-6 h-6 mx-auto mb-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 13a3 3 0 11-6 0 3 3 0 016 0z' />
                      </svg>
                      <span className='text-xs font-medium'>Change</span>
                    </div>
                  </div>
                </div>
                <input onChange={(e) => setImage(e.target.files[0])} type='file' id='image' hidden accept='image/*' />
              </label>
            ) : (
              <img
                className='w-28 h-28 rounded-2xl border-4 border-white shadow-lg object-cover'
                src={getProfileImage(userData.image)}
                alt='Profile'
              />
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className='pt-20 p-6'>

          {/* Name & Email */}
          <div className='mb-8'>
            {isEdit ? (
              <input
                className='text-2xl font-bold text-gray-800 bg-gray-50 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-all w-full max-w-md'
                type='text'
                value={userData.name}
                onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))}
                placeholder='Enter your name'
              />
            ) : (
              <h2 className='text-2xl font-bold text-gray-800'>{userData.name}</h2>
            )}
            <p className='text-gray-500 mt-1 flex items-center gap-2'>
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
              </svg>
              {userData.email}
            </p>
          </div>

          <div className='grid gap-6'>

            {/* Contact Information */}
            <div className='bg-gray-50 rounded-xl p-5 border border-gray-100'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
                  <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                  </svg>
                </div>
                <div>
                  <h3 className='font-semibold text-gray-800'>Contact Information</h3>
                  <p className='text-xs text-gray-500'>Your contact details</p>
                </div>
              </div>

              <div className='space-y-4'>
                {/* Phone */}
                <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
                  <div className='flex items-center gap-2 w-32'>
                    <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' />
                    </svg>
                    <span className='text-sm font-medium text-gray-600'>Phone</span>
                  </div>
                  {isEdit ? (
                    <input
                      className='flex-1 bg-white px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-all text-sm'
                      type='tel'
                      value={userData.phone === '0000000000' ? '' : userData.phone}
                      onChange={e => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder='Enter phone number'
                    />
                  ) : (
                    <span className={`text-sm font-medium flex items-center gap-1 ${
                      !userData.phone || userData.phone === '0000000000' ? 'text-amber-500' : 'text-gray-800'
                    }`}>
                      {!userData.phone || userData.phone === '0000000000' ? (
                        <><svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01' /></svg>Not set</>
                      ) : userData.phone}
                    </span>
                  )}
                </div>

                {/* Address */}
                <div className='flex flex-col sm:flex-row sm:items-start gap-2'>
                  <div className='flex items-center gap-2 w-32 pt-2'>
                    <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                    </svg>
                    <span className='text-sm font-medium text-gray-600'>Address</span>
                  </div>
                  {isEdit ? (
                    <div className='flex-1 space-y-2'>
                      <input
                        className='w-full bg-white px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-all text-sm'
                        onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                        value={userData.address.line1}
                        type='text'
                        placeholder='Address Line 1'
                      />
                      <input
                        className='w-full bg-white px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-all text-sm'
                        onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                        value={userData.address.line2}
                        type='text'
                        placeholder='Address Line 2 (City, State, ZIP)'
                      />
                    </div>
                  ) : (
                    <div className='text-sm text-gray-800'>
                      {userData.address.line1 || userData.address.line2 ? (
                        <>
                          <p className='font-medium'>{userData.address.line1 || 'Not set'}</p>
                          {userData.address.line2 && <p className='text-gray-500'>{userData.address.line2}</p>}
                        </>
                      ) : (
                        <span className='text-gray-400'>Not set</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className='bg-gray-50 rounded-xl p-5 border border-gray-100'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                  </svg>
                </div>
                <div>
                  <h3 className='font-semibold text-gray-800'>Basic Information</h3>
                  <p className='text-xs text-gray-500'>Your personal details</p>
                </div>
              </div>

              <div className='grid sm:grid-cols-2 gap-4'>
                {/* Gender */}
                <div className='flex flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' />
                    </svg>
                    <span className='text-sm font-medium text-gray-600'>Gender</span>
                  </div>
                  {isEdit ? (
                    <select
                      className='bg-white px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-all text-sm cursor-pointer'
                      onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                      value={userData.gender}
                    >
                      <option value=''>Select Gender</option>
                      <option value='Male'>Male</option>
                      <option value='Female'>Female</option>
                      <option value='Other'>Other</option>
                    </select>
                  ) : (
                    <span className={`text-sm font-medium ${
                      !userData.gender || userData.gender === 'Not Selected' ? 'text-amber-500' : 'text-gray-800'
                    }`}>
                      {!userData.gender || userData.gender === 'Not Selected' ? 'Not set' : userData.gender}
                    </span>
                  )}
                </div>

                {/* Date of Birth */}
                <div className='flex flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                    </svg>
                    <span className='text-sm font-medium text-gray-600'>Date of Birth</span>
                  </div>
                  {isEdit ? (
                    <input
                      className='bg-white px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-all text-sm'
                      type='date'
                      onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))}
                      value={userData.dob === 'Not Selected' ? '' : userData.dob}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  ) : (
                    <span className={`text-sm font-medium ${
                      !userData.dob || userData.dob === 'Not Selected' ? 'text-amber-500' : 'text-gray-800'
                    }`}>
                      {formatDate(userData.dob)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className={`rounded-xl p-5 border ${
              isIncomplete
                ? 'bg-amber-50 border-amber-100'
                : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100'
            }`}>
              <div className='flex items-center gap-3'>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isIncomplete ? 'bg-amber-100' : 'bg-green-100'
                }`}>
                  {isIncomplete ? (
                    <svg className='w-5 h-5 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                    </svg>
                  ) : (
                    <svg className='w-5 h-5 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                    </svg>
                  )}
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-gray-800'>
                    {isIncomplete ? 'Profile Incomplete' : 'Profile Complete'}
                  </h3>
                  <p className='text-xs text-gray-500'>
                    {isIncomplete
                      ? `Missing: ${missingFields.join(', ')}`
                      : 'Your profile is complete and account is verified'}
                  </p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${isIncomplete ? 'text-amber-600' : 'text-green-600'}`}>
                  {isIncomplete ? (
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01' />
                    </svg>
                  ) : (
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                    </svg>
                  )}
                  {isIncomplete ? 'Incomplete' : 'Complete'}
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap gap-3 pt-6 mt-6 border-t border-gray-100'>
            {isEdit ? (
              <>
                <button
                  className='flex-1 sm:flex-none bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                  onClick={updateUserProfileData}
                  disabled={saving}
                >
                  {saving ? (
                    <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>Saving...</>
                  ) : (
                    <><svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' /></svg>Save Changes</>
                  )}
                </button>
                <button
                  className='flex-1 sm:flex-none border-2 border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2'
                  onClick={() => { setIsEdit(false); setImage(false); loadUserProfileData() }}
                  disabled={saving}
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                  </svg>
                  Cancel
                </button>
              </>
            ) : (
              <button
                className='flex-1 sm:flex-none bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2'
                onClick={() => setIsEdit(true)}
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                </svg>
                Edit Profile
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  )
}

export default MyProfile