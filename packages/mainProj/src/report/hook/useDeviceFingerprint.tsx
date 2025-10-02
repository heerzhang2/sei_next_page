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
                let deviceId = localStorage.getItem('clientId');
                if (!deviceId) {
                    const components = [
                        Math.random().toString(36).slice(2, 5),
                        new Date().getTime().toString(36).slice(4, 9)
                    ];
                    deviceId = components.join('');
                    localStorage.setItem('clientId', deviceId);
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
    }, []);

    return {
        deviceFingerprint,
        isLoading
    };
};
