import { useContext, useEffect, useState } from "react";
import { Navigate, useLoaderData } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import Core from "../../components/Core/Core";
import SocketContextComponent from "../../components/Socket/socket-context-component";
import { validateToken } from "../../requests";
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
			<SocketContextComponent>
				<Core />
			</SocketContextComponent>
		</>
		) : <Navigate to={"/login"} />
	)
}
