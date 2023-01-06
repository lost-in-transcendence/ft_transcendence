import { User } from "../../../dto/users.dto";
import { backURL } from "../../../requests";

export function ChatRightBar({ className, users }: { className?: string, users: any[] }) {
	return (
		<div className={className}>
			<div className="bg-zinc-700 w-60 overflow-hidden break-words">
				<h3 className={"ml-2 mt-2 text-zinc-400"}>
					ONLINE
				</h3>
				<ul>
					{
						users.map((u: any, i) => {
							const user = u.user;
							if (user.status === 'ONLINE')
								return (
									<li
										key={i}>
										<span className='flex items-center ml-2'>
											<img className="float-left rounded-full h-10 w-10 inline mt-3 mb-2 mr-2"
												src={`${backURL}/users/avatars/${user.userName}?time=${Date.now()}`} />
											<div className="flex flex-col justify-center items-center">
												<span> {user.userName} </span>
												<span>{u.role}</span>
												<br />
												<br />
											</div>
										</span>
									</li>
								)
						})
					}
				</ul>
				<li className={"mt-5 ml-2 text-zinc-400"}>
					OFFLINE
				</li>
				<ul>
					{
						users.map((u: any, i) => {
							const user = u.user;
							if (user.status === 'OFFLINE')
								return (
									<div>
										<span key={i}
											className='overflow-x-hidden'>
											<img className="float-left rounded-full h-10 w-10 inline mt-3 mb-2 mr-2"
												src={`${backURL}/users/avatars/${user.userName}?time=${Date.now()}`} />
											<span className={"flex mt-5 "}> {user.userName} </span>
											<span>{u.role}</span>
											<br />
											<br />
										</span>
									</div>
								)
						})
					}
				</ul>
			</div>
		</div>

	)
}