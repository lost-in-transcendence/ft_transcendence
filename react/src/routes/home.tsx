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

export function HomePage()
{
	const user: any = useLoaderData();
	console.log(user);
	if (user.message === "Unauthorized") {
		console.log("user ds le cul");
		// return (

		// 	<Navigate to={"/login"} />
		// );
	}
	const auth = useContext(AuthContext);
	// const user = auth.currentUser;
	return (
		<div className="home-page">
			<h1>Home Page</h1>
			<p>{user.userName}</p>
			<img src={user.avatar} />
		</div>
	);
}