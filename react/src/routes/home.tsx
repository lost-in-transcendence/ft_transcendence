import { useContext } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";
import { backURL, getUserMeFull } from '../requests'

export async function loader()
{
	const res = await getUserMeFull();
	if (res.status !== 200)
	{
		return redirect('/login');
	}
	return res;
}

export function HomePage()
{
	const user: any = useLoaderData();
	const auth = useContext(AuthContext);
	// const user = auth.currentUser;
	return (
		<div className="home-page">
			<h1>Home Page</h1>
			<p>{user.userName}</p>
			<img src={`${backURL}/users/avatars/${user.id}?time=${Date.now()}`} />
		</div>
	);
}