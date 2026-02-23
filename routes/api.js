const express = require('express');
const router = express.Router();
const Vocabulary = require('../models/Vocabulary');
const Progress = require('../models/Progress');
const QuizHistory = require('../models/QuizHistory');
const { adminOnly } = require('../middleware/auth');

// ==================== VOCABULARY ====================

// GET all vocabulary (optional ?category=xxx)
router.get('/vocabulary', async (req, res) => {
    try {
        const filter = req.query.category ? { category: req.query.category } : {};
        const words = await Vocabulary.find(filter).sort({ word: 1 });
        res.json(words);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET categories list
router.get('/categories', async (req, res) => {
    try {
        const categories = await Vocabulary.distinct('category');
        const counts = await Promise.all(
            categories.map(async (cat) => ({
                name: cat,
                count: await Vocabulary.countDocuments({ category: cat })
            }))
        );
        res.json(counts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add new word
router.post('/vocabulary', async (req, res) => {
    try {
        const word = new Vocabulary(req.body);
        await word.save();
        res.status(201).json(word);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update word (admin only)
router.put('/vocabulary/:id', adminOnly, async (req, res) => {
    try {
        const word = await Vocabulary.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!word) return res.status(404).json({ error: 'Word not found' });
        res.json(word);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE word (admin only)
router.delete('/vocabulary/:id', adminOnly, async (req, res) => {
    try {
        const word = await Vocabulary.findByIdAndDelete(req.params.id);
        if (!word) return res.status(404).json({ error: 'Word not found' });
        await Progress.deleteMany({ wordId: req.params.id });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== PROGRESS ====================

// GET progress for all words (with word details)
router.get('/progress', async (req, res) => {
    try {
        const progress = await Progress.find().populate('wordId');
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET progress stats
router.get('/progress/stats', async (req, res) => {
    try {
        const total = await Vocabulary.countDocuments();
        const known = await Progress.countDocuments({ status: 'known' });
        const learning = await Progress.countDocuments({ status: 'learning' });
        const newWords = total - known - learning;
        const recentQuizzes = await QuizHistory.find().sort({ date: -1 }).limit(10);
        res.json({ total, known, learning, new: newWords, recentQuizzes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST update progress for a word
router.post('/progress/:wordId', async (req, res) => {
    try {
        const { correct } = req.body;
        let progress = await Progress.findOne({ wordId: req.params.wordId });

        if (!progress) {
            progress = new Progress({ wordId: req.params.wordId });
        }

        if (correct) {
            progress.correctCount += 1;
        } else {
            progress.wrongCount += 1;
        }

        // Determine status
        if (progress.correctCount >= 3) {
            progress.status = 'known';
        } else if (progress.correctCount > 0 || progress.wrongCount > 0) {
            progress.status = 'learning';
        }

        progress.lastReviewed = new Date();
        // Simple spaced repetition: next review based on correct count
        const days = Math.pow(2, progress.correctCount);
        progress.nextReview = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        await progress.save();
        res.json(progress);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ==================== QUIZ ====================

// GET quiz questions (random words from category)
router.get('/quiz', async (req, res) => {
    try {
        const filter = req.query.category ? { category: req.query.category } : {};
        const count = parseInt(req.query.count) || 10;
        const words = await Vocabulary.aggregate([
            { $match: filter },
            { $sample: { size: count } }
        ]);
        res.json(words);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST save quiz result
router.post('/quiz/history', async (req, res) => {
    try {
        const history = new QuizHistory(req.body);
        await history.save();
        res.status(201).json(history);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET quiz history
router.get('/quiz/history', async (req, res) => {
    try {
        const history = await QuizHistory.find().sort({ date: -1 }).limit(20);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== SENTENCE STRUCTURES ====================

const SentenceStructure = require('../models/SentenceStructure');

// GET all sentence structures (optional ?category=xxx)
router.get('/sentences', async (req, res) => {
    try {
        const filter = req.query.category ? { category: req.query.category } : {};
        const sentences = await SentenceStructure.find(filter).sort({ createdAt: -1 });
        res.json(sentences);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET sentence categories
router.get('/sentences/categories', async (req, res) => {
    try {
        const categories = await SentenceStructure.distinct('category');
        const counts = await Promise.all(
            categories.map(async (cat) => ({
                name: cat,
                count: await SentenceStructure.countDocuments({ category: cat })
            }))
        );
        res.json(counts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add sentence structure
router.post('/sentences', async (req, res) => {
    try {
        const sentence = new SentenceStructure(req.body);
        await sentence.save();
        res.status(201).json(sentence);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update sentence structure (admin only)
router.put('/sentences/:id', adminOnly, async (req, res) => {
    try {
        const sentence = await SentenceStructure.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!sentence) return res.status(404).json({ error: 'Not found' });
        res.json(sentence);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE sentence structure (admin only)
router.delete('/sentences/:id', adminOnly, async (req, res) => {
    try {
        const sentence = await SentenceStructure.findByIdAndDelete(req.params.id);
        if (!sentence) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
