import React, { useContext, useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { SiNestjs, SiPostgresql, SiTailwindcss, SiSocketdotio } from 'react-icons/si'
import { FaReact, FaGithubSquare as GithubIcon } from "react-icons/fa";
import { IoPrism } from "react-icons/io5";

import { backURL, getUserMeFull } from '../requests'
import SocketContext from "../components/Socket/socket-context";

export async function loader()
{
	const res = await getUserMeFull();
	return res;
}

export function HomePage()
{
	const user: any = useLoaderData();
	const socketState = useContext(SocketContext).SocketState;
	const { socket } = socketState;

	return (
		<div className="text-gray-300 mx-5 flex flex-col justify-between items-center h-full">
			<h1 className="text-6xl text-center">Welcome to Lost in Transcendence !</h1>
			<div className="basis-full flex items-center">
				<p className="my-5 text-center bg-gray-700 rounded-lg shadow p-2 mx-12">
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
				</p>
			</div>
			<div className="w-full flex justify-between lg:justify-center lg:gap-20 items-center mb-2">
				<div id="acabiac">
					<img
						src="https://cdn.intra.42.fr/users/e2f1b322c9f1290221dfbe017db50014/acabiac.jpg"
						className="rounded-full h-20 w-20"
					/>
					<div className="flex items-center gap-1">
						<GithubIcon />
						acabiac
					</div>
				</div>
				<div id="lebourre">
					<img
						src="https://cdn.intra.42.fr/users/c20226cf5861acce40029b7b8289f748/lebourre.jpg"
						className="rounded-full h-20 w-20"
					/>
					<div className="flex items-center gap-1">
						<GithubIcon />
						lebourre
					</div>
				</div>
				<div id="mchibane" className="">
					<img
						src="https://cdn.intra.42.fr/users/66d4ccda5644216f336433762556399a/mchibane.jpg"
						className="rounded-full h-20 w-20"
					/>
					<div className="flex items-center gap-1">
						<GithubIcon />
						mchibane
					</div>
				</div>
				<div id="mlebard">
					<img
						src="https://cdn.intra.42.fr/users/a32f34577bf8e1c2bf31b51ab85069fa/mlebard.jpg"
						className="rounded-full h-20 w-20"
					/>
					<div className="flex items-center gap-1">
						<GithubIcon />
						mlebard
					</div>
				</div>
			</div>
			<div className="w-full">
			<h2 className="text-2xl my-3 text-center">Powered by</h2>
				<ul className="flex justify-between">
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
				</ul>
			</div>
		</div>
	);
}
