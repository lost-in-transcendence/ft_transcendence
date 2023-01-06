import { useNavigate } from "react-router-dom";

export function ContextMenu({
	x,
	y,
	userName,
}: {
	x: number;
	y: number;
	userName: string;
})
{
	const navigate = useNavigate();

	console.log("Rendering contextMenu");
	console.log("x : " + x);
	console.log("y : " + y);

	function goToProfile(userName: string)
	{
		navigate(`/profile/view/${userName}`);
	}

	const liClassName: string =
		"hover:bg-indigo-600 rounded cursor-pointer text-white";

	return (
		<ul
			className={`list-none w-48 rounded p-2 bg-zinc-800 fixed`}
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
			<li className={liClassName}>Invite to play</li>
			<li className={liClassName}>[conditional friend]</li>
			<li className={liClassName}>Invite to channel</li>
			<li className={liClassName}>Mute</li>
		</ul>
	);
}
