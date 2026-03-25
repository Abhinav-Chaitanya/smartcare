// ============================================================
// Import local MongoDB data to Atlas
// 
// Steps:
// 1. Copy this file into your backend/ folder
// 2. Copy your 4 JSON files into your backend/ folder
//    (users.json, doctors.json, appointments.json, departments.json)
// 3. Run: node importToAtlas.js
// ============================================================

import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const importCollection = async (db, collectionName, jsonFile) => {
    const filePath = path.join(__dirname, jsonFile)

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${jsonFile} not found — skipping ${collectionName}`)
        return
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    const docs = JSON.parse(raw)

    if (!docs.length) {
        console.log(`⚠️  ${jsonFile} is empty — skipping`)
        return
    }

    const collection = db.collection(collectionName)

    // Drop existing collection data first
    await collection.deleteMany({})

    // Fix _id fields — Compass exports them as { $oid: "..." }
    const cleaned = docs.map(doc => {
        if (doc._id && doc._id.$oid) {
            doc._id = new mongoose.Types.ObjectId(doc._id.$oid)
        }
        return doc
    })

    await collection.insertMany(cleaned, { ordered: false })
    console.log(`✅ ${collectionName}: ${cleaned.length} documents imported`)
}

const run = async () => {
    try {
        console.log('Connecting to Atlas...')
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected!\n')

        const db = mongoose.connection.db

        await importCollection(db, 'users', 'users.json')
        await importCollection(db, 'doctors', 'doctors.json')
        await importCollection(db, 'appointments', 'appointments.json')
        await importCollection(db, 'departments', 'departments.json')

        console.log('\n✅ All done! Your Atlas database now has all your local data.')

    } catch (error) {
        console.error('Error:', error.message)
    } finally {
        await mongoose.disconnect()
        console.log('Disconnected.')
    }
}

run()