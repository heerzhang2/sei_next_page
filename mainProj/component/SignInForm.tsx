'use client';

import {useActionState, useEffect, useRef, useState,} from 'react';
import FieldSetWithStatus from '@/component/FieldSetWithStatus';
import Container from '@/component/Container';
import SubmitButtonWithStatus from '@/component/SubmitButtonWithStatus';
import {KEY_CALLBACK_URL, KEY_CREDENTIALS_SIGN_IN_ERROR, } from '.';
import {useSearchParams} from 'next/navigation';
import { FiLock } from 'react-icons/fi';
import {getAuthAction, } from "@/action/auth";
import ErrorNote from "@/component/ErrorNote";
import useLoginMutation from "@/component/useLoginMutation";
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { revalidatePath } from 'next/cache'
import {useAppState} from "@/action/AppState";

// import { z } from "zod";
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';             =感觉是罗嗦了
// const FormSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(6),
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
  const params = useSearchParams();
  const { setUserEmail } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const {call:submitfunc, doing:isInFlight}= useLoginMutation();

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

  const [response, action] = useActionState(signInAction, undefined);

  const usernameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const timeout = setTimeout(() => usernameRef.current?.focus(), 100);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    return () => {
      // Capture user email before unmounting
      getAuthAction().then(auth =>
        setUserEmail?.(auth?.user?.email ?? undefined));
    };
  }, [setUserEmail]);

  const isFormValid =
    email.length > 0 &&
    password.length > 0;

  return (
    <Container  >
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
          {response === KEY_CREDENTIALS_SIGN_IN_ERROR &&
            <ErrorNote>
              Invalid email/password
            </ErrorNote>}
          <div  >
            <FieldSetWithStatus
              id="username"
              inputRef={usernameRef}
              label="用户名"
              value={username}
              onChange={setUsername}
            />
            <FieldSetWithStatus
              id="password"
              label="Admin Password"
              type="password"
              value={password}
              onChange={setPassword}
            />
            <FieldSetWithStatus
                id="email"
                label="Admin Email"
                type="email"
                value={email}
                onChange={setEmail}
            />
            <input
              type="hidden"
              name={KEY_CALLBACK_URL}
              value={params.get(KEY_CALLBACK_URL) ?? ''}
            />
          </div>
          <SubmitButtonWithStatus disabled={!isFormValid}>
            Sign in
          </SubmitButtonWithStatus>
        </div>
      </form>
    </Container>
  );
}
