import React, { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {

    const { aToken } = useContext(AdminContext)
    const { dToken } = useContext(DoctorContext)
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Admin menu items with SVG icons
    const adminMenuItems = [
        {
            path: '/admin-dashboard',
            label: 'Dashboard',
            icon: (
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                </svg>
            ),
            description: 'Overview & Stats'
        },
        {
            path: '/all-appointments',
            label: 'Appointments',
            icon: (
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                </svg>
            ),
            description: 'Manage bookings'
        },
        /*{
            path: '/doctor-list',
            label: 'Doctors List',
            icon: (
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
            ),
            description: 'View all doctors'
        }*/
        {
            path: '/departments',  // ✅ CHANGED: from '/doctor-list' to '/departments'
            label: 'Departments',   // ✅ CHANGED: from 'Doctors List' to 'Departments'
            icon: (
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                </svg>
            ),
            description: 'Manage departments'  // ✅ CHANGED
        },
        {
            path: '/patients-list',
            label: 'Patients List',
            icon: (
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                </svg>
            ),
            description: 'View all patients'
        },
        {
            path: '/analytics',
            label: 'Analytics',
            icon: (
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                </svg>
            ),
            description: 'Reports & Charts'
        }
    ]

    // Doctor menu items with SVG icons
    const doctorMenuItems = [
        {
            path: '/doctor-dashboard',
            label: 'Dashboard',
            icon: (
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                </svg>
            ),
            description: 'Overview & Stats'
        },
        {
            path: '/doctor-appointments',
            label: 'Appointments',
            icon: (
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                </svg>
            ),
            description: 'Manage patients'
        },
        {
            path: '/doctor-profile',
            label: 'My Profile',
            icon: (
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
            ),
            description: 'Edit profile info'
        },
        {
            path: '/doctor-analytics',
            label: 'Analytics',
            icon: (
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                </svg>
            ),
            description: 'Reports & Charts'
        }
    ]

    const menuItems = aToken ? adminMenuItems : doctorMenuItems
    const panelType = aToken ? 'admin' : 'doctor'

    return (
        <aside className={`min-h-screen bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>

            {/* Sidebar Header */}
            <div className='p-4 border-b border-gray-100'>
                <div className='flex items-center justify-between'>
                    {!isCollapsed && (
                        <div>
                            <h2 className={`font-bold text-lg ${aToken ? 'text-purple-700' : 'text-primary'}`}>
                                {aToken ? 'Admin' : 'Doctor'}
                            </h2>
                            <p className='text-xs text-gray-500'>Control Panel</p>
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
                                        ? panelType === 'admin'
                                            ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500 shadow-sm'
                                            : 'bg-primary/10 text-primary border-l-4 border-primary shadow-sm'
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
                                            <span className={`w-2 h-2 rounded-full ${panelType === 'admin' ? 'bg-purple-500' : 'bg-primary'}`}></span>
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

export default Sidebar