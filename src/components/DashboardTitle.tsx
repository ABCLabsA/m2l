import styles from '../styles/Dashboard.module.css';

interface DashboardTitleProps {
  title: string;
}

const DashboardTitle = ({ title }: DashboardTitleProps) => {
  return (
    <div className={styles.titleContainer}>
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
};

export default DashboardTitle; 