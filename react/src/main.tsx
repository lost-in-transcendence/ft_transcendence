import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { Auth, AuthContext } from './auth/AuthContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  	// <React.StrictMode>
		<Auth>
			<App />
		</Auth>
	// </React.StrictMode>
)
