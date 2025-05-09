import Image from "next/image";
import Link from "next/link";
import { client } from "../../../../libs/microcms";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import styles from "../../page.module.css";
import { getArchives } from "../../../lib/archive";
import { getCategories, getLatestPosts, type Post } from "../../../lib/common";

type Props = {
  params: {
    id: string;
  };
};

// カテゴリIDに基づいて記事を取得
async function getCategoryPosts(categoryId: string): Promise<Post[]> {
  try {
    console.log("[CategoryPage] Fetching posts for categoryId:", categoryId); // デバッグログ追加
    const data = await client.get({
      endpoint: "blog",
      queries: {
        filters: `category[contains]${categoryId}`, // filtersを category[contains] に変更
        fields: "id,title,thumbnail,category,publishedAt",
        limit: 100, // limitを100に修正
      },
    });

    console.log(
      "[CategoryPage] API Response data:",
      JSON.stringify(data, null, 2)
    ); // デバッグログ追加

    if (!data || !data.contents || !Array.isArray(data.contents)) {
      console.warn(
        "[CategoryPage] Invalid data structure from API or no contents:",
        data
      ); // デバッグログ追加
      return [];
    }

    console.log(
      `[CategoryPage] Found ${data.contents.length} posts for category ${categoryId}`
    ); // デバッグログ追加
    return data.contents;
  } catch (error) {
    console.error("[CategoryPage] カテゴリー別記事取得エラー:", error); // エラーログに目印追加
    return [];
  }
}

// カテゴリー名を取得
async function getCategoryName(categoryId: string): Promise<string> {
  try {
    const data = await client.get({
      endpoint: "categories",
      contentId: categoryId,
    });
    return data.name || "不明なカテゴリー";
  } catch (error) {
    console.error("カテゴリー名取得エラー:", error);
    return "カテゴリー";
  }
}

export default async function CategoryPage({ params }: Props) {
  // paramsオブジェクトをawaitしてからプロパティにアクセスする
  const awaitedParams = await params;
  const categoryId = awaitedParams.id;

  // 各種データを取得
  const categoryName = await getCategoryName(categoryId);
  const posts = await getCategoryPosts(categoryId);
  const categories = await getCategories();
  const latestPosts = await getLatestPosts();

  // アーカイブデータを取得
  let archives: { year: string; month: string; count: number }[] = [];
  try {
    archives = await getArchives();
  } catch (error) {
    console.error("アーカイブ取得エラー:", error);
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.pageTitle}>カテゴリー: {categoryName}</h1>

          {posts.length === 0 ? (
            <p>このカテゴリーの記事はありません。</p>
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
                          {post.category.map((cat) => (
                            <span key={cat.id} className={styles.categoryTag}>
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className={styles.postDate}>
                        {new Date(post.publishedAt).toLocaleDateString("ja-JP")}
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
          archives={archives}
        />
      </div>
    </>
  );
}
