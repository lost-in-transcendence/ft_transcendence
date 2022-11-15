import { useContext } from "react";
import { useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";

export function loader()
{
	// return getCookie('jwt');
	// const auth = useContext(AuthContext);
	// console.log(auth.isAuth);
	return (fetch(`http://localhost:3333/users/me`, 
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")}
	}));
}

export function Game()
{
	const user: any = useLoaderData();
	// user.catch( () => {return (<Navigate to={"/login"} />)});
	// console.log(user);
	if (user.statusCode) {
		// console.log("user ds le cul");
		return (
			<Navigate to={"/login"} />
		);
	}
	const auth = useContext(AuthContext);
	return (
		<div>
			<h1>Game</h1>
		</div>
	)
}
