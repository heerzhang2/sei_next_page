import { ReactNode } from "react";
import UserAuthed from "@/common/UserAuthed";


export default async function Layout({children}: { children: ReactNode }) {
    return (
        <>
          <UserAuthed />
          {children}
        </>
    );
}