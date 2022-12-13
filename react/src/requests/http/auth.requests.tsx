import { backURL } from "../constants";
import { getCookie } from "../cookies";

export async function login(params: URLSearchParams)
{
    return fetch(`${backURL}/auth/login?` + params, 
    {
        method: 'GET',
        credentials: 'include',
    });
}

export async function logout()
{
    return fetch(`${backURL}/auth/logout`,
    {
        method: 'GET',
        credentials: 'include',
    });
}

export async function validateToken()
{
    const res = await fetch(`${backURL}/auth/validate`,
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")},
		credentials: 'include',
	});
    return res;
}

export async function generateTwoFa()
{
    const res = await fetch(`${backURL}/twofa/generate`,
        {
            method: 'POST',
            credentials: 'include',
            headers: {"Authorization": "Bearer " + getCookie("jwt")}
        })
    if (res.status !== 200)
    {
        throw res
    }
    return res;
}

export async function authenticateTwoFa(code: string)
{
    
    const res = await fetch(`${backURL}/twofa/authenticate`,
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
        throw res
    }
    return res;
}

export async function toggleTwoFa() {
    const res = await fetch(`${backURL}/twofa/toggle`,
        {
            method: 'POST',
            credentials: 'include',
            headers: {"Authorization": "Bearer " + getCookie("jwt")}
        })
    if (res.status !== 200)
    {
        throw res
    }
    return res;
}