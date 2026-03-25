import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { UploadCloud, CheckCircle, X } from 'lucide-react';

const UploadReceipt = () => {
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    setError('');
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a JPG, PNG, or PDF file.');
      return;
    }
    setFile(selectedFile);
    processReceipt(selectedFile);
  };

  const processReceipt = async (receiptFile) => {
    setIsExtracting(true);
    const formData = new FormData();
    formData.append('receipt', receiptFile);

    try {
      const { data } = await api.post('/receipts/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setExtractedData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to extract data. Please try again.');
      setFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/receipts', extractedData);
      navigate('/');
    } catch (err) {
      setError('Failed to save expense.');
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Upload Receipt</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Upload an image or PDF to auto-extract expense details using AI.</p>
      </header>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={18} /></button>
        </div>
      )}

      {!extractedData && !isExtracting && (
        <div 
          style={{ 
            border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border)'}`, 
            borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', 
            backgroundColor: isDragActive ? 'rgba(99, 102, 241, 0.05)' : 'var(--glass-bg)',
            transition: 'all 0.2s ease', cursor: 'pointer'
          }}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" ref={fileInputRef} style={{ display: 'none' }} 
            accept="image/jpeg, image/png, application/pdf"
            onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: isDragActive ? 'var(--accent)' : 'var(--text-secondary)' }}>
            <UploadCloud size={48} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Drop your receipt here</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>or click to browse from your computer</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '1rem' }}>Supports JPG, PNG, PDF (Max 5MB)</p>
        </div>
      )}

      {isExtracting && (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Analyzing Receipt...</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Our AI is extracting the details. This will just take a moment.</p>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {extractedData && !isExtracting && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--success)' }}>
            <CheckCircle size={24} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>Extraction Successful</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Please verify the extracted details before saving.</p>
          
          <form onSubmit={handleSaveExpense} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Vendor Name</label>
              <input type="text" className="input-field" value={extractedData.vendor || ''} onChange={e => setExtractedData({...extractedData, vendor: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input type="number" step="0.01" className="input-field" value={extractedData.amount || ''} onChange={e => setExtractedData({...extractedData, amount: parseFloat(e.target.value)})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="input-field" value={extractedData.date?.split('T')[0] || ''} onChange={e => setExtractedData({...extractedData, date: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="input-field" value={extractedData.category || 'Uncategorized'} onChange={e => setExtractedData({...extractedData, category: e.target.value})}>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Transportation">Transportation</option>
                <option value="Software">Software</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Uncategorized">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Bill / Invoice Number</label>
              <input type="text" className="input-field" value={extractedData.billNumber || ''} onChange={e => setExtractedData({...extractedData, billNumber: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select className="input-field" value={extractedData.status || 'Paid'} onChange={e => setExtractedData({...extractedData, status: e.target.value})}>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
            
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={isSaving} style={{ flex: 1 }}>
                {isSaving ? 'Saving...' : 'Confirm & Save Expense'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => { setExtractedData(null); setFile(null); }} style={{ flex: 1 }}>
                Cancel & Upload New
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UploadReceipt;
