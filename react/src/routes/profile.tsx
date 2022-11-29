import { useContext, useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { generateTwoFa, toggleTwoFa } from "../requests/auth.requests"

import './styles/profile.css'
import { getUserMeFull } from "../requests/users.requests";
import Modal from "../components/Modal/modal";
import { TwoFa } from "../components/TwoFa/twofa";

export async function loader() {
	const res = await getUserMeFull();
	return (res);
}

async function handleToggleTwoFa() {
	try {
		const res = await toggleTwoFa();
		return res;
	}
	catch (e: any)
	{
		if (e.status !== 200)
		{
			throw new Error('Wrong code!');
		}
	}
}

export function Profile() {
	const user: any = useLoaderData();
	const playerStats = user.playStats;
	const [status, setStatus] = useState('waiting');
	const [twoFa, setTwoFa] = useState<boolean>(user.twoFaEnabled);
	const [error, setError] = useState<string | null>(null);

	const [isModalOpen, setIsModalOpen] = useState(false);

	async function onModalOpen()
	{
		const res = await generateTwoFa()
		console.log(res);
        if (res.status !== 200)
        {
			setError("Error generating OTP");
        }
        return res;
	}

	async function enableTwoFa() 
	{
		setStatus('loading');
		setIsModalOpen(true);
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
			setStatus('error');
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
					handleToggleTwoFa();
					setTwoFa(true);

				}
				catch(err: any)
				{
					setError(err.message);
					setStatus('error');
				}

			}
		return (() => {})
	}, [status]);

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
				<button onClick={handleOnClick} disabled={status === 'loading'}>{twoFa === true ? ('Disable') : ('Enable')} 2fa</button>
				<Modal isOpen={isModalOpen} onOpen={onModalOpen} onClose={() => {setIsModalOpen(false); setStatus(prevEvent => {if (prevEvent === 'loading') {return 'waiting'} return prevEvent;})}}>
					<TwoFa onSuccess={() => {setIsModalOpen(false); setStatus('success')}} />
				</Modal>
				<p>status = {status}</p>
				<p>twoFa = {twoFa === true ? 'true' : 'false'}</p>
				<p>user.twoFaEnabled = {user.twoFaEnabled === true ? 'true' : 'false'}</p>
				<p>error = {error}</p>
			</>
		</div>
	)
}
