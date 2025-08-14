import { CSSProperties } from 'react';
import styles from './spinner.module.css';

interface ISpinnerProps {
  color?: string;
  size?: number;
  width?: number;
  additionalStyles?: CSSProperties;
}

export default function Spinner({
  color = "green",
  size = 50,
  width = size / 8,
  additionalStyles = {}
}: ISpinnerProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} style={{borderTopColor: color, width: size, height: size, borderWidth: width, ...additionalStyles}} />
    </div>
  )
}
