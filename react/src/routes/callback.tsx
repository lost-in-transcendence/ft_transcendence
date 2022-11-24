import { useContext } from "react";
import { Navigate, redirect, useLoaderData, useRouteLoaderData } from "react-router-dom"
import { AuthContext } from "../auth/AuthContext";
import { login } from "../requests";

export async function loader()
{
	if (window.opener)
	{
		window.opener.postMessage('loading', '*');
		let params = (new URL(window.location.href)).searchParams;
		const res = await login(params);
		if (res.status !== 200)
		{
			window.opener.postMessage("error", "*");
			window.close();
		}
		return res;
	}
	else
	{
		return redirect("/login");
	}
}

export function Callback()
{
	const something: any = useLoaderData();
	if (something.twoFaEnabled === true)
	{
		return(
			<Navigate to='/login/twofa'/>
		)
	}
	else
	{
		window.opener.postMessage('success', '*');
		window.close();
	}
    return (
        <>
		</>

    )
}

