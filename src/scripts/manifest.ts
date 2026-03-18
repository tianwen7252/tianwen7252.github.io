/// <reference types="node" />
import fs from 'node:fs'

export function main() {
  const packageJson = fs.readFileSync('package.json', 'utf-8')
  const manifest = fs.readFileSync('public/manifest.json', 'utf-8')
  const packageJsonData = JSON.parse(packageJson)
  const manifestData = JSON.parse(manifest)
  manifestData.start_url = `.?v=${packageJsonData.version}`
  const content = JSON.stringify(manifestData, null, 2) + '\n'
  fs.writeFileSync('public/manifest.json', content)
}

main()
