// 修改后的 offlineExchange 配置
const cache = offlineExchange({
    // ...其他配置保持不变...
    storage: {
        ...makeDefaultStorage({ /* 原有配置 */ }),
        // 覆盖 writeMetadata 方法
        writeMetadata: (metadata, { key }) => {
            return new Promise((resolve) => {
                // 获取现有元数据
                this.readMetadata().then(existing => {
                    // 创建新的元数据对象
                    const newMetadata = { ...existing };

                    // 删除所有同类型pending操作（按操作类型+变量哈希）
                    Object.keys(newMetadata.operations).forEach(opKey => {
                        if (opKey.startsWith(key)) {
                            delete newMetadata.operations[opKey];
                        }
                    });

                    // 添加新的操作记录（使用时间戳作为版本号）
                    newMetadata.operations[key] = {
                        ...metadata.operations[key],
                        version: Date.now() // 添加版本标识
                    };

                    // 写入更新后的元数据
                    localStorage.setItem('graphcache-metadata', JSON.stringify(newMetadata));
                    resolve();
                });
            });
        }
    }
});

// 在 authExchange 中添加请求指纹
const client = createClient({
    // ...其他配置...
    exchanges: [
        // ...其他交换器...
        authExchange(async (utils) => {
            let lastMutationId = 0;

            return {
                // ...原有方法...
                async refreshAuth() {
                    lastMutationId += 1;
                    return { mutationId: lastMutationId.toString() };
                }
            }
        }),
    ]
});