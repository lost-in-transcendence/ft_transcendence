import { useEffect, useState } from "react";
import { backURL } from "../../../requests";
import { ContextMenuData, Member } from "../dto";
import { ContextMenu } from "./ContextMenu";

export function MemberList({ members, status }: { members: Member[], status: 'ONLINE' | 'OFFLINE' })
{
	const [display, setDisplay] = useState<ContextMenuData | undefined>(undefined);

	useEffect(() =>
	{
		const handleClick = () => setDisplay(undefined);
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
			{
				display &&
				<ContextMenu x={display.x} y={display.y} userName={display.userName} targetId={display.targetId} />
			}
			<h3 className={"ml-2 mt-2 text-zinc-400"}>{status}</h3>
			<ul>
				{
					members.map((u: Member, i) =>
					{
						const user = u.user;
						return (
							<div key={i}>
								<span
									onContextMenu={(e) =>
									{
										e.preventDefault();
										setDisplay({
											x: e.pageX,
											y: e.pageY,
											userName: user.userName,
											targetId: user.id
										});
									}}
									className="flex rounded items-center ml-2 mr-2 hover:bg-zinc-400 cursor-pointer"
								>
									<img
										className="float-left rounded-full h-10 w-10 inline mt-3 mb-2 mr-2"
										src={`${backURL}/users/avatars/${user.userName
											}?time=${Date.now()}`}
									/>
									<div className="flex flex-col justify-center items-center">
										<span> {user.userName} </span>
										<span>{u.role}</span>
										{/* <span>{user.gameStatus}</span> */}
										<br />
										<br />
									</div>
								</span>
							</div>
						);
					})
				}
			</ul>
		</>
	)
}
