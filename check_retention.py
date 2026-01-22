#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查 RustFS 对象的 Object Retention（对象锁定）
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
print("检查 RustFS ywmast 桶的对象 Object Retention")
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

            print(f"\n对象: {key}")
            print(f"大小: {size} bytes")
            print(f"最后修改: {last_modified}")

            try:
                # 获取对象保留信息
                retention = s3.get_object_retention(Bucket='ywmast', Key=key)
                print(f"完整响应: {retention}")

                # 检查响应结构
                if 'Retention' in retention:
                    ret_data = retention['Retention']
                    if 'Mode' in ret_data:
                        mode = ret_data['Mode']
                        print(f"对象锁定模式: {mode}")
                    if 'RetainUntilDate' in ret_data:
                        retain_until = ret_data['RetainUntilDate']
                        print(f"保留到期: {retain_until}")
                else:
                    print("对象锁定: 无配置")

            except Exception as e:
                error_str = str(e)
                if 'NoSuchObjectLockConfiguration' in error_str or 'ObjectLockConfigurationNotFoundError' in error_str or 'InvalidRequest' in error_str:
                    print("对象锁定: 无配置")
                else:
                    print(f"获取锁定信息错误: {e}")

except Exception as e:
    print(f"列出对象失败: {e}")
