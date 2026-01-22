#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试使用 boto3 上传对象并设置 Object Lock
"""

import boto3
from datetime import datetime, timedelta

# 连接到 RustFS
s3 = boto3.client(
    's3',
    endpoint_url='http://192.168.109.66:30900',
    aws_access_key_id='rustfsadmin',
    aws_secret_access_key='rustfsadmin',
    region_name='us-east-1'
)

bucket_name = 'ywmast'

print("=" * 80)
print("测试上传对象并设置 Object Lock")
print("=" * 80)

# 创建一个简单的测试文件
test_content = b"This is a test file for Object Lock"
object_name = f"test-object-lock-{datetime.now().strftime('%Y%m%d%H%M%S')}.txt"

# 设置保留到期时间为明天
retain_until = datetime.utcnow() + timedelta(days=1)
print(f"\n上传对象: {object_name}")
print(f"保留到期时间: {retain_until}")

# 使用 boto3 上传对象并设置 Object Lock
try:
    response = s3.put_object(
        Bucket=bucket_name,
        Key=object_name,
        Body=test_content,
        ContentType='text/plain',
        ObjectLockMode='COMPLIANCE',
        ObjectLockRetainUntilDate=retain_until,
        Metadata={
            'test': 'object-lock',
            'author': 'test-script'
        }
    )
    print(f"\n上传成功!")
    print(f"响应: {response}")

    # 立即检查对象的 Object Lock 信息
    print("\n" + "=" * 80)
    print("检查刚上传的对象的 Object Lock 信息")
    print("=" * 80)

    # 方法1: get_object_retention
    print("\n--- get_object_retention ---")
    try:
        retention = s3.get_object_retention(Bucket=bucket_name, Key=object_name)
        print(f"完整响应: {retention}")
        if 'Retention' in retention and retention['Retention']:
            print(f"  ✓ 找到 Object Lock 信息!")
            print(f"    Mode: {retention['Retention'].get('Mode')}")
            print(f"    RetainUntilDate: {retention['Retention'].get('RetainUntilDate')}")
        else:
            print(f"  ✗ 无 Retention 数据")
    except Exception as e:
        print(f"  错误: {e}")

    # 方法2: head_object
    print("\n--- head_object ---")
    try:
        head = s3.head_object(Bucket=bucket_name, Key=object_name)
        print(f"响应键: {list(head.keys())}")
        if 'ObjectLockRetainUntilDate' in head:
            print(f"  ✓ ObjectLockRetainUntilDate: {head['ObjectLockRetainUntilDate']}")
        if 'ObjectLockMode' in head:
            print(f"  ✓ ObjectLockMode: {head['ObjectLockMode']}")
    except Exception as e:
        print(f"  错误: {e}")

    # 方法3: get_object
    print("\n--- get_object (仅元数据) ---")
    try:
        obj = s3.get_object(Bucket=bucket_name, Key=object_name)
        del obj['Body']  # 删除 body
        print(f"响应键: {list(obj.keys())}")
        if 'ObjectLockRetainUntilDate' in obj:
            print(f"  ✓ ObjectLockRetainUntilDate: {obj['ObjectLockRetainUntilDate']}")
        if 'ObjectLockMode' in obj:
            print(f"  ✓ ObjectLockMode: {obj['ObjectLockMode']}")
    except Exception as e:
        print(f"  错误: {e}")

    # 列出所有对象，包含刚上传的
    print("\n" + "=" * 80)
    print("列出桶中所有对象")
    print("=" * 80)
    response = s3.list_objects_v2(Bucket=bucket_name)
    for obj in response.get('Contents', []):
        print(f"  {obj['Key']} (最后修改: {obj['LastModified']})")

    print(f"\n测试对象已上传: {object_name}")
    print(f"可以使用以下命令删除: s3 rm s3://{bucket_name}/{object_name} --endpoint-url http://192.168.109.66:30900")

except Exception as e:
    print(f"\n上传失败: {e}")
    import traceback
    traceback.print_exc()
