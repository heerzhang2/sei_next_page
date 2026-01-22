# MinIO 到 RustFS 迁移配置指南

## 1. MinIO ywmast 桶配置（源）

### 基本信息汇总
```bash
桶名称: ywmast
版本控制: Enabled (启用)
对象锁定: COMPLIANCE 模式，保留 1 天
匿名访问: Enabled (启用)
生命周期管理: Enabled (启用)
位置: us-east-1

使用情况:
  总大小: 39 MiB
  对象数量: 38
  版本数量: 72
```

### 生命周期配置
```bash
# 最新版本过期策略
- 规则ID: cnjosbapih0klb2n8i0g
  状态: Enabled
  前缀: -
  标签: -
  过期天数: 0
  删除标记: true

- 规则ID: coc4d4qpih0heu4uj950
  状态: Enabled
  前缀: -
  标签: -
  过期天数: 13
  删除标记: false

# 旧版本过期策略
- 规则ID: cnjosbapih0klb2n8i0g
  状态: Enabled
  前缀: -
  标签: -
  过期天数: 1
  保留版本数: 0
```

### 对象锁定配置
```bash
锁定模式: COMPLIANCE (合规模式)
保留期限: 1 天
```

### 访问权限
```bash
Anonymous: Enabled (允许匿名访问)
```

### 存储配额
```bash
0 B (无限制)
```

### 对象大小分布
```bash
15 个对象: 1KB - 1MB
1 个对象: 1KB - 64KB
23 个对象: 1MB - 10MB
1 个对象: 256KB - 512KB
11 个对象: 512KB - 1MB
2 个对象: 64KB - 256KB
```

### 对象结构
```
ywmast/
├── 202406/
├── 202506/
├── 202508/
├── 202509/
├── 202512/
└── 202601/
```

---

## 2. RustFS 配置（目标）

### 2.1 application.yml 配置
```yaml
rustfs:
  endpoint: http://192.168.109.66:30900/
  bucketName: ywmast
  accessKey: rustfsadmin
  secretKey: rustfsadmin
```

### 2.2 需要在 RustFS 上配置的关键功能

#### 2.2.1 启用版本控制
```bash
# 通过 mc 工具
mc version enable rustfs/ywmast
```

#### 2.2.2 配置对象锁定
```python
import boto3

s3 = boto3.client(
    's3',
    endpoint_url='http://192.168.109.66:30900',
    aws_access_key_id='rustfsadmin',
    aws_secret_access_key='rustfsadmin',
    region_name='us-east-1'
)

# 设置对象锁定配置
s3.put_object_lock_configuration(
    Bucket='ywmast',
    ObjectLockConfiguration={
        'ObjectLockEnabled': 'Enabled',
        'Rule': {
            'DefaultRetention': {
                'Mode': 'COMPLIANCE',
                'Days': 1
            }
        }
    }
)

print("对象锁定配置成功")
```

#### 2.2.3 配置生命周期策略
**方式 1: 通过 RustFS 管理界面配置**
如果 RustFS 提供 Web UI，可以在桶设置中配置：
- 立即删除对象（如果符合业务需求）
- 13天后自动删除对象
- 旧版本 1天后过期，保留0个版本

**方式 2: 通过 AWS CLI 配置**
```bash
# 配置 AWS CLI 使用 RustFS
aws configure set default.s3.endpoint_url http://192.168.109.66:30900
aws configure set default.s3.use_path_addressing_style true
aws configure set aws_access_key_id rustfsadmin
aws configure set aws_secret_access_key rustfsadmin

# 设置完整的生命周期规则
aws s3api put-bucket-lifecycle-configuration \
  --bucket ywmast \
  --lifecycle-configuration '{
    "Rules": [
      {
        "Id": "expire-after-13-days",
        "Status": "Enabled",
        "Filter": {},
        "Expiration": {
          "Days": 13
        }
      },
      {
        "Id": "old-version-expiration",
        "Status": "Enabled",
        "Filter": {},
        "NoncurrentVersionExpiration": {
          "NoncurrentDays": 1
        }
      }
    ]
  }'
```

