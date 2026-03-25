// ============================================================
// Migration: Add isProfileComplete to all existing users
// 
// Logic:
//   - User has phone (not default) AND gender (not default) AND dob (not default)
//     → isProfileComplete: true  (they already filled everything)
//   - Otherwise → isProfileComplete: false  (they need to complete)
//
// Run once from your backend folder:
//   node migrateProfileComplete.js
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
        const usersCollection = db.collection('users')

        // Count users missing the field
        const missingCount = await usersCollection.countDocuments({
            isProfileComplete: { $exists: false }
        })

        console.log(`Found ${missingCount} user(s) without isProfileComplete field.\n`)

        if (missingCount === 0) {
            console.log('Nothing to migrate. All users already have isProfileComplete.')
            await mongoose.disconnect()
            return
        }

        // Mark as COMPLETE: has real phone, real gender, real dob
        const completeResult = await usersCollection.updateMany(
            {
                isProfileComplete: { $exists: false },
                phone: { $exists: true, $nin: ['0000000000', '', null] },
                gender: { $exists: true, $nin: ['Not Selected', '', null] },
                dob: { $exists: true, $nin: ['Not Selected', '', null] }
            },
            { $set: { isProfileComplete: true } }
        )

        // Mark as INCOMPLETE: missing any of the above
        const incompleteResult = await usersCollection.updateMany(
            { isProfileComplete: { $exists: false } },
            { $set: { isProfileComplete: false } }
        )

        console.log('✅ Migration complete.')
        console.log(`   Marked as complete:   ${completeResult.modifiedCount} user(s)`)
        console.log(`   Marked as incomplete: ${incompleteResult.modifiedCount} user(s)`)
        console.log('\nExisting users who already had phone + gender + DOB are untouched (complete).')
        console.log('Users missing any field will see the profile completion banner.')

    } catch (error) {
        console.error('Migration failed:', error.message)
    } finally {
        await mongoose.disconnect()
        console.log('\nDisconnected from MongoDB.')
    }
}

run()