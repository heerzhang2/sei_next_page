// import { getTranslations, setRequestLocale } from 'next-intl/server';
import SignInForm from "@/component/SignInForm";
import Link from "next/link";


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

  return (
      <div>
          <SignInForm/>

      </div>
  );
};
