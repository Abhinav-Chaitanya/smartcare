/*import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
    return (
        <div>
            <div className='text-center text-2xl pt-10 text-gray-500'>
                <p>ABOUT <span className='text-gray-700 font-medium'>US</span></p>
            </div>

            <div className='my-10 flex flex-col md:flex-row gap-12'>
                <img className='w-full md:max-w-[360px]' src={assets.about_image} alt="" />
                <div className='flex flex-col justify-center gap-6 md:w-2/4 text-medium text-gray-600'>
                    <p>Welcome To SmartCare, Your Trusted Partner In Managing Your Healthcare Needs Conveniently And Efficiently. At SmartCare, We Understand The Challenges Individuals Face When It Comes To Scheduling Doctor Appointments And Managing Their Health Records.</p>
                    <p>SmartCare Is Committed To Excellence In Healthcare Technology. We Continuously Strive To Enhance Our Platform, Integrating The Latest Advancements To Improve User Experience And Deliver Superior Service. Whether You're Booking Your First Appointment Or Managing Ongoing Care, SmartCare Is Here To Support You Every Step Of The Way.</p>
                    <b className='text-gray-800'>Our Vision</b>
                    <p>Our Vision At SmartCare Is To Create A Seamless Healthcare Experience For Every User. We Aim To Bridge The Gap Between Patients And Healthcare Providers, Making It Easier For You To Access The Care You Need, When You Need It.</p>
                </div>
            </div>

            <div className='text-xl my-7'>
                <p>WHY <span className='text-gray-700 font-semibold'>CHOOSE US</span></p>
            </div>

            <div className='flex flex-col md:flex-row mb-20'>
                <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                    <b>EFFICIENCY:</b>
                    <p>Streamlined Appointment Scheduling
                        That Fits Into Your Busy Lifestyle.</p>
                </div>

                <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                    <b>CONVENIENCE:</b>
                    <p>Access To A Network Of Trusted Healthcare Professionals.</p>
                </div>

                <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                    <b>TAILORED FOR YOU:</b>
                    <p>Everything you need, organized your way for easier access.</p>
                </div>
            </div>
        </div>
    )
}

export default About*/


import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
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
                        {/* Image Section */}
                        <div className='lg:w-2/5 relative'>
                            <img 
                                className='w-full h-full object-cover' 
                                src={assets.about_image} 
                                alt="About SmartCare" 
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent'></div>
                        </div>

                        {/* Content Section */}
                        <div className='lg:w-3/5 p-8 lg:p-12'>
                            <div className='space-y-6'>
                                {/* Who We Are */}
                                <div>
                                    <div className='flex items-center gap-3 mb-4'>
                                        <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center'>
                                            <span className='text-2xl'>🏥</span>
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
                                        <div className='w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center'>
                                            <span className='text-2xl'>💡</span>
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
                                        <span className='text-2xl'>🎯</span>
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

            {/* Why Choose Us Section */}
            <div className='mb-12'>
                <div className='text-center mb-10'>
                    <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-3'>
                        Why Choose <span className='text-primary'>SmartCare?</span>
                    </h2>
                    <p className='text-gray-600'>
                        Experience healthcare management like never before
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    {/* Card 1: Efficiency */}
                    <div className='group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary cursor-pointer'>
                        <div className='bg-gradient-to-br from-primary to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                            <span className='text-3xl'>⚡</span>
                        </div>
                        <h3 className='text-xl font-bold text-gray-900 mb-4'>Efficiency</h3>
                        <p className='text-gray-600 leading-relaxed'>
                            Streamlined appointment scheduling that fits into your busy lifestyle. Book appointments in seconds, not minutes.
                        </p>
                    </div>

                    {/* Card 2: Convenience */}
                    <div className='group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary cursor-pointer'>
                        <div className='bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                            <span className='text-3xl'>🌟</span>
                        </div>
                        <h3 className='text-xl font-bold text-gray-900 mb-4'>Convenience</h3>
                        <p className='text-gray-600 leading-relaxed'>
                            Access to a network of trusted healthcare professionals. Quality care is just a click away.
                        </p>
                    </div>

                    {/* Card 3: Personalization */}
                    <div className='group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary cursor-pointer'>
                        <div className='bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                            <span className='text-3xl'>🎨</span>
                        </div>
                        <h3 className='text-xl font-bold text-gray-900 mb-4'>Tailored for You</h3>
                        <p className='text-gray-600 leading-relaxed'>
                            Everything you need, organized your way for easier access. Your health, your preferences.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className='bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-10 mt-20'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white'>
                    <div>
                        <p className='text-4xl font-bold mb-2'>500+</p>
                        <p className='text-blue-100'>Doctors</p>
                    </div>
                    <div>
                        <p className='text-4xl font-bold mb-2'>10K+</p>
                        <p className='text-blue-100'>Patients</p>
                    </div>
                    <div>
                        <p className='text-4xl font-bold mb-2'>50K+</p>
                        <p className='text-blue-100'>Appointments</p>
                    </div>
                    <div>
                        <p className='text-4xl font-bold mb-2'>4.8★</p>
                        <p className='text-blue-100'>Rating</p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className='text-center mt-20 bg-gray-50 rounded-2xl p-12'>
                <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                    Ready to Get Started?
                </h2>
                <p className='text-gray-600 mb-8 max-w-2xl mx-auto'>
                    Join thousands of satisfied users who trust SmartCare for their healthcare needs
                </p>
                <button 
                    onClick={() => window.location.href = '/doctors'}
                    className='bg-primary text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl'
                >
                    Book Your Appointment
                </button>
            </div>
        </div>
    )
}

export default About