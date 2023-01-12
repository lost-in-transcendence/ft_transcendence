import { useContext} from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { getUserMeModal } from "../requests";
import ChatContext from '../components/Chat/Context/chatContext'
import { ChatSidebar } from "../components/Menu/ChatSideBar";
import { ChatDisplay } from "../components/Chat/ChatDisplay/ChatDisplay";
import SocketContext from "../components/Socket/socket-context";
import ContextMenuContext, { ContextMenuProvider } from "../components/Chat/ContextMenu/context-menu-context";
import { ContextMenu } from "../components/Chat/ContextMenu/ContextMenu";

export async function loader()
{
	const res = await getUserMeModal(new URLSearchParams({ 'channels': 'true' }));
	if (res.status !== 200)
	{
		return redirect('/login');
	}
	const user = await res.json();
	return ({ user });
}

export function Chat()
{
	const ctx = useContext(ChatContext);
	const state = ctx.ChatState;
	const data: any = useLoaderData();
	const { user } = data;
	const contextMenu = useContext(ContextMenuContext).ContextMenuState;

	return (
		<>
		{
			contextMenu ?
			<ContextMenu
			x={contextMenu.x}
			y={contextMenu.y}
			channel={contextMenu.channel}
			target={contextMenu.target} />
			:
			<></>
			
		}
			<div className="flex flex-col md:flex-row">
				<ChatSidebar user={user} />
				<div className="text-white basis-full overflow-auto justify-self-center mr-auto bg-gray-800">
					{
						state.activeChannel ?
						<ChatDisplay currentUser={user} channel={state.activeChannel} />
						:
						<>
								<h1 className="text-5xl text-center">Friends</h1>
								<ChatFriendList />
							</>
					}
				</div>
			</div>
		</>
	)
}

export function ChatFriendList()
{
	const mainCtx = useContext(SocketContext);
	const {user} = mainCtx.SocketState;

	return (
		<ul>
			{
				user.friends?.map((v) =>
				{
					return (
						<li key={v.id}>
							<p>{v.userName}</p>
						</li>
					)
				})
			}
		</ul>
	)
}
