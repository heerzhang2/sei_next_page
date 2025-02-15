'use client';

import {useActionState, useEffect, useRef, useState,} from 'react';
import SubmitButtonWithStatus from '@/component/SubmitButtonWithStatus';
// import {KEY_CALLBACK_URL, KEY_CREDENTIALS_SIGN_IN_ERROR, } from '.';
import {useSearchParams} from 'next/navigation';
import { FiLock } from 'react-icons/fi';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { revalidatePath } from 'next/cache'
import {useAppState} from "@/action/AppState";

// import { z } from "zod";
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';             =感觉是罗嗦了
// const formSchema = z.object({
//   name: z.string().min(2, 'Name must be at least 2 characters'),
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
//   confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords must match",
//   path: ['confirmPassword'],
// });
// export default function LoginForm() {
//   const form = useForm<z.infer<typeof FormSchema>>({       =感觉可以学习的点？
//     resolver: zodResolver(FormSchema),
//     defaultValues: {email: '', password: '',},
//   });
// async function onSubmit(data: z.infer<typeof FormSchema>) {const res = await signIn('credentials', {}


//密码hash 防止在服务后台泄密
var sha256 = require('hash.js/lib/hash/sha/256');

export default function SignInForm() {
  const router = useRouter();
  // const params = useSearchParams();
  const { setUserEmail } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  // const {call:submitfunc, doing:isInFlight}= useLoginMutation();

  const signInAction = async (_prevState: string | undefined, formData: FormData,
  ) => {
    const data = formData;  //{ email: '', password: '' }
    console.log("signInAction formData:{}", formData);
    const response = await signIn('credentials', {
      username: 'herzhang',
      email: 'herzhang@163.com', //data.email,
      password: '768768', //data.password,
      redirect: false
    });
    if (!response?.error) {
        window.location.reload()
        router.push('/')
        window.location.href = '/';
    } else {
      // setError(response.error);
      // resetForm();
      window.location.href = '/';
    }
  };

  // @ts-ignore
  const [response, action] = useActionState(signInAction, undefined);

  const usernameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const timeout = setTimeout(() => usernameRef.current?.focus(), 100);
    return () => clearTimeout(timeout);
  }, []);

  // useEffect(() => {
  //   return () => {
  //     // Capture user email before unmounting
  //     getAuthAction().then(auth =>
  //       setUserEmail?.(auth?.user?.email ?? undefined));
  //   };
  // }, [setUserEmail]);

  const isFormValid =
    email.length > 0 &&
    password.length > 0;

  return (
    <div  >
      <h1   >
        <FiLock className="text-main translate-y-[0.5px]" />
        <span className="text-main">
          Sign in
        </span>
      </h1>
      <form
        action={action}
        className="w-full"
      >
        <div >
          <div  >
            <input
              id="username"
              ref={usernameRef}
              value={username}
            />
            <input
              id="password"
              type="password"
              value={password}
            />
            <input
                id="email"
                type="email"
                value={email}
            />
          </div>
          <SubmitButtonWithStatus disabled={!isFormValid}>
            Sign in
          </SubmitButtonWithStatus>
        </div>
      </form>
    </div>
  );
}
