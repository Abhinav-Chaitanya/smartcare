/*import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
    slots_booked: { type: Object, default: {} }
}, { minimize: false })



const doctorModel = mongoose.models.doctor || mongoose.model('doctor', doctorSchema)

export default doctorModel




// doctorModel.js

import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
    
    // ✅ NEW: Track first-time login
    isFirstLogin: { type: Boolean, default: true }
    
}, { minimize: false })

const doctorModel = mongoose.models.doctor || mongoose.model('doctor', doctorSchema)

export default doctorModel



// doctorModel.js*/



/*import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
    isFirstLogin: { type: Boolean, default: true }  // ✅ NEW
}, { minimize: false })

const doctorModel = mongoose.models.doctor || mongoose.model('doctor', doctorSchema)

export default doctorModel */


/*import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
    isFirstLogin: { type: Boolean, default: true },
    
    // ✅ NEW: Schedule Confirmation Status
    isScheduleConfirmed: { type: Boolean, default: false },
    
    // ✅ NEW: Weekly Schedule
    weeklySchedule: {
        monday: {
            isWorking: { type: Boolean, default: false },
            timeSlots: [{
                start: { type: String },
                end: { type: String }
            }]
        },
        tuesday: {
            isWorking: { type: Boolean, default: false },
            timeSlots: [{
                start: { type: String },
                end: { type: String }
            }]
        },
        wednesday: {
            isWorking: { type: Boolean, default: false },
            timeSlots: [{
                start: { type: String },
                end: { type: String }
            }]
        },
        thursday: {
            isWorking: { type: Boolean, default: false },
            timeSlots: [{
                start: { type: String },
                end: { type: String }
            }]
        },
        friday: {
            isWorking: { type: Boolean, default: false },
            timeSlots: [{
                start: { type: String },
                end: { type: String }
            }]
        },
        saturday: {
            isWorking: { type: Boolean, default: false },
            timeSlots: [{
                start: { type: String },
                end: { type: String }
            }]
        },
        sunday: {
            isWorking: { type: Boolean, default: false },
            timeSlots: [{
                start: { type: String },
                end: { type: String }
            }]
        }
    },
    
    // ✅ NEW: Slot Duration in minutes (10, 15, 20)
    slotDuration: { type: Number, default: 20 },
    
    // ✅ NEW: Advance Booking Days (7, 14, 21, 30)
    advanceBookingDays: { type: Number, default: 7 },
    
    // ✅ NEW: Blocked Dates (Leave/Holiday)
    blockedDates: [{
        date: { type: String },      // Format: "25_12_2024"
        reason: { type: String }
    }]
    
}, { minimize: false })

const doctorModel = mongoose.models.doctor || mongoose.model('doctor', doctorSchema)

export default doctorModel   */



import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
    isFirstLogin: { type: Boolean, default: true },
    
    // Schedule Confirmation Status
    isScheduleConfirmed: { type: Boolean, default: false },

    // ✅ NEW: Block status (admin-level action)
    isBlocked: { type: Boolean, default: false },
    blockedReason: { type: String, default: '' },
    
    // Weekly Schedule
    weeklySchedule: {
        monday: {
            isWorking: { type: Boolean, default: false },
            timeSlots: [{ start: { type: String }, end: { type: String } }]
        },
        tuesday: {
            isWorking: { type: Boolean, default: false },
            timeSlots: [{ start: { type: String }, end: { type: String } }]
        },
        wednesday: {
            isWorking: { type: Boolean, default: false },
            timeSlots: [{ start: { type: String }, end: { type: String } }]
        },
        thursday: {
            isWorking: { type: Boolean, default: false },
            timeSlots: [{ start: { type: String }, end: { type: String } }]
        },
        friday: {
            isWorking: { type: Boolean, default: false },
            timeSlots: [{ start: { type: String }, end: { type: String } }]
        },
        saturday: {
            isWorking: { type: Boolean, default: false },
            timeSlots: [{ start: { type: String }, end: { type: String } }]
        },
        sunday: {
            isWorking: { type: Boolean, default: false },
            timeSlots: [{ start: { type: String }, end: { type: String } }]
        }
    },
    
    slotDuration: { type: Number, default: 20 },
    advanceBookingDays: { type: Number, default: 7 },
    
    blockedDates: [{
        date: { type: String },
        reason: { type: String }
    }]
    
}, { minimize: false })

const doctorModel = mongoose.models.doctor || mongoose.model('doctor', doctorSchema)

export default doctorModel

