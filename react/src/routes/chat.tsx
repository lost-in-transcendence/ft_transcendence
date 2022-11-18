import { useContext } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";

export async function loader()
{
	const res = await fetch(`http://localhost:3333/users/me/modal?` + new URLSearchParams(
		{
			friends: "cfdsfsfsdf",
			bullya: "true",
			pyrobarbare: "true",
			channels: "true",
			messages: "true"
		}
	), 
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")}
	});
	if (res.status !== 200)
	{
		return redirect('/login');
	}
	return res;
}

export function Chat()
{
	const user: any = useLoaderData();
	// console.log({user});
	const auth = useContext(AuthContext);
	return (
		<div>
			<h1>Chat</h1>
		</div>
	)
}
