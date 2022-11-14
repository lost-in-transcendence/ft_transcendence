import { useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './App.css'
// import '../src/components/Core.css'

import { Chat, loader as chatLoader } from './routes/chat'
import { Game, loader as gameLoader } from './routes/game'
import { HomePage, loader as homepageLoader } from './routes/home'
import { LeaderBoard, loader as leaderboardLoader} from './routes/leaderboard'
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
			element: <ProtectedRoute />,
			children:
			[
				// {
				// 	path: '/home',
				// 	element: <HomePage />,
				// },		
				{
					path: '/home',
					element: <HomePage />,
					loader: homepageLoader,
				},
				{
					path: '/profile',
					element: <Profile />,
					loader: profileLoader,
				},
				{
					path: '/game',
					element: <Game />,
					loader: gameLoader,
				},
				{
					path: "/chat",
					element: <Chat />,
					loader: chatLoader,
				},
				{
					path: '/leaderboard',
					element: <LeaderBoard />,
					loader: leaderboardLoader,
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
