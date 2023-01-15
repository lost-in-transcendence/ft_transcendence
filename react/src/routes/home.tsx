import { useContext, useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router-dom";

import { backURL, getUserMeFull } from '../requests'
import SocketContext from "../components/Socket/socket-context";
import { toast } from "react-toastify";
import { Spinner } from "../components/Spinner/Spinner";
import { UserAvatarStatus } from "../components/Avatar/UserAvatarStatus";

export async function loader()
{
	const res = await getUserMeFull();
	return res;
}

export function HomePage()
{
	const user: any = useLoaderData();
	const socketState = useContext(SocketContext).SocketState;
	const { socket } = socketState;

	return (
		<div className="home-page p-0">
			<h1>Home Page</h1>
			<UserAvatarStatus userName={user.userName} status={socketState.user.status} size={'12'} border={'border-gray-800'} className={''} />
			<button onClick={() => toast("wow so easy")}>Notify</button>
			<p>{user.userName}</p>
			<img src={`${backURL}/users/avatars/${user.userName}?time=${Date.now()}`} />
			<div>
				<h2>Socket IO information:</h2>
				<p>
					Socket ID: <strong>{socketState.socket?.id}</strong><br />
				</p>
			</div>
			<span>ok</span>
			<span>okkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhuio    </span>
			<Spinner />
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
			<p>lol</p>
		</div>
	);
}
