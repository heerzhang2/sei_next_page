import { ReactNode } from "react";
import UserLogined from "@/common/UserLogined";


export default async function Layout({children}: { children: ReactNode }) {
    return (
        <>
          <UserLogined />
          {children}
        </>
    );
}