import { useContext, useEffect, useState } from "react";
import { getAllUsersSelect } from "../../requests";
import { Objective } from "../../routes/game";
import { PartialUser } from "../Chat/dto";
import SocketContext from "../Socket/socket-context";
import GameSocketContext from "./Context/game-socket-context";

export function CustomGameScreen({ goBack, params }: { goBack: Function, params: URLSearchParams })
{
	// const {goBack, params} = props;
	const { socket } = useContext(GameSocketContext).GameSocketState;
	const me = useContext(SocketContext).SocketState.user;
	const masterSocket = useContext(SocketContext).SocketState.socket;

	const [customGameInfo, setCustomGameInfo] = useState({
		objective: Objective.SCORE,
		goal: 5,
		invitation: false,
		invitedUser: ''
	})
	const [gameVisibility, setGameVisibility] = useState('public');

	const [userSearchFilter, setUserSearchFilter] = useState("");
	const [userToInvite, setUserToInvite] = useState<undefined | { userName: string, id: string }>(undefined);
	const [userList, setUserList] = useState<PartialUser[]>([]);
	let filteredList = userList.filter((user: any) =>
	{
		return user.userName.includes(userSearchFilter) && user.id !== me.id;
	});

	const [showList, setShowList] = useState(false);

	useEffect(() =>
	{
		async function load()
		{
			const loadedUserList = await loadUserList();
			const action = params.get('action');
			const userName = params.get('userName');
			if (!action)
				return;
			if (action === 'invitePlayer')
			{
				if (!userName)
				{
					return;
				}
				const ret = loadedUserList.find((v: PartialUser) => { return v.userName === userName })
				if (!ret || !ret.id)
					return;
				setGameVisibility('invite')
				setUserToInvite({ userName, id: ret.id })
			}
		}
		async function loadUserList()
		{
			const res = await getAllUsersSelect(new URLSearchParams(
				{
					'id': 'true',
					'userName': 'true',
					'status': 'true'
				}
			));
			const ret = await res.json();
			setUserList(ret);
			return ret;
		}
		load();
	}, [])

	function customGameSubmit(e: any)
	{
		e.preventDefault();
		let payload;
		if (userToInvite && gameVisibility === 'invite')
		{
			payload = { ...customGameInfo, invitation: true, invitedUser: userToInvite.id };
		}
		else
		{
			payload = { ...customGameInfo, invitation: false, invitedUser: '' }
		}

		socket?.emit('createCustomGame', { ...payload });
	}
	return (
		<div className="flex flex-row gap-4 mx-auto w-full">
			<form className="flex flex-col"
				onSubmit={customGameSubmit}>
				<div className="flex flex-row gap-4 items-center mx-auto w-full">
					<p className="flex flex-col text-gray-100 text-xl bg-gray-800">Objective Type</p>
					<select className="flex flex-col text-gray-100 bg-gray-700 text-xl"
						value={customGameInfo.objective === Objective.SCORE ? 'score' : 'time'} onChange={(e) =>
						{
							let val = Objective.SCORE;
							if (e.target.value === 'score')
								val = Objective.SCORE;
							else if (e.target.value === 'time')
								val = Objective.TIME;
							setCustomGameInfo({ ...customGameInfo, objective: val })
						}}>
						<option value='score'>Score</option>
						<option value='time'>Time</option>
					</select>
				</div>

				<div className="flex flex-row gap-4 items-center mx-auto w-full">
					<p className="flex flex-col text-gray-100 text-xl bg-gray-800">Objective ({customGameInfo.objective === Objective.SCORE ? 'points' : 'minutes'})</p>
					<select className="flex flex-col text-gray-100 bg-gray-700 text-xl"
						value={customGameInfo.goal} onChange={(e) =>
						{
							setCustomGameInfo({ ...customGameInfo, goal: Number(e.target.value) })
						}}>
						<option value='3'>3</option>
						<option value='5'>5</option>
						<option value='10'>10</option>
					</select>
				</div>

				<div className="flex flex-row gap-4 items-center mx-auto w-full">
					<p className="flex flex-col text-gray-100 text-xl bg-gray-800">Game Visibility</p>
					<select className="flex flex-col text-gray-100 bg-gray-700 text-xl"
						value={gameVisibility} onChange={(e) => { setGameVisibility(e.target.value); setUserToInvite(undefined); setShowList(false); }}>
						<option value="public">Public</option>
						<option value="invite">Invite-only</option>
					</select>
				</div>

				{
					gameVisibility === 'invite' ?
						<div className="flex flex-row gap-4 items-center mx-auto w-full">
							{
								userToInvite?.userName ?
									<p className="flex flex-col text-gray-100 text-xl bg-gray-800">{`${userToInvite.userName} is set to be invited`}</p>
									:
									<></>
							}
							<button className="flex flex-row gap-4 items-center mt-2 h-12 w-auto
						text-xl text-gray-400 cursor-pointer rounded bg-gray-600
						hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
						focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
								onClick={(e) => { setShowList(true); e.preventDefault(); e.stopPropagation(); }}
							>
								Choose a player to invite
							</button>
						</div>
						: <></>
				}

				{
					gameVisibility === 'invite' ?
						showList ?
							<div className="flex flex-row gap-10 items-center mx-auto w-full">
								<input className="flex flex-row text-gray-100 text-xl my-12 bg-gray-800 border-2 border-white" type="text" placeholder="Search..." value={userSearchFilter} onChange={(e) => setUserSearchFilter(e.target.value)} />
								<ul className="flex flex-row max-height-40 gap-2">
									{
										filteredList.map((user: any) =>
										{
											return (
												<li className="flex flex-row gap-4 items-center mx-auto h-12 w-auto justify-items-center
											text-xl text-gray-400 cursor-pointer rounded bg-gray-600
											hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
											focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
													key={user.id} onClick={() => { setUserToInvite({ userName: user.userName, id: user.id }); setShowList(false) }}>{user.userName}</li>
											)
										})
									}
								</ul>
							</div>
							: <></>
						: <></>
				}
				<input className="flex flex-row gap-4 items-center mt-2 mx-auto h-12 w-auto
				text-xl text-gray-400 cursor-pointer rounded bg-gray-600 border-2 border-green-600
				hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
				focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
					type="submit" value="Submit" disabled={gameVisibility !== 'invite' ?
						false :
						userToInvite === undefined ?
							true :
							userToInvite.userName === '' ?
								true :
								false}
				/>
				<button className="flex flex-row gap-4 items-center mt-2 mx-auto h-12 w-auto
						text-xl text-gray-400 cursor-pointer rounded bg-gray-600 border-2 border-red-600
						hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
						focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
					onClick={() => goBack()}>Go Back!</button>
			</form>
		</div>
	)
}
