import { Link, Navigate, Outlet, redirect, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { appURL, backURL, generateTwoFa, getCookie, logDev, validateToken } from "../requests";
import Modal from "../components/Modal/modal";
import { TwoFa } from "../components/TwoFa/twofa";
import { Spinner } from "../components/Spinner/Spinner";

function popupwindow(url: string, title: string, w: number, h: number)
{
	var left = Math.round(window.screenX + (window.outerWidth - w) / 2);
	var top = Math.round(window.screenY + (window.outerHeight - h) / 2.5);
	return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
}

async function tryValidateToken()
{
	if (!getCookie('jwt'))
	{
		return false;
	}
	const res = await validateToken();
	if (res.status !== 200)
	{
		return false;
	}
	return true;
}

export function Login()
{
	const loc = useLocation();
	const [status, setStatus] = useState('waiting');

	const error = (loc?.state?.error ? <p>{loc.state.error}</p> : <></>)

	async function onMessage(event: MessageEvent)
	{
		if (status === "loading")
			return;
		let done = false;
		switch (event.data)
		{
			case 'loading':
				{
					break;
				}
			case 'error':
			case 'success':
			case 'next':
			case 'newUser':
				{
					done = true;
					break;
				}
		}
		if (done)
		{
			window.removeEventListener('message', onMessage);
		}
		setStatus(event.data);
	}

	async function logAsGuest()
	{
		const res = await logDev();
		if (res.status === 200)
		{
			setStatus('success');
		}
	}

	async function login()
	{
		setStatus('loading')
		const tokenValid = await tryValidateToken();
		if (tokenValid === true)
		{
			setStatus('success');
			return;
		}
		window.addEventListener('message', onMessage);
		const childWindow = popupwindow(`${backURL}/auth/login`, 'Log In', 400, 600);
		if (childWindow)
		{
			const timerId = setInterval(() =>
			{
				if (childWindow.closed)
				{
					clearInterval(timerId)
					setStatus((prevState) =>
					{
						if (prevState === 'loading')
							return 'waiting';
						return prevState;
					});
				}
			}, 100)
		}
	}

	const [isModalOpen, setIsModalOpen] = useState(false);
	if (status === 'next')
	{
		setIsModalOpen(true);
		setStatus('waiting');
	}

	async function onModalOpen()
	{
		const res = await generateTwoFa()
		if (res.status !== 200)
		{
			setStatus('error');
		}
		return res.ok;
	}

	return (
		<div className="bg-gray-800 w-screen h-screen flex items-center justify-center">
			<Modal isOpen={isModalOpen} onOpen={onModalOpen} onClose={() => { setIsModalOpen(false) }}>
				<TwoFa onSuccess={() => { setIsModalOpen(false); setStatus('success') }} />
			</Modal>
			{
				status === 'success' &&
				<Navigate to={"/"} />
			}
			{
				status === 'newUser' &&
				<Navigate to={"/profile/edit"} />
			}
			<div className="bg-gray-700 text-gray-300 rounded-lg shadow-lg w-1/2 gap-1
							flex flex-col items-center justify-start min-w-[700px]
							p-2 m-2">
				<h1 className="text-center text-8xl">Transcendence</h1>
				<h2 className="mt-4 text-2xl text-center">The awesome website to play pong with your friends !</h2>
				<h3 className='text-xs mb-6'> But only if they are a 42 student</h3>
				{
					error ?
					<div className="text-red-600 text-lg mb-1">
						{error}
					</div>
					: null
				}
				{
					status === 'error' ?
					<div className="text-red-600 text-2xl mb-1">
						There was an error, try again
					</div>
					:
					null
				}
				{
					status === 'loading' ?
					<Spinner />
					:
					<div className="basis-full w-full flex items-center justify-center mb-4">
							<button
								onClick={login}
								className='bg-indigo-500 rounded shadow-md px-3 py-1 text-2xl'
								>
								Log in with 42
							</button>
						</div>
				}
				{/* <button onClick={logAsGuest}>
					Log as Guest
				</button> */}
			</div>
		</div>
	)
}
