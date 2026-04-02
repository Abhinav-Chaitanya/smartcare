import 'dotenv/config'; // Load environment variables first!
import connectDB from './config/mongodb.js';
import { processDailyReminders, processOneHourReminders } from './utils/cronJobs.js';

const runTests = async () => {
    try {
        console.log("Connecting to database...");
        await connectDB();
        
        console.log("\n--- Testing Daily Reminders (7 AM) ---");
        await processDailyReminders();
        
        console.log("\n--- Testing 1-Hour Prior Reminders ---");
        await processOneHourReminders();
        
        console.log("\nAll tests completed! Check your email inbox if you had appointments scheduled for today.");
        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
}

runTests();
