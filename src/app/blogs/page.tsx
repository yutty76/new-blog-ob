import Image from 'next/image';
import Link from 'next/link';
import { client } from '../../../libs/microcms';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import styles from '../page.module.css';
import { getArchives } from '../../lib/archive';
import { type Post, type Category, getCategories as commonGetCategories, getLatestPosts as commonGetLatestPosts } from '../../lib/common'; // Post と Category を common からインポート

type PaginationProps = {
  totalCount: number;
  currentPage: number;
  perPage: number;
};

// 現在のページから表示する記事リストを取得
async function getBlogPostsWithPagination(page: number = 1, perPage: number = 12): Promise<{ posts: Post[], totalCount: number }> {
  const data = await client.get({
    endpoint: 'blog',
    queries: {
      fields: 'id,title,thumbnail,category,publishedAt',
      limit: perPage,
      offset: (page - 1) * perPage,
    },
  });
  
  return {
    posts: data.contents,
    totalCount: data.totalCount
  };
}

// ページネーションコンポーネント
function Pagination({ totalCount, currentPage, perPage }: PaginationProps) {
  const totalPages = Math.ceil(totalCount / perPage);
  
  return (
    <div className={styles.pagination}>
      {currentPage > 1 && (
        <Link href={`/blogs?page=${currentPage - 1}`} className={styles.paginationLink}>
          前のページ
        </Link>
      )}
      
      <span className={styles.paginationInfo}>
        {currentPage} / {totalPages}ページ
      </span>
      
      {currentPage < totalPages && (
        <Link href={`/blogs?page=${currentPage + 1}`} className={styles.paginationLink}>
          次のページ
        </Link>
      )}
    </div>
  );
}

export default async function BlogsPage({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const perPage = 12; // 1ページあたりの表示件数
  
  const { posts, totalCount } = await getBlogPostsWithPagination(currentPage, perPage);
  const categories = await commonGetCategories(); // commonGetCategories を使用
  const latestPosts = await commonGetLatestPosts(); // commonGetLatestPosts を使用
  
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
          <h1 className={styles.pageTitle}>全ての記事</h1>
          
          {posts.length === 0 ? (
            <p>記事がありません。</p>
          ) : (
            <>
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
              
              <Pagination 
                totalCount={totalCount} 
                currentPage={currentPage} 
                perPage={perPage} 
              />
            </>
          )}
        </main>
        <Sidebar 
          latestPosts={latestPosts} 
          categories={categories} 
          archives={archives} // アーカイブデータを渡す
        />
      </div>
    </>
  );
}
