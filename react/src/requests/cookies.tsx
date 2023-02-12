
export function getCookie(name: string) : string | undefined
{
	return document.cookie
	.split('; ')
	.find((row) => row.startsWith(name))
	?.split('=')[1];
}

export function setCookie(cname: string, cvalue: string, exms: number) {
	const d = new Date();
	d.setTime(d.getTime() + (exms));
	let expires = "expires="+ d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }