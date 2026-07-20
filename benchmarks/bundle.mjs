import { createReadStream, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createGzip } from 'node:zlib'
import { build } from 'vite'

const fixtureRoot = join(dirname(fileURLToPath(import.meta.url)), 'fixtures/counter')
const TARGET_KB = 12

async function gzipSize(filePath) {
  return new Promise((resolve, reject) => {
    let size = 0
    createReadStream(filePath)
      .pipe(createGzip({ level: 9 }))
      .on('data', (chunk) => {
        size += chunk.length
      })
      .on('end', () => resolve(size))
      .on('error', reject)
  })
}

function collectAssets(dir) {
  const files = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      files.push(...collectAssets(full))
    } else if (/\.(js|css|html)$/.test(name)) {
      files.push(full)
    }
  }
  return files
}

export async function runBundle() {
  await build({
    configFile: join(fixtureRoot, 'vite.config.js'),
    logLevel: 'error',
  })

  const distDir = join(fixtureRoot, 'dist')
  const assets = collectAssets(distDir)
  let totalGzip = 0
  const details = []
  for (const file of assets) {
    const gz = await gzipSize(file)
    totalGzip += gz
    details.push({
      file: file.slice(distDir.length + 1),
      gzipBytes: gz,
    })
  }

  const gzipKb = totalGzip / 1024
  return {
    name: 'bundle',
    description: 'vite-minimal counter app gzip (js/css/html)',
    gzipBytes: totalGzip,
    gzipKb,
    assets: details,
    targetGzipKb: TARGET_KB,
    targetOk: gzipKb < TARGET_KB,
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await runBundle(), null, 2))
}
