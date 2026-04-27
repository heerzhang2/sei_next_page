/**
 * 测试第三方登录
 * 运行: node scripts/test-login.cjs
 */

// 加载 .env.local 文件
require('dotenv').config({ path: '.env' });

const https = require('https');

const loginData = {
  // code: '0',
  containerId: '',
  digCertSign: '',
  loginType: '1',
  password: process.env.THIRD_PARTY_PASSWORD || '',
  userType: '10',
  username: process.env.THIRD_PARTY_USERNAME || '',
  uuid: '',
};

console.log('Login data:', {
  ...loginData,
  password: loginData.password ? '***' : '(empty)',
});

const postData = JSON.stringify(loginData);

const options = {
  hostname: '36.212.134.165',
  port: 10443,
  path: `/prod-api/auth/login?time=${Date.now()}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Accept': '*/*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Origin': 'https://36.212.134.165:10443',
    'Referer': 'https://36.212.134.165:10443/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  // 允许自签名证书
  rejectUnauthorized: false,
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:', data);
    try {
      const result = JSON.parse(data);
      console.log('Parsed:', result);
    } catch (e) {
      console.error('Parse error:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(postData);
req.end();
