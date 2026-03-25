import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
    return (
        <div className='py-12'>

            {/* Header */}
            <div className='text-center mb-14'>
                <div className='inline-block'>
                    <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
                        Contact <span className='text-primary'>Us</span>
                    </h1>
                    <div className='h-1 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
                </div>
                <p className='text-gray-600 mt-4 max-w-xl mx-auto'>
                    We're here to help. Reach out to us anytime.
                </p>
            </div>

            {/* Main Card */}
            <div className='bg-white rounded-2xl shadow-xl overflow-hidden mb-16'>
                <div className='flex flex-col lg:flex-row'>

                    {/* Image */}
                    <div className='lg:w-2/5 relative'>
                        <img className='w-full h-full object-cover min-h-[300px]'
                            src={assets.contact_image} alt="Contact SmartCare" />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent'></div>
                        <div className='absolute bottom-6 left-6 right-6'>
                            <p className='text-white text-xl font-bold'>SmartCare Hospitals</p>
                            <p className='text-white/80 text-sm mt-1'>Nellore, Andhra Pradesh</p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className='lg:w-3/5 p-8 lg:p-12'>

                        <h2 className='text-2xl font-bold text-gray-800 mb-8'>Get In Touch</h2>

                        <div className='space-y-6'>

                            {/* Address */}
                            <div className='flex items-start gap-4 p-5 bg-gray-50 rounded-xl'>
                                <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0'>
                                    <svg className='w-6 h-6 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                    </svg>
                                </div>
                                <div>
                                    <p className='font-semibold text-gray-800 mb-1'>Our Office</p>
                                    <p className='text-gray-600 text-sm leading-relaxed'>
                                        54709 Gandhi Street<br />
                                        T.Nagar, Chennai, India
                                    </p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className='flex items-start gap-4 p-5 bg-gray-50 rounded-xl'>
                                <div className='w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0'>
                                    <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                    </svg>
                                </div>
                                <div>
                                    <p className='font-semibold text-gray-800 mb-1'>Phone</p>
                                    <a href='tel:+911234567890'
                                        className='text-gray-600 text-sm hover:text-primary transition-colors'>
                                        +91 12345 67890
                                    </a>
                                </div>
                            </div>

                            {/* Email */}
                            <div className='flex items-start gap-4 p-5 bg-gray-50 rounded-xl'>
                                <div className='w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0'>
                                    <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                    </svg>
                                </div>
                                <div>
                                    <p className='font-semibold text-gray-800 mb-1'>Email</p>
                                    <a href='mailto:smartcare@gmail.com'
                                        className='text-gray-600 text-sm hover:text-primary transition-colors'>
                                        smartcare@gmail.com
                                    </a>
                                </div>
                            </div>

                            {/* Hours */}
                            <div className='flex items-start gap-4 p-5 bg-gray-50 rounded-xl'>
                                <div className='w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0'>
                                    <svg className='w-6 h-6 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                </div>
                                <div>
                                    <p className='font-semibold text-gray-800 mb-1'>Working Hours</p>
                                    <p className='text-gray-600 text-sm'>Monday – Saturday: 9:00 AM – 8:00 PM</p>
                                    <p className='text-gray-500 text-sm'>Sunday: Emergency only</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Careers Section */}
            <div className='bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-10'>
                <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
                    <div className='text-white'>
                        <div className='flex items-center gap-3 mb-3'>
                            <div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center'>
                                <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                </svg>
                            </div>
                            <h3 className='text-2xl font-bold'>Careers at SmartCare</h3>
                        </div>
                        <p className='text-blue-100 max-w-lg'>
                            Join our growing team of passionate healthcare professionals and technologists. We're always looking for great talent.
                        </p>
                    </div>
                    <button className='flex-shrink-0 flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                        </svg>
                        Explore Jobs
                    </button>
                </div>
            </div>

        </div>
    )
}

export default Contact