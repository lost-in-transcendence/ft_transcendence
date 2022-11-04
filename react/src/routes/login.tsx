import { Link, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export function Login()
{
	const auth = useContext(AuthContext);

	return (
		<div>
			<h1>Login</h1>
			{/* <Link to={"/home"}>
				<button onClick={() => auth.login()}>Login</button>
			</Link> */}
			<button onClick={() => {auth.login();}}>
				Log in
			</button>
			{/* <button */}

		</div>
	)
}
