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
              <div>{session?.user?.name}</div>
          <br/>
      </div>
  );
}
//eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJoZXJ6aGFuZyIsImlhdCI6MTc0MDYzMTkxOCwiZXhwIjoxNzQwNjM3MzE4fQ.BLZZN4iZ7o721FS2wcWxjYZYbS5dtoGlxqRa2wJ9vsiwD-gkaCG6b60BAKxQedR2Y_NvcI7Xl--VNp3A-1v5kw
