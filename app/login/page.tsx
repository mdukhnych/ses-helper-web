import LoginForm from '@/components/shared/LoginForm'
import { Card } from '@/components/ui/card'
import Logo from '@/components/ui/logo'
import React from 'react'

export default function LoginPage() {
  return (
    <div className='flex justify-center items-center h-screen overflow-hidden'>
      <Card className='p-5 flex flex-col items-center'>
        <Logo />
        <LoginForm />
      </Card>
    </div>
  )
}
