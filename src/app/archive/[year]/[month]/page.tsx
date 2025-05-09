import Image from 'next/image';
import Link from 'next/link';
import { client } from '../../../../../libs/microcms';
import Header from '../../../../components/Header';
import Sidebar from '../../../../components/Sidebar';
import styles from '../../../page.module.css';
import { getArchives } from '../../../../lib/archive';
import { getCategories,  getLatestPosts, type Post } from '../../../../lib/common';

type Props = {
  params: {
    year: string;
    month: string;
  };
};

// 年月に基づいて記事を取得
async function getArchivePosts(year: string, month: string): Promise<Post[]> {
  try {
    // 月の始まりと終わりの日付を生成
    const startDate = new Date(`${year}-${month.padStart(2, '0')}-01T00:00:00Z`);
    
    // 次の月の最初の日を計算し、1ミリ秒引いて今月の最終日にする
    let nextMonth = parseInt(month) + 1;
    let nextMonthYear = parseInt(year);
    if (nextMonth > 12) {
      nextMonth = 1;
      nextMonthYear += 1;
    }
    const endDate = new Date(`${nextMonthYear}-${nextMonth.toString().padStart(2, '0')}-01T00:00:00Z`);
    endDate.setMilliseconds(endDate.getMilliseconds() - 1);
    
    // ISO形式の日付文字列に変換
    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();

    const data = await client.get({
      endpoint: 'blog',
      queries: {
        filters: `publishedAt[greater_than]${startDateISO}[and]publishedAt[less_than]${endDateISO}`,
        fields: 'id,title,thumbnail,category,tag,publishedAt',
        limit: 100,
      },
    });
    
    if (!data || !data.contents || !Array.isArray(data.contents)) {
      return [];
    }
    
    return data.contents;
  } catch (error) {
    console.error('アーカイブ記事取得エラー:', error);
    return [];
  }
}

export default async function ArchivePage(props: Props) { // props を直接受け取るように変更
  const { year, month } = props.params; // props.params から year と month を取得
  
  // 各種データを取得
  const posts = await getArchivePosts(year, month);
  const categories = await getCategories();

  const latestPosts = await getLatestPosts();
  
  // アーカイブデータを取得
  let archivesData: { year: string; month: string; count: number }[] = [];
  try {
    archivesData = await getArchives();
  } catch (error) {
    console.error('アーカイブ取得エラー:', error);
    // エラーが発生した場合でも archivesData は初期値の空配列のままなので、
    // Sidebar には空の archives が渡される
  }

  // アーカイブデータの前処理：year と month の組み合わせでユニークにし、count を合計する
  const processedArchives = Object.values(
    archivesData.reduce((acc, current) => {
      const key = `${current.year}-${current.month}`;
      if (!acc[key]) {
        acc[key] = { ...current, count: 0 }; // 新しい年月の場合、countを0で初期化
      }
      // countが数値であることを保証し、加算する
      acc[key].count += (typeof current.count === 'number' ? current.count : 0);
      return acc;
    }, {} as Record<string, { year: string; month: string; count: number }>)
  );
  
  // 月名の配列
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  const monthIndex = parseInt(month, 10) - 1;
  const monthName = (monthIndex >= 0 && monthIndex < monthNames.length) 
                    ? monthNames[monthIndex] 
                    : '不明な月'; // 不正な月の場合のフォールバック

  return (
    <>
      <Header />
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.pageTitle}>{year}年{monthName}の記事</h1>
          
          {posts.length === 0 ? (
            <p>この期間の記事はありません。</p>
          ) : (
            <div className={styles.posts}>
              {posts.map((post) => (
                <div key={post.id} className={styles.postCard}>
                  <Link href={`/blog/${post.id}`} className={styles.postLink}>
                    <div className={styles.thumbnailContainer}>
                      {post.thumbnail ? (
                        <Image
                          src={post.thumbnail.url}
                          alt={post.title}
                          width={320}
                          height={180}
                          className={styles.thumbnail}
                        />
                      ) : (
                        <div className={styles.noThumbnail}>No Image</div>
                      )}
                    </div>
                    <div className={styles.postInfo}>
                      <h2 className={styles.postTitle}>{post.title}</h2>
                      {post.category && post.category.length > 0 && (
                        <div className={styles.postCategoriesContainer}>
                          {post.category.map(cat => (
                            <span key={cat.id} className={styles.categoryTag}>
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className={styles.postDate}>
                        {new Date(post.publishedAt).toLocaleDateString('ja-JP')}
                      </div>
                     
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </main>
        <Sidebar 
          latestPosts={latestPosts} 
          categories={categories} 
          archives={processedArchives} // ここで processedArchives が渡されています
        />
      </div>
    </>
  );
}
