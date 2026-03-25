import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const About = () => {
    const navigate = useNavigate()

    return (
        <div className='py-12'>

            {/* Hero Section */}
            <div className='text-center mb-16'>
                <div className='inline-block'>
                    <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
                        About <span className='text-primary'>SmartCare</span>
                    </h1>
                    <div className='h-1 bg-gradient-to-r from-primary to-blue-600 rounded-full'></div>
                </div>
                <p className='text-gray-600 mt-4 max-w-2xl mx-auto'>
                    Your trusted partner in modern healthcare management
                </p>
            </div>

            {/* Main Content Section */}
            <div className='mb-20'>
                <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
                    <div className='flex flex-col lg:flex-row'>

                        {/* Image */}
                        <div className='lg:w-2/5 relative'>
                            <img className='w-full h-full object-cover'
                                src={assets.about_image} alt="About SmartCare" />
                            <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent'></div>
                        </div>

                        {/* Content */}
                        <div className='lg:w-3/5 p-8 lg:p-12'>
                            <div className='space-y-8'>

                                {/* Who We Are */}
                                <div>
                                    <div className='flex items-center gap-3 mb-4'>
                                        <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0'>
                                            <svg className='w-6 h-6 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                                            </svg>
                                        </div>
                                        <h2 className='text-2xl font-bold text-gray-900'>Who We Are</h2>
                                    </div>
                                    <p className='text-gray-600 leading-relaxed'>
                                        Welcome to SmartCare, your trusted partner in managing your healthcare needs conveniently and efficiently. We understand the challenges individuals face when scheduling doctor appointments and managing their health records.
                                    </p>
                                </div>

                                {/* Our Commitment */}
                                <div>
                                    <div className='flex items-center gap-3 mb-4'>
                                        <div className='w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0'>
                                            <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' />
                                            </svg>
                                        </div>
                                        <h2 className='text-2xl font-bold text-gray-900'>Our Commitment</h2>
                                    </div>
                                    <p className='text-gray-600 leading-relaxed'>
                                        SmartCare is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service.
                                    </p>
                                </div>

                                {/* Our Vision */}
                                <div className='bg-gradient-to-br from-primary/5 to-blue-50 p-6 rounded-xl border-l-4 border-primary'>
                                    <div className='flex items-center gap-3 mb-3'>
                                        <svg className='w-6 h-6 text-primary flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                                        </svg>
                                        <h3 className='text-xl font-bold text-gray-900'>Our Vision</h3>
                                    </div>
                                    <p className='text-gray-700 leading-relaxed'>
                                        To create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Choose Us */}
            <div className='mb-12'>
                <div className='text-center mb-10'>
                    <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-3'>
                        Why Choose <span className='text-primary'>SmartCare?</span>
                    </h2>
                    <p className='text-gray-600'>Experience healthcare management like never before</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>

                    {/* Efficiency */}
                    <div className='group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary'>
                        <div className='bg-gradient-to-br from-primary to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                            <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 10V3L4 14h7v7l9-11h-7z' />
                            </svg>
                        </div>
                        <h3 className='text-xl font-bold text-gray-900 mb-4'>Efficiency</h3>
                        <p className='text-gray-600 leading-relaxed'>
                            Streamlined appointment scheduling that fits into your busy lifestyle. Book appointments in seconds, not minutes.
                        </p>
                    </div>

                    {/* Convenience */}
                    <div className='group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary'>
                        <div className='bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                            <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                            </svg>
                        </div>
                        <h3 className='text-xl font-bold text-gray-900 mb-4'>Convenience</h3>
                        <p className='text-gray-600 leading-relaxed'>
                            Access to a network of trusted healthcare professionals. Quality care is just a click away.
                        </p>
                    </div>

                    {/* Personalization */}
                    <div className='group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary'>
                        <div className='bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                            <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                        </div>
                        <h3 className='text-xl font-bold text-gray-900 mb-4'>Tailored for You</h3>
                        <p className='text-gray-600 leading-relaxed'>
                            Everything you need, organized your way for easier access. Your health, your preferences.
                        </p>
                    </div>

                </div>
            </div>

            {/* CTA Section */}
            <div className='text-center mt-20 bg-gray-50 rounded-2xl p-12'>
                <h2 className='text-3xl font-bold text-gray-900 mb-4'>Ready to Get Started?</h2>
                <p className='text-gray-600 mb-8 max-w-2xl mx-auto'>
                    Join thousands of satisfied users who trust SmartCare for their healthcare needs
                </p>
                <button onClick={() => navigate('/doctors')}
                    className='bg-primary text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl'>
                    Book Your Appointment
                </button>
            </div>

        </div>
    )
}

export default About