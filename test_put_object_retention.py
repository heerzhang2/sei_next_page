#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试使用 put_object_retention API 单独设置对象保留
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
print("测试使用 put_object_retention API 设置对象保留")
print("=" * 80)

# 先上传一个对象（不设置 Object Lock）
test_content = b"Test file for put_object_retention"
object_name = f"test-retention-api-{datetime.now().strftime('%Y%m%d%H%M%S')}.txt"

print(f"\n步骤1: 上传对象（不设置 Object Lock）: {object_name}")
try:
    upload_response = s3.put_object(
        Bucket=bucket_name,
        Key=object_name,
        Body=test_content,
        ContentType='text/plain',
        Metadata={
            'test': 'retention-api',
            'author': 'test-script'
        }
    )
    version_id = upload_response.get('VersionId')
    print(f"上传成功! VersionId: {version_id}")

    # 检查上传后的状态
    print("\n检查上传后是否有 Object Lock:")
    try:
        retention = s3.get_object_retention(Bucket=bucket_name, Key=object_name)
        print(f"  响应: {retention}")
    except Exception as e:
        print(f"  无 Object Lock: {e}")

    # 步骤2: 使用 put_object_retention 单独设置保留
    print(f"\n步骤2: 使用 put_object_retention 设置保留")
    retain_until = datetime.utcnow() + timedelta(days=1)
    print(f"保留到期时间: {retain_until}")

    try:
        retention_response = s3.put_object_retention(
            Bucket=bucket_name,
            Key=object_name,
            Retention={
                'Mode': 'COMPLIANCE',
                'RetainUntilDate': retain_until
            }
        )
        print(f"设置成功! 响应: {retention_response}")

        # 步骤3: 再次检查
        print(f"\n步骤3: 验证 Object Lock 是否设置成功")
        retention_check = s3.get_object_retention(Bucket=bucket_name, Key=object_name)
        print(f"完整响应: {retention_check}")
        if 'Retention' in retention_check and retention_check['Retention']:
            print(f"  ✓ 成功!")
            print(f"    Mode: {retention_check['Retention'].get('Mode')}")
            print(f"    RetainUntilDate: {retention_check['Retention'].get('RetainUntilDate')}")
        else:
            print(f"  ✗ 失败 - 仍然没有 Retention 数据")

    except Exception as e:
        print(f"设置失败: {e}")
        import traceback
        traceback.print_exc()

except Exception as e:
    print(f"\n上传失败: {e}")
    import traceback
    traceback.print_exc()

print(f"\n测试对象: {object_name}")
