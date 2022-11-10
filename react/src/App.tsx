import { useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './App.css'
// import '../src/components/Core.css'

import { Chat } from './routes/chat'
import { Game } from './routes/game'
import { HomePage, loader as homepageLoader } from './routes/home'
import { LeaderBoard } from './routes/leaderboard'
import { Login } from './routes/login'
import { Profile, loader as profileLoader} from './routes/profile'
import { ProtectedRoute } from './routes/protected-route/ProtectedRoute'
import { WelcomePage } from './routes/welcome'

const router = createBrowserRouter(
	[
		{
			path: "/",
			element: <WelcomePage />
		},
		{
			path: "/login",
			element: <Login />
		},
		{
			path: '/home',
			element: <HomePage />,
			loader: homepageLoader,
		},
		{
			element: <ProtectedRoute />,
			children:
			[
				// {
				// 	path: '/home',
				// 	element: <HomePage />,
				// },
				{
					path: '/profile',
					element: <Profile />,
					loader: profileLoader,
				},
				{
					path: '/game',
					element: <Game />
				},
				{
					path: "/chat",
					element: <Chat />
				},
				{
					path: '/leaderboard',
					element: <LeaderBoard />
				}
			]
		}
	])

function App() {
	return (
		<div className='app'>
			<RouterProvider router={router} />
		</div>
	)
}

export default App