**方式 3: 通过 Python/Boto3 配置**
```python
import boto3

s3 = boto3.client(
    's3',
    endpoint_url='http://192.168.109.66:30900',
    aws_access_key_id='rustfsadmin',
    aws_secret_access_key='rustfsadmin',
    region_name='us-east-1'
)

# 设置生命周期规则（包含旧版本过期）
lifecycle_configuration = {
    'Rules': [
        {
            'ID': 'expire-after-13-days',
            'Status': 'Enabled',
            'Filter': {},
            'Expiration': {
                'Days': 13
            }
        },
        {
            'ID': 'old-version-expiration',
            'Status': 'Enabled',
            'Filter': {},
            'NoncurrentVersionExpiration': {
                'NoncurrentDays': 1
            }
        }
    ]
}

s3.put_bucket_lifecycle_configuration(
    Bucket='ywmast',
    LifecycleConfiguration=lifecycle_configuration
)

print("生命周期规则设置成功")
```

#### 2.2.4 设置匿名访问权限
```bash
# 设置为只读访问（下载）
mc anonymous set download rustfs/ywmast

# 或设置为公共访问
mc anonymous set public rustfs/ywmast
```

---

## 3. 配置对比表

| 配置项 | MinIO (旧) | RustFS (新) | 状态 |
|--------|-----------|-------------|------|
| Endpoint | http://localhost:9000 | http://192.168.109.66:30900/ | ✅ 已更新 |
| Bucket Name | ywmast | ywmast | ✅ 一致 |
| Access Key | seibe | rustfsadmin | ✅ 已更新 |
| Secret Key | jhUe09wc81 | rustfsadmin | ✅ 已更新 |
| 版本控制 | Enabled | ⚠️ 需要配置 | ⚠️ 待处理 |
| 生命周期 (13天过期) | ✅ 已配置 | ⚠️ 需要配置 | ⚠️ 待处理 |
| 对象锁定 (COMPLIANCE) | ✅ 已配置 | ⚠️ 需要确认 | ⚠️ 待处理 |
| 匿名访问 | Enabled | ⚠️ 需要确认 | ⚠️ 待处理 |
| 标签 | 无 | 无 | ✅ 一致 |
| 配额 | 无限制 | 无限制 | ✅ 一致 |

---

## 4. 数据迁移方案

### 方案 1: 使用 mc 工具（推荐）
```bash
# 添加 RustFS 别名
mc alias set rustfs http://192.168.109.66:30900 rustfsadmin rustfsadmin

# 迁移数据（镜像同步）
mc mirror myminio/ywmast rustfs/ywmast
```

### 方案 2: 使用 AWS CLI
```bash
# 从 MinIO 导出
aws s3 sync s3://ywmast ./backup --endpoint-url http://localhost:9000

# 导入到 RustFS
aws s3 sync ./backup s3://ywmast --endpoint-url http://192.168.109.66:30900
```

### 方案 3: 使用 rclone
```bash
rclone copy minio:ywmast rustfs:ywmast --progress
```

---

## 5. 验证步骤

1. **验证连接**
```bash
# 测试 RustFS 连接
mc ls rustfs/ywmast
```

2. **验证生命周期配置**
```bash
# 查看 RustFS 生命周期配置
mc ilm ls rustfs/ywmast
```

3. **验证访问权限**
```bash
# 查看桶权限
mc anonymous list rustfs/ywmast
```

4. **验证数据完整性**
```bash
# 比较源和目标
mc diff myminio/ywmast rustfs/ywmast
```

---

## 6. 回滚方案

如果迁移失败，可以快速回滚：

1. 修改 `application.yml` 配置回 MinIO：
```yaml
rustfs:
  endpoint: http://localhost:9000
  bucketName: ywmast
  accessKey: seibe
  secretKey: jhUe09wc81
```

2. 重启应用

---

## 7. 注意事项

1. **证书配置**：MinIO 使用了证书（`D:\file\.minio\certs`），如果需要 HTTPS，RustFS 也需要配置证书

2. **版本控制**：MinIO 已启用版本控制（38个对象，72个版本），RustFS 必须启用版本控制才能支持对象锁定功能

3. **对象锁定**：MinIO 使用 COMPLIANCE 模式，保留1天，这是 WORM（Write Once Read Many）合规性要求

4. **生命周期规则**：MinIO 有两个过期规则：
   - 最新版本：13天后过期
   - 旧版本：1天后过期，保留0个版本

5. **匿名访问**：MinIO 允许匿名访问，根据安全需求决定是否在 RustFS 上开启

6. **备份**：迁移前建议备份 MinIO 数据

7. **停机时间**：建议在业务低峰期进行迁移，尽量减少停机时间

8. **数据量**：MinIO 当前有 38 个对象（39 MiB），数据量不大，迁移速度会很快
