#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查对象是否应用了桶级别的默认 Object Lock 规则
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
print("检查对象是否应用了桶级别的默认 Object Lock 规则")
print("=" * 80)

# 上传一个对象，不设置 Object Lock 参数（让桶默认规则生效）
test_content = b"Test default Object Lock from bucket config"
object_name = f"test-default-retention-{datetime.now().strftime('%Y%m%d%H%M%S')}.txt"

print(f"\n上传对象（不设置 Object Lock 参数）: {object_name}")
try:
    # 上传时不设置 ObjectLockMode 和 ObjectLockRetainUntilDate
    response = s3.put_object(
        Bucket=bucket_name,
        Key=object_name,
        Body=test_content,
        ContentType='text/plain',
        Metadata={
            'test': 'default-retention',
            'author': 'test-script'
        }
    )
    print(f"上传成功! VersionId: {response.get('VersionId')}")

    # 检查对象的 Object Lock 信息
    print("\n" + "=" * 80)
    print("检查对象的 Object Lock 信息")
    print("=" * 80)

    # 使用 get_object_retention
    print("\n--- get_object_retention ---")
    try:
        retention = s3.get_object_retention(Bucket=bucket_name, Key=object_name)
        print(f"完整响应: {retention}")
        if 'Retention' in retention and retention['Retention']:
            print(f"  ✓ 找到 Object Lock 信息!")
            print(f"    Mode: {retention['Retention'].get('Mode')}")
            print(f"    RetainUntilDate: {retention['Retention'].get('RetainUntilDate')}")
        else:
            print(f"  ✗ 无 Retention 数据（桶默认规则未生效）")
    except Exception as e:
        print(f"  错误: {e}")

    # 尝试删除对象（测试 WORM 保护是否生效）
    print("\n" + "=" * 80)
    print("尝试删除对象（测试 WORM 保护）")
    print("=" * 80)
    try:
        s3.delete_object(Bucket=bucket_name, Key=object_name)
        print("  ✗ 删除成功 - 说明 WORM 保护未生效！")
    except Exception as e:
        print(f"  ✓ 删除失败 - 说明 WORM 保护已生效!")
        print(f"    错误: {e}")

    # 恢复删除（如果删除成功，则说明对象存在）
    print(f"\n测试对象: {object_name}")

except Exception as e:
    print(f"\n上传失败: {e}")
    import traceback
    traceback.print_exc()

# 列出所有现有对象
print("\n" + "=" * 80)
print("列出桶中所有对象")
print("=" * 80)
try:
    response = s3.list_objects_v2(Bucket=bucket_name)
    objects = response.get('Contents', [])
    print(f"共 {len(objects)} 个对象:")
    for obj in objects:
        print(f"  {obj['Key']} (最后修改: {obj['LastModified']})")
except Exception as e:
    print(f"错误: {e}")
