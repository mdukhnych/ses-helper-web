'use client'

import { useState } from 'react'
import useAuth from '@/hooks/useAuth'
import Spinner from '@/components/ui/Spinner/Spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginForm() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { login } = useAuth()

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await login(email, password)
    setIsLoading(false)
  }

  return (
    // <form className={styles.loginForm} onSubmit={onSubmitHandler} >
    <form className='flex flex-col gap-3' onSubmit={onSubmitHandler} >
      <Input className='p-2.5 w-[300px]' type='email' placeholder='Введіть пошту...' value={email} onChange={e => setEmail(e.target.value)} />
      <div className='relative'>
        <Input className='p-2.5 w-[300px] pr-10' type={showPassword ? 'text' : 'password'} placeholder='Введіть пароль...' value={password} onChange={e => setPassword(e.target.value)} />
        <button type='button' className='absolute top-[50%] right-[10px] translate-y-[-50%] border-0 outline-0 cursor-pointer' onClick={() => setShowPassword(prev => !prev)} >
          {
            showPassword ? 
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off-icon lucide-eye-off"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
          }
        </button>
      </div>
      {
        isLoading ? <Spinner size={16} center additionalStyles={{marginTop: 19}} /> : <Button type='submit' className='cursor-pointer mt-3'>Вхід</Button>
      }
    </form>
  )
}

