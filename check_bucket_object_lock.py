#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查 RustFS 桶的 Object Lock 配置
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

bucket_name = 'ywmast'

print("=" * 80)
print(f"检查桶 '{bucket_name}' 的 Object Lock 配置")
print("=" * 80)

# 方法1: 使用 get_object_lock_configuration 检查桶级别的 Object Lock 配置
print("\n--- 方法1: get_object_lock_configuration API ---")
try:
    lock_config = s3.get_object_lock_configuration(Bucket=bucket_name)
    print(f"完整响应: {lock_config}")

    if 'ObjectLockConfiguration' in lock_config:
        config = lock_config['ObjectLockConfiguration']
        print(f"\nObject Lock 已启用!")
        if 'ObjectLockEnabled' in config:
            print(f"  ObjectLockEnabled: {config['ObjectLockEnabled']}")
        if 'Rule' in config:
            rule = config['Rule']
            print(f"  默认规则:")
            if 'DefaultRetention' in rule:
                retention = rule['DefaultRetention']
                print(f"    模式: {retention.get('Mode', 'N/A')}")
                print(f"    保留期: {retention.get('Days', 'N/A')} 天 或 {retention.get('Years', 'N/A')} 年")
    else:
        print("未找到 ObjectLockConfiguration")
except ClientError as e:
    print(f"错误: {e.response['Error']['Code']} - {e.response['Error']['Message']}")
    if e.response['Error']['Code'] == 'ObjectLockConfigurationNotFoundError':
        print("\n  ★★★ 桶未启用 Object Lock 功能！这是问题所在！")
        print("  如果桶没有启用 Object Lock，对象级别的 Object Lock 设置将被忽略。")
except Exception as e:
    print(f"异常: {e}")

# 方法2: 检查桶的版本控制状态（Object Lock 需要桶启用版本控制）
print("\n--- 方法2: 检查桶版本控制状态 ---")
try:
    versioning = s3.get_bucket_versioning(Bucket=bucket_name)
    print(f"完整响应: {versioning}")

    status = versioning.get('Status', '未设置')
    print(f"\n版本控制状态: {status}")

    if status == 'Enabled' or status == 'Suspended':
        print("  桶已启用版本控制（这是 Object Lock 的必要条件）")
    else:
        print("  ★★★ 桶未启用版本控制！Object Lock 需要桶启用版本控制！")
except Exception as e:
    print(f"异常: {e}")

print("\n" + "=" * 80)
print("结论:")
print("=" * 80)
print("如果桶未启用 Object Lock，即使在上传时设置了 objectLockMode 和")
print("objectLockRetainUntilDate，RustFS 也不会保存这些信息。")
print("\n解决方案：")
print("1. 在 RustFS Console 中为 ywmast 桶启用 Object Lock")
print("2. 或者在创建桶时就启用 Object Lock（如果需要重新创建桶）")
print("3. 注意：启用 Object Lock 需要先启用版本控制")
