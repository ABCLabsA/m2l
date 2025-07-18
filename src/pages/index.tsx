import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Move To Learn - 创新型区块链教育平台</title>
        <meta
          content="基于 Web3 和 Move 的创新教育平台，打造去中心化学习生态系统"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>
            区块链教育新范式
            <br />
            赋能未来学习生态
          </h1>
          <p className={styles.subtitle}>
            Move To Learn 致力于构建去中心化教育生态系统，
            通过区块链技术创新教育资源分发、学习认证和治理机制，
            为每位学习者提供透明、可信和高效的学习体验
          </p>
          <div className={styles.heroButtons}>
            <Link href="/courses" className={styles.ctaButton}>
              探索学习之旅
            </Link>
            <Link href="/about" className={`${styles.ctaButton} ${styles.secondary}`}>
              了解更多
            </Link>
          </div>
        </section>

        <section className={styles.incentivePlans}>
          <h2 className={styles.sectionTitle}>生态激励体系</h2>
          <div className={styles.plansContainer}>
            <div className={styles.planCard}>
              <div className={styles.planIcon}>👨‍💻</div>
              <h3>开发者激励</h3>
              <div className={styles.planContent}>
                <p>激励开发者积极参与教育课程开发和学习</p>
                <ul className={styles.planFeatures}>
                  <li>
                    <span className={styles.highlight}>BUG Bounty</span> 奖励计划
                  </li>
                  <li>课程开发激励</li>
                  <li>技术贡献奖励</li>
                </ul>
              </div>
            </div>

            <div className={styles.planCard}>
              <div className={styles.planIcon}>🤝</div>
              <h3>机构合作计划</h3>
              <div className={styles.planContent}>
                <p>提供社区专用节点部署激励</p>
                <ul className={styles.planFeatures}>
                  <li>联合颁发链上认证课程</li>
                  <li>拓展社区市场</li>
                  <li>提升平台影响力</li>
                </ul>
              </div>
            </div>

            <div className={styles.planCard}>
              <div className={styles.planIcon}>🎓</div>
              <h3>学生成长计划</h3>
              <div className={styles.planContent}>
                <p>学习成就排行榜</p>
                <ul className={styles.planFeatures}>
                  <li>TOP100 稀有NFT奖励</li>
                  <li>APT奖学金计划</li>
                  <li>生态项目空投机制</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.marketplaceSection} ${styles.hexagonGrid}`}>
          <div className={styles.sectionContent}>
            <div className={styles.hexagonWrapper}>
              <div className={styles.hexagon}>
                <div className={styles.hexagonContent}>
                  <h2>NFT课程市场</h2>
                  <p>重新定义教育资源分发方式</p>
                </div>
              </div>
              <div className={`${styles.hexagon} ${styles.feature}`}>
                <div className={styles.hexagonContent}>
                  <h3>课程通证化</h3>
                  <p>教育内容NFT化，确保知识产权</p>
                </div>
              </div>
              <div className={`${styles.hexagon} ${styles.feature}`}>
                <div className={styles.hexagonContent}>
                  <h3>灵活交易</h3>
                  <p>支持购买、租赁、转售</p>
                </div>
              </div>
              <div className={`${styles.hexagon} ${styles.feature}`}>
                <div className={styles.hexagonContent}>
                  <h3>收益分成</h3>
                  <p>智能合约自动分配</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.smartContractSection}>
          <div className={styles.blockchainLayout}>
            <div className={styles.blockchainHeader}>
              <h2>智能学习合约</h2>
              <p>基于区块链技术的智能合约系统，为您的学习之旅保驾护航</p>
            </div>
            <div className={styles.blockchainFlow}>
              {[
                {
                  hash: '0x7f9e...3a1b',
                  time: '2024-03-21 10:30',
                  title: '自动认证',
                  description: '智能合约自动追踪和验证学习进度，确保学习成果真实可信',
                  status: '已激活'
                },
                {
                  hash: '0x3d2c...8f4e',
                  time: '2024-03-21 10:31',
                  title: '学习轨迹',
                  description: '记录每一个学习里程碑，构建完整的技能成长档案',
                  status: '运行中'
                },
                {
                  hash: '0x6b5a...2c9d',
                  time: '2024-03-21 10:32',
                  title: '技能证明',
                  description: '基于区块链的技能认证，让您的能力得到权威认可',
                  status: '已确认'
                },
                {
                  hash: '0x1e8d...7h4k',
                  time: '2024-03-21 10:33',
                  title: '激励机制',
                  description: '完成学习目标获得代币奖励，激发持续学习动力',
                  status: '进行中'
                }
              ].map((block, index) => (
                <div key={block.hash} className={styles.block}>
                  <div className={styles.blockContent}>
                    <div className={styles.blockHeader}>
                      <span className={styles.blockHash}>{block.hash}</span>
                      <span className={styles.blockTime}>{block.time}</span>
                    </div>
                    <div className={styles.blockBody}>
                      <h3>{block.title}</h3>
                      <p>{block.description}</p>
                    </div>
                    <div className={styles.blockFooter}>
                      <span className={styles.blockStatus}>{block.status}</span>
                    </div>
                  </div>
                  <div className={styles.blockConnection} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.labSection}>
          <div className={styles.labGrid}>
            <div className={styles.labIntro}>
              <h2>AI + 区块链实验室</h2>
              <p>融合前沿科技，打造实战训练场</p>
            </div>
            <div className={styles.terminalWindow}>
              <div className={styles.terminalHeader}>
                <span className={styles.terminalDot}></span>
                <span className={styles.terminalDot}></span>
                <span className={styles.terminalDot}></span>
              </div>
              <div className={styles.terminalContent}>
                <div className={styles.commandLine}>
                  <span className={styles.prompt}>$</span>
                  <span className={styles.command}>启动智能实训环境</span>
                </div>
                <div className={styles.terminalFeatures}>
                  <div className={styles.feature}>实战项目开发</div>
                  <div className={styles.feature}>AI辅助编程</div>
                  <div className={styles.feature}>多人协作空间</div>
                  <div className={styles.feature}>资源工具集成</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.daoSection}>
          <div className={styles.daoNetwork}>
            <div className={styles.daoCenter}>
              <h2>教育DAO治理</h2>
              <p>共建去中心化学习生态，打造公平透明的教育未来</p>
            </div>
            <div className={styles.daoNodes}>
              <div className={`${styles.daoNode} ${styles.node1}`}>
                <h3>
                  <span className={styles.nodeIcon}>🗳️</span>
                  代币治理
                </h3>
                <p>通过 APT 代币进行社区投票，参与平台重大决策</p>
                <div className={styles.nodeMetrics}>
                  <div className={styles.nodeMetric}>
                    <span className={styles.metricValue}>10K+</span>
                    <span className={styles.metricLabel}>投票人数</span>
                  </div>
                  <div className={styles.nodeMetric}>
                    <span className={styles.metricValue}>89%</span>
                    <span className={styles.metricLabel}>参与率</span>
                  </div>
                </div>
              </div>
              <div className={`${styles.daoNode} ${styles.node2}`}>
                <h3>
                  <span className={styles.nodeIcon}>📜</span>
                  提案机制
                </h3>
                <p>社区成员可提交改进提案，共同决定平台发展方向</p>
                <div className={styles.nodeMetrics}>
                  <div className={styles.nodeMetric}>
                    <span className={styles.metricValue}>200+</span>
                    <span className={styles.metricLabel}>已提提案</span>
                  </div>
                  <div className={styles.nodeMetric}>
                    <span className={styles.metricValue}>85%</span>
                    <span className={styles.metricLabel}>通过率</span>
                  </div>
                </div>
              </div>
              <div className={`${styles.daoNode} ${styles.node3}`}>
                <h3>
                  <span className={styles.nodeIcon}>⚖️</span>
                  透明决策
                </h3>
                <p>所有治理决策和执行过程在链上公示，确保公平公正</p>
                <div className={styles.nodeMetrics}>
                  <div className={styles.nodeMetric}>
                    <span className={styles.metricValue}>100%</span>
                    <span className={styles.metricLabel}>链上记录</span>
                  </div>
                  <div className={styles.nodeMetric}>
                    <span className={styles.metricValue}>24h</span>
                    <span className={styles.metricLabel}>决策周期</span>
                  </div>
                </div>
              </div>
              <div className={`${styles.daoNode} ${styles.node4}`}>
                <h3>
                  <span className={styles.nodeIcon}>🎁</span>
                  激励机制
                </h3>
                <p>积极参与社区治理可获得代币奖励，实现价值共创共享</p>
                <div className={styles.nodeMetrics}>
                  <div className={styles.nodeMetric}>
                    <span className={styles.metricValue}>500K</span>
                    <span className={styles.metricLabel}>奖励代币</span>
                  </div>
                  <div className={styles.nodeMetric}>
                    <span className={styles.metricValue}>5K+</span>
                    <span className={styles.metricLabel}>活跃贡献者</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.daoConnections}>
              <div className={styles.daoConnection} style={{ 
                width: '200px',
                top: '30%',
                left: '50%',
                transform: 'rotate(-45deg)'
              }} />
              <div className={styles.daoConnection} style={{ 
                width: '200px',
                top: '30%',
                left: '50%',
                transform: 'rotate(45deg)'
              }} />
              <div className={styles.daoConnection} style={{ 
                width: '200px',
                bottom: '30%',
                left: '50%',
                transform: 'rotate(-135deg)'
              }} />
              <div className={styles.daoConnection} style={{ 
                width: '200px',
                bottom: '30%',
                left: '50%',
                transform: 'rotate(135deg)'
              }} />
            </div>
          </div>
        </section>

        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>1000+</div>
              <div className={styles.statLabel}>注册学习者</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>500+</div>
              <div className={styles.statLabel}>课程NFT</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>2000+</div>
              <div className={styles.statLabel}>认证发放</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>100+</div>
              <div className={styles.statLabel}>DAO提案</div>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <h2>开启您的区块链学习之旅</h2>
          <p>加入 Move To Learn，探索去中心化教育的无限可能</p>
          <div className={styles.ctaButtons}>
            <Link href="/login" className={styles.ctaButton}>
              立即进入
            </Link>
            <Link href="/courses" className={`${styles.ctaButton} ${styles.secondary}`}>
              浏览课程
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
