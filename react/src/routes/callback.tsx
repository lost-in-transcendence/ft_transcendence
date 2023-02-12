import { useContext } from "react";
import { Navigate, redirect, useLoaderData, useRouteLoaderData } from "react-router-dom"
import { Spinner } from "../components/Spinner/Spinner";
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
			console.log("error");
			// window.close();
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
		window.opener.postMessage('next', '*')
		console.log("next");
		// window.close();
	}
	else if (something.newUser === true)
	{
		window.opener.postMessage('newUser', '*')
		console.log("newUser");
		// window.close();
	}
	else
	{
		window.opener.postMessage('success', '*');
		console.log("success");
		// window.close();
	}

	return (
		<div className="flex flex-col justify-center items-center h-screen w-screen bg-gray-900">
			<h1 className="text-indigo-300 mb-2 text-3xl">Loading ...</h1>
			<Spinner />
		</div>
	)
}

