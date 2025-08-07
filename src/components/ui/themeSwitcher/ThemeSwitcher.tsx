'use client'

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import styles from './themeSwitcher.module.css';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className={styles.themeSwitcher}
      >
        <option value="system">Системна</option>
        <option value="light">Світла</option>
        <option value="dark">Темна</option>
      </select>
  )
}
