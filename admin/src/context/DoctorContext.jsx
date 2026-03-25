import { useState, createContext, useEffect } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '')
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState(false)
    const [analyticsData, setAnalyticsData] = useState(null)
    const [analyticsLoading, setAnalyticsLoading] = useState(false)

    // ✅ NEW: Schedule confirmation state
    const [requiresScheduleConfirmation, setRequiresScheduleConfirmation] = useState(
        localStorage.getItem('requiresScheduleConfirmation') === 'true'
    )

    // ✅ NEW: Schedule data
    const [scheduleData, setScheduleData] = useState(null)

    // Get all appointments
    const getAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dToken } })

            if (data.success) {
                const reversedAppointments = [...data.appointments].reverse()
                setAppointments(reversedAppointments)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Complete appointment
    /*const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/complete-appointment',
                { appointmentId },
                { headers: { dToken } }
            )

            if (data.success) {
                toast.success(data.message)
                getAppointments()
                getDashData()
                return true
            } else {
                toast.error(data.message)
                return false
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }*/
    // Complete appointment with diagnosis & prescription


    const completeAppointment = async (appointmentId, diagnosisData) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/complete-appointment',
                {
                    appointmentId,
                    diagnosis: diagnosisData.diagnosis,
                    prescription: diagnosisData.prescription
                },
                { headers: { dToken } }
            )

            if (data.success) {
                toast.success(data.message)
                getAppointments()
                getDashData()
                return true
            } else {
                toast.error(data.message)
                return false
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    // Cancel appointment with reason
    const cancelAppointment = async (appointmentId, reason) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/cancel-appointment',
                { appointmentId, reason },
                { headers: { dToken } }
            )

            if (data.success) {
                toast.success(data.message)
                getAppointments()
                getDashData()
                return true
            } else {
                toast.error(data.message)
                return false
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    // Reschedule appointment
    const rescheduleAppointment = async (appointmentId, newSlotDate, newSlotTime, reason) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/reschedule-appointment',
                { appointmentId, newSlotDate, newSlotTime, reason },
                { headers: { dToken } }
            )

            if (data.success) {
                toast.success(data.message)
                getAppointments()
                getDashData()
                return true
            } else {
                toast.error(data.message)
                return false
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    // Get dashboard data
    const getDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dToken } })

            if (data.success) {
                setDashData(data.dashData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Get profile data
    const getProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { dToken } })

            if (data.success) {
                setProfileData(data.profileData)

                // ✅ Check if schedule is confirmed
                if (data.profileData.isScheduleConfirmed === false) {
                    setRequiresScheduleConfirmation(true)
                    localStorage.setItem('requiresScheduleConfirmation', 'true')
                } else {
                    setRequiresScheduleConfirmation(false)
                    localStorage.removeItem('requiresScheduleConfirmation')
                }
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // ✅ NEW: Get schedule data
    const getScheduleData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/schedule', { headers: { dToken } })

            if (data.success) {
                setScheduleData(data.schedule)
                return data.schedule
            } else {
                toast.error(data.message)
                return null
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return null
        }
    }

    // ✅ NEW: Confirm schedule (first time)
    const confirmSchedule = async (weeklySchedule, slotDuration, advanceBookingDays) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/confirm-schedule',
                { weeklySchedule, slotDuration, advanceBookingDays },
                { headers: { dToken } }
            )

            if (data.success) {
                toast.success(data.message)
                setRequiresScheduleConfirmation(false)
                localStorage.removeItem('requiresScheduleConfirmation')
                await getProfileData()
                return true
            } else {
                toast.error(data.message)
                return false
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    // ✅ NEW: Update schedule
    const updateSchedule = async (weeklySchedule, slotDuration, advanceBookingDays) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/update-schedule',
                { weeklySchedule, slotDuration, advanceBookingDays },
                { headers: { dToken } }
            )

            if (data.success) {
                toast.success(data.message)
                await getProfileData()
                await getScheduleData()
                return true
            } else {
                toast.error(data.message)
                return false
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    // ✅ NEW: Add blocked date
    const addBlockedDate = async (date, reason) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/add-blocked-date',
                { date, reason },
                { headers: { dToken } }
            )

            if (data.success) {
                toast.success(data.message)
                await getScheduleData()
                return true
            } else {
                toast.error(data.message)
                return false
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    // ✅ NEW: Remove blocked date
    const removeBlockedDate = async (date) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/remove-blocked-date',
                { date },
                { headers: { dToken } }
            )

            if (data.success) {
                toast.success(data.message)
                await getScheduleData()
                return true
            } else {
                toast.error(data.message)
                return false
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    // Get analytics data
    const getAnalyticsData = async (options = {}) => {
        try {
            setAnalyticsLoading(true)
            const { period = '30d', specificDate, fromDate, toDate } = typeof options === 'string' ? { period: options } : options
            const params = new URLSearchParams()
            params.append('period', period)
            if (specificDate) params.append('specificDate', specificDate)
            if (fromDate) params.append('fromDate', fromDate)
            if (toDate) params.append('toDate', toDate)
            const { data } = await axios.get(
                backendUrl + `/api/doctor/analytics?${params.toString()}`,
                { headers: { dToken } }
            )

            if (data.success) {
                setAnalyticsData(data.data)
                return data.data
            } else {
                toast.error(data.message)
                return null
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return null
        } finally {
            setAnalyticsLoading(false)
        }
    }

    // ✅ Check schedule confirmation on token change
    useEffect(() => {
        if (dToken) {
            getProfileData()
        }
    }, [dToken])

    const value = {
        dToken, setDToken,
        backendUrl,
        appointments, setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        rescheduleAppointment,
        dashData, setDashData, getDashData,
        profileData, setProfileData,
        getProfileData,
        // ✅ NEW exports
        requiresScheduleConfirmation, setRequiresScheduleConfirmation,
        scheduleData, setScheduleData,
        getScheduleData,
        confirmSchedule,
        updateSchedule,
        addBlockedDate,
        removeBlockedDate,
        analyticsData, analyticsLoading, getAnalyticsData
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider