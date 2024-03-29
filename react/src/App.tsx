import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { ChatContextComponent } from './components/Chat/Context/chatContextComponent'
import { ContextMenuContextComponent } from './components/Chat/ContextMenu/ContextMenuContextComponent'
import GameSocketContextComponent from './components/Game/Context/game-socket-context-component'
import { Callback, loader as callbackLoader } from './routes/callback'
import { Chat, loader as chatLoader } from './routes/chat'
import { ErrorPage } from './routes/error'
import { Game, loader as gameLoader } from './routes/game'
import { HomePage, loader as homepageLoader} from './routes/home'
import { LeaderBoard, loader as leaderboardLoader } from './routes/leaderboard'
import { Login } from './routes/login'
import { Profile, loader as profileLoader } from './routes/profile'
import { ProfileEdit, loader as profileEditLoader, action as profileEditAction } from './routes/profileEdit'
import { ProfileView, loader as profileViewLoader } from './routes/profileView'
import { ProtectedRoute, loader as protectedLoader } from './routes/protected-route/ProtectedRoute'

const router = createBrowserRouter(
	[
		{
			path: '/',
			errorElement: <ErrorPage />,
			children:
				[
					{
						path: "/login",
						element: <Login />,
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
									path: '/profile/edit',
									element: <ProfileEdit />,
									loader: profileEditLoader,
									action: profileEditAction,
								},
								{
									path: 'profile/view/:userName',
									element: <ProfileView />,
									loader: profileViewLoader,
								},
								{
									path: '/game',
									element: <GameSocketContextComponent>
										<Game />
									</GameSocketContextComponent>,
									loader: gameLoader,
								},
								{
									path: "/chat",
									element: <ChatContextComponent>
										<ContextMenuContextComponent>
											<Chat />
										</ContextMenuContextComponent>
									</ChatContextComponent>,
									loader: chatLoader,
								},
								{
									path: '/leaderboard',
									element: <LeaderBoard />,
									loader: leaderboardLoader,
								}
							]
					}
				]
		}
	])

function App()
{
	return (
		<div className='app'>
			<RouterProvider router={router} />
		</div>
	)
}

export default App

