import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import DashboardTitle from '../../components/DashboardTitle';
import styles from '../../styles/DashboardCourses.module.css';
import { FiBook, FiClock, FiStar, FiUsers } from 'react-icons/fi';
import { CourseDto, CourseTypeDto } from '../../api/ApiType';
import { api } from '@/api/Api';

// 课程分类数据
const courseCategories = [
  { id: 'all', name: '全部课程' },
  { id: 'AI', name: 'AI课程' },
  { id: 'WEB3', name: 'Web3课程' },
  { id: 'MOVE', name: 'Move语言' },
  { id: 'SMART_CONTRACT', name: '智能合约' },
  { id: 'DEFI', name: 'DeFi' },
  { id: 'NFT', name: 'NFT' },
  { id: 'SECURITY', name: '安全审计' },
];

// 课程类型标签颜色映射
const courseTypeColors: Record<string, string> = {
  1: '#10b981',
  2: '#3b82f6',
  3: '#8b5cf6',
  4: '#ec4899',
  5: '#f59e0b',
  6: '#6366f1',
  7: '#ef4444',
};

// 筛选条件
const filters = [
  // { id: 'difficulty', name: '难度', options: ['全部', '初级', '中级', '高级'] },
  { id: 'status', name: '状态', options: ['全部', '进行中', '已完成', '未开始'] },
  { id: 'sort', name: '排序', options: ['最近学习', '完成度高', '完成度低'] },
];

interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
}

const Courses: NextPage = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [courseCategories, setCourseCategories] = useState<CourseTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>(
    Object.fromEntries(filters.map(filter => [filter.id, filter.options[0]]))
  );

  // 获取课程数据
  useEffect(() => {
    fetchCourses();
    fetchCourseCategories();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.courseController.getPrivateCourses();
      console.log("courses", response.data);
      setCourses(response.data || []);
      setLoading(false);
    } catch (err) {
      setError('加载课程失败，请稍后重试');
      console.error('获取课程失败:', err);
    } finally {
      setLoading(false);
    }
  };
  const fetchCourseCategories = async () => {
    const response = await api.courseController.getCourseTypes();
    const categories = response.data || [];
    // 再添加一个全部
      setCourseCategories([{ id: 'all', name: '全部' }, ...categories]);
  };

  // 过滤课程
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || course.type?.id === activeCategory;

    let matchesStatus = true;
    if (selectedFilters.status !== '全部') {
      if (selectedFilters.status === '已完成') {
        matchesStatus = course.totalChapterLength === (course.learnedChapterLength || 0);
      } else if (selectedFilters.status === '进行中') {
        matchesStatus = Boolean(course.totalChapterLength && course.totalChapterLength > (course.learnedChapterLength || 0));
      } else {
        matchesStatus = course.learnedChapterLength === 0;
      }
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // 排序课程
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (selectedFilters.sort) {
      case '完成度高':
        return (b.learnedChapterLength || 0) - (a.learnedChapterLength || 0);
      case '完成度低':
        return (a.learnedChapterLength || 0) - (b.learnedChapterLength || 0);
      case '最近学习':
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  return (
    <div className={styles.container}>
      <Head>
        <title>我的课程 - Move To Learn</title>
        <meta content="Move To Learn 课程中心" name="description" />
      </Head>

      <Navbar />
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.content}>
          <DashboardTitle title="我的课程" />

          {/* 搜索栏 */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索我的课程..."
              className={styles.searchInput}
            />
          </div>

          {/* 课程分类 */}
          <div className={styles.categoryContainer}>
            {courseCategories.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryButton} ${activeCategory === category.id ? styles.categoryActive : ''
                  }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* 筛选条件 */}
          <div className={styles.filterContainer}>
            {filters.map((filter) => (
              <div key={filter.id} className={styles.filterWrapper}>
                <span className={styles.filterLabel}>{filter.name}：</span>
                <select
                  value={selectedFilters[filter.id]}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, [filter.id]: e.target.value }))}
                  className={styles.filterSelect}
                >
                  {filter.options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* 课程列表 */}
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner}></div>
              加载中...
            </div>
          ) : error ? (
            <div className={styles.error}>
              <span>❌</span> {error}
            </div>
          ) : (
            <div className={styles.courseGrid}>
              {sortedCourses.length > 0 ? (
                sortedCourses.map((course) => (
                  <Link href={`/courses/${course.id}`} key={course.id} className={styles.courseCard}>
                    <div className={styles.courseImage}>
                      {course.image ? (
                        <Image
                          src={course.image}
                          alt={course.title}
                          layout="fill"
                          objectFit="cover"
                          priority
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          📚
                        </div>
                      )}
                      <div className={styles.courseType} style={{
                        backgroundColor: courseTypeColors[course.type?.id || ''] || '#6b7280'
                      }}>
                        {/* {courseCategories.find(cat => cat.id === course.type)?.name || course.type} */}
                      </div>
                      <div className={styles.progressBadge} style={{
                        background: course.learnedChapterLength === course.totalChapterLength
                          ? '#10b981'
                          : course.learnedChapterLength && course.learnedChapterLength   > 0
                            ? '#3b82f6'
                            : '#6b7280'
                      }}>
                        {course.learnedChapterLength === course.totalChapterLength
                          ? '已完成'
                          : course.learnedChapterLength && course.learnedChapterLength > 0
                            ? `${course.learnedChapterLength}%`
                            : '未开始'
                        }
                      </div>
                    </div>
                    <div className={styles.courseInfo}>
                      <h3>{course.title}</h3>
                      <p>{course.description}</p>
                      <div className={styles.courseMeta}>
                        <div className={styles.metaItem}>
                          <FiBook className={styles.icon} />
                          <span>{course.totalChapterLength} 章节</span>
                        </div>
                        <div className={styles.metaItem}>
                          <FiClock className={styles.icon} />
                          <span>{course.learnedChapterLength}/{course.totalChapterLength}</span>
                        </div>

                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${(course.learnedChapterLength || 0) / (course.totalChapterLength || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className={styles.emptyCourses}>
                  <span>📚</span>
                  <p>没有找到符合条件的课程</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Courses; 