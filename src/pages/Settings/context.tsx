import { createContext } from 'react'

export const DefaultData = {
  product: {} as {
    commondityTypes?: RestaDB.Table.CommondityType[]
    commondities?: RestaDB.Table.Commondity[]
    orderTypes?: RestaDB.Table.OrderType[]
  },
}

export const contextValue = {
  storage: DefaultData,
  updateStorage: () => {},
  setInitialStorage: (keyPath: string) => {},
}

export const StorageContext = createContext(contextValue)
