#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全面检查 RustFS 对象的 Object Lock 信息
尝试所有可能的 API 调用
"""

import boto3
from botocore.exceptions import ClientError

# 连接到 RustFS
s3 = boto3.client(
    's3',
    endpoint_url='http://192.168.109.66:30900',
    aws_access_key_id='rustfsadmin',
    aws_secret_access_key='rustfsadmin',
    region_name='us-east-1'
)

print("=" * 80)
print("全面检查 RustFS ywmast 桶的对象 Object Lock 信息")
print("=" * 80)

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

            print(f"\n{'='*80}")
            print(f"对象: {key}")
            print(f"大小: {size} bytes")
            print(f"最后修改: {last_modified}")

            # 方法1: 使用 get_object_retention
            print(f"\n--- 方法1: get_object_retention API ---")
            try:
                retention = s3.get_object_retention(Bucket='ywmast', Key=key)
                print(f"完整响应: {retention}")
                if 'Retention' in retention and retention['Retention']:
                    ret = retention['Retention']
                    print(f"  Mode: {ret.get('Mode', 'N/A')}")
                    print(f"  RetainUntilDate: {ret.get('RetainUntilDate', 'N/A')}")
                else:
                    print("  无 Retention 数据")
            except ClientError as e:
                print(f"  错误: {e.response['Error']['Code']} - {e.response['Error']['Message']}")
            except Exception as e:
                print(f"  异常: {e}")

            # 方法2: 使用 head_object
            print(f"\n--- 方法2: head_object API ---")
            try:
                head = s3.head_object(Bucket='ywmast', Key=key)
                print(f"完整响应键: {list(head.keys())}")

                # 检查所有可能的 Object Lock 相关字段
                ol_fields = ['ObjectLockRetainUntilDate', 'ObjectLockMode',
                           'ObjectLockLegalHoldStatus', 'ObjectLockEnabled']
                found_any = False
                for field in ol_fields:
                    if field in head:
                        print(f"  {field}: {head[field]}")
                        found_any = True

                if not found_any:
                    print("  未找到任何 Object Lock 字段")

                # 显示完整的响应内容（除了 ResponseMetadata）
                print(f"\n  所有头字段:")
                for k, v in head.items():
                    if k != 'ResponseMetadata':
                        print(f"    {k}: {v}")
            except Exception as e:
                print(f"  异常: {e}")

            # 方法3: 使用 get_object (获取完整对象信息，不下载内容)
            print(f"\n--- 方法3: get_object API (只取元数据) ---")
            try:
                obj_info = s3.get_object(Bucket='ywmast', Key=key)
                print(f"完整响应键: {list(obj_info.keys())}")

                ol_fields = ['ObjectLockRetainUntilDate', 'ObjectLockMode',
                           'ObjectLockLegalHoldStatus', 'ObjectLockEnabled']
                found_any = False
                for field in ol_fields:
                    if field in obj_info:
                        print(f"  {field}: {obj_info[field]}")
                        found_any = True

                if not found_any:
                    print("  未找到任何 Object Lock 字段")
            except Exception as e:
                print(f"  异常: {e}")

except Exception as e:
    print(f"列出对象失败: {e}")
