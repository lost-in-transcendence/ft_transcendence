
import { NavLink, redirect, useLoaderData, useNavigate } from "react-router-dom";
import { backURL } from "../requests/constants";
import { useContext, useEffect, useState } from "react";
import { generateTwoFa, toggleTwoFa } from "../requests/auth.requests"
import './styles/profile.css'
import { getUserMeFull } from "../requests/users.requests";
import Modal from "../components/Modal/modal";
import { TwoFa } from "../components/TwoFa/twofa";
import { UserCard } from "../components/UserCard/UserCard";

export async function loader() {
	const res = await getUserMeFull();
	return (res);
}

export function Profile() {
	const user: any = useLoaderData();
	console.log({user});
	const playerStats = user.playStats;
	const navigate = useNavigate();
	user.friends.forEach((f: any) => {
		console.log({f});
	})
	return (
		<div>
			<div className="profilePage">
				<div className="profileTitle">
					<div className="profileImg">
						<img src={`${backURL}/users/avatars/${user.userName}?time=${Date.now()}`} />
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
					<div className="flex-break"></div>
					<div className="friendListContainer">
						<h2>Friends</h2>
						{
							user.friends.length > 0 ?
							(
								<div className="overflow-y-auto">
								<ul>
									{user.friends.map((f: any) =>
									{
										return <UserCard user={f}></UserCard>
									})}
								</ul>
								</div>
							)
							:
							<h3>You have no friends :(</h3>
						}
					</div>
				</div>
			</div>
				<button onClick={() => {navigate("/profile/edit");}}>Edit Profile</button>
		</div>
	)
}
