import React from 'react'
import { createRoot } from 'react-dom/client'
import App from 'src/pages/App'

createRoot(document.getElementById('root')!).render(
  // https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-double-rendering-in-development
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>,
)
