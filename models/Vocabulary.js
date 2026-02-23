const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema({
    word: { type: String, required: true },
    meaning: { type: String, required: true },
    phonetic: { type: String, default: '' },
    example: { type: String, default: '' },
    category: { type: String, required: true, index: true }
}, { timestamps: true });

vocabularySchema.index({ word: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Vocabulary', vocabularySchema);
