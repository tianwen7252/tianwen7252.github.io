import React, { lazy, memo, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

import Home from '../Home'
import Keyboard from '../Keyboard'

// dynamic components
const lazyLoad = (
  loader: () => Promise<{
    default: React.ComponentType<any>
  }>,
) => {
  const Component = lazy(loader)
  return <Suspense>{<Component />}</Suspense>
}

export const Root: React.FC<{}> = memo(() => {
  const keyboardElement = <Keyboard />
  return (
    <Routes>
      <Route element={<Home />}>
        <Route path="/" element={keyboardElement} />
        <Route path="order" element={keyboardElement} />
        <Route
          path="order-list"
          // this is a bug not working in react-router 6
          // lazy={async () => {
          //   console.log('??????')
          //   const { OrderList } = await import('../OrderList')
          //   return { element: <OrderList /> }
          // }}
          element={lazyLoad(() => import('../OrderList'))}
        />
        <Route path="login" element={<>Login</>} />
      </Route>
    </Routes>
  )
})

export default Root
