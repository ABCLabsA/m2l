import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../styles/CourseCard.module.css';
import { FiBook, FiClock, FiStar, FiUsers } from 'react-icons/fi';

import LoadingSpinner from './LoadingSpinner';
import { CourseDetailDto, CourseDto } from '@/api/ApiType';
import { api } from '@/api/Api';


interface CourseCardProps {
  course: CourseDto | CourseDetailDto;
  onPurchase?: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onPurchase }) => {
  const [purchasing, setPurchasing] = useState(false);
  const router = useRouter();

  const handlePurchase = async (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止链接跳转
    if (purchasing) return;

    try {
      setPurchasing(true);
      const response = await api.courseController.buyCourse(course.id);
      
      const result = response as any;
      
      if (result.success) {
        onPurchase?.(course.id);
        // 显示成功消息
        alert('购买成功！');
        // 重新获取数据
        router.refresh();
      }
    } catch (err) {
      console.error('购买失败:', err);
      alert('购买失败，请稍后重试');
    } finally {
      setPurchasing(false);
    }
  };

  // 判断是否为详情页面的课程数据
  const isDetailCourse = (course: CourseDto | CourseDetailDto): course is CourseDetailDto => {
    return 'chapters' in course;
  };

  // 获取课程长度
  const getCourseLength = () => {
    if (isDetailCourse(course)) {
      return course.chapters?.length || 0;
    }
    return course.courseLength;
  };

  // 获取用户进度长度
  const getUserProgressLength = () => {
    if (isDetailCourse(course)) {
      return course.learnedChapterLength || 0;
    }
    return course.userProgressLength;
  };

  // 判断用户是否已购买
  const isuserBrought = () => {
    if (isDetailCourse(course)) {
      return course.userBrought || false;
    }
    return course.userBrought;
  };

  return (
    <Link href={`/courses/${course.id}`}>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <Image
            src={course.image || '/placeholder-course.jpg'}
            alt={course.title || ''}
            className={styles.image}
            layout="fill"
            priority
          />
          {course.type && (
            <div className={styles.courseType}>
              {typeof course.type === 'object' && course.type.name ? course.type.name : '未分类'}
            </div>
          )}
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{course.title}</h3>
          <p className={styles.description}>{course.description}</p>
          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <FiBook className={styles.icon} />
              <span>{getCourseLength()}章节</span>
            </div>
            <div className={styles.metaItem}>
              <FiClock className={styles.icon} />
              <span>{getUserProgressLength()}/{getCourseLength()}</span>
            </div>
            <div className={styles.metaItem}>
              <FiUsers className={styles.icon} />
              <span>{getUserProgressLength()}</span>
            </div>
          </div>
          <div className={styles.footer}>
            <div className={styles.price}>
              {course.price === 0 ? (
                <span className={styles.free}>免费</span>
              ) : (
                <span>￥{course.price}</span>
              )}
            </div>
            <div className={styles.actions}>
              {!isuserBrought() && (
                <button 
                  className={styles.purchaseButton}
                  onClick={handlePurchase}
                  disabled={purchasing}
                >
                  {purchasing ? (
                    <span className={styles.purchaseLoading}>
                      <LoadingSpinner size="small" color="white" />
                      <span>购买中...</span>
                    </span>
                  ) : '免费获取'}
                </button>
              )}
              {isuserBrought() && (
                <div className={styles.purchaseStatus}>
                  已获得
                </div>
              )}
              <div className={styles.rating}>
                <FiStar className={styles.icon} style={{ color: '#f59e0b' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard; 