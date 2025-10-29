import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const buildInfo = {
    version: Date.now().toString(),
    buildTime: new Date().toISOString(),
    nodeVersion: process.version,
}

const outputPath = join(__dirname, '..', 'public', 'build-info.json')

writeFileSync(outputPath, JSON.stringify(buildInfo, null, 2), 'utf-8')

console.log('✓ Generated build-info.json:', buildInfo)
