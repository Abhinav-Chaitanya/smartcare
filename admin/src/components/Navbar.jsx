/*import React from 'react'
import { assets } from '../assets/assets'
import { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'

const Navbar = () => {

    const { aToken, setAToken } = useContext(AdminContext)

    const { dToken, setDToken } = useContext(DoctorContext)

    const navigate = useNavigate()

    const logout = () => {

        // Admin logout
        if (aToken) {
            setAToken('')
            localStorage.removeItem('aToken')
            navigate('/')
            return
        }


        // Doctor logout
        if (dToken) {
            setDToken('')
            localStorage.removeItem('dToken')
            navigate('/')
            return
        }
    }

    return (
        <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
            <div className='flex items-center gap-2 text-xs'>
                <img className='w-42 h-10 sm:w-40 cursor-pointer' src={assets.logo1} alt="" />
                <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>{aToken ? 'Admin' : 'Doctor'}</p>
            </div>
            <button onClick={logout} className='bg-primary text-white text-sm px-10 py-2 rounded-full'>Logout</button>
        </div>
    )
}

export default Navbar   */


/*import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {

    const { aToken, setAToken } = useContext(AdminContext)
    const { dToken, setDToken, profileData } = useContext(DoctorContext)
    const navigate = useNavigate()

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)

    const logout = () => {
        // Admin logout
        if (aToken) {
            setAToken('')
            localStorage.removeItem('aToken')
            navigate('/')
            return
        }

        // Doctor logout
        if (dToken) {
            setDToken('')
            localStorage.removeItem('dToken')
            navigate('/')
            return
        }
    }

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true)
        setShowProfileMenu(false)
    }

    const isAdmin = !!aToken
    const isDoctor = !!dToken

    return (
        <>
            <nav className='sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm'>
                <div className='flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3'>
                    
              
                    <div className='flex items-center gap-4'>
                   
                        <div 
                            onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/doctor-dashboard')}
                            className='cursor-pointer flex items-center gap-2'
                        >
                            <img 
                                className='h-9 sm:h-10 w-auto' 
                                src={assets.logo1} 
                                alt="SmartCare" 
                            />
                        </div>

                        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                            ${isAdmin 
                                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                : 'bg-green-100 text-green-700 border border-green-200'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-purple-500' : 'bg-green-500'} animate-pulse`}></span>
                            {isAdmin ? 'Admin Panel' : 'Doctor Panel'}
                        </div>
                    </div>

                 
                    <div className='flex items-center gap-3'>
                        
                        
                        <div className='hidden lg:block text-right mr-2'>
                            <p className='text-xs text-gray-500'>Welcome back,</p>
                            <p className='text-sm font-semibold text-gray-800'>
                                {isAdmin ? 'Administrator' : profileData?.name || 'Doctor'}
                            </p>
                        </div>

                       
                        <div className='relative'>
                            <button 
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className='flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200'
                            >
                             
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md
                                    ${isAdmin 
                                        ? 'bg-gradient-to-br from-purple-500 to-purple-700' 
                                        : 'bg-gradient-to-br from-primary to-blue-600'
                                    }`}
                                >
                                    {isAdmin ? (
                                        <span className='text-lg'>👨‍💼</span>
                                    ) : profileData?.image ? (
                                        <img 
                                            src={profileData.image} 
                                            alt="Profile" 
                                            className='w-full h-full rounded-xl object-cover'
                                        />
                                    ) : (
                                        <span className='text-lg'>👨‍⚕️</span>
                                    )}
                                </div>

                             
                                <svg 
                                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                  
                            {showProfileMenu && (
                                <>
                             
                                    <div 
                                        className='fixed inset-0 z-10' 
                                        onClick={() => setShowProfileMenu(false)}
                                    ></div>

                           
                                    <div className='absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20 animate-fadeIn'>
                                 
                                        <div className='px-4 py-3 border-b border-gray-100'>
                                            <p className='text-sm font-semibold text-gray-800'>
                                                {isAdmin ? 'Administrator' : profileData?.name || 'Doctor'}
                                            </p>
                                            <p className='text-xs text-gray-500 mt-0.5'>
                                                {isAdmin ? 'admin@smartcare.com' : profileData?.email || 'doctor@smartcare.com'}
                                            </p>
                                        </div>

                                 
                                        {isDoctor && (
                                            <button 
                                                onClick={() => {
                                                    navigate('/doctor-profile')
                                                    setShowProfileMenu(false)
                                                }}
                                                className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all'
                                            >
                                                <span className='text-lg'>👤</span>
                                                My Profile
                                            </button>
                                        )}

                                        <button 
                                            onClick={() => {
                                                navigate(isAdmin ? '/admin-dashboard' : '/doctor-dashboard')
                                                setShowProfileMenu(false)
                                            }}
                                            className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all'
                                        >
                                            <span className='text-lg'>🏠</span>
                                            Dashboard
                                        </button>

                                        <div className='border-t border-gray-100 my-1'></div>

                                        <button 
                                            onClick={handleLogoutClick}
                                            className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all'
                                        >
                                            <span className='text-lg'>🚪</span>
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

           
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl animate-fadeIn">
                        <div className="p-6 text-center">
                            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <span className='text-3xl'>👋</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Logout?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to logout from the {isAdmin ? 'Admin' : 'Doctor'} Panel?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-2.5 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={logout}
                                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>🚪</span>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbar   */


