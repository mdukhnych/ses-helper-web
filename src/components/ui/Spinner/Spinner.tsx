// components/Spinner/Spinner.tsx
import React from 'react'
import styles from './spinner.module.css'

interface ISpinnerProps {
  size?: number
  color?: string
  borderWidth?: number
  center?: boolean
  additionalStyles?: React.CSSProperties
}

export default function Spinner({
  size = 24,
  color = '#3498db',
  borderWidth = 4,
  center = false,
  additionalStyles = {}
}: ISpinnerProps) {
  const spinnerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderWidth: `${borderWidth}px`,
    borderLeftColor: color,
  }

  if (center) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner} style={{...spinnerStyle, ...additionalStyles}} />
      </div>
    )
  }

  return <div className={styles.spinner} style={spinnerStyle} />
}