import { useLoaderData } from "react-router-dom";


export function loader()
{
	return (fetch(`http://localhost:3333/users/me`, {method: 'GET'}));
}

export function HomePage()
{
	const user: any = useLoaderData();
	return (
		<div className="home-page">
			<h1>Home Page</h1>
			<p>{user}</p>
		</div>
	);
}
