import { useContext, useEffect, useState } from "react";
import { Channel } from "../../../dto/channels.dto";
import { User } from "../../../dto/users.dto";
import SocketContext from "../../Socket/socket-context";
import ChatContext from "../Context/chatContext";
import * as events from "../../../../shared/constants";
import {CheckBox} from "../../commons/CheckBox"

export function InviteBox({ channel, user, onClose }: { channel: Channel, user: User, onClose: Function })
{
	const mainSocket = useContext(SocketContext).SocketState.socket
	const chatSocket = useContext(ChatContext).ChatState.socket;

	const [friends, setFriends] = useState<{ id: string, userName: string, checked: boolean }[]>([])

	useEffect(() =>
	{
		mainSocket?.on(events.GET_FRIENDLIST, (payload: { id: string, userName: string }[]) =>
		{
			const invitables = payload.filter((p) => !channel.members.find((m) => m.user.id === p.id))
			setFriends(invitables.map((p) => ({ ...p, checked: false })));
		})
		mainSocket?.emit(events.GET_FRIENDLIST, { userId: user.id })

		return (() =>
		{
			mainSocket?.off(events.GET_FRIENDLIST);
		})
	}, [])

	function onCheck(checked: boolean, userId: string)
	{
		setFriends((prev) =>
		{
			const newArray = prev.map((p) =>
			{
				if (p.id === userId)
					return { ...p, checked: !p.checked }
				return { ...p }
			})
			return newArray
		})
	}

	function onSubmit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>)
	{
		e.preventDefault();
		const usersToInvite: string[] = [];
		for (let f of friends)
		{
			if (f.checked)
				usersToInvite.push(f.id);
		}
		if (usersToInvite.length <= 0)
		{
			onClose();
			return;
		}
		chatSocket?.emit(events.INVITE_TO_PRIVATE_CHANNEL, { usersToInvite, channelId: channel.id });
		onClose();
	}

	return (
		<div className="flex flex-col items-center justify-center">
			{
				friends.length > 0 ?
					<>
						<div className="bg-gray-400 rounded shadow-inner max-h-96 w-11/12 text-center overflow-auto p-2">
							{
								friends.map((f) =>
								{
									return (
										<div
											key={f.id}
											className="flex items-center justify-around cursor-pointer rounded hover:bg-slate-700 hover:text-gray-100"
											onClick={() => onCheck(f.checked, f.id)}
										>
											<span>{f.userName}</span>
											<CheckBox checked={f.checked} />
										</div>
									)
								})
							}

						</div>
						<button
							className="bg-indigo-300 w-24 mt-2"
							onClick={(e) => onSubmit(e)}
						>
							Invite
						</button>
					</>
				:
				<p>No friends to invite</p>
			}
		</div>
	)
}