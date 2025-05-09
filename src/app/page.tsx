import Link from 'next/link';
import Image from 'next/image';
import { client } from '../../libs/microcms';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from './page.module.css';
import { getArchives } from '../lib/archive';
import { getCategories, /* getTags, */ getLatestPosts, type Post } from '../lib/common';

// microCMSからブログ記事を取得
async function getBlogPosts(): Promise<Post[]> {
  try {
    const data = await client.get({
      endpoint: 'blog',
      queries: {
        fields: 'id,title,thumbnail,category,publishedAt', // tag を削除
        limit: 10,
      },
    });
    
    if (!data || !data.contents || !Array.isArray(data.contents)) {
      console.error('ブログ記事データ形式エラー:', data);
      return [];
    }
    
    return data.contents;
  } catch (error) {
    console.error('ブログ記事取得エラー:', error);
    return [];
  }
}

export default async function Home() {
  const posts = await getBlogPosts();
  const categories = await getCategories();
  // const tags = await getTags(); // 削除
  
  // アーカイブ取得時のエラーハンドリング
  let archives: { year: string; month: string; count: number }[] = [];
  try {
    archives = await getArchives();
  } catch (error) {
    console.error('アーカイブ取得エラー:', error);
  }
  
  // 最新の5件のみを抽出
  const latestPosts = posts.slice(0, 5);

  return (
    <>
      <Header />
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.pageTitle}>ブログ記事一覧</h1>
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
                    {/* post.tag の表示部分を削除 */}
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          {/* 全ての記事を見るボタンを追加 */}
          <div className={styles.viewAllButtonContainer}>
            <Link href="/blogs" className={styles.viewAllButton}>
              全ての記事を見る
            </Link>
          </div>
        </main>
        <Sidebar 
          latestPosts={latestPosts} 
          categories={categories} 
          // tags={tags} // 削除
          archives={archives} // アーカイブデータを渡す
        />
      </div>
    </>
  );
}