module.exports = {
    apps: [
        {
            name: "main_proj",
            script: "server-cluster.mjs",
            instances: "max", // 或者指定数字，如 4
            exec_mode: "cluster",
            env: {
                NODE_ENV: "development",
                PORT: 3765,
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3765,
            },
            // 生产环境配置
            max_memory_restart: "1G",
            error_file: "./logs/err.log",
            out_file: "./logs/out.log",
            log_file: "./logs/combined.log",
            time: true,
            // 自动重启配置
            watch: false,
            ignore_watch: ["node_modules", "logs"],
            // 健康检查
            min_uptime: "10s",
            max_restarts: 10,
        },
    ],
}
