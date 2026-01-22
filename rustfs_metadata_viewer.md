# 查看 RustFS 对象元数据和 Object Retention

## 方法 1: 使用 mc 工具查看元数据

### 查看单个对象的元数据
```bash
# 查看对象详细信息（包含元数据）
mc stat myminio/ywmast/path/to/object.pdf

# 查看对象的元数据标签
mc tag list myminio/ywmast/path/to/object.pdf
```

### 查看对象的 Object Retention（对象锁定）
```bash
# 查看对象的保留配置
mc retention show myminio/ywmast/path/to/object.pdf
```

### 批量查看多个对象的元数据
```bash
# 先列出所有对象
mc ls --recursive myminio/ywmast > objects.txt

# 然后逐个查看
while read -r line; do
  echo "Object: $line"
  mc stat myminio/ywmast/$line
  echo "---"
done < objects.txt
```

---

## 方法 2: 使用 AWS CLI 查看元数据

### 配置 AWS CLI 连接 RustFS
```bash
# 在 Windows 上
aws configure set default.s3.endpoint_url http://192.168.109.66:30900
aws configure set default.s3.use_path_addressing_style true
aws configure set aws_access_key_id rustfsadmin
aws configure set aws_secret_access_key rustfsadmin
```

### 查看对象元数据
```bash
# 查看对象元数据
aws s3api head-object \
  --bucket ywmast \
  --key path/to/object.pdf \
  --endpoint-url http://192.168.109.66:30900

# 输出包含：
# - x-amz-meta-* 自定义元数据
# - x-amz-object-lock-retain-until-date 对象保留到期日期
# - x-amz-object-lock-mode 对象锁定模式 (COMPLIANCE/GOVERNANCE)
# - x-amz-object-lock-legal-hold 法律锁定状态
```

### 查看对象锁定配置
```bash
# 查看对象的保留策略
aws s3api get-object-retention \
  --bucket ywmast \
  --key path/to/object.pdf \
  --endpoint-url http://192.168.109.66:30900

# 输出示例：
# {
#   "Retention": {
#     "Mode": "COMPLIANCE",
#     "RetainUntilDate": "2026-01-23T00:00:00Z"
#   }
# }
```

### 查看对象的法律锁定
```bash
# 查看对象的法律锁定状态
aws s3api get-object-legal-hold \
  --bucket ywmast \
  --key path/to/object.pdf \
  --endpoint-url http://192.168.109.66:30900

# 输出示例：
# {
#   "LegalHold": {
#     "Status": "ON"
#   }
# }
```

---

## 方法 3: 使用 Python/Boto3 查看元数据

### 脚本：批量查看所有对象的元数据
```python
import boto3
import json
from datetime import datetime

# 连接到 RustFS
s3 = boto3.client(
    's3',
    endpoint_url='http://192.168.109.66:30900',
    aws_access_key_id='rustfsadmin',
    aws_secret_access_key='rustfsadmin',
    region_name='us-east-1'
)

def get_object_metadata(bucket, prefix=''):
    """获取对象的元数据"""
    paginator = s3.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=bucket, Prefix=prefix)

    for page in pages:
        if 'Contents' in page:
            for obj in page['Contents']:
                key = obj['Key']
                print(f"\n{'='*60}")
                print(f"对象: {key}")
                print(f"大小: {obj['Size']} bytes")
                print(f"最后修改: {obj['LastModified']}")

                try:
                    # 获取对象元数据
                    head = s3.head_object(Bucket=bucket, Key=key)

                    # 自定义元数据
                    if 'Metadata' in head and head['Metadata']:
                        print(f"\n自定义元数据:")
                        for k, v in head['Metadata'].items():
                            print(f"  {k}: {v}")

                    # 对象锁定信息
                    if 'ObjectLockRetainUntilDate' in head:
                        retain_until = head['ObjectLockRetainUntilDate']
                        print(f"\n对象保留到期: {retain_until}")

                    if 'ObjectLockMode' in head:
                        mode = head['ObjectLockMode']
                        print(f"对象锁定模式: {mode}")

                except Exception as e:
                    print(f"错误: {e}")

# 查看所有对象
get_object_metadata('ywmast')

# 查看特定前缀的对象
# get_object_metadata('ywmast', '202601/')
```

