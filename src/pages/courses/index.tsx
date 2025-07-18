import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import CourseCard from '../../components/CourseCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from '../../styles/Courses.module.css';
import Navbar from '@/components/Navbar';
import { api } from '@/api/Api';
import { CourseTypeDto } from '@/api/ApiType';
// 筛选条件
import { CourseDto } from '@/api/ApiType';
const filters = [
  { id: 'difficulty', name: '难度', options: ['全部', '初级', '中级', '高级'] },
  { id: 'price', name: '价格', options: ['全部', '免费', '付费'] },
  { id: 'duration', name: '时长', options: ['全部', '1-5课时', '6-10课时', '10课时以上'] },
  { id: 'sort', name: '排序', options: ['最受欢迎', '最新', '评分最高'] },
];


// 课程数据

const CoursesPage: NextPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [courseTypes, setCourseTypes] = useState<CourseTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>(
    Object.fromEntries(filters.map(filter => [filter.id, filter.options[0]]))
  );

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await api.courseController.getAllCourses();
        console.log("response", response);
        setCourses(response.data || []);
      } catch (error) {
        console.error('获取课程失败:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchCourseTypes = async () => {
      try {
        const response = await api.courseController.getCourseTypes();
        console.log("response", response);
        setCourseTypes([{ id: '', name: '全部' }, ...response.data]);
      } catch (error) {
        console.error('获取课程类型失败:', error);
      }
    };
    
    const fetchData = async () => {
      await Promise.all([fetchCourses(), fetchCourseTypes()]);
    };
    
    fetchData();
  }, []); // 只在组件挂载时执行一次

  const handleCategoryChange = async (categoryId: string) => {
    try {
      setCategoryLoading(true);
      setActiveCategory(categoryId);
      setSearchQuery('');
      const response = await api.courseController.getAllCourses(categoryId);
      console.log("response", response);
      setCourses(response.data || []);
    } catch (error) {
      console.error('切换分类失败:', error);
    } finally {
      setCategoryLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>课程列表 - Move To Learn</title>
        <meta name="description" content="探索 Move To Learn 平台上的优质课程" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        {/* 搜索栏 */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索区块链快链课程、教程、项目..."
            className={styles.searchInput}
          />
        </div>

        {/* 课程分类 */}
        <div className={styles.categoryContainer}>
          {courseTypes && courseTypes.length > 0 ? (
            courseTypes.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryButton} ${
                  activeCategory === category.id ? styles.categoryActive : ''
                } ${categoryLoading && activeCategory === category.id ? styles.categoryLoading : ''}`}
                onClick={() => handleCategoryChange(category.id)}
                disabled={categoryLoading}
              >
                {categoryLoading && activeCategory === category.id ? (
                  <span className={styles.buttonContent}>
                    <LoadingSpinner size="small" />
                    <span>{category.name || '未分类'}</span>
                  </span>
                ) : (
                  category.name || '未分类'
                )}
              </button>
            ))
          ) : (
            <div className={styles.noCategories}>暂无课程分类</div>
          )}
        </div>

        {/* 加载状态 */}
        {(loading || categoryLoading) && (
          <div className={styles.loadingContainer}>
            <LoadingSpinner size="large" />
            <p className={styles.loadingText}>
              {loading ? '正在加载课程...' : '正在切换分类...'}
            </p>
          </div>
        )}

        {/* 课程列表 */}
        {!loading && !categoryLoading && (
          courses.length > 0 ? (
            <div className={styles.courseGrid}>
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className={styles.noCourses}>暂无课程</div>
          )
        )}
      </main>
    </div>
  );
};

export default CoursesPage; 