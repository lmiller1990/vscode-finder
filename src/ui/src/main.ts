import App from './App.svelte'

declare global {
	interface Window { 
		minimize: () => void
	}
}


const app = new App({
	target: document.querySelector('#root')
});

export default app