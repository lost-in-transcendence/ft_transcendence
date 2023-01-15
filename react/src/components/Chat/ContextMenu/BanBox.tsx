import { FormEvent, useContext, useState } from "react";
import ChatContext from "../Context/chatContext";
import { BanMemberDto, PartialUser } from "../dto";
import ContextMenuContext from "./context-menu-context";
import * as events from '../../../../shared/constants'
import { Channel } from "../../../dto/channels.dto";


export function BanBox({ onClose, channel, target, action }: { onClose: any, channel: Channel, target: PartialUser, action: 'BAN' | 'MUTE' })
{
	const { socket } = useContext(ChatContext).ChatState;

	const setContextMenu = useContext(ContextMenuContext).ContextMenuSetter;

	const [data, setData] = useState<{ time: number, timeUnit: string }>({ time: 1, timeUnit: "sec" })

	function submitForm(e: FormEvent)
	{
		e.preventDefault();
		let finalTime = data.time;

		switch (data.timeUnit)
		{
			case 'day':
				finalTime *= 24;
			case 'hour':
				finalTime *= 60;
			case 'min':
				finalTime *= 60;
			case 'sec':
				finalTime *= 1000;
				break;
			default:
				return;
		}
		const banParams: BanMemberDto = { userId: target.id, channelId: channel.id, banTime: finalTime, userName: target.userName };
		if (action === 'BAN')
			socket?.emit(events.BAN_USER, banParams);
		else
			socket?.emit(events.MUTE_USER, banParams)
		setContextMenu(undefined);
		onClose();
	}

	return (
		<>
			<h1 className="text-center mb-3" >{action === 'BAN' ? "Ban" : "Mute"} {target.userName}</h1>
			<form className="flex flex-col" onSubmit={submitForm}>
				<label className="flex flex-row justify-around items-end p-2">
					<p className="basis-0">Duration</p>
					<div className='basis-full flex flex-col items-center justify-center'>
						<p>{data.time}</p>
						<input
							className="w-11/12"
							type={"range"}
							min={1}
							max={60}
							value={data.time}
							onChange={(e) => setData({ ...data, time: parseInt(e.target.value, 10) })}
						/>

					</div>
					<select
						className="rounded shadow basis-0"
						name="time"
						value={data.timeUnit}
						onChange={(e) =>
							setData({ ...data, timeUnit: e.target.value })
						}
					>
						<option value={"sec"}>sec</option>
						<option value={"min"}>min</option>
						<option value={"hour"}>hour</option>
						<option value={"day"}>day</option>
					</select>
				</label>
				<input
					type={"submit"}
					name="Submit"
					className="bg-indigo-300 shadow border w-1/4 rounded self-center"
				/>
			</form>

		</>
	)
}
