/// <reference types="react" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

import React, { PropsWithChildren } from 'react'

export = Resta
export as namespace Resta

declare namespace Resta {
  type IObject = GuiFW.JsonObject
  type JsonObject = GuiFW.JsonObject

  namespace Keyboard {
    interface Input {
      data: InputItem[]
      total: number
    }
    interface InputItem {
      value?: string
      type?: string
      amount?: string
      operator?: '+' | '*'
    }
  }
}
