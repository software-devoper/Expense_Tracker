import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { CategoryIcon } from '../components/CategoryIcon';

const StatCard = ({ title, amount, icon, subtitle }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', flex: '1', minWidth: '240px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>{title}</p>
        <h3 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-primary)' }}>${amount.toFixed(2)}</h3>
      </div>
      <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--accent)' }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
      <span>{subtitle}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data } = await api.get('/receipts');
        setExpenses(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingBills = expenses.filter(e => e.status === 'Unpaid').reduce((acc, curr) => acc + curr.amount, 0);
  
  // Chart Data: Last 7 days
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayTotal = expenses
      .filter(e => {
        const expenseDate = new Date(e.date).toISOString().split('T')[0];
        return expenseDate === dateStr;
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { name: format(d, 'EEE'), amount: dayTotal };
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.name}. Here's your expense overview.</p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <StatCard title="Total Spent" amount={totalSpent} icon={<DollarSign size={24} />} subtitle="All time expenses" />
        <StatCard title="Pending Bills" amount={pendingBills} icon={<CreditCard size={24} />} subtitle="Awaiting payment" />
        <StatCard title="Total Transactions" amount={expenses.length} icon={<TrendingUp size={24} />} subtitle="Receipts processed" />
      </div>

      {/* Charts & Tables Section */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', flex: '2', minWidth: '500px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Spending (Last 7 Days)</h3>
          {isLoading ? <p>Loading chart...</p> : (
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'var(--text-primary)', fontWeight: '600' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', flex: '1', minWidth: '300px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Recent Transactions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isLoading ? <p>Loading...</p> : expenses.slice(0, 5).map((tx) => (
              <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CategoryIcon category={tx.category} size={18} />
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                    <p style={{ fontWeight: '500', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{tx.vendor}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{format(new Date(tx.date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <span style={{ fontWeight: '600', color: tx.status === 'Unpaid' ? 'var(--danger)' : 'var(--text-primary)' }}>
                  -${tx.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {!isLoading && expenses.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No transactions yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
