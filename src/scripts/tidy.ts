// @ts-nocheck this file is going to be deprecated
import fs from 'node:fs'
import * as prettier from 'prettier'

// const args = process.argv.slice(2)

import { COMMODITIES } from '../constants/defaults/commondities'
import { getCommoditiesInfo } from '../libs/common'

const filePath = 'src/constants/defaults/commondities.ts'

export async function tidyCommondities(source = COMMODITIES) {
  const { data } = getCommoditiesInfo(source, true)
  const prettierrc = fs.readFileSync('.prettierrc', 'utf-8')
  const content = await prettier.format(
    `
    /* THIS DATA HAS BEEN TIDIED BY $npm run tidyCommondities */
    export const COMMODITIES = ${JSON.stringify(data)}
  `,
    {
      parser: 'babel',
      ...JSON.parse(prettierrc),
    },
  )
  fs.writeFileSync(filePath, content)
  return data
}

tidyCommondities()
