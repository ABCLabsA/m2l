import React from 'react';
import styles from '../styles/LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  color = '#4CAF50'
}) => {
  const sizeMap = {
    small: '20px',
    medium: '30px',
    large: '40px'
  };

  return (
    <div 
      className={styles.spinner}
      style={{ 
        width: sizeMap[size],
        height: sizeMap[size],
        borderColor: color,
        borderTopColor: 'transparent'
      }}
    />
  );
};

export default LoadingSpinner; 