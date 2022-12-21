import { Navigate, useLoaderData } from "react-router-dom";
import Core from "../../components/Core/Core";
import SocketContextComponent from "../../components/Socket/socket-context-component";
import { validateToken } from "../../requests";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
			<ToastContainer />
			<SocketContextComponent>
				<Core />
			</SocketContextComponent>
		</>
		) : <Navigate to={"/login"} />
	)
}
