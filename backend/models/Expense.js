const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  billNumber: { type: String },
  category: { type: String, default: 'Uncategorized' },
  status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Paid' },
  paymentDate: { type: Date },
  receiptUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
