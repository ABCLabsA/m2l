import React from 'react';
import Navbar from './Navbar';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Move To Learn', 
  description = 'Move编程学习平台',
  className = ''
}) => {
  return (
    <>
      <Navbar />
      <div className={`${styles.layout} ${className}`}>
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout; 