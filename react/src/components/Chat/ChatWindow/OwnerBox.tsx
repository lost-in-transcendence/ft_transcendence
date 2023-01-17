import { useContext, useEffect, useState } from "react";
import { Channel } from "../../../dto/channels.dto";
import ChatContext from "../Context/chatContext";
import { Member } from "../dto";
import * as events from "../../../../shared/constants";

export function OwnerBox({ onClose, channel }: { onClose: any, channel: Channel })
{
	const [data, setData] = useState<{ channelId: string, channelName?: string; mode: string; password?: string; }>({ channelId: channel.id, mode: channel.mode});
	const [bannedUsers, setbannedUsers] = useState<Member[]>([]);

	const ctx = useContext(ChatContext);
	const { socket } = ctx.ChatState;

	function updateChannel(e: any)
	{
		e.preventDefault();
		ctx.ChatState.socket?.emit(events.UPDATE_CHANNEL_INFO, data);
	}

	useEffect(() =>
	{
		socket?.on(events.GET_BANNED_USERS, (payload: Member[]) =>
		{
			setbannedUsers(payload);
		})

		socket?.emit(events.GET_BANNED_USERS, { channelId: channel.id });
		return (() =>
		{
			socket?.off(events.GET_BANNED_USERS);
		})
	}, [])

	if (!channel)
	{
		onClose();
		return <></>
	}

	return (
		<>
			<h1 className="text-center mb-3" >Channel Settings</h1>
			<form className="flex flex-col" onSubmit={updateChannel}>
				<label className="flex flex-row justify-between p-2">
					<p>Channel Name</p>
					<input
						type={"text"}
						onChange={(e) => setData({ ...data, channelName: e.target.value })}
						className="basis-1/2 rounded shadow"
						defaultValue={channel.channelName}
					/>
				</label>
				<label className="flex flex-row justify-between p-2">
					<p>Mode</p>
					<select
						className="basis-1/2 rounded shadow"
						name="mode"
						defaultValue={channel.mode}
						onChange={(e) =>
							setData({ ...data, mode: e.target.value })
						}
					>
						<option value={"PUBLIC"}>Public</option>
						<option value={"PRIVATE"}>Private</option>
						<option value={"PROTECTED"}>Password protected</option>
					</select>
				</label>
				{data.mode === "PROTECTED" && (
					<label className="flex flex-row justify-between p-2">
						<p>Password</p>
						<input
							type={"text"}
							onChange={(e) => setData({ ...data, password: e.target.value })}
							className="basis-1/2 rounded shadow"
							placeholder="Password"
						/>
					</label>
				)}
				<input
					type={"submit"}
					value={'Update Channel Infos'}
					className="bg-indigo-300 shadow border rounded self-center px-2"
				/>
			</form>
			{
				(bannedUsers && bannedUsers.length > 0) ?
					<form className="flex flex-row gap-2 justify-between items-center p-2">
						<label className="basis-full">
							Banned
							<select className="ml-2 rounded shadow">
								{
									bannedUsers.map((u: Member) =>
									{
										return (
											<option key={u.user.id}>
												{u.user.userName}
											</option>
										)

									})
								}
							</select>
						</label>
						<input
							type={'submit'}
							value={'Unban'}
							className='bg-indigo-300 rounded border px-2 h-6'
						/>
					</form>
					:
					null
			}
		</>
	);
}
