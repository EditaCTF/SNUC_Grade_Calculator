<script lang="ts">

    import { goto } from '$app/navigation';

    import pocketbase from 'pocketbase';
    const pb = new pocketbase('https://edita.pockethost.io');
    let userAuthenticated = pb.authStore.isValid;
    function logoutHandler() {
        pb.authStore.clear();
        window.location.href = "/"; 
    }
</script>

<a href = "/">Home</a>
<a href="/input">Input</a>
<a href = "/dashboard">Dashboard</a>
<a href="/calculate_score">Calculator</a>

{#if userAuthenticated}
    <button on:click={logoutHandler}>Logout</button>
{:else}
    <a href = "/register">Sign Up</a>
    <a href = "/login">Sign In</a>
{/if}
