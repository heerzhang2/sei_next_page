'use client';
import * as React from "react";
import Link from "next/link";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useAppState } from "@/action/AppState";

// import { z } from "zod";
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';             =感觉是罗嗦了
// const formSchema = z.object({
//   name: z.string().min(2, 'Name must be at least 2 characters'),
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
//   confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords must match",
//   path: ['confirmPassword'],
// });
// export default function LoginForm() {
//   const form = useForm<z.infer<typeof FormSchema>>({       =感觉可以学习的点？
//     resolver: zodResolver(FormSchema),
//     defaultValues: {email: '', password: '',},
//   });
// async function onSubmit(data: z.infer<typeof FormSchema>) {const res = await signIn('credentials', {}


//密码hash 防止在服务后台泄密
// var sha256 = require('hash.js/lib/hash/sha/256');
/*登录表单；却在浏览器端运行的。
* */


export default function SignInForm() {
    const router = useRouter();
    const { setUserEmail } = useAppState();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState("");
    const usernameRef = useRef<HTMLInputElement>(null);

    // 自动聚焦用户名输入框
    useEffect(() => {
        const timeout = setTimeout(() => usernameRef.current?.focus(), 100);
        return () => clearTimeout(timeout);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await signIn('credentials', {
            ...formData,
            redirect: false
        });

        if (!response?.error) {
            setUserEmail(formData.email);
            router.push('/user');
        } else {
            setError("登录失败，请检查您的账户信息");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-xl shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                        用户登录
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        欢迎回来！请输入您的账户信息
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                邮箱
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="请输入邮箱地址"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                密码
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="请输入密码"
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={!formData.email || !formData.password}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            登录
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-gray-500">
                    <Link href="/signup" className="text-blue-600 hover:text-blue-700">
                        没有账户？立即注册
                    </Link>
                </div>
            </div>
        </div>
    );
}
