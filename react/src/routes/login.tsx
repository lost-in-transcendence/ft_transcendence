import { Link, Navigate, Outlet, redirect, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../auth/AuthContext";
import { appURL, backURL, generateTwoFa, getCookie, validateToken } from "../requests";
import Modal from "../components/Modal/modal";
import { TwoFa } from "../components/TwoFa/twofa";

function popupwindow(url: string , title: string, w: number, h: number) 
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
	const auth = useContext(AuthContext);
	const loc = useLocation();
	const [status, setStatus] = useState('waiting');

	const error = (loc?.state?.error ? <p>{loc.state.error}</p> : <></>)

	async function onMessage(event: MessageEvent)
	{
		if (status === "loading")
			return;
		let done = false;
		console.log(event.data);
		switch (event.data)
		{
			case 'loading':
			{
				break;
			}
			case 'error':
			case 'success':
			case 'next':
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
		console.log(res);
        if (res.status !== 200)
        {
			setStatus('error');
        }
        return res;
	}

	return (
		<div>
			{error}
			<Modal isOpen={isModalOpen} onOpen={onModalOpen} onClose={() => {setIsModalOpen(false)}}>
				<TwoFa onSuccess={() => {setIsModalOpen(false); setStatus('success')}} />
			</Modal>
			{status === 'success' &&
			<Navigate to={"/"} />}
			<h1>Login</h1>
			<button onClick={login}>
				Log in
			</button>
			
			{status === 'loading' &&
			<p>Loading</p>}
			{status === 'error' &&
			<p>BIG ERROR!!!</p>}
			<p>state = {status}</p>

		</div>
	)
}
