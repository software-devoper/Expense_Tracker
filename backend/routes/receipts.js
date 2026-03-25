const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const Expense = require('../models/Expense');
const fs = require('fs');
let GoogleGenerativeAI;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {
  console.log("Gemini module missing.");
}

const router = express.Router();
// Multer setup - ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
const upload = multer({ dest: 'uploads/' });

let genAI;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 30 && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// @route POST /api/receipts/extract
router.post('/extract', protect, upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No receipt file provided' });
    
    // Fallback to mock extraction if no Gemini API Key is provided
    if (!genAI) {
      console.log('Gemini API key missing. Simulating extraction delay...');
      setTimeout(() => {
        res.json({
          vendor: 'Mock Cafe & Tech',
          amount: 45.99,
          date: new Date().toISOString().split('T')[0],
          billNumber: 'INV-' + Math.floor(Math.random() * 100000),
          category: 'Food & Dining',
          originalFile: req.file.filename
        });
      }, 2500);
      return;
    }

    const base64Image = fs.readFileSync(req.file.path).toString('base64');
    const mimeType = req.file.mimetype;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are an expert OCR parser. Extract these details from the receipt: vendor (string), amount (numeric, no symbols), date (YYYY-MM-DD), billNumber (string), category (string). Return ONLY a valid JSON object without markdown formatting blocks.`;
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    const parsedData = JSON.parse(cleanJson);

    res.json({
      ...parsedData,
      originalFile: req.file.filename
    });

  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ message: 'Error processing receipt', error: error.message });
  }
});

// @route POST /api/receipts
// Save the final confirmed expense
router.post('/', protect, async (req, res) => {
  try {
    const { vendor, amount, date, billNumber, category, status, originalFile } = req.body;
    
    const expense = await Expense.create({
      user: req.user._id,
      vendor,
      amount,
      date,
      billNumber,
      category,
      status,
      receiptUrl: originalFile
    });

    const { createCalendarReminder, sendEmailReminder } = require('../integrations/google');
    if (status === 'Unpaid') {
      createCalendarReminder(expense);
      sendEmailReminder(req.user.email, expense);
    }

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/receipts
// Get all expenses for a user
router.get('/', protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/receipts/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/receipts/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
