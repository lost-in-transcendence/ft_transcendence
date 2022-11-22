import { backURL } from "./constants";
import { getCookie } from "./cookies";

export async function login(params: URLSearchParams)
{
    console.log(backURL);
    const url = "http://localhost:3333"
    return fetch(`${backURL}/auth/login?` + params, 
    {
        method: 'GET',
        credentials: 'include',
    })
}

export async function validateToken()
{
    return fetch(`${backURL}/auth/validate`,
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")},
		credentials: 'include',
	});
}

export async function generateTwoFa()
{
    console.log(backURL);
    const url = "http://localhost:3333"
    return fetch(`http://localhost:3333/twofa/generate`,
        {
            method: 'POST',
            credentials: 'include',
            headers: {"Authorization": "Bearer " + getCookie("jwt")}
        })
}

export async function authenticateTwoFa(code: string)
{
    
    return fetch(`${backURL}/twofa/authenticate`,
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
}

export async function toggleTwoFa() {
    return fetch(`${backURL}/twofa/toggle`,
        {
            method: 'POST',
            credentials: 'include',
            headers: {"Authorization": "Bearer " + getCookie("jwt")}
        })
}