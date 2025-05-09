"use client";
import { useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">OB家のブログ</Link>
      </div>
      
      {/* ハンバーガーメニューボタン */}
      <button 
        className={styles.menuButton} 
        onClick={toggleMenu}
        aria-label="メニューを開く"
      >
        <div className={`${styles.menuIcon} ${menuOpen ? styles.open : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      {/* ナビゲーションメニュー */}
      <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
        <ul>
          <li><Link href="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link href="/blogs" onClick={() => setMenuOpen(false)}>Blog</Link></li>
          <li><Link href="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
        </ul>
      </nav>
    </header>
  );
}
