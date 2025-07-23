import LoginForm from '@/components/shared/LoginForm/LoginForm'
import styles from './login.module.css'

export default function LoginPage() {

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginInner}>
        <div className={styles.logo}>
          <h3>SES</h3>
          <span>HELPER</span>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
