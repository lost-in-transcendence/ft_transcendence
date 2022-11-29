import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './App.css'
import {Callback, loader as callbackLoader} from './routes/callback'

import { Chat, loader as chatLoader } from './routes/chat'
import { ErrorPage } from './routes/error'
import { Game, loader as gameLoader } from './routes/game'
import { HomePage, loader as homepageLoader } from './routes/home'
import { LeaderBoard, loader as leaderboardLoader} from './routes/leaderboard'
import { Login } from './routes/login'
import { Profile, loader as profileLoader} from './routes/profile'
import { ProtectedRoute, loader as protectedLoader } from './routes/protected-route/ProtectedRoute'

const router = createBrowserRouter(
	[
		{
			path: "/login",
			element: <Login />
		},
		{
			path: "/login/callback",
			element: <Callback />,
			loader: callbackLoader
		},
		{
			element: <ProtectedRoute />,
			loader: protectedLoader,
			errorElement: <ErrorPage />,
			children:
			[
				{
					path: '/',
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

