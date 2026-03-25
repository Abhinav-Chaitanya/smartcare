import { createContext, useEffect } from "react";
import axios from 'axios'
import { useState } from "react";
import { toast } from 'react-toastify'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = 'Rs. '
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false)
    const [userData, setUserData] = useState(false)
    const [appointments, setAppointments] = useState([])
    const [departments, setDepartments] = useState([])
    const [departmentsLoading, setDepartmentsLoading] = useState(false)

    // ✅ NEW: Track whether userData has finished loading
    const [userDataLoading, setUserDataLoading] = useState(false)

    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getDepartments = async () => {
        try {
            setDepartmentsLoading(true)
            const { data } = await axios.get(backendUrl + '/api/user/departments')
            if (data.success) {
                setDepartments(data.departments)
            }
        } catch (error) {
            console.log('Error fetching departments:', error)
        } finally {
            setDepartmentsLoading(false)
        }
    }

    const loadUserProfileData = async () => {
        try {
            setUserDataLoading(true)  // ✅ Mark loading start
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })
            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setUserDataLoading(false)  // ✅ Mark loading done
        }
    }

    const getUserAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
            if (data.success) {
                setAppointments(data.appointments.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const slotDateFormat = (slotDate) => {
        if (!slotDate) return ''
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const [day, month, year] = slotDate.split('_')
        return `${day} ${months[Number(month) - 1]} ${year}`
    }

    const value = {
        doctors, getDoctorsData,
        currencySymbol,
        token, setToken,
        backendUrl,
        userData, setUserData,
        loadUserProfileData,
        userDataLoading,  // ✅ NEW export
        appointments, setAppointments,
        getUserAppointments,
        slotDateFormat,
        departments, departmentsLoading, getDepartments
    }

    useEffect(() => {
        getDoctorsData()
        getDepartments()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
            getUserAppointments()
        } else {
            setUserData(false)
            setAppointments([])
        }
    }, [token])

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider