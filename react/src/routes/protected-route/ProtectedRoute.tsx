import { Navigate, useLoaderData } from "react-router-dom";
import Core from "../../components/Core/Core";
import SocketContextComponent from "../../components/Socket/socket-context-component";
import { setCookie, validateToken } from "../../requests";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export async function loader()
{
	const res = await validateToken();
	if (res.status === 200)
	{
		const json = await res.json();
		if (json.token)
		{
			setCookie('jwt', json.token, 7 * 24 * 60 * 60 * 1000);
			setCookie("jwtExpiration", String(7 * 24 * 60 * 60 * 1000), 7 * 24 * 60 * 60 * 1000);
		}
		return true;
	}
	else
		return false;
}

export function ProtectedRoute()
{
	const isAuth = useLoaderData();
	return (
		isAuth ? (
		<>
			<ToastContainer style={{width: "260px"}}/>
			<SocketContextComponent>
				<Core />
			</SocketContextComponent>
		</>
		) : <Navigate to={"/login"} />
	)
}
