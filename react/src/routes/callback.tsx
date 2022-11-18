import { useContext } from "react";
import { Navigate, redirect, useLoaderData, useRouteLoaderData } from "react-router-dom"
import { AuthContext } from "../auth/AuthContext";

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
		if (res.status !== 200)
		{
			console.log("there was an error");
			window.opener.postMessage("error", "*");
			window.close();
		}
		else
		{
			// const json = await res.json();
			// console.log(res);
			// window.opener.postMessage("success", "*");
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
		return(
			<Navigate to='/login/twofa'/>
		)
	}
	else
	{
		// window.opener.postMessage("success", "*");
		window.close();
	}
	// const auth = useContext(AuthContext);
	// if (something === "ok")
	// {
	// 	auth.setIsAuth(true);
	// }
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