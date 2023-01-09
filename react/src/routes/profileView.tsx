// import './styles/profile.css'

import { useContext, useState } from "react";
import { useLoaderData } from "react-router-dom";

import { backURL } from "../requests/constants";
import { getUserMeModal, getUserModal } from "../requests";
import { getCookie } from "../requests";
import { addFriend, removeFriend } from "../requests/http/friends.requests";
import SocketContext from "../components/Socket/socket-context";

export async function loader({params} : any) {
	// let res = await getUserMeModal(new URLSearchParams({'friends': 'true'}));
	// const user = await res.json()
	const res = await getUserModal(params.userName, new URLSearchParams({'playStats': 'true', 'matchHistory': 'true'}));
	const profile = await res.json();
	return ({profile});
}

export function ProfileView() {
	const data: any = useLoaderData();
	const {profile} = data;
	const playerStats = profile.playStats;
	const masterSocket = useContext(SocketContext).SocketState.socket;
	const user = useContext(SocketContext).SocketState.user;
	// const [isFriends, setIsFriends] = useState(user?.friends?.find((e: any) => e.id === profile.id) ? true : false)
	// console.log(user.friends);
	const isFriends = user?.friends?.find((e: any) => e.id === profile.id) ? true : false;

	async function handleFriend()
	{
		if (isFriends)
		{
			const res = await removeFriend(profile.id);
		}
		else
		{
			const res = await addFriend(profile.id);
		}
		masterSocket?.emit('changeFriends')
		// setIsFriends(user?.friends?.find((e: any) => e.id === profile.id) ? true : false);
	}

	return (
		<div>
			<div className="profilePage">
				<div className="profileTitle">
					<div className="profileImg">
						<img src={`${backURL}/users/avatars/${profile.userName}?time=${Date.now()}`} />
					</div>
					<div className="profileInfo">
						<h3>{profile.userName}</h3>
						<p>{profile.status}</p>
						<p>{profile.gameStatus}</p>
					</div>
				</div>
				<div className="profilePong">
					<div className="profileStatsContainer">
						<h2>Stats</h2>
						<div className="profileStats">
							{
								playerStats ?
									<>
										<p>Wins : {playerStats.wins}</p>
										<p>Losses : {playerStats.losses}</p>
										<p>Rank : {playerStats.rank}</p>
										<p>Points Scored : {playerStats.points}</p>
										<p>Achievement points : {playerStats.achievement_points}</p>
									</>
									:
									<p>Something went wrong ! <br /> Check with the owner of this awesome webapp</p>
							}
						</div>
					</div>
					<div className="profileHistoryContainer">
						<h2>Match History</h2>
						{
							profile.matchHistory > 0 ?
								(
									<ul>
										<li>There is a match history</li>
									</ul>
								)
								:
								<h3>No match played yet !</h3>
						}
					</div>
				</div>
				{
					user.id !== profile.id ?
					<button className={`${isFriends ? "remove" : "add"}-friend`}onClick={handleFriend}>{isFriends ? "Remove" : "Add"} Friend</button>
					:
					<></>
				}
			</div>
		</div>
	)
}
