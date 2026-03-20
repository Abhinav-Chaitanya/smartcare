// check2.js

import mongoose from 'mongoose'
import 'dotenv/config'

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ Connected to MongoDB\n')

        // Show connection details
        console.log('📍 Connection Details:')
        console.log('   Host:', mongoose.connection.host)
        console.log('   Database Name:', mongoose.connection.name)
        console.log('')

        // List ALL databases
        const adminDb = mongoose.connection.db.admin()
        const databases = await adminDb.listDatabases()
        
        console.log('📁 All Databases on this cluster:')
        for (const db of databases.databases) {
            console.log(`   - ${db.name}`)
            
            // Check each database for doctors collection
            const tempDb = mongoose.connection.client.db(db.name)
            const collections = await tempDb.listCollections().toArray()
            const hasDoctor = collections.find(c => c.name === 'doctors')
            
            if (hasDoctor) {
                const doctorCount = await tempDb.collection('doctors').countDocuments()
                console.log(`     └── ✅ Has 'doctors' collection with ${doctorCount} doctors!`)
            }
        }

        process.exit(0)

    } catch (error) {
        console.log('❌ Error:', error.message)
        process.exit(1)
    }
}

check()