import { useContext } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";
import { getUserMe } from "../requests";

export async function loader()
{
	const res = await getUserMe();
	return res;
}

export function LeaderBoard()
{
	const user: any = useLoaderData();
	const auth = useContext(AuthContext);
	return (
		<div>
			<h1>
				LEADERBOARD
			</h1>
		</div>
	)
}
