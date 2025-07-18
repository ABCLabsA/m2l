import { useState } from 'react';
import styles from '../styles/CourseSearch.module.css';
import { FiSearch } from 'react-icons/fi';

interface CourseSearchProps {
  onSearch: (query: string) => void;
}

const CourseSearch = ({ onSearch }: CourseSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.searchInputWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="搜索区块链课程、教程、项目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button type="submit" className={styles.searchButton}>
          高级筛选
        </button>
      </form>
    </div>
  );
};

export default CourseSearch; 