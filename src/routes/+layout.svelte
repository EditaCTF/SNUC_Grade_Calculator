<script>
	import '../app.css';
	import Navbar from './Navbar.svelte';
</script>

<div id="wip">WIP</div>

<Navbar />

<slot />

<style>
	#wip {
		font-size: 50px;
		position: absolute;
		z-index: 2;
		top: 100px;
		right: 0;
		padding-right: 20px;
		width: 150px;
		text-align: center;
		background-color: #f4d2d8;
		border-top-left-radius: 10px;
		border-bottom-left-radius: 10px;
	}
</style>
