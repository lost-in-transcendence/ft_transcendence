import { useContext } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";
import { getUserMeModal } from "../requests";

export async function loader()
{
	const res = await getUserMeModal(new URLSearchParams({'friends': 'true'}));
	return res;
}

export function Chat()
{
	const user: any = useLoaderData();
	const auth = useContext(AuthContext);
	return (
		<div>
			<h1>Chat</h1>
		</div>
	)
}
