import { useContext } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";

import './styles/profile.css'
import { getUserMeFull } from "../requests/users.requests";

export async function loader()
{
	const res = await getUserMeFull();
	if (res.status !== 200)
		return (redirect('/login'));
	return (res);
}


export function Profile()
{
	const user: any = useLoaderData();
	const playerStats = user.playStats;

	// if (user.statusCode)
	// {
	// 	console.log();
	// 	return (
	// 		<Navigate to={'/login'} />
	// 	)
	// }

	return (
		<div className="profilePage">
			{/* <h1>Profile</h1> */}
			<div className="profileTitle">
				<div className="profileImg">
					<img src={user.avatar} />
				</div>
				<div className="profileInfo">
					<h3>{user.userName}</h3>
					<p>{user.email}</p>
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
								<p>Achievement points : {playerStats.achievement_point}</p>
							</>
							:
							<p>Something went wrong ! <br/> Check with the owner of this awesome webapp</p>
						}
					</div>
				</div>
				<div className="profileHistoryContainer">
					<h2>Match History</h2>
					{
						user.matchHistory > 0 ?
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
		</div>
	)
}
