import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import Core from "../../components/Core/Core";

export function ProtectedRoute()
{
	const auth = useContext(AuthContext)
	return (
		auth.isLoggedIn ? (
		<>
			<Core />
		</>
		) : <Navigate to={"/login"} />
	)
}
