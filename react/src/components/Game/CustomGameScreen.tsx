import { useContext, useEffect, useState } from "react";
import { IoReturnDownBackSharp } from 'react-icons/io5'

import { getAllUsersSelect } from "../../requests";
import { Objective } from "../../routes/game";
import { PartialUser } from "../Chat/dto";
import { BackButton } from "../commons/BackButton";
import Modal from "../Modal/modal";
import SocketContext from "../Socket/socket-context";
import GameSocketContext from "./Context/game-socket-context";

interface IUsersList
{
	userName: string
	id: string
}

export function CustomGameScreen({ goBack, params }: { goBack: () => void, params: URLSearchParams })
{
	// const {goBack, params} = props;
	const { socket } = useContext(GameSocketContext).GameSocketState;
	const me = useContext(SocketContext).SocketState.user;
	const masterSocket = useContext(SocketContext).SocketState.socket;

	const [customGameInfo, setCustomGameInfo] = useState({
		objective: Objective.SCORE,
		goal: 5,
		theme: 'classic',
		invitation: false,
		invitedUser: ''
	})
	const [gameVisibility, setGameVisibility] = useState('public');

	const [userSearchFilter, setUserSearchFilter] = useState("");
	const [userToInvite, setUserToInvite] = useState<undefined | IUsersList>(undefined);
	const [userList, setUserList] = useState<PartialUser[]>([]);

	const [modalIsOpen, setModalIsOpen] = useState(false);

	let filteredList = userList.filter((user: IUsersList) =>
	{
		return user.userName.includes(userSearchFilter) && user.id !== me.id;
	});

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
		<div className="w-full text-gray-300 bg-inherit">
			<form
				className=""
				onSubmit={customGameSubmit}
			>
				<div className="flex flex-col items-center p-2 w-96 gap-2 text-2xl bg-gray-700 rounded-lg shadow m-3">
					<h1 className="text-3xl">Game Options</h1>
					<hr className="border-gray-600 w-full" />
					<div className="flex flex-col py-2 px-1 w-full gap-10 items-start justify-start bg-gray-700">
						<div className="flex justify-between w-full items-center gap-2">
							<p className="">Theme</p>
							<select className="rounded shadow bg-gray-600 text-lg p-1 cursor-pointer"
								value={customGameInfo.theme}
								onChange={(e) =>
								{
									setCustomGameInfo({ ...customGameInfo, theme: e.target.value })
								}}
							>
								<option value='classic'>Classic</option>
								<option value='camouflage'>Camouflage</option>
								<option value='rolandGarros'>Roland Garros</option>
							</select>
						</div>
						<div className="flex justify-between w-full items-center gap-2">
							<p className="">Objective</p>
							<select className="rounded shadow bg-gray-600 text-lg p-1 cursor-pointer"
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

						<div className="flex justify-between w-full items-center gap-2">
							<p className="">{customGameInfo.objective === Objective.SCORE ? 'Points' : 'Time (min)'}</p>
							<select className="rounded shadow bg-gray-600 text-lg p-1 cursor-pointer"
								value={customGameInfo.goal} onChange={(e) =>
								{
									setCustomGameInfo({ ...customGameInfo, goal: Number(e.target.value) })
								}}>
								<option value='3'>3</option>
								<option value='5'>5</option>
								<option value='10'>10</option>
							</select>
						</div>

						<div className="flex justify-between w-full items-center gap-2">
							<p className="text-xl">
								Matchmaking
							</p>
							<select className="rounded w-fit shadow bg-gray-600 text-lg p-1 cursor-pointer"
								value={gameVisibility} onChange={(e) => { setGameVisibility(e.target.value); setUserToInvite(undefined); }}>
								<option value="public">Random</option>
								<option value="invite">Challenge a Player</option>
							</select>
						</div>
						{
							gameVisibility === 'invite' && userToInvite !== undefined ?
								<div className="flex justify-between w-full items-center gap-2">
									<p className="text-xl">
										Opponnent
									</p>
									<p className="rounded w-fit shadow bg-gray-600 text-lg px-2 py-1 truncate">
										{userToInvite.userName}
									</p>
								</div>
								:
								null
						}
						{
							gameVisibility === 'invite' ?
								<div className="flex w-full justify-center">
									<Modal onClose={() => setModalIsOpen(false)} isOpen={modalIsOpen}>
										<div className="flex flex-col justify-center items-center w-full gap-2 p-1 m-1">
											<h2 className="text-xl">Select player</h2>
											<input
												className="rounded px-1 w-72"
												type="text" placeholder="Search..."
												value={userSearchFilter}
												onChange={(e) => setUserSearchFilter(e.target.value)}
											/>
											<ul className="w-72 max-h-96 overflow-auto bg-gray-400 rounded shadow flex flex-col gap-2 items-center py-1">
												{
													filteredList.length > 0 ?
														filteredList.map((user: IUsersList) =>
														{
															return (
																<li className="hover:bg-slate-700 w-64 px-1 hover:text-gray-100 text-center cursor-pointer rounded"
																	key={user.id} onClick={() => { setModalIsOpen(false); setUserToInvite({ userName: user.userName, id: user.id }); }}>{user.userName}</li>
															)
														})
														:
														<li className="text-indigo-700">
															Cannot find player
														</li>
												}
											</ul>
										</div>
									</Modal>
									<button className="bg-indigo-500 rounded shadow p-1 text-lg"
										onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalIsOpen(true) }}
									>
										{
											gameVisibility === 'invite' && userToInvite !== undefined ?
												'Change '
												:
												'Choose your '
										}
										opponent !
									</button>
								</div>
								: <></>
						}
					</div>
					<div className="flex justify-between w-full">
						<BackButton goBack={goBack} />
						<input
							className={` rounded shadow px-2  ${gameVisibility === 'invite' && !userToInvite ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer'}`}
							type="submit"
							value="Play !"
							disabled=
							{
								gameVisibility !== 'invite' ?
									false :
									userToInvite === undefined ?
										true :
										userToInvite.userName === '' ?
											true :
											false
							}
						/>
					</div>
				</div>
			</form>
		</div>
	)
}
