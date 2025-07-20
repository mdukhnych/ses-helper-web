'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import styles from './themeSwitcher.module.css'

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; 
  }

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)} className={styles.themeSelect} >
      <option value="light">Світла</option>
      <option value="dark">Темна</option>
      <option value="system">Системна</option>
    </select>
  );
}