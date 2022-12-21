import { useContext } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";
import { backURL, getUserMeFull } from '../requests'
import SocketContext from "../components/Socket/socket-context";
import { toast } from "react-toastify";

export async function loader()
{
	const res = await getUserMeFull();
	return res;
}

export function HomePage()
{
	const user: any = useLoaderData();
	const socketState = useContext(SocketContext).SocketState;
	const { socket} = socketState;

	// if (socket)
	// 	console.log(socket, {socket});
	// console.info({user});
	return (
		<div className="home-page">
			<h1>Home Page</h1>
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
			<span>okkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidhokkodwjqoidjwqiodjoiwqjdoiwqhduihwqodhwquidh</span>
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
