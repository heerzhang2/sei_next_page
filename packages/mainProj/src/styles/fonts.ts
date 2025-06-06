import { Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google';
// import { Inter, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google"

export const notoSans = Noto_Sans_SC({
    subsets: ['latin'], // 按需指定字符集
    variable: '--font-noto-sans', // 自定义CSS变量名
    display: 'swap', // 或 'optional' 减少布局偏移
});

export const notoSerif = Noto_Serif_SC({
    subsets: ['latin'],
    variable: '--font-noto-serif',
    display: 'swap',
});
