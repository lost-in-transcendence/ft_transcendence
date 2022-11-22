import { useContext } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";
import { getUserMe } from "../requests";

export async function loader()
{
	const res = await getUserMe()
	if (res.status !== 200)
	{
		return redirect('/login');
	}
	return res;
}

export function Game()
{

	const user: any = useLoaderData();
	const auth = useContext(AuthContext);
	return (
		<div>
			<h1>Game</h1>
		</div>
	)
}
