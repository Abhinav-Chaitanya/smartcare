// utils/migrateDoctors.js
// Run this ONCE to update existing doctors in database

import mongoose from 'mongoose'
import doctorModel from '../models/doctorModel.js'
import 'dotenv/config'

const migrateDoctors = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ Connected to MongoDB')

        // Default empty schedule structure
        const defaultSchedule = {
            monday: { isWorking: false, timeSlots: [] },
            tuesday: { isWorking: false, timeSlots: [] },
            wednesday: { isWorking: false, timeSlots: [] },
            thursday: { isWorking: false, timeSlots: [] },
            friday: { isWorking: false, timeSlots: [] },
            saturday: { isWorking: false, timeSlots: [] },
            sunday: { isWorking: false, timeSlots: [] }
        }

        // Find all doctors that don't have the new fields
        const doctors = await doctorModel.find({
            $or: [
                { isScheduleConfirmed: { $exists: false } },
                { weeklySchedule: { $exists: false } }
            ]
        })

        console.log(`📋 Found ${doctors.length} doctors to migrate`)

        if (doctors.length === 0) {
            console.log('✅ All doctors already migrated!')
            process.exit(0)
        }

        // Update each doctor
        for (const doctor of doctors) {
            await doctorModel.findByIdAndUpdate(doctor._id, {
                $set: {
                    isScheduleConfirmed: false,  // Force them to set schedule
                    weeklySchedule: doctor.weeklySchedule || defaultSchedule,
                    slotDuration: doctor.slotDuration || 20,
                    advanceBookingDays: doctor.advanceBookingDays || 7,
                    blockedDates: doctor.blockedDates || []
                }
            })
            console.log(`✅ Migrated: Dr. ${doctor.name} (${doctor.email})`)
        }

        console.log('\n🎉 Migration completed successfully!')
        console.log('📌 All existing doctors will need to set their schedule on next login.')
        
        process.exit(0)

    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    }
}

migrateDoctors()