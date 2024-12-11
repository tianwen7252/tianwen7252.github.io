import fs from 'node:fs'
import * as prettier from 'prettier'

export async function main() {
  const packageJson = fs.readFileSync('package.json', 'utf-8')
  const manifest = fs.readFileSync('public/manifest.json', 'utf-8')
  const packageJsonData = JSON.parse(packageJson)
  const manifestData = JSON.parse(manifest)
  manifestData.start_url = `.?v=${packageJsonData.version}`
  const content = await prettier.format(JSON.stringify(manifestData), {
    parser: 'json',
    ...JSON.parse(fs.readFileSync('.prettierrc', 'utf-8')),
  })
  fs.writeFileSync('public/manifest.json', content)
}

main()
