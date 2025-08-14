'use client'

import { useState } from 'react';
import { Eye, EyeOff  } from 'lucide-react';
import styles from './loginForm.module.css';
import Button from '@/components/ui/Button/Button';
import useAuth from '@/hooks/useAuth';

export default function LoginForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.loginForm} onSubmit={handleSubmit}>
      <input 
        type="email" 
        placeholder='Введіть пошту...' 
        value={email}  
        onChange={e => setEmail(e.target.value)}
      />
      <div className={styles.passwordInput}>
        <input 
          type={showPassword ? "text" : "password"} 
          placeholder='Введіть пароль...' 
          value={password}  
          onChange={e => setPassword(e.target.value)}
        />
        <button  
          type='button' 
          onClick={() => setShowPassword(prev => !prev)}
          className={styles.eyeBtn}
        >
            { showPassword ? <EyeOff size={20} /> : <Eye size={20} /> }
        
        </button>
      </div>
      <Button type='submit' text='Вхід' loading={loading}  />
    </form>
  )
}
