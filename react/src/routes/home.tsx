import { useContext } from "react";
import { useLoaderData } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"

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
	const auth = useContext(AuthContext);
	// const user = auth.currentUser;
	return (
		<div className="home-page">
			<h1>Home Page</h1>
			<p>{user.userName}</p>
			<img src={user.avatar} />
			<div>
				<button onClick={() => {auth.logout()}}>Logout</button>
			</div>
		</div>
	);
}