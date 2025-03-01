/** @jsxImportSource @emotion/react */
'use client';

import { jsx, css, Global, ClassNames } from '@emotion/react'
import {useActionState, useEffect, useRef, useState,} from 'react';
import SubmitButtonWithStatus from '@/component/SubmitButtonWithStatus';
// import {KEY_CALLBACK_URL, KEY_CREDENTIALS_SIGN_IN_ERROR, } from '.';
import {useSearchParams} from 'next/navigation';
import { FiLock } from 'react-icons/fi';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// import { revalidatePath } from 'next/cache'
import {useAppState} from "@/action/AppState";
import * as React from "react";
import {
    useTheme,
    Layer,
    Text,
    Button,
    Link as StyledLink,
    LayerLoading,
    Alert, Spinner,
    Container, Input, InputGroup, IconArrowRight
} from "customize-easy-ui-component";
// import queryString from "query-string";
// import {useContext} from "react";
// import {UserContext} from "../routing/UserContext";
// import useLoginMutation from "./useLoginMutation";
// import useRegisterMutation from "./useRegisterMutation";
import {AloneContainer} from "@/comp/AloneContainer";
import Link from "next/link";

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
/*登录表单；却在浏览器端运行的。
* */
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
    console.log("signInAction录入formData:{}", formData);
    const response = await signIn('credentials', {
      username: 'herzhang',
      email: 'herzhang@163.com', //data.email,
      password: '768768', //data.password,
      redirect: true
    });
    if (!response?.error) {
        window.location.reload()
        router.push('/user')
        window.location.href = '/user';
    } else {
      // setError(response.error);
      // resetForm();
      window.location.href = '/';
    }
  };

  // @ts-ignore
  const [response, action, isPending] = useActionState(signInAction, undefined);

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
    const theme = useTheme();
    const [error, setError] = React.useState("");

  return (
      <>
      <AloneContainer>
          <Layer
              css={{
                  boxShadow: "none",
                  marginBottom: theme.spaces.md,
                  background: "white",
                  [theme.mediaQueries.md]: {
                      marginTop: theme.spaces.xl,
                      boxShadow: theme.shadows.xl
                  }
              }}
          >
              <div
                  css={{
                      borderBottom: "1px solid",
                      borderColor: theme.colors.border.muted,
                      textAlign: "center",
                      padding: theme.spaces.lg,
                      paddingBottom: theme.spaces.sm
                  }}
              >
                  <Text variant="h4">
                      "使用前先登陆账户"
                  </Text>

                  <div
                      css={{
                          textAlign: "center",
                          paddingBottom: theme.spaces.sm
                      }}
                  >
                      <Text css={{fontSize: theme.fontSizes[0]}}>
                          若没有账户?{" "}先要
                          <StyledLink href="#">
                              <Button size="xs" noBind intent="primary" iconAfter={<IconArrowRight/>}
                              >申请注册
                              </Button>
                          </StyledLink>
                      </Text>
                  </div>
              </div>

              <div
                  css={{
                      padding: theme.spaces.lg
                  }}
              >
                  <form action={action}>
                      <div css={{marginTop: theme.spaces.md}}>
                          <Text muted css={{textAlign: "center"}} variant="subtitle">
                              请使用您的用户名密码登录:
                          </Text>
                          <InputGroup label={"账户"}>
                              <Input required
                                     onChange={e => {
                                         setUsername(e.currentTarget.value);
                                     }}
                                     value={username}
                                     inputSize="md"
                                     type="text"
                                     placeholder="账户"
                              />
                          </InputGroup>
                          <InputGroup label={"密码"}>
                              <Input required
                                     onChange={e => {
                                         setPassword(e.currentTarget.value);
                                     }}
                                     value={password}
                                     inputSize="md"
                                     type="password"
                                     placeholder="密码最少6位的复杂"
                                     autoComplete="off"
                              />
                          </InputGroup>

                          {error && (
                              <Alert
                                  css={{marginTop: theme.spaces.md}}
                                  intent={"error"}
                                  title={"报错"}
                                  subtitle={error}
                              />
                          )}
                          <div css={{display: "flex", justifyContent: "flex-end"}}>
                              <Button
                                  disabled={!username || !password}
                                  block
                                  component="button"
                                  css={{
                                      textAlign: "center",
                                      width: "100%",
                                      marginTop: theme.spaces.md
                                  }}
                                  type="submit"
                                  size="md"
                                  intent="primary"
                                  //onPress={e =>{isRegistering ? doRegister(e) : doLogin(e) } }
                              >
                                  登录
                              </Button>

                          </div>
                      </div>
                  </form>
              </div>
              <div className="mt-10">
                  <Link href="/mainProj/public">⬅️ Go back home</Link>
              </div>
              <div className="mt-10">
                  <Link href="/user">⬅️ Go 不能尼克酸y用户</Link>
              </div>
              <div className="mt-10">
                  <Link href="/profile">⬅️ Profile y用户</Link>
              </div>
          </Layer>
      </AloneContainer>
          <Spinner doing={isPending}/>
      </>
  );
}

//          <div  >
//             <input
//               id="username"
//               ref={usernameRef}
//               value={username}
//             />
//             <input
//               id="password"
//               type="password"
//               value={password}
//             />
//             <input
//                 id="email"
//                 type="email"
//                 value={email}
//             />
//           </div>