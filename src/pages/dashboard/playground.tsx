import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DashboardTitle from '@/components/DashboardTitle';
import MovePlayground from '@/components/MovePlayground';
import styles from '@/styles/Dashboard.module.css';

const PlaygroundPage: NextPage = () => {
  const router = useRouter();
  const { isConnected } = useAccount();

  console.log('Rendering PlaygroundPage');
  return (
    <div className={styles.container}>
      <Head>
        <title>代码操场 - Move To Learn</title>
        <meta content="Move To Learn 代码操场" name="description" />
      </Head>

      <Navbar />
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.content}>
          <DashboardTitle title="Move 代码操场" />
          <div className={styles.playgroundContainer}>
            <MovePlayground />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaygroundPage; 