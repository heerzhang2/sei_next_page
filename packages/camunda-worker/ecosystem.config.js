module.exports = {
apps: [{
        name: 'pdf-uploader',
        script: 'server.js',
        cwd: '/opt/myapp',
        watch: false,
        autorestart: true,
        max_memory_restart: '1G',
        env: {
        NODE_ENV: 'production'
    }
    }]
}
