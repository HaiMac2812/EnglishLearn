const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    wordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vocabulary', required: true, unique: true },
    status: { type: String, enum: ['new', 'learning', 'known'], default: 'new' },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    lastReviewed: { type: Date, default: null },
    nextReview: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
