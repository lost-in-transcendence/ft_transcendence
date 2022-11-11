import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import Core from "../../components/Core/Core";
import { getCookie } from "../../requests/cookies";

export function ProtectedRoute()
{
	const auth = useContext(AuthContext)
	return (
		getCookie('jwt') ? (
		<>
			<Core />
		</>
		) : <Navigate to={"/login"} />
	)
}
