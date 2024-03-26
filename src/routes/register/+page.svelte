<script lang="ts">
    import { onMount } from 'svelte';
    import PocketBase from 'pocketbase';

    let submitDisabled = false;

    const pb = new PocketBase('https://edita.pockethost.io');

    let username = "";
    let email = "";
    let password = "";
    let passwordConfirm = "";
    let year = "";
    let branch = "";

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
        const record = await pb.collection('user_details').create(data);
    }
</script>

<h1>SNUC Grade Calculator</h1>

<div>
    <div>
        <label for="username">Username:</label>
        <input type="text" id="username" bind:value={username}>
    </div>

    <div>
        <label for="email">Email:</label>
        <input type="email" id="email" bind:value={email}>
    </div>

    <div>
        <label for="password">Password:</label>
        <input type="password" id="password" bind:value={password}>
    </div>

    <div>
        <label for="passwordConfirm">Confirm Password:</label>
        <input type="password" id="passwordConfirm" bind:value={passwordConfirm}>
    </div>

    <div>
        <label for="year">Year:</label>
        <select id="year" bind:value={year}>
            <option value="" selected disabled>Select Year</option> <!-- Default value -->
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
        </select>
    </div>

    <div>
        <label for="branch">Branch:</label>
        <select id="branch" bind:value={branch}>
            <option value="" selected disabled>Select Branch</option> <!-- Default value -->
            <option value="AIDS">AIDS</option>
            <option value="IoT">IoT</option>
            <option value="Cyber">Cyber</option>
        </select>
    </div>
    
    <div>
        <button class="text-3xl" id="submit" disabled={submitDisabled} on:click={authUser}>
            Create Account
        </button>
    </div>
</div>
