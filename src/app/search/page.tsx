import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '../../../libs/microcms';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import styles from '../page.module.css';
import { getArchives } from '../../lib/archive';
import { getCategories, getLatestPosts, type Post } from '../../lib/common';

type SearchProps = {
  searchParams: {
    q?: string;
  };
};

// 検索キーワードに基づいてブログ記事を検索
async function searchBlogPosts(keyword: string): Promise<Post[]> {
  if (!keyword) return [];
  
  try {
    const data = await client.get({
      endpoint: 'blog',
      queries: {
        q: keyword,
        fields: 'id,title,thumbnail,category,publishedAt',
        limit: 50, // limitを50に戻す
      },
    });
    
    if (!data || !data.contents || !Array.isArray(data.contents)) {
      return [];
    }
    
    return data.contents;
  } catch (error) {
    console.error('検索エラー:', error);
    return [];
  }
}

// 検索結果コンポーネント
async function SearchResults({ keyword }: { keyword: string }) {
  const posts = await searchBlogPosts(keyword);
  
  return (
    <div>
      <h1 className={styles.pageTitle}>「{keyword}」の検索結果: {posts.length}件</h1>
      
      {posts.length === 0 ? (
        <p>検索キーワードに一致する記事が見つかりませんでした。</p>
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
    </div>
  );
}

export default async function Search({ searchParams }: SearchProps) {
  const keyword = searchParams.q || '';
  
  const categories = await getCategories();
  const latestPosts = await getLatestPosts();
  
  // アーカイブデータを取得
  let archives: { year: string; month: string; count: number }[] = [];
  try {
    archives = await getArchives();
  } catch (error) {
    console.error('アーカイブ取得エラー:', error);
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <main className={styles.main}>
          <Suspense fallback={<div>検索結果を読み込み中...</div>}>
            <SearchResults keyword={keyword} />
          </Suspense>
        </main>
        <Sidebar 
          latestPosts={latestPosts} 
          categories={categories} 
          archives={archives}
        />
      </div>
    </>
  );
}
