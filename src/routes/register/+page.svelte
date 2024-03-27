<script lang="ts">
	import PocketBase from 'pocketbase';

	let submitDisabled = false;

	const pb = new PocketBase('https://edita.pockethost.io');

	let username = '';
	let email = '';
	let password = '';
	let passwordConfirm = '';
	let year = '';
	let branch = '';

	async function authUser() {
		submitDisabled = true;
		const data = {
			username,
			email,
			emailVisibility: true,
			password,
			passwordConfirm,
			Year: year,
			Branch: branch
		};

		await pb.collection('user_details').create(data);
	}
</script>

<div class="p-8 rounded-lg max-w-sm">
	<div class="mb-4">
		<h1 class="text-6xl font-bold">Sign Up</h1>
	</div>
	<div class="mb-4">
		<a href="/login" class="text-blue-500 underline">or Sign in?</a>
	</div>

	<div class="mb-4">
		<div class="mb-2">
			<input
				type="email"
				id="email"
				bind:value={email}
				placeholder="Email"
				class="p-3 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
			/>
		</div>

		<div class="mb-2">
			<input
				type="text"
				id="username"
				bind:value={username}
				placeholder="Username"
				class="p-3 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
			/>
		</div>

		<div class="mb-2">
			<input
				type="password"
				id="password"
				bind:value={password}
				placeholder="Password"
				class="p-3 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
			/>
		</div>

		<div class="mb-2">
			<input
				type="password"
				id="passwordConfirm"
				bind:value={passwordConfirm}
				placeholder="Confirm Password"
				class="p-3 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
			/>
		</div>

		<div class="mb-2">
			<select
				id="year"
				bind:value={year}
				class="p-3 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
			>
				<option value="" selected disabled>Select Year</option>
				<option value="1">1</option>
				<option value="2">2</option>
				<option value="3">3</option>
			</select>
		</div>

		<div class="mb-2">
			<select
				id="branch"
				bind:value={branch}
				class="p-3 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
			>
				<option value="" selected disabled>Select Branch</option>
				<option value="AIDS">AIDS</option>
				<option value="IoT">IoT</option>
				<option value="Cyber">Cyber</option>
			</select>
		</div>

		<div>
			<button
				class="p-3 bg-blue-500 text-white rounded-full w-100 cursor-pointer hover:bg-blue-600"
				id="submit"
				disabled={submitDisabled}
				on:click={authUser}
			>
				Sign Up
			</button>
		</div>
	</div>
</div>