### 脚本：查看对象 Object Retention
```python
import boto3
from datetime import datetime

s3 = boto3.client(
    's3',
    endpoint_url='http://192.168.109.66:30900',
    aws_access_key_id='rustfsadmin',
    aws_secret_access_key='rustfsadmin',
    region_name='us-east-1'
)

def get_object_retention(bucket, key):
    """获取对象的保留策略"""
    try:
        response = s3.get_object_retention(Bucket=bucket, Key=key)
        retention = response['Retention']
        print(f"对象: {key}")
        print(f"模式: {retention['Mode']}")
        print(f"保留到期: {retention['RetainUntilDate']}")

        # 计算剩余天数
        retain_date = retention['RetainUntilDate']
        now = datetime.now(retain_date.tzinfo)
        remaining = retain_date - now
        print(f"剩余天数: {remaining.days} 天")

    except Exception as e:
        print(f"对象: {key}")
        print(f"错误: {e}")

# 查看单个对象
get_object_retention('ywmast', '202601/somefile.pdf')

# 批量查看
def list_and_show_retentions(bucket):
    """列出所有对象并显示保留策略"""
    paginator = s3.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=bucket)

    for page in pages:
        if 'Contents' in page:
            for obj in page['Contents']:
                get_object_retention(bucket, obj['Key'])

list_and_show_retentions('ywmast')
```

### 脚本：导出所有元数据到 JSON 文件
```python
import boto3
import json

s3 = boto3.client(
    's3',
    endpoint_url='http://192.168.109.66:30900',
    aws_access_key_id='rustfsadmin',
    aws_secret_access_key='rustfsadmin',
    region_name='us-east-1'
)

def export_metadata_to_json(bucket, output_file='metadata.json'):
    """导出所有对象的元数据到 JSON"""
    objects = []
    paginator = s3.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=bucket)

    for page in pages:
        if 'Contents' in page:
            for obj in page['Contents']:
                key = obj['Key']
                obj_info = {
                    'Key': key,
                    'Size': obj['Size'],
                    'LastModified': obj['LastModified'].isoformat(),
                }

                try:
                    head = s3.head_object(Bucket=bucket, Key=key)

                    # 元数据
                    if 'Metadata' in head:
                        obj_info['Metadata'] = head['Metadata']

                    # 对象锁定
                    if 'ObjectLockRetainUntilDate' in head:
                        obj_info['ObjectLockRetainUntilDate'] = head['ObjectLockRetainUntilDate'].isoformat()
                    if 'ObjectLockMode' in head:
                        obj_info['ObjectLockMode'] = head['ObjectLockMode']

                except Exception as e:
                    obj_info['Error'] = str(e)

                objects.append(obj_info)

    # 保存到文件
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(objects, f, indent=2, ensure_ascii=False)

    print(f"已导出 {len(objects)} 个对象到 {output_file}")

# 执行导出
export_metadata_to_json('ywmast', 'ywmast_metadata.json')
```

---

## 方法 4: 在 RustFS Console 上间接查看

### 通过对象详情页查看
1. 打开 RustFS Console: http://192.168.109.66:30901
2. 进入 `ywmast` 桶
3. 点击对象查看详情
4. 如果 Console 支持，可能在"属性"或"元数据"标签页查看

### 下载对象查看本地
```bash
# 下载对象
mc cp myminio/ywmast/path/to/object.pdf .

# 使用文件属性工具查看（Windows）
file object.pdf

# 或使用 PowerShell
Get-ItemProperty object.pdf
```

---

## 常见元数据字段

| 字段名 | 说明 | 示例 |
|--------|------|------|
| x-amz-meta-author | 上传者 | admin |
| x-amz-meta-filename | 原始文件名 | document.pdf |
| x-amz-meta-business | 业务类型 | inspection |
| x-amz-meta-eid | 业务ID | 12345 |
| x-amz-object-lock-retain-until-date | 保留到期时间 | 2026-01-23T00:00:00Z |
| x-amz-object-lock-mode | 锁定模式 | COMPLIANCE/GOVERNANCE |
| x-amz-object-lock-legal-hold | 法律锁定 | ON/OFF |

---

## 总结

推荐使用顺序：
1. **快速查看**：使用 `mc stat` 命令
2. **详细信息**：使用 AWS CLI `head-object` 或 `get-object-retention`
3. **批量处理**：使用 Python/Boto3 脚本导出所有元数据
4. **最简单**：运行提供的 Python 脚本，一键查看所有对象的 Object Retention
