import Cookies from 'js-cookie';

// 获取令牌的函数
export async function getAuthToken() {
  // 从Cookie中获取令牌
  const token = Cookies.get('auth_token');
  
  // 如果没有令牌或令牌即将过期，尝试刷新
  if (!token) {
    return await refreshAuthToken();
  }
  
  return token;
}

// 刷新令牌的函数
export async function refreshAuthToken() {
  try {
    // 调用刷新令牌的API
    const response = await fetch('/api/refresh-token', {
      method: 'POST',
      credentials: 'include', // 包含cookies
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    
    // 将新令牌存储在Cookie中
    Cookies.set('auth_token', data.accessToken, {
      secure: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + 1000 * 60 * 60) // 1小时过期
    });
    
    return data.accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    // 可能需要重定向到登录页面
    window.location.href = '/login';
    return null;
  }
}
