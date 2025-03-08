import { auth } from '@/app/auth';
import AuthStatus from "@/auth/auth-status";

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
      return <div>未登录啊</div>;
  }
  // if(typeof window === "undefined")    console.log("ProfilePage用户:", session);
  return (
      <div>
          <AuthStatus/>
           <br/><br/>
              <div>{session.user.name ?? session.user.email}</div>
          <br/>
      </div>
  );
} 