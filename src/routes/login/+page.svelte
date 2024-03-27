<script lang="ts">
	import PocketBase from 'pocketbase';

	const pb = new PocketBase('https://edita.pockethost.io');

	let loginUsername = '';
	let loginPassword = '';
	let isDisabled = false;

	async function loginUser(e: any) {
		isDisabled = true;
		const data = {
			username: loginUsername,
			password: loginPassword
		};
		try {
			const authData = await pb
				.collection('user_details')
				.authWithPassword(data.username, data.password);
		} catch {
			e.disabled = false;
			alert('Incorrect credentials!');
			pb.authStore.clear();
			return;
		} finally {
			console.log(pb.authStore.isValid);
			if (pb.authStore.isValid == true) {
				console.log('Login Successful');
				window.location.href = '/dashboard';
			}
		}
	}
</script>

<div class="p-8 rounded-lg max-w-sm">
	<div class="mb-4">
		<h1 class="text-6xl font-bold">Log in</h1>
	</div>
	<div class="mb-4 underline">
		<a href="/register" class="text-blue-500">or Sign up?</a>
	</div>

	<form>
		<div class="mb-4">
			<input
				type="text"
				id="loginUsername"
				bind:value={loginUsername}
				placeholder="username"
				class="p-3 border border-gray-300 rounded w-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
			/>
		</div>

		<div class="mb-4">
			<input
				type="password"
				id="loginPassword"
				bind:value={loginPassword}
				placeholder="password"
				class="p-3 border border-gray-300 rounded w-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-500"
			/>
		</div>

		<div>
			<input
				type="submit"
				on:click={loginUser}
				disabled={isDisabled}
				value="Sign In"
				class="p-3 bg-blue-500 text-white rounded-full w-100 cursor-pointer hover:bg-blue-600"
			/>
		</div>
	</form>
</div>
