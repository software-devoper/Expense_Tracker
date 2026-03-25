import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Search, Filter, Edit2, Trash2, CheckCircle, Circle } from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import * as XLSX from 'xlsx';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get('/receipts');
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
      await api.put(`/receipts/${id}`, { status: newStatus });
      setExpenses(expenses.map(e => e._id === id ? { ...e, status: newStatus } : e));
    } catch (error) {
      console.error('Failed to toggle status', error);
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/receipts/${id}`);
      setExpenses(expenses.filter(e => e._id !== id));
    } catch (error) {
      console.error('Failed to delete expense', error);
    }
  };

  const filteredExpenses = expenses.filter(expense => 
    expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory ? expense.category === filterCategory : true)
  );

  const exportCSV = () => {
    const headers = ['Date', 'Vendor', 'Category', 'Amount', 'Status', 'Bill Number'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\\n"
      + filteredExpenses.map(e => `${new Date(e.date).toLocaleDateString()},"${e.vendor}","${e.category}",${e.amount},${e.status},"${e.billNumber || ''}"`).join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = () => {
    const dataToExport = filteredExpenses.map(e => ({
      Date: new Date(e.date).toLocaleDateString(),
      Vendor: e.vendor,
      Category: e.category,
      Amount: e.amount,
      Status: e.status,
      'Bill Number': e.billNumber || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    XLSX.writeFile(workbook, "expenses_export.xlsx");
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>All Expenses</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and track your imported receipts.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={exportCSV} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            Export CSV
          </button>
          <button onClick={exportExcel} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', backgroundColor: '#10b981', color: 'white' }}>
            Export Excel
          </button>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search by vendor..." 
            className="input-field" 
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative', width: '250px' }}>
          <Filter size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <select 
            className="input-field" 
            style={{ paddingLeft: '2.5rem', appearance: 'none' }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Food & Dining">Food & Dining</option>
            <option value="Transportation">Transportation</option>
            <option value="Software">Software</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Uncategorized">Other</option>
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500' }}>Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500' }}>Vendor</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500' }}>Category</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500' }}>Amount</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: '500' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading expenses...</td></tr>
            ) : filteredExpenses.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No expenses found.</td></tr>
            ) : (
              filteredExpenses.map((expense) => (
                <tr key={expense._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s ease' }}>
                  <td style={{ padding: '1rem' }}>{new Date(expense.date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <CategoryIcon category={expense.category} size={16} />
                      {expense.vendor}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '999px', fontSize: '0.875rem', border: '1px solid var(--border)' }}>
                      {expense.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>${expense.amount.toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => toggleStatus(expense._id, expense.status)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                        padding: '0.375rem 0.75rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
                        backgroundColor: expense.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: expense.status === 'Paid' ? 'var(--success)' : 'var(--danger)',
                        fontWeight: '500'
                      }}
                    >
                      {expense.status === 'Paid' ? <CheckCircle size={14} /> : <Circle size={14} />}
                      {expense.status}
                    </button>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginRight: '0.5rem' }} title="Edit"><Edit2 size={18} /></button>
                    <button onClick={() => deleteExpense(expense._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} title="Delete"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;
