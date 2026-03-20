// migration.js

import mongoose from 'mongoose'
import 'dotenv/config'

const migrate = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ Connected to MongoDB')

        // Direct MongoDB update (no model needed)
        const result = await mongoose.connection.db.collection('doctors').updateMany(
            { isFirstLogin: { $exists: false } },
            { $set: { isFirstLogin: true } }
        )

        console.log(`✅ Updated ${result.modifiedCount} doctors`)
        console.log('✅ Migration completed successfully!')
        
        process.exit(0)

    } catch (error) {
        console.log('❌ Migration failed:', error.message)
        process.exit(1)
    }
}

migrate()