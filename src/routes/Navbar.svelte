<script lang="ts">
	import pocketbase from 'pocketbase';
	const pb = new pocketbase('https://edita.pockethost.io');

	let userAuthenticated = pb.authStore.isValid;

	function logoutHandler() {
		pb.authStore.clear();
		window.location.href = '/';
	}
</script>

<nav
	class="fixed top-0 left-0 w-full flex justify-between items-center py-2 px-6 bg-white bg-opacity-20 backdrop-blur-md shadow-md"
>
	<div class="">
		<a href="/">
			<img src="/edita_logo.webp" alt="Logo" class="h-12 md:h-10 lg:h-12" />
		</a>
	</div>

	<div class="flex space-x-2 md:space-x-4">
		<button
			on:click={() => {
				window.location.href = '/calculator';
			}}
			class="hover:text-blue-500 text-xs md:text-sm">SGPA Calculator</button
		>
		<button
			on:click={() => {
				window.location.href = '/cgpa';
			}}
			class="hover:text-blue-500 text-xs md:text-sm">CGPA Calculator</button
		>
		<!-- <button on:click={() => {window.location.href="/dashboard"}} class="hover:text-gray-400">Dashboard</button> -->
		<!-- <button on:click={() => {window.location.href="/calculator"}} class="hover:text-blue-500 text-sm md:text-lg">Calculator</button> -->
		<button
			on:click={() => {
				window.location.href = '/updates';
			}}
			class="hover:text-blue-500 text-sm md:text-sm">Updates</button
		>
		<button
			on:click={() => {
				window.location.href = '/about';
			}}
			class="hover:text-blue-500 text-sm md:text-sm">About</button
		>

		<!-- {#if userAuthenticated}
			<button on:click={logoutHandler} class="hover:text-gray-400">Logout</button>
		{:else}
			<a href="/register" class="hover:text-gray-400">Sign Up</a>
			<a href="/login" class="hover:text-gray-400">Sign In</a>
		{/if} -->
	</div>
</nav>
