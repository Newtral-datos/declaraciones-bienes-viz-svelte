import { mount } from 'svelte';
import './styles/main.scss';
import App from './App.svelte';

export default mount(App, { target: document.getElementById('app') });
