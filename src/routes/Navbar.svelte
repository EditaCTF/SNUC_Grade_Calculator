<script lang="ts">
	import pocketbase from 'pocketbase';
	const pb = new pocketbase('https://edita.pockethost.io');

	let userAuthenticated = pb.authStore.isValid;

	function logoutHandler() {
		pb.authStore.clear();
		window.location.href = '/';
	}
</script>
<!-- window.location.href = '/dashboard' -->
<nav class="flex justify-between items-center py-4 px-6">
	<div class="flex items-center">
		<img src="image.png" alt="Logo" class="h-8 mr-2" />

	</div> 

	<div class="flex space-x-4">
		<button on:click={() => {window.location.href="/"}} class="hover:text-gray-400">Home</button>
		<button on:click={() => {window.location.href="/dashboard"}} class="hover:text-gray-400">Dashboard</button>
		<button on:click={() => {window.location.href="/calculator"}} class="hover:text-gray-400">Calculator</button>
		<button on:click={() => {window.location.href="/about"}} class="hover:text-gray-400">About</button>

		{#if userAuthenticated}
			<button on:click={logoutHandler} class="hover:text-gray-400">Logout</button>
		{:else}
			<a href="/register" class="hover:text-gray-400">Sign Up</a>
			<a href="/login" class="hover:text-gray-400">Sign In</a>
		{/if}
	</div>
</nav>
