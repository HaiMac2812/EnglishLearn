const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flashcard_english';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', apiRoutes);

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('\n💡 Make sure MongoDB is running. You can:');
        console.log('   1. Install MongoDB: https://www.mongodb.com/try/download/community');
        console.log('   2. Or use MongoDB Atlas (cloud): set MONGO_URI environment variable');
        process.exit(1);
    });
