const mongoose = require('mongoose');

const quizHistorySchema = new mongoose.Schema({
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    category: { type: String, default: 'all' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('QuizHistory', quizHistorySchema);
