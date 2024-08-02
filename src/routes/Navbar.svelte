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
<nav class="flex justify-between items-center py-2 px-6">
	<div class="">
		<a href="/">
			<img src="/image.png" alt="Logo" class="md:h-16 md:mr-2" />
		</a>
	</div>

	<div class="flex space-x-2 md:space-x-4">
		<button
			on:click={() => {
				window.location.href = '/';
			}}
			class="hover:text-blue-500 text-sm md:text-lg">Calculator</button
		>
		<!-- <button on:click={() => {window.location.href="/dashboard"}} class="hover:text-gray-400">Dashboard</button> -->
		<!-- <button on:click={() => {window.location.href="/calculator"}} class="hover:text-blue-500 text-sm md:text-lg">Calculator</button> -->
		<button
			on:click={() => {
				window.location.href = '/updates';
			}}
			class="hover:text-blue-500 text-sm md:text-lg">Updates</button
		>
		<button
			on:click={() => {
				window.location.href = '/about';
			}}
			class="hover:text-blue-500 text-sm md:text-lg">About</button
		>

		<!-- {#if userAuthenticated}
			<button on:click={logoutHandler} class="hover:text-gray-400">Logout</button>
		{:else}
			<a href="/register" class="hover:text-gray-400">Sign Up</a>
			<a href="/login" class="hover:text-gray-400">Sign In</a>
		{/if} -->
	</div>
</nav>
