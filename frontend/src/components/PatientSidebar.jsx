import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

const PatientSidebar = () => {

    const [isCollapsed, setIsCollapsed] = useState(false)

    // Patient menu items with SVG icons
    const menuItems = [
        {
            path: '/my-dashboard',
            label: 'Dashboard',
            icon: (
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                </svg>
            ),
            description: 'Overview & Stats'
        },
        {
            path: '/my-appointments',
            label: 'My Appointments',
            icon: (
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                </svg>
            ),
            description: 'View & manage bookings'
        },
        /*{
            path: '/doctors',
            label: 'Find Doctors',
            icon: (
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
            ),
            description: 'Browse & book doctors'
        },*/
        {
            path: '/my-profile',
            label: 'My Profile',
            icon: (
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
            ),
            description: 'Edit profile info'
        }
    ]

    return (
        <aside className={`min-h-screen bg-white border-r border-gray-200 transition-all duration-300 sticky top-0 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            
            {/* Sidebar Header */}
            <div className='p-4 border-b border-gray-100'>
                <div className='flex items-center justify-between'>
                    {!isCollapsed && (
                        <div>
                            <h2 className='font-bold text-lg text-primary'>
                                Patient
                            </h2>
                            <p className='text-xs text-gray-500'>Dashboard</p>
                        </div>
                    )}
                    
                    {/* Collapse Button */}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className='p-2 rounded-lg hover:bg-gray-100 transition-all hidden lg:block'
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                        <svg 
                            className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className='p-3'>
                <ul className='space-y-1'>
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <NavLink 
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                                    ${isActive 
                                        ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                                    }
                                    ${isCollapsed ? 'justify-center px-2' : ''}
                                `}
                            >
                                {/* Icon */}
                                <span className='flex-shrink-0'>{item.icon}</span>
                                
                                {/* Label & Description */}
                                {!isCollapsed && (
                                    <div className='flex-1 min-w-0'>
                                        <p className='font-medium text-sm'>{item.label}</p>
                                        <p className='text-xs text-gray-400 truncate'>{item.description}</p>
                                    </div>
                                )}

                                {/* Active Indicator */}
                                {!isCollapsed && (
                                    <NavLink to={item.path}>
                                        {({ isActive }) => isActive && (
                                            <span className='w-2 h-2 rounded-full bg-primary'></span>
                                        )}
                                    </NavLink>
                                )}

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className='absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50'>
                                        {item.label}
                                        <div className='absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900'></div>
                                    </div>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    )
}

export default PatientSidebar