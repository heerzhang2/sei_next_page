'use client';

import FieldSetWithStatus from '@/component/FieldSetWithStatus';
import Container from '@/component/Container';
import SubmitButtonWithStatus from '@/component/SubmitButtonWithStatus';
import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react';
// import { getAuthAction, signInAction } from './actions';
// import ErrorNote from '@/components/ErrorNote';
import {KEY_CALLBACK_URL, KEY_CREDENTIALS_SIGN_IN_ERROR, } from '.';
import {redirect, useSearchParams} from 'next/navigation';
// import { useAppState } from '@/state/AppState';
// import { clsx } from 'clsx/lite';
import { FiLock } from 'react-icons/fi';
import {getAuthAction, } from "@/action/auth";
// import {getAuthAction, signInAction} from "@/action/auth";
import {useAppState} from "@/action/AppState";
import ErrorNote from "@/component/ErrorNote";
import useLoginMutation from "@/component/useLoginMutation";
import {PATH_ADMIN_PHOTOS} from "@/site/paths";
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {z} from "zod";

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

  async function 旧的onSubmit_Login(data: z.infer<typeof FormSchema>) {
    console.log("onSubmit_Login:", data);
    const res = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    });
    if (res?.error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: (res as any).code,
      });
      form.setError('password', { type: 'manual', message: (res as any).code });
    } else {
      router.refresh();
      router.push('/');
      // window.location.href = '/';
    }
  }
  const signInAction = async (
      _prevState: string | undefined,
      formData: FormData,
  ) => {

    // e.preventDefault();
    const data = formData;  //{ email: '', password: '' }
    console.log("signInAction formData:{}", formData);
    const response = await signIn('credentials', {
      username: 'herzhang',
      email: 'herzhang@163.com', //data.email,
      password: '768768', //data.password,
      redirect: false
    });
    if (!response?.error) {
        router.refresh();
        router.push('/');
    } else {
      // setError(response.error);
      // resetForm();
      window.location.href = '/';
    }

    // try {
    //   await signIn('credentials', Object.fromEntries(formData));
    // } catch (error) {
    //   if (!`${error}`.includes('NEXT_REDIRECT')) {
    //     console.log('Unknown sign in error:', {
    //       errorText: `${error}`,
    //       error,
    //     });
    //     // Rethrow non-redirect errors
    //     throw error;
    //   }
    // }
    // redirect(formData.get(KEY_CALLBACK_URL) as string || PATH_ADMIN_PHOTOS);
  };

  // async function signIn(tag,form)
  // {
  //   // e.preventDefault();
  //   let encodePass=sha256().update(form?.password).digest('hex');
  //   try {
  //     // setError("");
  //     // setLoading(true);
  //     await  submitfunc(form?.username, encodePass);
  //     //实际await不会在这里阻塞等待的！
  //     //setIsMeUser(false);  加上这个导致点登陆不管后端应答与否，都会被立刻跳转URL='/'
  //   } catch (err: any) {
  //     // setLoading(false);
  //     // @ts-ignore
  //     // setError(err.message);
  //     console.log('Unknown sign in error:', {
  //       errorText: `${error}`,
  //       error,
  //     });
  //   }
  // }

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
