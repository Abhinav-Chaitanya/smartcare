import { useState } from "react";
import { createContext } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '')
    const [doctors, setDoctors] = useState([])
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [patients, setPatients] = useState([])
    const [analyticsData, setAnalyticsData] = useState(null)
    const [analyticsLoading, setAnalyticsLoading] = useState(false)
    const [departments, setDepartments] = useState([])
    const [departmentsLoading, setDepartmentsLoading] = useState(false)

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    // ==================== Doctor Functions ====================

    const getAllDoctors = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/all-doctors', {}, { headers: { aToken } })
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getDoctorById = async (docId) => {
        try {
            const { data } = await axios.get(backendUrl + `/api/admin/doctor/${docId}`, { headers: { aToken } })
            if (data.success) {
                return data
            } else {
                toast.error(data.message)
                return null
            }
        } catch (error) {
            toast.error(error.message)
            return null
        }
    }

    const changeAvailability = async (docId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    // ✅ NEW: Edit Doctor
    const editDoctor = async (docId, formData) => {
        try {
            const { data } = await axios.put(
                backendUrl + `/api/admin/edit-doctor/${docId}`,
                formData,
                { headers: { aToken, 'Content-Type': 'multipart/form-data' } }
            )
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    // ✅ NEW: Block Doctor
    const blockDoctor = async (docId, reason = '') => {
        try {
            const { data } = await axios.post(
                backendUrl + `/api/admin/block-doctor/${docId}`,
                { reason },
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    // ✅ NEW: Unblock Doctor
    const unblockDoctor = async (docId, newSpeciality = '') => {
        try {
            const { data } = await axios.post(
                backendUrl + `/api/admin/unblock-doctor/${docId}`,
                { newSpeciality },
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
                getAllDepartments()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    // ✅ NEW: Get active doctors by department (for delete modal)
    const getDoctorsByDepartment = async (departmentName) => {
        try {
            const { data } = await axios.get(
                backendUrl + `/api/admin/doctors-by-department/${encodeURIComponent(departmentName)}`,
                { headers: { aToken } }
            )
            if (data.success) {
                return data.doctors
            } else {
                toast.error(data.message)
                return []
            }
        } catch (error) {
            toast.error(error.message)
            return []
        }
    }

    // ✅ NEW: Reassign doctor to different department
    const reassignDoctor = async (docId, newSpeciality) => {
        try {
            const { data } = await axios.post(
                backendUrl + `/api/admin/reassign-doctor/${docId}`,
                { newSpeciality },
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    // ==================== Appointment Functions ====================

    const getAllAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/appointments', { headers: { aToken } })
            if (data.success) {
                setAppointments(data.appointments)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const cancelAppointmentWithReason = async (appointmentId, reason) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/cancel-appointment-with-reason',
                { appointmentId, reason },
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
                getDashData()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    const rescheduleAppointment = async (appointmentId, newSlotDate, newSlotTime, reason) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/reschedule-appointment',
                { appointmentId, newSlotDate, newSlotTime, reason },
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
                getDashData()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    // ==================== Dashboard Functions ====================

    const getDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { aToken } })
            if (data.success) {
                setDashData(data.dashData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // ==================== Patient Functions ====================

    const getAllPatients = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/all-patients', { headers: { aToken } })
            if (data.success) {
                setPatients(data.patients)
                return data.patients
            } else {
                toast.error(data.message)
                return []
            }
        } catch (error) {
            toast.error(error.message)
            return []
        }
    }

    const getPatientById = async (patientId) => {
        try {
            const { data } = await axios.get(backendUrl + `/api/admin/patient/${patientId}`, { headers: { aToken } })
            if (data.success) {
                return data
            } else {
                toast.error(data.message)
                return null
            }
        } catch (error) {
            toast.error(error.message)
            return null
        }
    }

    // ==================== Analytics Functions ====================

    const getAnalyticsData = async (options = {}) => {
        try {
            setAnalyticsLoading(true)
            const { period = '30d', specificDate, fromDate, toDate, doctorId } = typeof options === 'string' ? { period: options } : options
            const params = new URLSearchParams()
            params.append('period', period)
            if (specificDate) params.append('specificDate', specificDate)
            if (fromDate) params.append('fromDate', fromDate)
            if (toDate) params.append('toDate', toDate)
            if (doctorId && doctorId !== 'all') params.append('doctorId', doctorId)
            const { data } = await axios.get(
                backendUrl + `/api/admin/analytics?${params.toString()}`,
                { headers: { aToken } }
            )
            if (data.success) {
                setAnalyticsData(data.data)
                return data.data
            } else {
                toast.error(data.message)
                return null
            }
        } catch (error) {
            toast.error(error.message)
            return null
        } finally {
            setAnalyticsLoading(false)
        }
    }

    // ==================== Department Functions ====================

    const getAllDepartments = async () => {
        try {
            setDepartmentsLoading(true)
            const { data } = await axios.get(backendUrl + '/api/admin/departments', { headers: { aToken } })
            if (data.success) {
                setDepartments(data.departments)
                return data.departments
            } else {
                toast.error(data.message)
                return []
            }
        } catch (error) {
            toast.error(error.message)
            return []
        } finally {
            setDepartmentsLoading(false)
        }
    }

    const addDepartment = async (name, description = '') => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/add-department',
                { name, description },
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                await getAllDepartments()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    const updateDepartment = async (departmentId, updateData) => {
        try {
            const { data } = await axios.put(
                backendUrl + `/api/admin/department/${departmentId}`,
                updateData,
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                await getAllDepartments()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    const deleteDepartment = async (departmentId) => {
        try {
            const { data } = await axios.delete(
                backendUrl + `/api/admin/department/${departmentId}`,
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                await getAllDepartments()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    // ==================== Context Value ====================

    const value = {
        aToken, setAToken,
        backendUrl, 
        doctors, getAllDoctors, changeAvailability, getDoctorById,
        editDoctor, blockDoctor, unblockDoctor, getDoctorsByDepartment, reassignDoctor,
        appointments, setAppointments, getAllAppointments, cancelAppointment,
        cancelAppointmentWithReason, rescheduleAppointment,
        dashData, getDashData,
        patients, getAllPatients, getPatientById,
        analyticsData, analyticsLoading, getAnalyticsData,
        departments, departmentsLoading, getAllDepartments, addDepartment, updateDepartment, deleteDepartment
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider