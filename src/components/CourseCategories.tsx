import styles from '../styles/CourseCategories.module.css';

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface CourseCategoriesProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CourseCategories = ({
  categories,
  activeCategory,
  onCategoryChange,
}: CourseCategoriesProps) => {
  return (
    <div className={styles.categoriesContainer}>
      <div className={styles.categories}>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`${styles.categoryButton} ${
              activeCategory === category.id ? styles.active : ''
            }`}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.icon && <span className={styles.categoryIcon}>{category.icon}</span>}
            {category.name}
          </button>
        ))}
      </div>
      <div className={styles.filters}>
        <select className={styles.filterSelect} defaultValue="建立">
          <option value="建立">建立</option>
          <option value="价格">价格</option>
          <option value="评分">评分</option>
          <option value="时长">时长</option>
          <option value="热度">热度</option>
        </select>
        <select className={styles.filterSelect} defaultValue="全部">
          <option value="全部">全部</option>
          <option value="免费">免费</option>
          <option value="付费">付费</option>
        </select>
      </div>
    </div>
  );
};

export default CourseCategories; 