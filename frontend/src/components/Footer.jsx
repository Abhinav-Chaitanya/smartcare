import React from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className='border-t border-gray-100 mt-20'>

      {/* Main Footer */}
      <div className='mx-4 sm:mx-[10%]'>
        <div className='grid grid-cols-1 sm:grid-cols-[3fr_1fr_1fr] gap-12 py-14'>

          {/* Brand Column */}
          <div>
            <img className='h-10 w-auto mb-5' src={assets.logo1} alt="SmartCare" />
            <p className='text-gray-500 leading-relaxed text-sm max-w-sm'>
              Connecting patients and healthcare providers through a seamless, tech-driven platform designed for convenience, clarity, and care.
            </p>
            <div className='flex items-center gap-3 mt-6'>
              {[
                { label: 'Facebook', path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                { label: 'Twitter', path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
                { label: 'Instagram', path: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 21h11A2.5 2.5 0 0020 18.5v-11A2.5 2.5 0 0017.5 5h-11A2.5 2.5 0 004 7.5v11A2.5 2.5 0 006.5 21z' },
              ].map(({ label, path }) => (
                <button key={label} aria-label={label}
                  className='w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-primary/10 hover:text-primary text-gray-500 transition-colors duration-300'>
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d={path} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-gray-800 font-semibold text-sm uppercase tracking-wider mb-5'>Company</h3>
            <ul className='space-y-3'>
              {[
                { label: 'Home', path: '/' },
                { label: 'About Us', path: '/about' },
                { label: 'Our Doctors', path: '/doctors' },
                { label: 'Contact Us', path: '/contact' },
              ].map(({ label, path }) => (
                <li key={label}>
                  <NavLink to={path}
                    className='text-gray-500 hover:text-primary transition-colors duration-200 text-sm flex items-center gap-2 group'>
                    <svg className='w-3 h-3 text-gray-300 group-hover:text-primary transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                    </svg>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className='text-gray-800 font-semibold text-sm uppercase tracking-wider mb-5'>Get In Touch</h3>
            <ul className='space-y-4'>
              <li className='flex items-start gap-3'>
                <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5'>
                  <svg className='w-4 h-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                  </svg>
                </div>
                <p className='text-gray-500 text-sm leading-relaxed'>54709 Gandhi Street,<br />T.Nagar, Chennai, India</p>
              </li>
              <li className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <svg className='w-4 h-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                  </svg>
                </div>
                <a href='tel:+911234567890' className='text-gray-500 hover:text-primary transition-colors text-sm'>+91 12345 67890</a>
              </li>
              <li className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <svg className='w-4 h-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                </div>
                <a href='mailto:smartcare@gmail.com' className='text-gray-500 hover:text-primary transition-colors text-sm'>smartcare@gmail.com</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className='border-t border-gray-100 py-5 flex flex-col sm:flex-row items-center justify-between gap-3'>
          <p className='text-gray-400 text-sm'>© 2025 SmartCare. All rights reserved.</p>
          <div className='flex items-center gap-5'>
            {['Privacy Policy', 'Terms of Service'].map(item => (
              <button key={item} className='text-gray-400 hover:text-primary text-sm transition-colors'>{item}</button>
            ))}
          </div>
        </div>
      </div>

    </footer>
  )
}

export default Footer