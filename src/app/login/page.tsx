import LoginForm from '@/components/shared/LoginForm/LoginForm';
import styles from './login.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <h3>SES</h3>
          <span>HELPER</span>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
