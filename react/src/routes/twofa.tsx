import { useEffect, useState } from "react";
import { generateTwoFa, authenticateTwoFa } from "../requests"

// export async function loader()
// {
//     if (window.opener)
// 	{
//         const res = await generateTwoFa()
//         console.log(res);
//         if (res.status !== 200)
//         {
// 			window.opener.postMessage("error", "*");
// 			window.close();
//         }
//         return res;
//     }
//     else
//     {
//         redirect('/login');
//     }
// }

async function submitTwoFa(code: string)
{

    const res = await authenticateTwoFa(code);

    if (res.status !== 200)
    {
        throw new Error('Wrong code!');
    }
}

export function TwoFa(props: {onSuccess: any})
{
    // const data: any = useLoaderData();

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

    useEffect(() =>
    {
        console.log("aaaaaaaaaaaa");
        if (status === 'success')
        {
            props.onSuccess();
        }
    })

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