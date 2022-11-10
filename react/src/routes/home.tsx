import { useLoaderData } from "react-router-dom";
import { getCookie } from "../requests/cookies"

export function loader()
{
	// return getCookie('jwt');
	return (fetch(`http://localhost:3333/users/me`, 
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")}
	}));
}

export function HomePage()
{
	const user: any = useLoaderData();
	return (
		<div className="home-page">
			<h1>Home Page</h1>
			<p>{user.userName}</p>
			<img src={user.avatar} />
		</div>
	);
}