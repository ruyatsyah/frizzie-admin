require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testConnection() {
    console.log('Testing connection to:', process.env.MONGODB_URI?.replace(/:([^@]+)@/, ':****@'));
    
    if (!process.env.MONGODB_URI) {
        console.error('Error: MONGODB_URI is not defined in .env.local');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Berhasil terhubung ke MongoDB!');
        
        // Check if we can see collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Koleksi yang ditemukan:', collections.map(c => c.name));
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Gagal terhubung ke MongoDB:', error.message);
        process.exit(1);
    }
}

testConnection();
