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
import CompleteProfile from './pages/CompleteProfile'
import { ToastContainer } from 'react-toastify'

const App = () => {
  const location = useLocation()

  const hideNavbar = location.pathname.startsWith('/payment')
  const isDashboardPage = ['/my-dashboard', '/my-appointments', '/my-profile'].includes(location.pathname) || location.pathname.startsWith('/appointment-details/')

  return (
    <>
      <ToastContainer />

      {isDashboardPage && !hideNavbar ? (
        // Dashboard Layout (with Sidebar) — no footer
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
        // Normal Layout — Navbar + page content inside margin, Footer outside margin
        <>
          {!hideNavbar && <Navbar />}

          <div className='mx-4 sm:mx-[10%]'>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/doctors' element={<Doctors />} />
              <Route path='/doctors/:speciality' element={<Doctors />} />
              <Route path='/login' element={<Login />} />
              <Route path='/about' element={<About />} />
              <Route path='/contact' element={<Contact />} />
              <Route path='/appointment/:docId' element={<Appointment />} />
              <Route path='/complete-profile' element={<CompleteProfile />} />
              <Route path='/payment/:appointmentId' element={<Payment />} />
            </Routes>
          </div>

          {!hideNavbar && <Footer />}
        </>
      )}
    </>
  )
}

export default App