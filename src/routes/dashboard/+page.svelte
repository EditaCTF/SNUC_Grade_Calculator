<script lang="ts">
    import { onMount } from 'svelte';
    import PocketBase from 'pocketbase';

    let notLoading = false;
    let data: any;

    onMount(async () => {
        notLoading = true;
        const pb = new PocketBase('https://edita.pockethost.io');
        data = pb.authStore.model;

        const grades = data.grades;
        console.log(grades);
    });
</script>

<h1>Dashboard</h1>

{#if notLoading}
    <ul>
        {#each Object.entries(data.grades) as [course, grade]}
            <li>{course} : {grade}</li>
        {/each}
    </ul>
{:else}
    <p>Loading...</p>
{/if}
