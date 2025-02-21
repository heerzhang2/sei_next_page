/** @jsxImportSource @emotion/react */
'use client';

// import { auth } from '@/app/auth';
import { UserNav } from './user-nav';
import { SessionProvider } from 'next-auth/react';
import { Global } from "@emotion/react";
import {
    Button, ButtonRefComp, DarkMode, DarkRefMode,
    IconArrowRight, IconChevronDown,
    IconKey,
    LightMode, LightRefMode, MenuItem, MenuList,
    Navbar,
    Text,
    Toolbar,
    useTheme, MainMenuBar, IconTruck, DdMenu, DdMenuItem,
} from "customize-easy-ui-component";
import {footbarQuery} from "./__generated__/footbarQuery.graphql";
// import {useRouter} from "next/navigation";
import {Suspense, useContext, } from "react";
import UserContext from "@/action/UserContext";
import food from "../../public/images/food.svg";
import cutting_board_knife from "../../public/images/cutting-board-knife.jpg";
import Link from "next/link";
import {  signOut, useSession } from "next-auth/react"

export const dynamic = 'force-dynamic'
export const fetchCache = 'default-no-store'

export default function FootBar() {
    const theme = useTheme();
    const handleSignOut = async () => {
        const data =await signOut({
            redirect: true,
            redirectTo: '/'        // Redirect to home after sign out
        });
        //useRouter().push(data.url)
    }

    // console.log("graphql->authUser", data);
    // const {authUser} = data;
    // const router = useRouter();
    const {user, setUser} = useContext(UserContext);

    return (
        <>
            <Global
                styles={{
                    html: {
                        overflowX: 'hidden',
                        [theme.mediaQueries.md]: {
                            backgroundAttachment: "fixed",
                            backgroundSize: "cover",
                            backgroundImage: `url(${cutting_board_knife})`
                        }
                    }
                }}
            />

            <MainMenuBar  id={'floormenu'}  css={{
                justifyContent: "space-between",
                "@media print": {
                    display: 'none',
                }
            }}
            >
                {/*有可能窄屏幕情况，切分50%时在宽度上超出50%位置的；高度方向可能被按钮突破,Toolbar替代*/}
                <DdMenu label="菜单"  tight={true}
                        icon={
                            <ButtonRefComp
                                size="xs"
                                iconBefore={
                                    <img
                                        css={{
                                            marginRight: theme.spaces.sm,
                                            width: "25px",
                                            height: "25px"
                                        }}
                                        src="/images/food.svg" alt={''}
                                        aria-hidden
                                    />
                                }
                                variant="ghost"
                            >
                                我的
                            </ButtonRefComp>
                        }
                        divStyle={{
                            lineHeight: '1.0',
                        }}
                >
                    {user? <DdMenuItem label="账户" onClick={handleSignOut}>退出帐户{user?.username}</DdMenuItem>
                        :
                        <Link href="/login">
                            <DdMenuItem label="账户" onClick={() => {  }}>登录帐户</DdMenuItem>
                        </Link>
                    }

                </DdMenu>

                <Button
                    size="xs"
                    intent="primary"
                    iconBefore={<IconArrowRight />}
                    onPress={() => {  }}
                >
                    搜索
                </Button>
                <Link href="/inspect">
                    <Button size="xs" intent="primary" iconBefore={<IconChevronDown />} onPress={() => {  }}>检验</Button>
                </Link>

                <Button
                    size="xs"
                    intent="primary"
                    iconBefore={
                        <img
                            css={{
                                marginRight: theme.spaces.sm,
                                width: "25px",
                                height: "25px"
                            }}
                            src="/images/food.svg" alt={''}
                            aria-hidden
                        />
                    }
                    onPress={() => { }}
                >
                    待办
                </Button>
                <Link href="/tasks">
                    <Button size="xs" noBind intent="primary" iconBefore={<IconKey />}>任务</Button>
                </Link>
            </MainMenuBar>
        </>
    );
}
