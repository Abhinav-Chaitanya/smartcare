// Run once: node clearOldDefaultImages.js
// In backend/ folder

import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

await mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection.db
await db.collection('users').updateMany(
  { image: { $regex: /^data:image/ } },  // find all with base64
  { $set: { image: '' } }                 // clear to empty string
)
console.log('Done')
await mongoose.disconnect()