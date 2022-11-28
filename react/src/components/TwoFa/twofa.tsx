import { useEffect, useState } from "react";
import { generateTwoFa, authenticateTwoFa } from "../../requests"

async function submitTwoFa(code: string)
{

    const res = await authenticateTwoFa(code);

    if (res.status !== 200)
    {
        throw new Error('Wrong code!');
    }
}

function DisplayTimer(props: {timer: any, years:boolean, hours:boolean, minutes: boolean, seconds: boolean})
{
    const {timer} = props;
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
		console.log(res);
        if (res.status !== 200)
        {
            throw new Error("Error generating OTP");
        }
        return res;

}

export function TwoFa(props: {onSuccess: any})
{
    const [status, setStatus] = useState('waiting');
    const [error, setError] = useState(null);
    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(5 * 60);

    function handleChange(e: any)
    {
        setCode(e.target.value);
    }

    async function handleSubmit(e: any)
    {
        e.preventDefault();
        setStatus('submitting');
        try {
            await submitTwoFa(code);
            setStatus('success');
        }
        catch(err: any)
        {
            setStatus('waiting');
            setError(err.message);
        }
    }

    async function regenerateOTP()
    {
        try
        {
            setStatus('loading');
            await resendEmail()
            setTimer(5 * 60);
            setStatus('waiting');
        }
        catch (err: any)
        {
            setError(err.message);
            setStatus('error');
        }
    }

    useEffect(() =>
    {
        if (status === 'success')
        {
            props.onSuccess();
        };

    }, [status])

    useEffect(() =>
    {
        const interval = setInterval(() => setTimer((prev) => {return prev - 1}), 1000);

        return () => {clearInterval(interval)};
    }, [])

    return(
        <>
        <div>
            <DisplayTimer timer={timer} years={false} hours={false} minutes={true} seconds={true}/>
            <p>Enter your 2fa</p>
            <form
            onSubmit={handleSubmit}>
                <textarea 
                value={code}
                onChange={handleChange}
                disabled={status === 'submitting'}/>
                <br />
                <button
                disabled=
                {code.length=== 0 || code.length > 6 || status === 'submitting'
                }>Submit</button>
            </form>
            <button onClick={regenerateOTP}>Re-send one time password</button>
            <p>status = {status}</p>
            <p>error = {error}</p>
        </div>
        </>
    )
}