import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {

    const { aToken, setAToken } = useContext(AdminContext)
    const { dToken, setDToken, profileData } = useContext(DoctorContext)
    const navigate = useNavigate()

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)

    const logout = () => {
        // Admin logout
        if (aToken) {
            setAToken('')
            localStorage.removeItem('aToken')
            navigate('/')
            return
        }

        // Doctor logout
        if (dToken) {
            setDToken('')
            localStorage.removeItem('dToken')
            navigate('/')
            return
        }
    }

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true)
        setShowProfileMenu(false)
    }

    const isAdmin = !!aToken
    const isDoctor = !!dToken

    return (
        <>
            <nav className='sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm'>
                <div className='flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3'>
                    
                    {/* Left Section - Logo & Role Badge */}
                    <div className='flex items-center gap-4'>
                        {/* Logo */}
                        <div 
                            onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/doctor-dashboard')}
                            className='cursor-pointer flex items-center gap-2'
                        >
                            <img 
                                className='h-9 sm:h-10 w-auto' 
                                src={assets.logo1} 
                                alt="SmartCare" 
                            />
                        </div>

                        {/* Role Badge */}
                        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                            ${isAdmin 
                                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                : 'bg-green-100 text-green-700 border border-green-200'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-purple-500' : 'bg-green-500'} animate-pulse`}></span>
                            {isAdmin ? 'Admin Panel' : 'Doctor Panel'}
                        </div>
                    </div>

                    {/* Right Section - Profile & Actions */}
                    <div className='flex items-center gap-3'>
                        
                        {/* Welcome Message - Hidden on mobile */}
                        <div className='hidden lg:block text-right mr-2'>
                            <p className='text-xs text-gray-500'>Welcome back,</p>
                            <p className='text-sm font-semibold text-gray-800'>
                                {isAdmin ? 'Administrator' : profileData?.name || 'Doctor'}
                            </p>
                        </div>

                        {/* Profile Dropdown */}
                        <div className='relative'>
                            <button 
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className='flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200'
                            >
                                {/* Avatar */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md
                                    ${isAdmin 
                                        ? 'bg-gradient-to-br from-purple-500 to-purple-700' 
                                        : 'bg-gradient-to-br from-primary to-blue-600'
                                    }`}
                                >
                                    {isAdmin ? (
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                                        </svg>
                                    ) : profileData?.image ? (
                                        <img 
                                            src={profileData.image} 
                                            alt="Profile" 
                                            className='w-full h-full rounded-xl object-cover'
                                        />
                                    ) : (
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                        </svg>
                                    )}
                                </div>

                                {/* Dropdown Arrow */}
                                <svg 
                                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {showProfileMenu && (
                                <>
                                    {/* Backdrop */}
                                    <div 
                                        className='fixed inset-0 z-10' 
                                        onClick={() => setShowProfileMenu(false)}
                                    ></div>

                                    {/* Menu */}
                                    <div className='absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20 animate-fadeIn'>
                                        {/* User Info */}
                                        <div className='px-4 py-3 border-b border-gray-100'>
                                            <p className='text-sm font-semibold text-gray-800'>
                                                {isAdmin ? 'Administrator' : profileData?.name || 'Doctor'}
                                            </p>
                                            <p className='text-xs text-gray-500 mt-0.5'>
                                                {isAdmin ? 'admin@smartcare.com' : profileData?.email || 'doctor@smartcare.com'}
                                            </p>
                                        </div>

                                        {/* Menu Items */}
                                        {isDoctor && (
                                            <button 
                                                onClick={() => {
                                                    navigate('/doctor-profile')
                                                    setShowProfileMenu(false)
                                                }}
                                                className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all'
                                            >
                                                <svg className='w-5 h-5 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                                </svg>
                                                My Profile
                                            </button>
                                        )}

                                        <button 
                                            onClick={() => {
                                                navigate(isAdmin ? '/admin-dashboard' : '/doctor-dashboard')
                                                setShowProfileMenu(false)
                                            }}
                                            className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all'
                                        >
                                            <svg className='w-5 h-5 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                                            </svg>
                                            Dashboard
                                        </button>

                                        <div className='border-t border-gray-100 my-1'></div>

                                        {/* Logout */}
                                        <button 
                                            onClick={handleLogoutClick}
                                            className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all'
                                        >
                                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl animate-fadeIn">
                        <div className="p-6 text-center">
                            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Logout?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to logout from the {isAdmin ? 'Admin' : 'Doctor'} Panel?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-2.5 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={logout}
                                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbar