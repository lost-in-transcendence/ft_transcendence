import { Navigate, redirect, useLoaderData, useRouteLoaderData } from "react-router-dom"

export async function loader()
{
	if (window.opener)
	{
		window.opener.postMessage('loading', '*');
		let params = (new URL(window.location.href)).searchParams;
		const res = await fetch("http://localhost:3333/auth/login?" + params, 
		{
			method: 'GET',
			credentials: 'include',
		})
		if (res.ok === false)
		{
			console.log("there was an error");
			window.opener.postMessage("error", "*");
			window.close();
		}
		else
		{
			window.opener.postMessage("success", "*");
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
	let something = useLoaderData();
	// console.log(something);
    return (
        <>
		{/* <div>
			Bonjour
		</div>
		<p>Hey</p>
		<p>Hey</p>
		<p>Hey</p>
		<p>Hey</p>
		<p>Hey</p>
		<p>Hey</p>
		<p>Hey</p>
		<p>Hey</p>
		<p>Hey</p>
		<p>Hey</p>
		<p>Hey</p>
		<p>Hey</p> */}
		</>

    )
}