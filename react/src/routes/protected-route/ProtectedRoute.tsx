import { useContext, useEffect, useState } from "react";
import { Navigate, useLoaderData } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import Core from "../../components/Core/Core";
import { getCookie } from "../../requests/cookies";

export async function loader()
{
	const res = await fetch('http://localhost:3333/auth/validate',
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")},
		credentials: 'include',
	})
	if (res.status === 200)
		return true;
	else
		return false;
}

export function ProtectedRoute()
{
	const isAuth = useLoaderData();
	return (
		isAuth ? (
		<>
			<Core />
		</>
		) : <Navigate to={"/login"} />
	)
}




// useEffect(() =>
	// {
	// 	const refreshToken = async () =>
	// 	{
	// 		const token = (await fetch(`http://localhost:3333/auth/refresh`, 
	// 		{
	// 			method: 'GET',
	// 			headers: {"Authorization": "Bearer " + getCookie("jwt")},
	// 			credentials: 'include',
	// 		})
	// 		);
	// 		if (token.ok && token.status >= 200 && token.status <= 299)
	// 		{
	// 			setIsAuth((prevState: boolean) => {console.log(`prevState: ${prevState}, newState: ${true}`); return true});
	// 		}
	// 		else
	// 		{
	// 			setIsAuth((prevState: boolean) => {console.log(`prevState: ${prevState}, newState: ${false}`); return false});
	// 		}
	// 	}
	// 	//check le back
	// 	console.log('lol');
	// 	const jwtCookie = getCookie('jwt');
	// 	// if (!jwtCookie)
	// 	// 	return false;
	// 	//verif validite du token
	
	// 	const expireCookie = getCookie('jwtExpiration');
	// 	const timeElapsed = Number(expireCookie) - Date.now();
	// 	console.log(`now : ${Date.now()} expire : ${Number(expireCookie)} elapsed : ${timeElapsed}`);
	// 	if ( timeElapsed < /*24 * 60 * 60 * */  (4 * 60 * 1000)  + (50 * 1000) && timeElapsed > 0) {
	// 		refreshToken();
	// 	}
	// 	else {
	// 		console.log("ici");
	// 		setIsAuth((prevState: boolean) => {console.log(`prevState: ${prevState}, newState: ${true}`); return true});
	// 	}
	// })