import React from 'react'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify';
import { useContext } from 'react';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import Departments from './pages/Admin/Departments';  // ✅ NEW IMPORT
import PatientsList from './pages/Admin/PatientsList';
import PatientDetail from './pages/Admin/PatientDetail';
import { DoctorContext } from './context/DoctorContext';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import DoctorDetails from './pages/Admin/DoctorDetails';
import ConfirmSchedule from './pages/Doctor/ConfirmSchedule';
import AppointmentDetails from './pages/Doctor/AppointmentDetails';
import AdminAppointmentDetails from './pages/Admin/AdminAppointmentDetails';
import DoctorAppointmentsPage from './pages/Admin/DoctorAppointmentsPage';
import Analytics from './pages/Admin/Analytics';
import DoctorAnalytics from './pages/Doctor/DoctorAnalytics';
import DoctorSlotsView from './pages/Doctor/DoctorSlotsView';

const App = () => {

  const { aToken } = useContext(AdminContext)
  const { dToken, requiresScheduleConfirmation } = useContext(DoctorContext)

  // If doctor needs to confirm schedule, only show that page
  if (dToken && requiresScheduleConfirmation) {
    return (
      <div className='bg-[#F8F9FD] min-h-screen'>
        <ToastContainer />
        <Routes>
          <Route path='/confirm-schedule' element={<ConfirmSchedule />} />
          <Route path='*' element={<Navigate to='/confirm-schedule' replace />} />
        </Routes>
      </div>
    )
  }

  // If logged in (Admin or Doctor)
  if (aToken || dToken) {
    return (
      <div className='bg-[#F8F9FD] min-h-screen'>
        <ToastContainer />
        <Navbar />
        <div className='flex items-start'>
          <Sidebar />
          <Routes>
            {/*------------- Admin Routes --------------  */}
            <Route path='/' element={
              aToken
                ? <Navigate to='/admin-dashboard' replace />
                : <Navigate to='/doctor-dashboard' replace />
            } />

            <Route path='/admin-dashboard' element={<Dashboard />} />
            <Route path='/all-appointments' element={<AllAppointments />} />
            
            {/* ✅ NEW: Departments Route */}
            <Route path='/departments' element={<Departments />} />
            
            {/* ✅ NEW: Doctors Routes (with optional department filter) */}
            <Route path='/doctors' element={<DoctorsList />} />
            <Route path='/doctors/:departmentName' element={<DoctorsList />} />
            
            {/* ✅ UPDATED: Add Doctor Routes (with optional department) */}
            <Route path='/add-doctor' element={<AddDoctor />} />
            <Route path='/add-doctor/:departmentName' element={<AddDoctor />} />
            
            {/* Doctor Details & Appointments */}
            <Route path='/doctor-details/:docId' element={<DoctorDetails />} />
            <Route path='/admin-appointment-details/:appointmentId' element={<AdminAppointmentDetails />} />
            <Route path='/doctor/:docId/appointments' element={<DoctorAppointmentsPage />} />
            
            {/* Analytics */}
            <Route path='/analytics' element={<Analytics />} />

            {/* Patient Routes */}
            <Route path='/patients-list' element={<PatientsList />} />
            <Route path='/patient/:patientId' element={<PatientDetail />} />

            {/* ✅ OLD ROUTE: Redirect old doctor-list to new departments */}
            <Route path='/doctor-list' element={<Navigate to='/departments' replace />} />

            {/* ----------- Doctor Routes ------------------- */}
            <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
            <Route path='/doctor-appointments' element={<DoctorAppointments />} />
            <Route path='/doctor-slots' element={<DoctorSlotsView />} />
            <Route path='/doctor-analytics' element={<DoctorAnalytics />} />
            <Route path='/doctor-profile' element={<DoctorProfile />} />
            <Route path='/confirm-schedule' element={<ConfirmSchedule />} />
            <Route path='/appointment-details/:appointmentId' element={<AppointmentDetails />} />

            {/* Catch all unknown routes */}
            <Route path='*' element={
              aToken
                ? <Navigate to='/admin-dashboard' replace />
                : <Navigate to='/doctor-dashboard' replace />
            } />
          </Routes>
        </div>
      </div>
    )
  }

  // Not logged in - Show Login Page
  return (
    <>
      <Login />
      <ToastContainer />
    </>
  )
}

export default App