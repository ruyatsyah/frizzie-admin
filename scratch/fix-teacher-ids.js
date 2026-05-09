const mongoose = require('mongoose');
const dbConnect = require('./lib/mongodb').default;
const LearningOutcome = require('./models/LearningOutcome').default;
const User = require('./models/User').default;
const Teacher = require('./models/Teacher').default;

async function fixTeacherIds() {
    try {
        await dbConnect();
        console.log("Connected to DB...");

        const outcomes = await LearningOutcome.find({});
        console.log(`Found ${outcomes.length} outcomes.`);

        let fixCount = 0;
        for (const out of outcomes) {
            // Try to find in Teacher collection
            const teacher = await Teacher.findById(out.teacher);
            if (!teacher) {
                // If not found, check if it's a User ID
                const user = await User.findById(out.teacher);
                if (user && user.teacherId) {
                    console.log(`Fixing outcome ${out._id}: Changing teacher ID from User(${user.name}) to Teacher(${user.teacherId})`);
                    out.teacher = user.teacherId;
                    await out.save();
                    fixCount++;
                } else if (user && user.role === 'admin') {
                     // If it's an admin, we might not know who the teacher was.
                     // But wait, if it was created from a session, we can find the teacher from the Attendance record.
                     if (out.sessionId) {
                         const Attendance = require('./models/Attendance').default;
                         const session = await Attendance.findById(out.sessionId);
                         if (session && session.teacher) {
                             console.log(`Fixing outcome ${out._id}: Changing teacher ID from Admin to Session Teacher(${session.teacher})`);
                             out.teacher = session.teacher;
                             await out.save();
                             fixCount++;
                         }
                     }
                }
            }
        }

        console.log(`Finished! Fixed ${fixCount} records.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixTeacherIds();
