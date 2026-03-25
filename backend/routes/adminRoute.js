import express from 'express'
import { 
    addDoctor, allDoctors, loginAdmin, appointmentsAdmin, appointmentCancel, adminDashboard, 
    appointmentCancelWithReason, appointmentRescheduleAdmin, getDoctorById, getAllPatients, 
    getPatientById, getAnalyticsData, addDepartment, getAllDepartments, updateDepartment, deleteDepartment,
    editDoctor, blockDoctor, unblockDoctor, getDoctorsByDepartment, reassignDoctor
} from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'
import { changeAvailability } from '../controllers/doctorController.js'

const adminRouter = express.Router()

// Auth
adminRouter.post('/login', loginAdmin)

// Doctors
adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor)
adminRouter.post('/all-doctors', authAdmin, allDoctors)
adminRouter.post('/change-availability', authAdmin, changeAvailability)
adminRouter.get('/doctor/:docId', authAdmin, getDoctorById)
adminRouter.put('/edit-doctor/:docId', authAdmin, upload.single('image'), editDoctor)      // ✅ NEW
adminRouter.post('/block-doctor/:docId', authAdmin, blockDoctor)                           // ✅ NEW
adminRouter.post('/unblock-doctor/:docId', authAdmin, unblockDoctor)                       // ✅ NEW
adminRouter.get('/doctors-by-department/:departmentName', authAdmin, getDoctorsByDepartment) // ✅ NEW
adminRouter.post('/reassign-doctor/:docId', authAdmin, reassignDoctor)                     // ✅ NEW

// Appointments  
adminRouter.get('/appointments', authAdmin, appointmentsAdmin)
adminRouter.post('/cancel-appointment', authAdmin, appointmentCancel)
adminRouter.post('/cancel-appointment-with-reason', authAdmin, appointmentCancelWithReason)
adminRouter.post('/reschedule-appointment', authAdmin, appointmentRescheduleAdmin)

// Dashboard & Analytics
adminRouter.get('/dashboard', authAdmin, adminDashboard)
adminRouter.get('/analytics', authAdmin, getAnalyticsData)

// Patients
adminRouter.get('/all-patients', authAdmin, getAllPatients)
adminRouter.get('/patient/:patientId', authAdmin, getPatientById)

// Departments
adminRouter.post('/add-department', authAdmin, addDepartment)
adminRouter.get('/departments', authAdmin, getAllDepartments)
adminRouter.put('/department/:departmentId', authAdmin, updateDepartment)
adminRouter.delete('/department/:departmentId', authAdmin, deleteDepartment)

export default adminRouter



/*import express from 'express';
import { addDoctor } from '../controllers/adminController.js';
import upload from '../middlewares/multer.js'; // <- default import

const adminRouter = express.Router();
adminRouter.post('/add-doctor', upload.single('image'), addDoctor);
export default adminRouter;*/
