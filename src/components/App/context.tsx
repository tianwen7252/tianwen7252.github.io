import { createContext } from 'react'

const userAgent = navigator.userAgent.toLowerCase()
export const isTablet =
  /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
    userAgent,
  )

export const DefaultContextData = {
  isTablet,
}

export const AppContext = createContext(DefaultContextData)
