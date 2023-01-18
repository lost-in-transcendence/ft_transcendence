/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}"
	],
	theme: {
		extend:
		{
			animation:
			{
				'spin-slow': 'spin 10s linear infinite',
			},
			backgroundImage:
			{
				'rolandGarros': "url('/assets/rolandGarros.jpeg')",
				'musicMakesMeLoseControl' : "url('/assets/music-makes-me-lose-control.gif')",
				'catPong' : "url('/assets/catpong.gif')"
			},
		},
		
	},
	plugins: [],
}
