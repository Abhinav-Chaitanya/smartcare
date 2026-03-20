/*import { createContext, useEffect } from "react";
import axios from 'axios'
import { useState } from "react";
import {toast} from 'react-toastify'


export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = 'Rs. '
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [doctors,setDoctors] = useState([])
    const [token,setToken] = useState( localStorage.getItem('token') ? localStorage.getItem('token') : false )
    const [userData, setUserData] = useState(false)


    const getDoctorsData = async() => {
        try {

            const {data} = await axios.get(backendUrl + '/api/doctor/list')
            if(data.success){
                setDoctors(data.doctors)
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
          console.log(error)  
          toast.error(error.message)
        }
    }

    const loadUserProfileData = async() => {
        try {

            const {data} = await axios.get(backendUrl + '/api/user/get-profile', {headers:{token}})

            if(data.success){
                setUserData(data.userData)
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)  
            toast.error(error.message)
            
        }
    }

    const value ={
        doctors,getDoctorsData,
        currencySymbol,
        token,setToken,
        backendUrl,
        userData,setUserData,
        loadUserProfileData
    }

    useEffect(()=>{
        getDoctorsData()
    },[])


    useEffect(()=>{
        if(token){
            loadUserProfileData()
        }else{
            setUserData(false)
        }

    },[token])



    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider   */


/*import { createContext, useEffect } from "react";
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
    const [appointments, setAppointments] = useState([])  // NEW: Appointments state

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

    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })
            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // NEW: Get user's appointments
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

    // NEW: Format slot date helper
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
        appointments, setAppointments,  // NEW
        getUserAppointments,             // NEW
        slotDateFormat                   // NEW
    }

    useEffect(() => {
        getDoctorsData()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
            getUserAppointments()  // NEW: Fetch appointments when token exists
        } else {
            setUserData(false)
            setAppointments([])    // NEW: Clear appointments on logout
        }
    }, [token])

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider  */

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

    // ✅ NEW: Departments state
    const [departments, setDepartments] = useState([])
    const [departmentsLoading, setDepartmentsLoading] = useState(false)

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

    // ✅ NEW: Get departments (public - no auth required)
    const getDepartments = async () => {
        try {
            setDepartmentsLoading(true)
            const { data } = await axios.get(backendUrl + '/api/user/departments')
            if (data.success) {
                setDepartments(data.departments)
            } else {
                console.log('Failed to fetch departments:', data.message)
            }
        } catch (error) {
            console.log('Error fetching departments:', error)
        } finally {
            setDepartmentsLoading(false)
        }
    }

    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })
            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Get user's appointments
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

    // Format slot date helper
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
        appointments, setAppointments,
        getUserAppointments,
        slotDateFormat,
        // ✅ NEW: Department exports
        departments, departmentsLoading, getDepartments
    }

    // ✅ UPDATED: Fetch doctors AND departments on app load
    useEffect(() => {
        getDoctorsData()
        getDepartments()  // ✅ NEW
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