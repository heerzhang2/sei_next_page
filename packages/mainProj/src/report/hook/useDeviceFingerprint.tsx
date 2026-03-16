"use client"

import { useState, useEffect, useRef } from 'react';

export const useDeviceFingerprint = () => {
    const [deviceFingerprint, setDeviceFingerprint] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const fingerprintRef = useRef('');

    useEffect(() => {
        const generateDeviceFingerprint = () => {
            try {
                // 检查是否在浏览器环境
                if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
                    return 'server_side';
                }

                // 尝试从 localStorage 获取现有设备ID
                let deviceId = localStorage.getItem('clientId');

                // 如果没有，生成新的设备ID
                if (!deviceId) {
                    const components = [
                        Math.random().toString(36).slice(2, 5),
                        new Date().getTime().toString(36).slice(4, 9)
                    ];
                    deviceId = components.join('');
                    localStorage.setItem('clientId', deviceId);
                    console.log('生成新的设备ID:', deviceId);
                } else {
                    console.log('使用现有设备ID:', deviceId);
                }

                return deviceId;
            } catch (error) {
                console.warn('生成设备指纹失败:', error);
                // 返回基于时间的临时指纹
                return 'temp_' + new Date().getTime().toString(36);
            }
        };

        const fingerprint = generateDeviceFingerprint();
        fingerprintRef.current = fingerprint;
        setDeviceFingerprint(fingerprint);
        setIsLoading(false);

        // 将设备ID设置为全局变量，方便其他模块访问
        if (typeof window !== 'undefined') {
            (window as any).__DEVICE_ID = fingerprint;
        }
    }, []);

    return {
        deviceFingerprint,
        isLoading
    };
};

// 辅助函数：直接获取设备ID（同步方式）
export const getDeviceIdSync = (): string => {
    if (typeof window === 'undefined') return '';

    // 先尝试从全局变量获取
    if ((window as any).__DEVICE_ID) {
        return (window as any).__DEVICE_ID;
    }

    // 然后尝试从 localStorage 获取
    try {
        return localStorage.getItem('clientId') || '';
    } catch {
        return '';
    }
};