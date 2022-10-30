import { Link } from "react-router-dom";

export function WelcomePage()
{
	return (
		<div>
			<h1>Welcome to AmalGAm</h1>
			<Link to={'/login'}>Click here to Login</Link>
		</div>
	)
}
