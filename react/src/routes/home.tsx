import { useContext } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";
import { getUserMeFull } from '../requests'

export async function loader()
{
	const res = await getUserMeFull();
	return res;
}

export function HomePage()
{
	const user: any = useLoaderData();
	return (
		<div className="home-page">
			<h1>Home Page</h1>
			<p>{user.userName}</p>
			<img src={user.avatar} />
		</div>
	);
}