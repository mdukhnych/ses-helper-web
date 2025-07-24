import LoginForm from '@/components/shared/LoginForm'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {

  return (
    
    <div className="flex justify-center items-center h-[100vh]">
      <Card className='h-fit'>
        <CardHeader>
          <CardTitle className='text-center'>
            <h3 className='text-5xl font-black'>SES</h3>
            <span className='text-2xl font-normal'>HELPER</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
