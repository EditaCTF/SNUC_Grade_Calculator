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

    const grades = {
        EN1001: 0,
        MA1001: 0,
        PH1001T: 0,
        BS1001: 0,
        CS1001: 0,
        CS1703: 0,
        CS1801: 0,
        PH1801T: 0,
    };

    async function authUser() {
        submitDisabled = true;
        const data = {
            username,
            email,
            emailVisibility: true,
            password,
            passwordConfirm,
            grades,
            Year: year,
            Branch: branch
        };
        console.log(data);
        const record = await pb.collection('user_details').create(data);
        console.log(record);
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
            <option value="">Select Year</option> <!-- Default value -->
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
        </select>
    </div>

    <div>
        <label for="branch">Branch:</label>
        <select id="branch" bind:value={branch}>
            <option value="">Select Branch</option> <!-- Default value -->
            <option value="AIDS">AIDS</option>
            <option value="IoT">IoT</option>
            <option value="Cyber">Cyber</option>
        </select>
    </div>
    
    {#if branch == "AIDS"}
        AIDS
    {:else if branch == "IoT"}
        IoT
    {:else if branch == "Cyber"}
        Cyber
    {/if}
    
    <div>
        <button id="submit" disabled={submitDisabled} on:click={authUser}>
            Submit
        </button>
    </div>

</div>

<!-- <script lang="ts">
    import { onMount } from 'svelte';
    import PocketBase from 'pocketbase';

    let submitDisabled = false;

    const pb = new PocketBase('https://edita.pockethost.io');

    const data = {
        username: "test_username",
        email: "test@example.com",
        emailVisibility: true,
        password: "12345678",
        passwordConfirm: "12345678",
        grades: {
            EN1001: 9,
            MA1001: 9,
            PH1001T: 9,
            BS1001: 9,
            CS1001: 9,
            CS1703: 9,
            CS1801: 9,
            PH1801T: 9,
        },
        Year: 1,
        Branch: "AIDS"
    };

    async function authUser() {
        submitDisabled = true;
        console.log(data);
        const record = await pb.collection('user_details').create(data);
        console.log(record);
    }

</script>

<h1>Welcome to SvelteKit</h1>

<button id="submit" disabled={submitDisabled} on:click={authUser}>
    Hi
</button> -->
