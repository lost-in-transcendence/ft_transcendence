import { useNavigate } from "react-router-dom";
import { BsFillTrophyFill as Trophy } from "react-icons/bs";

import { avatarPlaceholder } from "../../../assets";
import { PlayStats } from "../../dto/game.dto";
import { backURL } from "../../requests";

export function Podium({ number, player }: { number: number, player: PlayStats | undefined })
{
	const navigate = useNavigate();
	let imageMargin: number = 0;
	let divBg: string = ''
	let trophyColor: string = '';
	let textColor: string = '';
	let border: string = '';
	if (number === 1)
	{
		imageMargin = 5;
		trophyColor = textColor = 'text-yellow-600'
		border = 'border-l-[3px] border-r-[3px]'
	}
	else if (number === 2)
	{
		imageMargin = 40;
		trophyColor = textColor = 'text-zinc-600'
		border = 'border-l-[3px]'
	}
	else if (number === 3)
	{
		imageMargin = 60;
		trophyColor = textColor = 'text-yellow-900'
		border = 'border-r-[3px]'
	}
	divBg = 'bg-gray-300'
	let imgSrc: string = '';
	if (!player)
		imgSrc = avatarPlaceholder
	else
		imgSrc = `${backURL}/users/avatars/${player.user.userName}`
	let userName: string = ''

	if (!player || !player.user.userName)
		userName = "No one :'(";
	else
	{
		userName = player.user.userName.length > 12 ? player.user.userName.slice(0, 12) + "..." : player.user.userName;
	}
	const onClick = player ? () => { navigate(`/profile/view/${player?.user.userName}`) } : () => { };

	return (
		<div className={`flex-1 flex flex-col text-center ${player ? 'cursor-pointer' : ''} bg-gray-800`}
			onClick={onClick}>
			<div className="mb-[5px]" style={{ marginTop: imageMargin + 'px' }}>
				<img className="w-[80px] rounded-full m-auto" src={imgSrc} />
			</div>
			<div className={`${divBg} flex flex-col justify-between items-center w-full h-full border-y-[3px] ${border} border-yellow-600 rounded-sm text-xl ${textColor} `} >
				<p className="text-4xl pt-2">{number}</p>
				<p className="text-2xl pb-[5px]">{userName}</p>
				<Trophy className={` ${trophyColor} mb-2`} size={50} />
			</div>
		</div>
	)
}
