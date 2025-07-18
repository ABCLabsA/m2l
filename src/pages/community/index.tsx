import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import styles from './Community.module.css';

const Community: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>社区 - Move To Learn</title>
        <meta
          content="加入我们的开发者社区，探索更多学习资源和分享经验"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>
            开发者社区
          </h1>
          <p className={styles.subtitle}>
            连接M2L开发者，分享知识与经验，共同构建区块链教育生态
          </p>
        </section>

        <section className={styles.communitySection}>
          <div className={styles.communityGrid}>
            <div className={styles.communityCard}>
              <div className={styles.cardIcon}>
                <div className={styles.iconWrapper}>
                  🌍
                </div>
              </div>
              <div className={styles.cardContent}>
                <h3>开发者社区</h3>
                <p>加入我们的M2L开发者社区，与来自各地的开发者交流技术、分享经验，参与项目协作和技术讨论。</p>
                <div className={styles.cardFeatures}>
                  <span className={styles.feature}>技术交流</span>
                  <span className={styles.feature}>项目协作</span>
                  <span className={styles.feature}>资源分享</span>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <a 
                  href="https://accc.space" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.communityButton}
                >
                  访问社区
                  <span className={styles.buttonIcon}>→</span>
                </a>
              </div>
            </div>

            <div className={styles.communityCard}>
              <div className={styles.cardIcon}>
                <div className={styles.iconWrapper}>
                  📝
                </div>
              </div>
              <div className={styles.cardContent}>
                <h3>开发者博客</h3>
                <p>探索深度技术文章、教程和最佳实践。了解最新的区块链技术趋势、开发技巧和项目案例分析。</p>
                <div className={styles.cardFeatures}>
                  <span className={styles.feature}>技术文章</span>
                  <span className={styles.feature}>项目案例</span>
                  <span className={styles.feature}>最佳实践</span>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <a 
                  href="https://guico.top" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.communityButton}
                >
                  阅读博客
                  <span className={styles.buttonIcon}>→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>准备开始学习之旅？</h2>
            <p>立即开始探索我们的课程，获得实践经验，成为区块链技术专家</p>
            <Link href="/courses" className={styles.ctaButton}>
              探索课程
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Community;
