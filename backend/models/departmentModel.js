/*import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true  // Removes extra spaces
    },
    description: { 
        type: String, 
        default: '' 
    },
    isActive: { 
        type: Boolean, 
        default: true  // If false, won't show in dropdown
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
})

// Create index for faster queries
departmentSchema.index({ name: 1 })

const departmentModel = mongoose.models.department || mongoose.model('department', departmentSchema)

export default departmentModel  */

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