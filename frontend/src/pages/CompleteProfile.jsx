import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import getProfileImage from '../utils/getProfileImage'

const CompleteProfile = () => {

    const { userData, userDataLoading, token, backendUrl, loadUserProfileData } = useContext(AppContext)
    const navigate = useNavigate()

    const [image, setImage] = useState(null)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        phone: '',
        gender: '',
        dob: '',
        addressLine1: '',
        addressLine2: ''
    })

    const handleSkip = () => {
        toast.info('You can complete your profile anytime from My Profile.')
        navigate('/')
    }

    const handleSubmit = async () => {
        if (!form.phone || !form.gender || !form.dob) {
            toast.error('Please fill phone, gender and date of birth')
            return
        }

        try {
            setSaving(true)
            const formData = new FormData()
            formData.append('name', userData?.name || '')
            formData.append('phone', form.phone)
            formData.append('gender', form.gender)
            formData.append('dob', form.dob)
            formData.append('address', JSON.stringify({
                line1: form.addressLine1,
                line2: form.addressLine2
            }))
            if (image) formData.append('image', image)

            const { data } = await axios.post(
                backendUrl + '/api/user/update-profile',
                formData,
                { headers: { token } }
            )

            if (data.success) {
                await loadUserProfileData()
                toast.success('Profile completed successfully!')
                navigate('/')
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

    const filledCount = [form.phone, form.gender, form.dob].filter(Boolean).length
    const progressPercent = Math.round((filledCount / 3) * 100)

    // ✅ Profile image logic:
    // 1. If user picked a new image → show preview
    // 2. If userData loaded and has image → show it
    // 3. If still loading → show a placeholder div (no broken img)
    const renderProfileImage = () => {
        if (image) {
            return (
                <img src={URL.createObjectURL(image)} alt='Profile'
                    className='w-16 h-16 rounded-full object-cover border-2 border-gray-200' />
            )
        }
        if (userDataLoading) {
            // ✅ Show animated placeholder while loading
            return (
                <div className='w-16 h-16 rounded-full bg-gray-200 animate-pulse border-2 border-gray-200'></div>
            )
        }
        if (userData?.image) {
            return (
                <img src={getProfileImage(userData.image)} alt='Profile'
                    className='w-16 h-16 rounded-full object-cover border-2 border-gray-200'
                    onError={(e) => {
                        // If image fails to load, show initials
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                    }}
                />
            )
        }
        // Fallback — show initials
        return (
            <div className='w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center'>
                <span className='text-primary font-bold text-xl'>
                    {userData?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-primary/5 to-blue-50 flex items-center justify-center py-12 px-4'>
            <div className='w-full max-w-lg'>
                <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>

                    {/* Header */}
                    <div className='bg-gradient-to-r from-primary to-blue-600 px-8 py-8 text-center'>
                        <div className='w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <span className='text-3xl'>🎉</span>
                        </div>
                        <h1 className='text-2xl font-bold text-white mb-1'>
                            Welcome{userData?.name ? `, ${userData.name.split(' ')[0]}` : ''}!
                        </h1>
                        <p className='text-blue-100 text-sm'>
                            Complete your profile to get the best experience
                        </p>
                        <div className='mt-5'>
                            <div className='flex items-center justify-between text-xs text-blue-100 mb-2'>
                                <span>Profile Completion</span>
                                <span>{progressPercent}%</span>
                            </div>
                            <div className='w-full bg-white/20 rounded-full h-2'>
                                <div className='bg-white rounded-full h-2 transition-all duration-500'
                                    style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className='px-8 py-6 space-y-5'>

                        {/* Profile Photo */}
                        <div className='flex items-center gap-4'>
                            <div className='relative flex-shrink-0'>
                                {/* ✅ Smart image rendering — no broken images */}
                                {renderProfileImage()}
                                <label className='absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-all'>
                                    <svg className='w-3 h-3 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                                    </svg>
                                    <input type='file' accept='image/*'
                                        onChange={e => setImage(e.target.files[0])} className='hidden' />
                                </label>
                            </div>
                            <div>
                                {userDataLoading ? (
                                    <div className='space-y-1'>
                                        <div className='h-4 w-28 bg-gray-200 animate-pulse rounded'></div>
                                        <div className='h-3 w-36 bg-gray-100 animate-pulse rounded'></div>
                                    </div>
                                ) : (
                                    <>
                                        <p className='font-semibold text-gray-800'>{userData?.name || 'Loading...'}</p>
                                        <p className='text-sm text-gray-500'>{userData?.email || ''}</p>
                                    </>
                                )}
                                <p className='text-xs text-primary mt-0.5'>Click + to add photo (optional)</p>
                            </div>
                        </div>

                        <div className='border-t border-gray-100'></div>

                        {/* Phone */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-2'>
                                Phone Number <span className='text-red-500'>*</span>
                            </label>
                            <div className='relative'>
                                <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                                    <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                    </svg>
                                </div>
                                <input type='tel' value={form.phone}
                                    onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder='Enter your phone number'
                                    className='w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all' />
                            </div>
                        </div>

                        {/* Gender */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-2'>
                                Gender <span className='text-red-500'>*</span>
                            </label>
                            <div className='grid grid-cols-3 gap-3'>
                                {['Male', 'Female', 'Other'].map(g => (
                                    <button key={g} type='button'
                                        onClick={() => setForm(prev => ({ ...prev, gender: g }))}
                                        className={`py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                                            form.gender === g
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-gray-200 text-gray-600 hover:border-primary/50'
                                        }`}>
                                        {g === 'Male' ? '👨 Male' : g === 'Female' ? '👩 Female' : '🧑 Other'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-2'>
                                Date of Birth <span className='text-red-500'>*</span>
                            </label>
                            <div className='relative'>
                                <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                                    <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                    </svg>
                                </div>
                                <input type='date' value={form.dob}
                                    onChange={e => setForm(prev => ({ ...prev, dob: e.target.value }))}
                                    max={new Date().toISOString().split('T')[0]}
                                    className='w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all' />
                            </div>
                        </div>

                        {/* Address — Optional */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-2'>
                                Address <span className='text-gray-400 font-normal'>(optional)</span>
                            </label>
                            <div className='space-y-2'>
                                <input type='text' value={form.addressLine1}
                                    onChange={e => setForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                                    placeholder='Address Line 1'
                                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all' />
                                <input type='text' value={form.addressLine2}
                                    onChange={e => setForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                                    placeholder='City, State, PIN'
                                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all' />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className='pt-2 space-y-3'>
                            <button onClick={handleSubmit}
                                disabled={saving || !form.phone || !form.gender || !form.dob}
                                className='w-full py-3.5 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                                {saving ? (
                                    <><div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>Saving...</>
                                ) : (
                                    <><svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                                    </svg>Complete Profile</>
                                )}
                            </button>

                            <button onClick={handleSkip}
                                className='w-full py-3 text-gray-500 text-sm font-medium hover:text-gray-700 transition-all flex items-center justify-center gap-1'>
                                Skip for now
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                                </svg>
                            </button>
                        </div>

                        <p className='text-xs text-center text-gray-400'>
                            You can always update this later from My Profile
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CompleteProfile