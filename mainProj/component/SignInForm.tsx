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
import {KEY_CALLBACK_URL, KEY_CREDENTIALS_SIGN_IN_ERROR, signIn} from '.';
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

//密码hash 防止在服务后台泄密
var sha256 = require('hash.js/lib/hash/sha/256');

export default function SignInForm() {
  const params = useSearchParams();

  const { setUserEmail } = useAppState();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {call:submitfunc, doing:isInFlight}= useLoginMutation();


  const signInAction = async (
      _prevState: string | undefined,
      formData: FormData,
  ) => {
    try {
      await signIn('credentials', Object.fromEntries(formData));
    } catch (error) {
      if (!`${error}`.includes('NEXT_REDIRECT')) {
        console.log('Unknown sign in error:', {
          errorText: `${error}`,
          error,
        });
        // Rethrow non-redirect errors
        throw error;
      }
    }
    // redirect(formData.get(KEY_CALLBACK_URL) as string || PATH_ADMIN_PHOTOS);
  };
  async function signIn(tag,form)
  {
    // e.preventDefault();
    let encodePass=sha256().update('').digest('hex');
    try {
      // setError("");
      // setLoading(true);
      await  submitfunc('', encodePass);
      //实际await不会在这里阻塞等待的！
      //setIsMeUser(false);  加上这个导致点登陆不管后端应答与否，都会被立刻跳转URL='/'
    } catch (err: any) {
      // setLoading(false);
      // @ts-ignore
      // setError(err.message);
      console.log('Unknown sign in error:', {
        errorText: `${error}`,
        error,
      });
    }
  }

  const [response, action] = useActionState(signInAction, undefined);

  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const timeout = setTimeout(() => emailRef.current?.focus(), 100);
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
              id="email"
              inputRef={emailRef}
              label="Admin Email"
              type="email"
              value={email}
              onChange={setEmail}
            />
            <FieldSetWithStatus
              id="password"
              label="Admin Password"
              type="password"
              value={password}
              onChange={setPassword}
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
