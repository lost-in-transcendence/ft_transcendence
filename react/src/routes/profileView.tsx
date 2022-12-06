
import { useLoaderData } from "react-router-dom";
import { backURL } from "../requests/constants";
import './styles/profile.css'
import { getUserModal } from "../requests/users.requests";

export async function loader({params} : any) {
	const res = getUserModal(params.userName, new URLSearchParams({'playStats': 'true', 'matchHistory': 'true'}));
	return (res);
}

export function ProfileView() {
	const user: any = useLoaderData();
	const playerStats = user.playStats;

	return (
		<div>
			<div className="profilePage">
				<div className="profileTitle">
					<div className="profileImg">
						<img src={`${backURL}/users/avatars/${user.userName}?time=${Date.now()}`} />
					</div>
					<div className="profileInfo">
						<h3>{user.userName}</h3>
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
									<p>Something went wrong ! <br /> Check with the owner of this awesome webapp</p>
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
		</div>
	)
}
