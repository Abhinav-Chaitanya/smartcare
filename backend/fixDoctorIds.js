// ============================================================
// Fix broken ObjectIds AND broken number fields in doctors
// Run once from your backend folder:
//   node fixDoctorIds.js
// ============================================================

import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const run = async () => {
    try {
        console.log('Connecting to Atlas...')
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected.\n')

        const db = mongoose.connection.db
        const doctors = db.collection('doctors')

        const allDoctors = await doctors.find({}).toArray()
        console.log(`Found ${allDoctors.length} doctors to check...\n`)

        let fixed = 0

        for (const doctor of allDoctors) {
            const update = {}

            // ✅ Fix date field — { $numberLong: '...' } → Number
            if (doctor.date && typeof doctor.date === 'object' && doctor.date.$numberLong) {
                update.date = Number(doctor.date.$numberLong)
            }

            // ✅ Fix weeklySchedule timeSlot _ids
            if (doctor.weeklySchedule) {
                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                const fixedSchedule = {}
                let scheduleNeedsFix = false

                for (const day of days) {
                    if (doctor.weeklySchedule[day]) {
                        const slots = doctor.weeklySchedule[day].timeSlots
                        if (Array.isArray(slots)) {
                            const fixedSlots = slots.map(slot => {
                                if (slot._id && typeof slot._id === 'object' && slot._id.$oid) {
                                    scheduleNeedsFix = true
                                    return { ...slot, _id: new mongoose.Types.ObjectId(slot._id.$oid) }
                                }
                                return slot
                            })
                            fixedSchedule[day] = { ...doctor.weeklySchedule[day], timeSlots: fixedSlots }
                        } else {
                            fixedSchedule[day] = doctor.weeklySchedule[day]
                        }
                    }
                }

                if (scheduleNeedsFix) {
                    update.weeklySchedule = fixedSchedule
                }
            }

            // ✅ Fix blockedDates _ids
            if (Array.isArray(doctor.blockedDates) && doctor.blockedDates.length > 0) {
                const needsFix = doctor.blockedDates.some(
                    b => b._id && typeof b._id === 'object' && b._id.$oid
                )
                if (needsFix) {
                    update.blockedDates = doctor.blockedDates.map(b => ({
                        ...b,
                        _id: b._id && b._id.$oid
                            ? new mongoose.Types.ObjectId(b._id.$oid)
                            : (b._id || new mongoose.Types.ObjectId())
                    }))
                }
            }

            if (Object.keys(update).length > 0) {
                await doctors.updateOne(
                    { _id: doctor._id },
                    { $set: update }
                )
                fixed++
                console.log(`✅ Fixed: ${doctor.name} — fixed: ${Object.keys(update).join(', ')}`)
            }
        }

        console.log(`\n✅ Done. Fixed ${fixed} out of ${allDoctors.length} doctors.`)

    } catch (error) {
        console.error('Error:', error.message)
    } finally {
        await mongoose.disconnect()
        console.log('Disconnected.')
    }
}

run()