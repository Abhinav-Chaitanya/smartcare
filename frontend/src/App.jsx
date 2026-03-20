/*import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import Navbar from './components/Navbar'
import Footer from './components/footer'
import Payment from './pages/Payment'
import { ToastContainer, toast } from 'react-toastify';

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/doctors/:speciality' element={<Doctors />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/my-profile' element={<MyProfile />} />
        <Route path='/my-appointments' element={<MyAppointments />} />
        <Route path='/appointment/:docId' element={<Appointment />} />
        <Route path="/payment/:appointmentId" element={<Payment />} />

      </Routes>
      <Footer />
      
    </div>
  )
}

export default App*/

/*import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import Navbar from './components/Navbar'
import Footer from './components/footer'
import Payment from './pages/Payment'
import { ToastContainer } from 'react-toastify'

const App = () => {
  const location = useLocation()
  
  // ✅ Hide navbar on payment page
  const hideNavbar = location.pathname.startsWith('/payment')

  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer />
      
      
      {!hideNavbar && <Navbar />}
      
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/doctors/:speciality' element={<Doctors />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/my-profile' element={<MyProfile />} />
        <Route path='/my-appointments' element={<MyAppointments />} />
        <Route path='/appointment/:docId' element={<Appointment />} />
        <Route path="/payment/:appointmentId" element={<Payment />} />
      </Routes>
      
      
      {!hideNavbar && <Footer />}
    </div>
  )
}

export default App   */


/*import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Payment from './pages/Payment'
import PatientDashboard from './pages/PatientDashboard'
import PatientSidebar from './components/PatientSidebar'
import { ToastContainer } from 'react-toastify'

const App = () => {
  const location = useLocation()
  
  // Hide navbar on payment page
  const hideNavbar = location.pathname.startsWith('/payment')
  
  // Check if current page is a dashboard page (needs sidebar)
  const isDashboardPage = ['/my-dashboard', '/my-appointments', '/my-profile'].includes(location.pathname)

  return (
    <>
      <ToastContainer />
      
      
      {isDashboardPage && !hideNavbar ? (
        <div className='bg-[#F8F9FD] min-h-screen'>
          <Navbar />
          <div className='flex'>
            <PatientSidebar />
            <main className='flex-1 min-h-screen'>
              <Routes>
                <Route path='/my-dashboard' element={<PatientDashboard />} />
                <Route path='/my-appointments' element={<MyAppointments />} />
                <Route path='/my-profile' element={<MyProfile />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        // Normal Layout (without Sidebar)
        <div className='mx-4 sm:mx-[10%]'>
          {!hideNavbar && <Navbar />}
          
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/doctors' element={<Doctors />} />
            <Route path='/doctors/:speciality' element={<Doctors />} />
            <Route path='/login' element={<Login />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/appointment/:docId' element={<Appointment />} />
            <Route path="/payment/:appointmentId" element={<Payment />} />
          </Routes>
          
          {!hideNavbar && <Footer />}
        </div>
      )}
    </>
  )
}

export default App  */

import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import AppointmentDetails from './pages/AppointmentDetails'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Payment from './pages/Payment'
import PatientDashboard from './pages/PatientDashboard'
import PatientSidebar from './components/PatientSidebar'
import { ToastContainer } from 'react-toastify'

const App = () => {
  const location = useLocation()
  
  // Hide navbar on payment page
  const hideNavbar = location.pathname.startsWith('/payment')
  
  // Check if current page is a dashboard page (needs sidebar)
  const isDashboardPage = ['/my-dashboard', '/my-appointments', '/my-profile'].includes(location.pathname) || location.pathname.startsWith('/appointment-details/')

  return (
    <>
      <ToastContainer />
      
      {/* Dashboard Layout (with Sidebar) */}
      {isDashboardPage && !hideNavbar ? (
        <div className='bg-[#F8F9FD] min-h-screen'>
          <Navbar />
          <div className='flex'>
            <PatientSidebar />
            <main className='flex-1 min-h-screen'>
              <Routes>
                <Route path='/my-dashboard' element={<PatientDashboard />} />
                <Route path='/my-appointments' element={<MyAppointments />} />
                <Route path='/my-profile' element={<MyProfile />} />
                <Route path='/appointment-details/:appointmentId' element={<AppointmentDetails />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        // Normal Layout (without Sidebar)
        <div className='mx-4 sm:mx-[10%]'>
          {!hideNavbar && <Navbar />}
          
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/doctors' element={<Doctors />} />
            <Route path='/doctors/:speciality' element={<Doctors />} />
            <Route path='/login' element={<Login />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/appointment/:docId' element={<Appointment />} />
            <Route path="/payment/:appointmentId" element={<Payment />} />
          </Routes>
          
          {!hideNavbar && <Footer />}
        </div>
      )}
    </>
  )
}

export default App

