import { useNavigate } from "react-router-dom";

export function ContextMenu({ x, y, userName }: { x: number, y: number, userName: string }) {
	const navigate = useNavigate();

	function goToProfile(userName: string) {
		navigate(`/profile/view/${userName}`)
	}

	const liClassName: string = "hover:bg-zinc-400 rounded cursor-pointer"
	console.log('inside contextMenu')
	console.log(x)
	console.log(y)
	return (
		<div className={`w-32 rounded p-2 bg-zinc-800 left-[${x}px] top-[${y}px]`}>
			<li className={liClassName}
				onClick={() => { goToProfile(userName) }}>
				Profile
			</li>
			<li className={liClassName}>
				Invite
			</li>
			<li className={liClassName}>
				Mute
			</li>
		</div>
	)
}