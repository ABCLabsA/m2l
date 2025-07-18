import React from 'react';
import styles from '../styles/Home.module.css';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = '搜索...' }) => {
  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.searchInput}
      />
    </div>
  );
};

export default SearchBar; 