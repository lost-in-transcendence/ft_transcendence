import { useEffect, useState } from "react";
import { generateTwoFa, authenticateTwoFa } from "../../requests"

async function submitTwoFa(code: string)
{

	const res = await authenticateTwoFa(code);
	if (res.status !== 200)
	{
		throw new Error('Wrong code !');
	}
}

function DisplayTimer(props: { timer: any, years: boolean, hours: boolean, minutes: boolean, seconds: boolean })
{
	const { timer } = props;
	let years, hours, minutes, seconds;
	let timerstr = '';
	if (props.years === true)
	{
		years = Math.floor(timer / (60 * 60 * 24))
		timerstr += years;
	}
	if (props.hours === true)
	{
		hours = Math.floor((timer / (60 * 60)) % 24),
			timerstr += (hours < 10 ? `0${hours}` : hours);
	}
	if (props.minutes === true)
	{
		minutes = Math.floor((timer / 60) % 60);
		timerstr += (minutes < 10 ? `0${minutes}` : minutes);
	}
	if (props.seconds === true)
	{
		seconds = Math.floor((timer % 60));
		timerstr += ':' + (seconds < 10 ? `0${seconds}` : seconds);
	}

	return <p>{timerstr}</p>
}

async function resendEmail()
{
	const res = await generateTwoFa()
	if (res.status !== 200)
	{
		throw new Error("Error generating OTP");
	}
	return res;

}

export function TwoFa(props: { onSuccess: any })
{
	const [status, setStatus] = useState('waiting');
	const [error, setError] = useState(null);
	const [code, setCode] = useState('');
	const [timer, setTimer] = useState(5 * 60);
	const [resendDisabled, setResendDisabled] = useState(false);

	function handleChange(e: any)
	{
		setCode(e.target.value);
	}

	async function handleSubmit(e: any)
	{
		e.preventDefault();
		setStatus('submitting');
		try
		{
			await submitTwoFa(code);
			setStatus('success');
		}
		catch (err: any)
		{
			setStatus('waiting');
			setError(err.message);
		}
	}

	async function regenerateOTP()
	{
		try
		{
			setResendDisabled(true);
			const timeoutId = setTimeout(() => {setResendDisabled(false)}, 1000 * 15)
			setStatus('loading');
			await resendEmail()
			setTimer(5 * 60);
			setStatus('waiting');
			setCode('')
			setError(null)
		}
		catch (err: any)
		{
			setError(err.message);
			setStatus('error');
		}
	}

	useEffect(() =>
	{
		if (resendDisabled === true)
			setTimeout(() => {setResendDisabled(false)}, 1000 * 15);
	}, [resendDisabled])

	useEffect(() =>
	{
		if (status === 'success')
		{
			props.onSuccess();
		};

	}, [status])

	useEffect(() =>
	{
		const interval = setInterval(() => setTimer((prev) => { return prev - 1 }), 1000);

		return () => { clearInterval(interval) };
	}, [])

	return (
		<>
			<div className="flex flex-col items-center justify-center gap-1 text-neutral-800">
				<div className="text-4xl">
					<DisplayTimer timer={timer} years={false} hours={false} minutes={true} seconds={true} />
				</div>
				<p>Enter the 6-digits code you received via e-mail</p>
				<form
					onSubmit={handleSubmit}
					className='flex flex-col justify-center items-center gap-2'
				>
					<input
						type={'text'}
						value={code}
						placeholder='______'
						onChange={handleChange}
						disabled={status === 'submitting'}
						className='text-center rounded shadow tracking-widest'
						minLength={6}
						maxLength={6}
					/>
					{
						error ?
							<p className="text-red-600">
								{error}
							</p>
							:
							null
					}
					<button
						disabled={code.length === 0 || code.length > 6 || status === 'submitting'}
						className={`${code.length !== 6 ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-500'} rounded shadow px-1 text-gray-200`}
					>
						Submit
					</button>
				</form>
				<button
					onClick={() => {regenerateOTP(); setResendDisabled(true);}}
					className={`${resendDisabled ? 'bg-gray-500' : 'bg-indigo-500'} rounded shadow px-1 text-gray-200`}
					disabled={resendDisabled}
				>
					Re-send code
				</button>
			</div>
		</>
	)
}
