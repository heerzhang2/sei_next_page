#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查 RustFS 对象的完整元数据（包括 Object Retention 和自定义 Metadata）
"""

import boto3

# 连接到 RustFS
s3 = boto3.client(
    's3',
    endpoint_url='http://192.168.109.66:30900',
    aws_access_key_id='rustfsadmin',
    aws_secret_access_key='rustfsadmin',
    region_name='us-east-1'
)

print("=" * 60)
print("检查 RustFS ywmast 桶的对象元数据")
print("=" * 60)

# 列出所有对象
try:
    response = s3.list_objects_v2(Bucket='ywmast')
    objects = response.get('Contents', [])

    if not objects:
        print("桶为空，没有对象")
    else:
        print(f"共找到 {len(objects)} 个对象\n")

        for obj in objects:
            key = obj['Key']
            size = obj['Size']
            last_modified = obj['LastModified']

            print(f"\n{'='*60}")
            print(f"对象: {key}")
            print(f"大小: {size} bytes ({size/1024:.2f} KB)")
            print(f"最后修改: {last_modified}")

            try:
                # 获取对象的 HEAD 信息（包含元数据）
                head = s3.head_object(Bucket='ywmast', Key=key)

                # 1. 显示自定义元数据（Metadata）
                if 'Metadata' in head and head['Metadata']:
                    print(f"\n自定义元数据:")
                    for meta_key, meta_value in head['Metadata'].items():
                        print(f"  {meta_key}: {meta_value}")
                else:
                    print(f"\n自定义元数据: 无")

                # 2. 显示对象锁定信息（使用 get_object_retention API）
                try:
                    retention = s3.get_object_retention(Bucket='ywmast', Key=key)
                    if 'Retention' in retention and retention['Retention']:
                        ret = retention['Retention']
                        print(f"\n对象锁定信息:")
                        print(f"  模式: {ret.get('Mode', 'N/A')}")
                        print(f"  保留到期: {ret.get('RetainUntilDate', 'N/A')}")
                    else:
                        print(f"\n对象锁定: 无")
                except Exception as e:
                    error_str = str(e)
                    if 'NoSuchObjectLockConfiguration' in error_str or 'ObjectLockConfigurationNotFoundError' in error_str:
                        print(f"\n对象锁定: 无")
                    else:
                        print(f"\n对象锁定: 检查失败 ({e})")

                # 3. 显示其他重要信息
                print(f"\n其他信息:")
                print(f"  Content-Type: {head.get('ContentType', 'N/A')}")
                print(f"  ETag: {head.get('ETag', 'N/A')}")
                print(f"  VersionId: {head.get('VersionId', 'N/A')}")

            except Exception as e:
                print(f"\n获取元数据错误: {e}")

except Exception as e:
    print(f"列出对象失败: {e}")
