import { redirect, useLoaderData } from "react-router-dom";
import { getUserMe } from "../requests";

export async function loader()
{
	const res = await getUserMe();
	return res;
}

export function LeaderBoard()
{
	const user: any = useLoaderData();
	return (
		<div>
			<h1>
				LEADERBOARD
			</h1>
		</div>
	)
}
