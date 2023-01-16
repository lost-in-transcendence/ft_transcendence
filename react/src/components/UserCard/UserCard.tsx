
import { NavLink } from "react-router-dom";
import { backURL } from "../../requests";

export function UserCard(props: {user: any})
{
	const {user} = props;

	return(
		<li key={user.id} className="no-decoration">
			<NavLink to={`/profile/view/${user.userName}`}>
				<div className="user-card flex items-center">
					<div className="user-card-avatar">
						<img className="rounded-full h-20 w-20" src={`${backURL}/users/avatars/${user.userName}?time=${Date.now()}`} />
					</div>
					<div className="user-card-name text-3xl">
						{user.userName.length > 26 ? user.userName.slice(0, 23) + "..." : user.userName}
					</div>
				</div>
			</NavLink>
		</li>
	)

}
