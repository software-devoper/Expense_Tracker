import React from 'react';
import { Utensils, Car, Monitor, Briefcase, Film, Tag } from 'lucide-react';

const categoryMap = {
  'Food & Dining': { icon: Utensils, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  'Transportation': { icon: Car, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  'Software': { icon: Monitor, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  'Office Supplies': { icon: Briefcase, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  'Entertainment': { icon: Film, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
  'Other': { icon: Tag, color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' },
  'Uncategorized': { icon: Tag, color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' }
};

export const CategoryIcon = ({ category, size = 16 }) => {
  const config = categoryMap[category] || categoryMap['Other'];
  const IconComponent = config.icon;
  
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size + 16,
      height: size + 16,
      borderRadius: '8px',
      backgroundColor: config.bg,
      color: config.color,
      marginRight: '0.75rem'
    }}>
      <IconComponent size={size} />
    </div>
  );
};
