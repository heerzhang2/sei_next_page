import { auth } from '@/app/auth';
import ProfileForm from '@/component/profile-form';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
      return <div>未登录啊</div>;
  }
  // if(typeof window === "undefined")    console.log("ProfilePage用户:", session);
  return (
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-12">
          <div className="text-2xl text-center">My Profile</div>
          <div className="flex flex-col items-center space-y-4">

              <br/><br/>
              <div>{session.user.name?.[0] ?? session.user.email?.[0]}</div>
          </div>
          <br/><br/> <br/><br/>
          <div className="flex flex-col items-center space-y-4">
              <div>{session.user.email}</div>
          </div>
          <br/>
          <br/>
          <ProfileForm user={session.user}/>
      </div>
  );
} 