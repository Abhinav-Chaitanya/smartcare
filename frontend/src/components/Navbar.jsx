import React, { useState, useEffect, useContext } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import getProfileImage from '../utils/getProfileImage'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, setToken, userData } = useContext(AppContext)

  const [showMenu, setShowMenu] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isDashboardPage = ['/my-dashboard', '/my-appointments', '/my-profile'].includes(location.pathname) || location.pathname.startsWith('/appointment-details/')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setShowMenu(false)
    setShowDropdown(false)
  }, [location])

  const logout = () => {
    navigate('/')
    setToken(false)
    localStorage.removeItem('token')
  }

  // ✅ Single call — handles all fallback logic
  const profileImg = getProfileImage(userData?.image)

  const navLinks = [
    {
      path: '/',
      label: 'Home',
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
        </svg>
      )
    },
    {
      path: '/doctors',
      label: 'Doctors',
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
        </svg>
      )
    },
    {
      path: '/about',
      label: 'About',
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
      )
    },
    {
      path: '/contact',
      label: 'Contact',
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
        </svg>
      )
    },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
      }`}>
        <div className='w-full border-b border-gray-200'>
          <div className='w-full px-4 sm:px-6 lg:px-8'>
            <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'py-3' : 'py-4'}`}>

              {/* Logo */}
              <div onClick={() => navigate('/')} className='cursor-pointer flex items-center gap-2 group'>
                <img className='w-40 sm:w-44 transition-transform duration-300 group-hover:scale-105'
                  src={assets.logo1} alt="Logo" />
              </div>

              {/* Desktop Navigation */}
              <ul className='hidden lg:flex items-center gap-1'>
                {navLinks.map((link) => (
                  <NavLink key={link.path} to={link.path}
                    className={({ isActive }) => `
                      relative px-4 py-2 rounded-full font-medium text-sm transition-all duration-300
                      ${isActive ? 'text-primary bg-primary/10' : 'text-gray-600 hover:text-primary hover:bg-gray-100'}
                    `}>
                    {({ isActive }) => (
                      <>
                        <span>{link.label}</span>
                        {isActive && <span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full'></span>}
                      </>
                    )}
                  </NavLink>
                ))}
              </ul>

              {/* Right Side */}
              <div className='flex items-center gap-3'>

                {token && userData ? (
                  <div className='relative'>
                    <button onClick={() => setShowDropdown(!showDropdown)}
                      className='flex items-center gap-2 p-1.5 pr-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 border-2 border-transparent hover:border-primary/20'>
                      {/* ✅ Using profileImg with fallback */}
                      <img className='w-9 h-9 rounded-full object-cover ring-2 ring-primary/20'
                        src={profileImg} alt={userData.name} />
                      <div className='hidden sm:block text-left'>
                        <p className='text-sm font-semibold text-gray-800 leading-tight'>
                          {userData.name?.split(' ')[0] || 'User'}
                        </p>
                        <p className='text-xs text-gray-500'>My Account</p>
                      </div>
                      <svg className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showDropdown && (
                      <>
                        <div className='fixed inset-0 z-10' onClick={() => setShowDropdown(false)}></div>
                        <div className='absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-20 animate-fadeIn'>
                          <div className='p-4 bg-gradient-to-r from-primary/10 to-blue-50 border-b border-gray-100'>
                            <div className='flex items-center gap-3'>
                              {/* ✅ Using profileImg with fallback */}
                              <img className='w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md'
                                src={profileImg} alt={userData.name} />
                              <div className='min-w-0 flex-1'>
                                <p className='font-bold text-gray-900 truncate'>{userData.name}</p>
                                <p className='text-xs text-gray-500 truncate'>{userData.email}</p>
                              </div>
                            </div>
                          </div>

                          <div className='p-2'>
                            <button onClick={() => { navigate('/my-dashboard'); setShowDropdown(false) }}
                              className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 group'>
                              <svg className='w-5 h-5 text-gray-500 group-hover:text-primary transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                              </svg>
                              <div className='text-left'>
                                <p className='font-medium'>My Dashboard</p>
                                <p className='text-xs text-gray-500'>View your overview</p>
                              </div>
                            </button>

                            {isDashboardPage && (
                              <button onClick={() => { navigate('/'); setShowDropdown(false) }}
                                className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 group'>
                                <svg className='w-5 h-5 text-gray-500 group-hover:text-primary transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                                </svg>
                                <div className='text-left'>
                                  <p className='font-medium'>Home</p>
                                  <p className='text-xs text-gray-500'>Go to main website</p>
                                </div>
                              </button>
                            )}

                            <div className='my-2 border-t border-gray-100'></div>

                            <button onClick={() => { logout(); setShowDropdown(false) }}
                              className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group'>
                              <svg className='w-5 h-5 group-hover:scale-110 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                              </svg>
                              <div className='text-left'>
                                <p className='font-medium'>Logout</p>
                                <p className='text-xs text-red-400'>Sign out of your account</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button onClick={() => navigate('/login')}
                    className='hidden md:flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5'>
                    <span>Login</span>
                    <svg className='w-4 h-4' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                )}

                <button onClick={() => setShowMenu(true)}
                  className='lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-300'>
                  <svg className='w-6 h-6 text-gray-700' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className={`${scrolled ? 'h-[65px]' : 'h-[73px]'} transition-all duration-300`}></div>

      {/* Mobile Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity duration-300 ${showMenu ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setShowMenu(false)}></div>

      {/* Mobile Panel */}
      <div className={`fixed top-0 right-0 bottom-0 w-80 max-w-full bg-white z-50 lg:hidden transform transition-transform duration-300 ease-out shadow-2xl ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='flex items-center justify-between p-5 border-b border-gray-100'>
          <img className='w-32' src={assets.logo1} alt="Logo" />
          <button onClick={() => setShowMenu(false)} className='p-2 rounded-xl hover:bg-gray-100 transition-all duration-300'>
            <svg className='w-6 h-6 text-gray-700' fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {token && userData && (
          <div className='p-5 bg-gradient-to-r from-primary/10 to-blue-50 border-b border-gray-100'>
            <div className='flex items-center gap-3'>
              {/* ✅ Using profileImg with fallback */}
              <img className='w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-lg'
                src={profileImg} alt={userData.name} />
              <div className='min-w-0 flex-1'>
                <p className='font-bold text-gray-900 text-lg truncate'>{userData.name}</p>
                <p className='text-sm text-gray-500 truncate'>{userData.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className='p-5 overflow-y-auto' style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3'>Menu</p>
          <ul className='space-y-1'>
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink to={link.path} onClick={() => setShowMenu(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-700 hover:bg-gray-100'}
                  `}>
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {token && userData && (
            <div className='mt-6'>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3'>Account</p>
              <ul className='space-y-1'>
                <li>
                  <button onClick={() => { navigate('/my-dashboard'); setShowMenu(false) }}
                    className='w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                    </svg>
                    <span>My Dashboard</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => { logout(); setShowMenu(false) }}
                    className='w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all duration-200'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                    </svg>
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {!token && (
          <div className='absolute bottom-0 left-0 right-0 p-5 border-t border-gray-100 bg-white'>
            <button onClick={() => { navigate('/login'); setShowMenu(false) }}
              className='w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25'>
              <span>Login / Sign Up</span>
              <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default Navbar