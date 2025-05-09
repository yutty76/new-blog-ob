import Image from 'next/image';
import Link from 'next/link';
import { client } from '../../../../libs/microcms';
import Header from '../../../components/Header';
import styles from './page.module.css';
import { getArchives } from '../../../lib/archive';
import { getCategories, getLatestPosts, type Post } from '../../../lib/common';

type Props = {
  params: {
    id: string;
  };
};

// 記事詳細を取得
async function getBlogPost(postId: string): Promise<Post> {
  try {
    const data = await client.get({
      endpoint: 'blog',
      contentId: postId,
    });
    return data;
  } catch (error) {
    console.error('ブログ記事取得エラー:', error);
    throw new Error('記事の取得に失敗しました');
  }
}

export default async function BlogPost({ params }: Props) {
  try {
    const awaitedParams = await params; // paramsをawaitする
    const postId = awaitedParams.id; // awaitした結果からidを取得
    const post = await getBlogPost(postId);
    
    // アーカイブデータを取得
    let archives: { year: string; month: string; count: number }[] = [];
    try {
      archives = await getArchives();
    } catch (error) {
      console.error('アーカイブ取得エラー:', error);
    }
    
    // 記事の公開日と最終更新日
    const publishedDate = new Date(post.publishedAt).toLocaleDateString('ja-JP');
    const updatedDate = post.revisedAt ? new Date(post.revisedAt).toLocaleDateString('ja-JP') : publishedDate;

  

    return (
      <>
        <Header />
        <div>
          <main className={styles.main}>
            <article>
              <header>
                <h1 className={styles.title}>{post.title}</h1>
                <div>
                  <div className={styles.date}>
                    <time dateTime={post.publishedAt}>公開: {publishedDate}</time>
                    {post.revisedAt && post.revisedAt !== post.publishedAt && (
                      <time dateTime={post.revisedAt}>更新: {updatedDate}</time>
                    )}
                  </div>
                  
                  {/* カテゴリーとタグのセクション */}
                  <div className={styles.categorySection}>
                    {/* カテゴリー */}
                    {post.category && post.category.length > 0 && (
                      <>
                        <span className={styles.categoryLabel}>カテゴリー:</span>
                        <div className={styles.categoryTagsContainer}>
                          {post.category.map(cat => (
                            <Link 
                              key={cat.id}
                              href={`/category/${cat.id}`}
                              className={styles.categoryTag}
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </header>
              
              <div 
                className={styles.post}
                dangerouslySetInnerHTML={{ __html: post.body || '' }}
              />
            </article>
          </main>
        </div>
      </>
    );
  } catch (error) {
    return (
      <>
        <Header />
        <div>
          <main className={styles.main}>
            <h1>エラーが発生しました</h1>
            <p>記事の取得中にエラーが発生しました。</p>
            <Link href="/">ホームに戻る</Link>
          </main>
        </div>
      </>
    );
  }
}

// 静的パスを生成
export async function generateStaticParams() {
  const contentIds = await client.getAllContentIds({ endpoint: 'blog' });

  return contentIds.map((contentId) => ({
    id: contentId, // 各記事のIDをパラメータとして返す
  }));
}