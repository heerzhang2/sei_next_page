#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Redis 连接测试脚本
"""

import redis
import sys

def test_redis_connection(host='192.168.109.66', port=31379, password='Kh_dfg4jwq0o9f!sdUa', db=0):
    """测试 Redis 连接"""
    print("正在连接 Redis: {}:{}".format(host, port))
    print("-" * 50)

    try:
        # 创建 Redis 连接
        r = redis.Redis(
            host=host,
            port=port,
            password=password,
            db=db,
            decode_responses=True,
            socket_timeout=5
        )

        # 测试 PING
        print("1. 测试 PING 命令:")
        pong = r.ping()
        print("   响应: {}".format(pong))
        if pong:
            print("   Redis 连接正常")
        else:
            print("   Redis 连接异常")
            return False
        print()

        # 获取 Redis 信息
        print("2. 获取 Redis 服务器信息:")
        info = r.info()
        print("   Redis 版本: {}".format(info.get('redis_version')))
        print("   运行天数: {}".format(info.get('uptime_in_days')))
        print("   连接的客户端数: {}".format(info.get('connected_clients')))
        print("   内存使用: {}".format(info.get('used_memory_human')))
        print()

        # 测试 SET 和 GET
        print("3. 测试读写操作:")
        test_key = "test_connection"
        test_value = "hello from python script"
        r.set(test_key, test_value)
        print("   SET {} = '{}'".format(test_key, test_value))

        retrieved_value = r.get(test_key)
        print("   GET {} = '{}'".format(test_key, retrieved_value))

        if retrieved_value == test_value:
            print("   读写操作正常")
        else:
            print("   读写操作异常")
            return False

        # 清理测试数据
        r.delete(test_key)
        print("   删除测试键: {}".format(test_key))
        print()

        # 测试数据库大小
        print("4. 当前数据库信息:")
        db_size = r.dbsize()
        print("   当前数据库键数量: {}".format(db_size))
        print()

        print("=" * 50)
        print("所有测试通过！Redis 连接正常工作")
        print("=" * 50)
        return True

    except redis.ConnectionError as e:
        print("连接错误: {}".format(e))
        print("\n可能的原因:")
        print("  - Redis 服务未启动")
        print("  - 网络不通（检查防火墙）")
        print("  - 主机名或端口号错误")
        return False

    except redis.AuthenticationError as e:
        print("认证错误: {}".format(e))
        print("\n如果 Redis 设置了密码，需要提供密码:")
        print("  r = redis.Redis(host='...', port=..., password='your_password')")
        return False

    except Exception as e:
        print("其他错误: {}".format(e))
        return False

if __name__ == "__main__":
    # 测试集群外连接（通过 NodePort）
    print("测试方案: 集群外连接（通过 NodePort）")
    success = test_redis_connection(host='192.168.109.66', port=31379)

    # 如果失败，可以尝试集群内连接
    # print("\n测试方案: 集群内连接")
    # success = test_redis_connection(host='redis', port=6379)

    sys.exit(0 if success else 1)
