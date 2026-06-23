const express = require('express');
const fs = require('fs');
const path = require('path');

const Book = require('../models/Book');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

function deleteImage(imagePath) {
    if (!imagePath) return;

    const fullPath = path.join(__dirname, '..', imagePath);

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
}

// Semua route books wajib login
router.use(authMiddleware);

// Get all books
router.get('/', async (req, res) => {
    try {
        const books = await Book.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        return res.json({
            data: books
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

// Create book
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, author } = req.body;

        if (!title || !author) {
            return res.status(400).json({
                message: 'Title and author are required'
            });
        }

        const imagePath = req.file ? `uploads/books/${req.file.filename}` : null;

        const book = await Book.create({
            title,
            author,
            image: imagePath,
            user: req.user._id
        });

        return res.status(201).json({
            message: 'Book created successfully',
            data: book
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

// Get detail book
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('user', 'name email');

        if (!book) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        return res.json({
            data: book
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

// Update book
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, author } = req.body;

        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        let imagePath = book.image;

        if (req.file) {
            deleteImage(book.image);
            imagePath = `uploads/books/${req.file.filename}`;
        }

        book.title = title || book.title;
        book.author = author || book.author;
        book.image = imagePath;

        await book.save();

        return res.json({
            message: 'Book updated successfully',
            data: book
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

// Delete book
router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        deleteImage(book.image);

        await book.deleteOne();

        return res.json({
            message: 'Book deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;