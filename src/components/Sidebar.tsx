import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const router = useRouter();

  const menuItems = [
    {
      icon: '📊',
      label: '仪表盘',
      path: '/dashboard',
    },
    {
      icon: '📚',
      label: '我的课程',
      path: '/dashboard/courses',
    },
    {
      icon: '🤖',
      label: 'AI助教',
      path: '/dashboard/ai-assistant',
    },
    {
      icon: '💻',
      label: '沙盘演练',
      path: '/dashboard/playground',
    },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.menuList}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.menuItem} ${
              router.pathname === item.path ? styles.active : ''
            }`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar; 