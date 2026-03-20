/*import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    userId:{ type:String, required: true },
    docId:{ type:String, required:true },
    slotDate:{ type:String, required:true},
    slotTime:{ type:String, required:true},
    userData: { type: Object, required:true},
    docData: { type: Object, required: true},
    amount:{ type: Number, required: true},
    date:{type:Number, required:true},
    cancelled:{ type: Boolean, default: false},
    payment: { type: Boolean, default:false},
    isCompleted:{ type: Boolean, default:false}
})

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment',appointmentSchema)


export default appointmentModel*/


/*import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  docId: { type: String, required: true },
  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true },

  userData: { type: Object, required: true },
  docData: { type: Object, required: true },

  amount: { type: Number, required: true },
  date: { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'expired', 'cancelled'],
    default: 'pending'
  },

  paymentExpiresAt: { type: Date }
})

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model('appointment', appointmentSchema)

export default appointmentModel*/


/*import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  docId: { type: String, required: true },
  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true },

  userData: { type: Object, required: true },
  docData: { type: Object, required: true },

  amount: { type: Number, required: true },
  date: { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'expired', 'cancelled'],
    default: 'pending'
  },

  paymentExpiresAt: { type: Date },

  // ✅ NEW: Razorpay fields
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },

  cancelReason: { type: String, default: '' },
  rescheduleReason: { type: String, default: '' },
  cancelledBy: { type: String, default: '' },       // 'doctor' or 'patient'
  rescheduledBy: { type: String, default: '' },     // 'doctor' or 'patient'
  previousSlotDate: { type: String, default: '' },  // Store old slot when rescheduled
  previousSlotTime: { type: String, default: '' }
})

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model('appointment', appointmentSchema)

export default appointmentModel    */



import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  docId: { type: String, required: true },
  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true },

  userData: { type: Object, required: true },
  docData: { type: Object, required: true },

  amount: { type: Number, required: true },
  date: { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'expired', 'cancelled'],
    default: 'pending'
  },

  paymentExpiresAt: { type: Date },

  // Razorpay fields
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },

  cancelReason: { type: String, default: '' },
  rescheduleReason: { type: String, default: '' },
  cancelledBy: { type: String, default: '' },
  rescheduledBy: { type: String, default: '' },
  previousSlotDate: { type: String, default: '' },
  previousSlotTime: { type: String, default: '' },

  // ✅ NEW: Diagnosis & Prescription Fields
  completedAt: { type: Date },
  
  diagnosis: { type: String, default: '' },
  
  prescription: {
    hasMedicines: { type: Boolean, default: false },
    medicines: [{
      name: { type: String },
      timesPerDay: { type: Number },
      timing: { type: String },       // 'before food' or 'after food'
      duration: { type: String }      // '3 days', '1 week', etc.
    }],
    notes: { type: String, default: '' }
  }
})

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model('appointment', appointmentSchema)

export default appointmentModel
