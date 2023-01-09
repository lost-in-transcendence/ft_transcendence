import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import SocketContext from "../../Socket/socket-context";
import { ContextMenuData } from "../dto";
import * as events from '../../../../shared/constants'

export function ContextMenu({ x, y, userName, targetId }: ContextMenuData)
{
	const mainCtx = useContext(SocketContext);

	const currentUser = mainCtx.SocketState.user;
	const mainSocket = mainCtx.SocketState.socket;
	const blacklist = mainCtx.SocketState.user.blacklist;

	const isInBlacklist: boolean = blacklist?.find((u) => u.id === targetId) ? true : false;

	const navigate = useNavigate();

	function goToProfile(userName: string)
	{
		navigate(`/profile/view/${userName}`);
	}

	function blockUser()
	{
		mainSocket?.emit(events.BLOCK_USER, { userId: targetId });
	}

	function unblockUser()
	{
		mainSocket?.emit(events.UNBLOCK_USER, { userId: targetId });
	}

	const liClassName: string =
		"hover:bg-indigo-600 rounded cursor-pointer text-white";

	return (
		<ul
			className={`list-none w-48 rounded p-2 bg-zinc-800 fixed z-[250]`}
			style={{ top: `${y}px`, left: `${x}px` }}
		>
			<li
				className={liClassName}
				onClick={() =>
				{
					goToProfile(userName);
				}}
			>
				Profile
			</li>
			{
				currentUser.id !== targetId &&
				<>
					<li className={liClassName}>Invite to play</li>
					<li className={liClassName}>[conditional friend]</li>
					<li className={liClassName}>Invite to channel</li>
					{
						isInBlacklist ?
							<li
								className={liClassName}
								onClick={unblockUser}
							>
								Unblock
							</li>
							:
							<li
								className={liClassName}
								onClick={blockUser}
							>
								Block
							</li>
					}
				</>
			}
		</ul>
	);
}
