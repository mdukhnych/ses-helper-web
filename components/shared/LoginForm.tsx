'use client'

import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Eye, EyeOff } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordShowing, setIsPasswordShowing] = useState(false);

  const { login } = useAuth();

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    
  }

  return (
    <form className='flex flex-col gap-[10] w-[250px]' onSubmit={onFormSubmit}>
      <Input type='email' placeholder='Введіть вашу пошту...' value={email} onChange={e => setEmail(e.target.value)} />
      <div className="relative">
        <Input type={isPasswordShowing ? "text" : "password"} placeholder='Введіть ваш пароль...' value={password} onChange={e => setPassword(e.target.value)} className='pr-[45px]' />
        <button 
          type='button' 
          className='absolute top-[50%] translate-y-[-50%] right-[10px] cursor-pointer'
          onClick={() => setIsPasswordShowing(prev => !prev)}
        >
          {
            isPasswordShowing ? <EyeOff /> : <Eye />
          }
        </button>
      </div>
      <Button type='submit' className='cursor-pointer'>Вхід</Button>
    </form>
  )
}
