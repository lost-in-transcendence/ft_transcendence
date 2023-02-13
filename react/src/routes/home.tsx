import { SiNestjs, SiPostgresql, SiTailwindcss, SiSocketdotio, SiTypescript } from 'react-icons/si'
import { FaReact, FaGithubSquare as GithubIcon } from "react-icons/fa";
import { IoPrism } from "react-icons/io5";
import { validateToken } from '../requests';

export async function loader()
{
	const res = await validateToken();
	if (res.status !== 200)
		throw res;
}

export function HomePage()
{
	return (
		<div className="text-gray-300 mx-5 flex flex-col justify-between items-center h-full">
			<h1 className="text-6xl mb-6 text-center">Welcome to Lost in Transcendence !</h1>
			<div className=" text-center lg:w-[50%] md:w-[65%] sm:w-[75%] flex justify-center my-5 bg-gray-700 rounded-lg shadow p-2 mx-12">
				<div className="w-[90%]">

				<h2 className="text-2xl mb-6">
					What is this?
				</h2>
				<p className="text-left mb-4">
					Welcome to a live demo of our final assignment for 42 School of Code's Common Core: <strong>ft_transcendence</strong>!
				</p>
				<p className="text-left">
					A React and NestJS-based full-stack app written in Typescript featuring...
				</p>
				<ul className="text-left list-disc ml-[25px] mb-4">
					<li>
						A multiplayer, customizable Pong game
					</li>
					<li>
						A live chat interface, complete with channel creation and administration
					</li>
					<li>
						User profiles, friendlists, blacklists...
					</li>
					<li>
						Live rankings and a leaderboard
					</li>
					<li>
						And a bunch of other stuff!
					</li>
				</ul>
				<p className="text-left">
					If you're a fellow 42 student using a similar stack and you want some advice, feel free to hit us up!
				</p>
				<p className='text-left text-sm'>
					Message Neruko#6289 on Discord if you find any bugs please :)
				</p>
				{/* <p className="my-5 text-center bg-gray-700 rounded-lg shadow p-2 mx-12">
					This is a student project that hosts a multiplayer Pong game.
					<br />
					You will find a chat made from scratch where you will be able to create different channels, manage a friend list and invite different users.
					<br />
					
					There is an integrated 2FA system, yet not mandatory to use to website.
					<br />
					You can continue to read if you want to learn more about the stack we used to build the project.
					<br />
					Otherwise the sidebar on the left will take you where you want to be !
					<br />
					Have fun !
				</p> */}
				</div>
			</div>
			<div>
				<h2 className="text-2xl mb-2 text-center">Github repo of the project:</h2>
				<a className="text-green-600 hover:text-green-500" href="https://github.com/mchibane/ft_transcendence">https://github.com/mchibane/ft_transcendence</a>
			</div>
			<div>
				<h2 className="text-2xl my-6 text-center">Made by these four handsome men</h2>
				<div className="w-full flex justify-between lg:justify-center lg:gap-20 md:gap-12 items-center mb-2">
					<div id="acabiac">
						<a href="https://github.com/TsakBoolhak" className="flex flex-col items-center justify-center">
						<img
							src="https://cdn.intra.42.fr/users/e2f1b322c9f1290221dfbe017db50014/acabiac.jpg"
							className="rounded-full h-20 w-20"
							/>
						<div className="flex items-center gap-1">
							<GithubIcon />
							/TsakBoolhak
						</div>
						</a>
					</div>
					<div id="lebourre">
						<a href="https://github.com/LeoBourret" className="flex flex-col items-center justify-center">
						<img
							src="https://cdn.intra.42.fr/users/c20226cf5861acce40029b7b8289f748/lebourre.jpg"
							className="rounded-full h-20 w-20"
							/>
						<div className="flex items-center gap-1">
							<GithubIcon />
							/LeoBourret
						</div>
						</a>
					</div>
					<div id="mchibane" className="">
						<a href="https://github.com/mchibane" className="flex flex-col items-center justify-center">
						<img
							src="https://cdn.intra.42.fr/users/66d4ccda5644216f336433762556399a/mchibane.jpg"
							className="rounded-full h-20 w-20"
							/>
						<div className="flex items-center gap-1">
							<GithubIcon />
							/mchibane
						</div>
						</a>
					</div>
					<div id="mlebard">
						<a href="https://github.com/NeronTheTyrant" className="flex flex-col items-center justify-center">
						<img
							src="https://cdn.intra.42.fr/users/a32f34577bf8e1c2bf31b51ab85069fa/mlebard.jpg"
							className="rounded-full h-20 w-20"
							/>
						<div className="flex items-center gap-1">
							<GithubIcon />
							/NeronTheTyrant
						</div>
						</a>
					</div>
				</div>
			</div>
			<div className="w-full">
			<h2 className="text-2xl my-3 text-center">Powered by</h2>
				<ul className="flex justify-center gap-6">
					<li className="my-4">
						<h3 className="text-3xl">
							<a href="https://beta.reactjs.org/" className="w-fit flex gap-1 items-center">
								<FaReact className="mr-4 text-cyan-500 animate-spin-slow" size={40} />
							</a>
						</h3>
					</li>
					<li className="my-4">
						<h3 className="text-3xl">
							<a href="https://nestjs.com/" className="w-fit flex gap-1 items-center">
								<SiNestjs className="mr-4 text-rose-600" size={40} />
							</a>
						</h3>
					</li>
					<li className="my-4">
						<h3 className="text-3xl">
							<a href="https://www.postgresql.org/" className="w-fit flex gap-1 items-center">
								<SiPostgresql className="mr-4 text-sky-700" size={40} />
							</a>
						</h3>
					</li>
					<li className="my-4">
						<h3 className="text-3xl">
							<a href="https://www.prisma.io/" className="w-fit flex gap-1 items-center">
								<IoPrism className="mr-4 text-white" size={40} />
							</a>
						</h3>
					</li>
					<li className="my-4">
						<h3 className="text-3xl">
							<a href="https://tailwindcss.com/" className="w-fit flex gap-1 items-center">
								<SiTailwindcss className="mr-4 text-sky-400" size={40} />
							</a>
						</h3>
					</li>
					<li className="my-4">
						<h3 className="text-3xl">
							<a href="https://socket.io/" className="w-fit flex gap-1 items-center">
								<SiSocketdotio className="mr-4 text-gray-100" size={40} />
							</a>
						</h3>
					</li>
					<li className="my-4">
						<h3 className="text-3xl">
							<a href="https://www.typescriptlang.org/" className="w-fit flex gap-1 items-center">
								<SiTypescript className="mr-4 text-[#3178c6]" size={40} />
							</a>
						</h3>
					</li>
				</ul>
			</div>
		</div>
	);
}
