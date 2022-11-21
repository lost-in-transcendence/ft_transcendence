import { useState } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import { getCookie } from "../requests/cookies";

export async function loader()
{
    if (window.opener)
	{
        const res = await fetch('http://localhost:3333/twofa/generate',
        {
            method: 'POST',
            credentials: 'include',
            headers: {"Authorization": "Bearer " + getCookie("jwt")}
        })
        if (res.status !== 200)
        {
            console.log("there was an error");
			window.opener.postMessage("error", "*");
			window.close();
        }
        // console.log(res);
        return res;
    }
    else
    {
        redirect('/login');
    }
}

async function submitTwoFa(code: string)
{
    const res = await fetch('http://localhost:3333/twofa/authenticate',
    {
        method: 'POST',
        credentials: 'include',
        headers: 
        {
            "Authorization": "Bearer " + getCookie("jwt"),
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({token: code}),
    });
    if (res.status !== 200)
    {
        throw new Error('Wrong code!');
    }
    console.log(res);
}

export function TwoFa()
{
    const data: any = useLoaderData();

    const [status, setStatus] = useState('waiting');
    const [error, setError] = useState(null);
    const [code, setCode] = useState('');

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

    if (status === 'success')
    {
        window.opener.postMessage('success', '*');
        window.close();
    }

    return(
        <>
        <div>
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
            <p>status = {status}</p>
            <p>error = {error}</p>
        </div>
        </>
    )
}