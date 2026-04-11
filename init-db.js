const mongoose = require('mongoose');

// URL Encoded Password: S6RMb2%40ndDqx4HP
const uri = "mongodb+srv://ruyat:S6RMb2%40ndDqx4HP@cluster0.nj3uren.mongodb.net/admin-frizzie?appName=Cluster0";

const studentSchema = new mongoose.Schema({
    name: String,
    contact: String,
    grade: String,
    createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

async function initDB() {
    console.log('Menghubungkan ke MongoDB Atlas...');
    try {
        await mongoose.connect(uri);
        console.log('✅ Terhubung!');

        console.log('Mencoba memasukkan data pertama...');
        const count = await Student.countDocuments();
        
        if (count === 0) {
            await Student.create({
                name: "Admin Test",
                contact: "00000000",
                grade: "System"
            });
            console.log('✅ Data pertama berhasil dimasukkan!');
        } else {
            console.log('Database sudah memiliki data.');
        }

        console.log('Silakan refresh halaman MongoDB Atlas kamu.');
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

initDB();
