import { useContext, useEffect, useState } from "react";
import { Navigate, useLoaderData } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import Core from "../../components/Core/Core";
import { validateToken } from "../../requests/auth.requests";
import { getCookie } from "../../requests/cookies";

export async function loader()
{
	const res = await validateToken();
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