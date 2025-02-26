import { ReactNode } from "react";
import UserAuthed from "@/common/UserAuthed";

//光光依靠UserAuthed还是无法确保 变更页面一定能够获取到session?.user.token的？可能urql自己的发起包没有提供token
export default async function Layout({children}: { children: ReactNode }) {
    return (
        <>
          <UserAuthed />
          {children}
        </>
    );
}