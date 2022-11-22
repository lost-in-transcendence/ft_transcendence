import { useContext, useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";
import { toggleTwoFa } from "../requests/auth.requests"
import { frontURL } from "../requests/constants";

import './styles/profile.css'
import { getUserMeFull } from "../requests/users.requests";

function popupwindow(url: string, title: string, w: number, h: number) {
	var left = Math.round(window.screenX + (window.outerWidth - w) / 2);
	var top = Math.round(window.screenY + (window.outerHeight - h) / 2.5);
	return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
}

export async function loader() {
	const res = await getUserMeFull();
	if (res.status !== 200)
		return (redirect('/login'));
	return (res);
}

async function handleToggleTwoFa() {

	const res = await toggleTwoFa();

	if (res.status !== 200) {
		throw new Error('Wrong code!');
	}
	return res;
}

export function Profile() {
	const user: any = useLoaderData();
	const playerStats = user.playStats;
	const [status, setStatus] = useState('waiting');
	const [twoFa, setTwoFa] = useState<boolean>(user.twoFaEnabled);
	const [error, setError] = useState(null);

	async function onMessage(event: MessageEvent) 
	{
		if (status === "loading")
			return;
		let done = false;
		switch (event.data) 
		{
			case 'loading':
				{
					break;
				}
			case 'error':
				{
					done = true;
					break;
				}
			case 'success':
				{
					done = true;
					break;
				}
		}
		if (done) {
			window.removeEventListener('message', onMessage);
		}
		setStatus(event.data);
	}

	async function enableTwoFa() 
	{
		setStatus('loading')
		window.addEventListener('message', onMessage);
		const childWindow = popupwindow(`${frontURL}/login/twofa`, 'Log In', 400, 600);
		if (childWindow) 
		{
			const timerId = setInterval(async () => 
			{
				if (childWindow.closed) 
				{
					clearInterval(timerId)
					setStatus((prevState) => 
					{
						if (prevState === 'loading')
							return 'waiting';
						return prevState;
					});
				}
			}, 100)
		}
	}

	async function disableTwoFa()
	{
		try 
		{
			await handleToggleTwoFa()
			setTwoFa(false);
		}
		catch(err: any)
		{
			setError(err.message);
		}
	}

	async function handleOnClick() 
	{
		if (twoFa === true) 
		{
			disableTwoFa();
		}
		else if (twoFa === false)
		{
			enableTwoFa();
		}
	}

	useEffect(() =>
	{
		if (status === 'success')
			{
				setStatus('waiting');
				try 
				{
					handleToggleTwoFa()
					setTwoFa(true);
				}
				catch(err: any)
				{
					setError(err.message);
				}

			}
		return (() => {})
	});

	return (
		<div>
			<div className="profilePage">
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
			<>
				<button onClick={handleOnClick}>{twoFa === true ? ('Disable') : ('Enable')} 2fa</button>
				<p>status = {status}</p>
				<p>twoFa = {twoFa === true ? 'true' : 'false'}</p>
				<p>user.twoFaEnabled = {user.twoFaEnabled === true ? 'true' : 'false'}</p>
				<p>error = {error}</p>
			</>
		</div>
	)
}
