// import { getTranslations, setRequestLocale } from 'next-intl/server';
import SignInForm from "@/app/login/SignInForm";
import Link from "next/link";
import LoginForm from "@/app/login/LoginForm";


type ISignInPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ISignInPageProps) {
  const { locale } = await props.params;
  // const t = await getTranslations({
  //   locale,
  //   namespace: 'SignIn',
  // });

  return {
    title: ('meta_title'),
    description: ('meta_description'),
  };
}

export default async function SignInPage(props: ISignInPageProps) {
  const { locale } = await props.params;
  // setRequestLocale(locale);
  const onLoginSuccess = auth => {
    // saveAuthData(auth);
    // setIsLoggedIn(true);
  };

  //报错onLoginSuccess={onLoginSuccess：auth => {}} #跨越网络界限的# [ Server ] Error: Event handlers cannot be passed to Client Component props.
  return (
      <div>
          {/*<SignInForm/>*/}
         <LoginForm />
      </div>
  );
};
