import { Accordeon } from "./Accordeon";
import { FaUserFriends as FriendsIcon } from 'react-icons/fa'
import { useContext } from "react";
import ChatContext from "../Chat/Context/chatContext";
import { ChannelCard } from "../Chat/Channels/ChannelCard";

export function ChatSidebar({ user }: any)
{
	const ctx = useContext(ChatContext);

	const privMsgs = ctx.ChatState.visibleChannels.filter((c) => c.mode === 'PRIVMSG');
	const joinedChans = ctx.ChatState.visibleChannels.filter((c) => (c.members?.find((m) => m.user.id === user.id)) && c.mode !== 'PRIVMSG')
	const visibleChans = ctx.ChatState.visibleChannels.filter((c) => !(c.members?.find((m) => m.user.id === user.id)) && c.mode !== 'PRIVMSG')

	console.log('loggin visible chans', {visibleChans});
	return (
		<div className="flex w-full h-screen">
			<div className="bg-gray-700 w-full h-full rounded drop-shadow-lg
						md:w-52
						text-gray-300 overflow-auto">
				<button className="flex flex-row gap-4 m-2 items-center h-12 w-11/12
							text-xl cursor-pointer rounded
							hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
							focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm">
					<FriendsIcon size='20' className="ml-3" />
					Friends
				</button>
				<button className="flex flex-row m-2 items-center h-max w-11/12 px-3
							text-xl cursor-pointer rounded
							hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
							focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm">
					New Channel
				</button>
				<hr className="border-gray-600 mb-2 w-11/12 m-auto" />
				{
					privMsgs.length > 0 &&
					<Accordeon title={'Private Messages'}>
						{
							privMsgs.map((c) => (
								<ChannelCard key={c.id} channel={c} joinable={false} />
							))
						}
					</Accordeon>
				}
				{
					joinedChans.length > 0 &&
					<Accordeon title={'Your channels'}>
						{
							joinedChans.map((c) => (
								<ChannelCard key={c.id} channel={c} joinable={false} />
							))
						}
					</Accordeon>
				}
				{
					visibleChans.length > 0 &&
					<Accordeon title={'Available channels'}>
						{
							visibleChans.map((c) => (
								<ChannelCard key={c.id} channel={c} />
							))
						}
					</Accordeon>
				}
			</div>
		</div>
	)
}
