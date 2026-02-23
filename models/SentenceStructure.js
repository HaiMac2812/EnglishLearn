const mongoose = require('mongoose');

const sentenceSchema = new mongoose.Schema({
    structure: { type: String, required: true },
    meaning: { type: String, required: true },
    formula: { type: String, default: '' },
    examples: [{
        english: { type: String },
        vietnamese: { type: String }
    }],
    category: { type: String, required: true, index: true },
    note: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('SentenceStructure', sentenceSchema);
