import { auth } from '@/app/auth';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
      return <div>未登录啊</div>;
  }
  // if(typeof window === "undefined")    console.log("ProfilePage用户:", session);
  return (
      <div>
           <br/><br/>
              <div>{session.user.name?.[0] ?? session.user.email?.[0]}</div>
          <br/>
      </div>
  );
} 