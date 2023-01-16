export function NotFound()
{
	return (
		<div className="flex flex-col justify-start items-center gap-5 bg-gray-800 text-gray-300 h-screen w-screen">
			<h1 className="text-6xl font-semibold text-center p-2 m-2">Sorry !</h1>
			<img src="https://cdn.dribbble.com/users/26516/screenshots/1871645/ping-pong.gif" className="rounded-full h-52 w-52" />
			<h2 className="mt-4 text-4xl">The page you are looking for does not exists</h2>
		</div>
	)
}
