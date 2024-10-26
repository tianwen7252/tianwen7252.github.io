import { createContext } from 'react'

export const DefaultData = {
  product: {} as {
    commondityTypes?: RestaDB.Table.CommondityType[]
    commondities?: RestaDB.Table.Commondity[]
  },
}

export const StorageContext = createContext(DefaultData)
