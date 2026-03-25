import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,    // This already creates an index
        trim: true
    },
    description: { 
        type: String, 
        default: '' 
    },
    isActive: { 
        type: Boolean, 
        default: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
})

// REMOVED: departmentSchema.index({ name: 1 })
// Because "unique: true" already creates an index automatically

const departmentModel = mongoose.models.department || mongoose.model('department', departmentSchema)

export default departmentModel