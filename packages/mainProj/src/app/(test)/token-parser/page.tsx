// app/session-token-parser/page.tsx
'use client';

import { useState } from 'react';

export default function SessionTokenParser() {
    const [token, setToken] = useState(
        'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoicVFLN1RuNms5bEExOUV1bDBRR1cwUEcybHhHak5fZFNGVHFneGtCZGNJbVRlWXRjSzQyVDRleUtmM2laUUUzdXl4Vnl6LWhTN2xjeHVmUXI3LVdHZncifQ..U2L243a6fkO65kexJLpF7g.4a4Hv6kmaleWGBxvRUir8nkci2WEn70to76BvSzya4ba0jrwb2udf72zARpWVP2Jh2BpbqmzCyDJGGq9Fqb_Ep3yzLmvxuDyJ-vY9UYT8YPwPdblpctdoM9vYxYY9aEEMuTN3uU0ySKQQkEcVOeuNP2ZIogPmdHDxgmAGPyo2xXy6uG4y2-0EuCe9OjEv72L8tA-y3srIP1aVrY--tZiDXNn1PTCR3eDOZnVhdu0Jz22tNgrl1KJQVU1yn0PyAeuMiSUTs2Ui2oH6O_yw55cR5_zu4NwfrStl0KStZtsCpEOfU49d5C4rXOfn5D_YfD4HaFk0LkKO0r6wM8ZblzRTH3cr2MzTIJMvJCgFpWZqM1itraYfo7Hj0SvP2urGVV-qZgZPM4BZkUxBvLlPQh5JXTPOhh4Jf4G6r6ZABiIqEFD8J0TLHWeTsmu42EypgcmGQgA4FWsfZpSIS4kvYlYsGnW12B9Qwqtj-zzeE37BsUffjidJ4StMJUddpXCRlj4R7mePgkz2fuPe7XdFr6Yu4caxd2In6d4uaQgRpiIwysa9d2TwYRxdzqsQDkb8i00Lahi--7ZdzLqPTYWaZrPUIDpmppalbIx61r0jAAZ_hV-ry-8FwghUP05-2gEc0IUzlPauU8pMZhnu7Sw22M_cOvMz4SoB_T4z_svg_mg56_YAwOVNiOJOd_p6TqiguVgnpac_9--IYTUWYMVIVePhQ.ypzFh8nRLcn8e64CiZxIQmyohps5KL1c45qJ2Tn6mSo'
    );

    const handleDecode = () => {
        alert('这是一个加密的JWT token，无法在客户端直接解码。请查看下方的说明和示例。');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-600 px-6 py-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">NextAuth Session Token 解析</h1>
                    <p className="text-indigo-100">解析和理解NextAuth生成的session token结构</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Token Input Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Session Token</h2>
                        <textarea
                            className="w-full h-40 p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm resize-y"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="粘贴您的session token here..."
                        />
                        <button
                            onClick={handleDecode}
                            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
                        >
                            解析 Token
                        </button>
                    </div>

                    {/* Results Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Header */}
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-indigo-600 mb-3 pb-2 border-b border-gray-200">Header</h3>
                            <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap overflow-auto">
                {`{
  "alg": "dir",
  "enc": "A256CBC-HS512",
  "kid": "qQK7Tn6k9lA19Eul0QGW0PG2lxGjN_dSFTgxkCdcImTeYtcK42T4eyKf3iZQE3uyxVyz-hS7lcxufQr7-WGfw"
}`}
              </pre>
                        </div>

                        {/* Payload */}
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-indigo-600 mb-3 pb-2 border-b border-gray-200">Payload (示例)</h3>
                            <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap overflow-auto">
                {`{
  "name": "张三",
  "email": "zhangsan@example.com",
  "picture": "https://example.com/image.png",
  "sub": "1234567890",
  "iat": 1516239022,
  "exp": 1516242622,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}`}
              </pre>
                        </div>

                        {/* Signature */}
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-medium text-indigo-600 mb-3 pb-2 border-b border-gray-200">Signature (验证)</h3>
                            <p className="text-sm font-mono text-gray-700">
                                无法显示加密签名的内容，这是用于验证token完整性的部分。
                            </p>
                        </div>
                    </div>

                    {/* Information Section */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h2 className="text-xl font-semibold text-indigo-700 mb-4">关于 NextAuth Session Token</h2>

                        <div className="space-y-4 text-gray-700">
                            <p>NextAuth 使用加密的JWT（JSON Web Token）作为默认的session策略。您的token由三部分组成：</p>

                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            <strong>注意：</strong> 这是一个加密token，无法在客户端直接解码。上述解码仅用于展示结构，实际内容需要服务器端密钥才能解密。
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p>1. <strong>Header</strong> - 包含加密算法和密钥ID</p>
                                <p>2. <strong>Payload</strong> - 包含用户信息、access token和过期时间等数据</p>
                                <p>3. <strong>Signature</strong> - 用于验证token完整性的加密签名</p>
                            </div>

                            <p>要获取access token，您需要在NextAuth配置中设置jwt回调：</p>

                            <div className="bg-gray-800 rounded-lg p-4 text-white font-mono text-sm overflow-x-auto">
                <pre>{`// pages/api/auth/[...nextauth].js
jwt: async ({ token, user, account }) => {
  // 首次登录，将access token添加到token中
  if (account && user) {
    token.accessToken = account.access_token;
  }
  return token;
},
session: async ({ session, token }) => {
  // 将access token添加到session中
  session.accessToken = token.accessToken;
  return session;
}`}</pre>
                            </div>

                            <p>然后您可以在客户端使用 <code className="bg-gray-800 text-white px-1 py-0.5 rounded text-sm">useSession()</code> 获取access token：</p>

                            <div className="bg-gray-800 rounded-lg p-4 text-white font-mono text-sm overflow-x-auto">
                <pre>{`import { useSession } from "next-auth/react";

const { data: session } = useSession();
const accessToken = session?.accessToken;`}</pre>
                            </div>

                            <p className="text-red-600 font-medium">
                                您的access token通常存储在payload部分，但需要服务器端解密才能获取。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
