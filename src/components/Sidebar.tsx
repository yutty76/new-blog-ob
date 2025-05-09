"use client"
import { useState } from 'react';
import Link from 'next/link';
import styles from './Sidebar.module.css';
import type { ArchiveItem } from '../lib/archive';
import { Post, Category} from '../lib/common';

type SidebarProps = {
  latestPosts: Post[];
  categories: Category[];
  archives?: ArchiveItem[];
};

export default function Sidebar({ latestPosts, categories, archives = [] }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  // 月名の配列
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  // アーカイブが有効かチェック
  const hasValidArchives = Array.isArray(archives) && archives.length > 0;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarSection}>
        <h3>検索</h3>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="キーワードを入力"
          />
          <button type="submit">検索</button>
        </form>
      </div>

      <div className={styles.sidebarSection}>
        <h3>最新記事</h3>
        <ul>
          {latestPosts.length > 0 ? (
            latestPosts.map((post) => (
              <li key={post.id}>
                <Link href={`/blog/${post.id}`}>{post.title}</Link>
              </li>
            ))
          ) : (
            <li>最新の記事はありません</li>
          )}
        </ul>
      </div>

      <div className={styles.sidebarSection}>
        <h3>カテゴリー</h3>
        <ul>
          {categories.length > 0 ? (
            categories.map((category) => (
              <li key={category.id}>
                <Link href={`/category/${category.id}`}>{category.name}</Link>
              </li>
            ))
          ) : (
            <li>カテゴリーはありません</li>
          )}
        </ul>
      </div>

      <div className={styles.sidebarSection}>
        <h3>アーカイブ</h3>
        {hasValidArchives ? (
          <ul>
            {archives.map((archive) => (
              <li key={`${archive.year}-${archive.month}`}>
                <Link href={`/archive/${archive.year}/${archive.month}`}>
                  {`${archive.year}年${monthNames[parseInt(archive.month) - 1]} (${archive.count})`}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>アーカイブがありません</p>
        )}
      </div>
    </aside>
  );
}
