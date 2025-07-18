import styles from '../styles/Dashboard.module.css';

const DashboardHome = () => {
  return (
    <div className={styles.content}>
      <section className={styles.overview}>
        <h1 className={styles.title}>我的学习中心</h1>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>3</span>
            <span className={styles.statLabel}>进行中的课程</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>12</span>
            <span className={styles.statLabel}>已获得证书</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>80%</span>
            <span className={styles.statLabel}>平均完成率</span>
          </div>
        </div>
      </section>

      <section className={styles.courses}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>进行中的课程</h2>
          <button className={styles.viewAllButton}>查看全部</button>
        </div>
        <div className={styles.courseGrid}>
          <div className={styles.courseCard}>
            <div className={styles.courseProgress}>
              <div 
                className={styles.progressBar} 
                style={{ width: '60%' }}
              ></div>
            </div>
            <h3 className={styles.courseTitle}>Move 智能合约开发入门</h3>
            <p className={styles.courseInfo}>已完成 6/10 课时</p>
            <button className={styles.continueButton}>继续学习</button>
          </div>
          <div className={styles.courseCard}>
            <div className={styles.courseProgress}>
              <div 
                className={styles.progressBar} 
                style={{ width: '30%' }}
              ></div>
            </div>
            <h3 className={styles.courseTitle}>Web3 DApp 实战开发</h3>
            <p className={styles.courseInfo}>已完成 3/10 课时</p>
            <button className={styles.continueButton}>继续学习</button>
          </div>
          <div className={styles.courseCard}>
            <div className={styles.courseProgress}>
              <div 
                className={styles.progressBar} 
                style={{ width: '80%' }}
              ></div>
            </div>
            <h3 className={styles.courseTitle}>区块链基础理论</h3>
            <p className={styles.courseInfo}>已完成 8/10 课时</p>
            <button className={styles.continueButton}>继续学习</button>
          </div>
        </div>
      </section>

      <section className={styles.certificates}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>最近获得的证书</h2>
          <button className={styles.viewAllButton}>查看全部</button>
        </div>
        <div className={styles.certificateGrid}>
          <div className={styles.certificateCard}>
            <div className={styles.certificateIcon}>🏆</div>
            <div className={styles.certificateInfo}>
              <h3>Move 语言基础</h3>
              <p>获得时间：2024-03-28</p>
            </div>
          </div>
          <div className={styles.certificateCard}>
            <div className={styles.certificateIcon}>🏆</div>
            <div className={styles.certificateInfo}>
              <h3>区块链原理与应用</h3>
              <p>获得时间：2024-03-15</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardHome; 