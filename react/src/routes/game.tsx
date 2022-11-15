import { useContext } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";

export async function loader()
{
	const res = await fetch(`http://localhost:3333/users/me`, 
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")}
	});
	if (!res.ok)
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
