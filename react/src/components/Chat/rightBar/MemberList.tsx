import { useContext, useEffect, useState } from "react";
import { FaCrown, FaAngleDoubleUp } from 'react-icons/fa'
import { BsFillMicMuteFill as MuteIcon } from 'react-icons/bs'
import { Channel } from "../../../dto/channels.dto";

import { backURL } from "../../../requests";
import { UserAvatarStatus } from "../../Avatar/UserAvatarStatus";
import { ContextMenuData, Member } from "../dto";
import { ContextMenu } from "../ContextMenu/ContextMenu";
import ContextMenuContext from "../ContextMenu/context-menu-context";

export function MemberList({ members, status, channel}: { members: Member[], status: 'ONLINE' | 'OFFLINE', channel: Channel})
{
	const setContextMenu = useContext(ContextMenuContext).ContextMenuSetter;
	useEffect(() =>
	{
		const handleClick = () => setContextMenu(undefined);
		window.addEventListener("click", handleClick);
		return () =>
		{
			window.removeEventListener("click", handleClick);
		};
	}, []);

	if (members.length <= 0)
		return <></>

	return (
		<>
			<h3 className={"ml-2 mt-2 text-zinc-400"}>{status}</h3>
			<ul>
				{
					members.map((u: Member, i) =>
					{
						const user = u.user;
						const displayName = u.user.userName.length > 7 ? u.user.userName.slice(0, 7) + '...' : user.userName;
						return (
							<li
								key={i}
								onContextMenu={(e) =>
								{
									e.preventDefault();
									setContextMenu({
										x: e.pageX,
										y: e.pageY,
										channel: channel,
										target: u.user
									});
								}}
								className="flex items-center gap-3 py-1 my-1 rounded hover:bg-zinc-500 cursor-pointer group"
							>

								<UserAvatarStatus userName={user.userName} status={user.status} size={"10"} border={"border-zinc-700"} className={"ml-1 mr-0 group"} />
								<span> {displayName} </span>
								{
									u.role === 'OWNER' &&
									<span className="text-yellow-500 " >
										<FaCrown />
									</span>
								}
								{
									u.role === 'ADMIN' &&
									<span className="text-slate-400" >
										<FaAngleDoubleUp />
									</span>
								}
								{
									u.role === 'MUTED' &&
									<span className="text-red-400">
										<MuteIcon />
									</span>
								}
								<br />
							</li>
						);
					})
				}
			</ul>
		</>
	)
}
