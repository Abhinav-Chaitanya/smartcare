// ============================================================
// Migration: Add isBlocked field to all existing doctors
// Run once from your backend folder:
//   node migrateAddIsBlocked.js
// ============================================================

import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const run = async () => {
    try {
        console.log('Connecting to MongoDB...')
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected.\n')

        const db = mongoose.connection.db
        const doctorsCollection = db.collection('doctors')

        // Count docs that don't have isBlocked field at all
        const missingCount = await doctorsCollection.countDocuments({
            isBlocked: { $exists: false }
        })

        console.log(`Found ${missingCount} doctor(s) without isBlocked field.`)

        if (missingCount === 0) {
            console.log('Nothing to migrate. All doctors already have isBlocked.')
            await mongoose.disconnect()
            return
        }

        // Write isBlocked: false and blockedReason: '' to all docs missing the field
        const result = await doctorsCollection.updateMany(
            { isBlocked: { $exists: false } },
            { $set: { isBlocked: false, blockedReason: '' } }
        )

        console.log(`\n✅ Migration complete.`)
        console.log(`   Modified: ${result.modifiedCount} doctor(s)`)
        console.log(`   isBlocked: false and blockedReason: '' written to all existing doctors.`)

    } catch (error) {
        console.error('Migration failed:', error.message)
    } finally {
        await mongoose.disconnect()
        console.log('\nDisconnected from MongoDB.')
    }
}

run()