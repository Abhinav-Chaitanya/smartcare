// check.js

import mongoose from 'mongoose'
import 'dotenv/config'

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ Connected to MongoDB\n')

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray()
        console.log('📁 Collections in your database:')
        collections.forEach(col => console.log('   -', col.name))
        console.log('')

        // Check doctors collection
        const doctors = await mongoose.connection.db.collection('doctors').find({}).toArray()
        
        console.log(`👨‍⚕️ Total Doctors: ${doctors.length}\n`)

        // Show each doctor's isFirstLogin status
        console.log('Doctor Details:')
        console.log('─'.repeat(60))
        
        doctors.forEach((doc, index) => {
            console.log(`${index + 1}. ${doc.name}`)
            console.log(`   Email: ${doc.email}`)
            console.log(`   isFirstLogin: ${doc.isFirstLogin === undefined ? '❌ MISSING' : doc.isFirstLogin}`)
            console.log('')
        })

        process.exit(0)

    } catch (error) {
        console.log('❌ Error:', error.message)
        process.exit(1)
    }
}

check()