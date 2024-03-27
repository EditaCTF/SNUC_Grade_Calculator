<script lang="ts">
    import { onMount } from 'svelte';
    import data from '../../data.json';

    let branch: string = '';
    let year: number = 0;
    let subject1: string = '';
    let subject2: string = '';

    const calculateGrades = () => {
		console.log(year, branch);
		console.log(data[year][branch])
        if (year === 1 && branch === 'cyber') {
            subject1 = 'cyber1';
            subject2 = 'cyber2';

        } else if (year === 1 && branch === 'aids') {
            subject1 = 'aids1';
            subject2 = 'aids2';
        } else if (year === 1 && branch === 'iot') {
            subject1 = 'iot1';
            subject2 = 'iot2';
        } else {
            subject1 = '';
            subject2 = '';
        }
	};

	// onMount(() => {
	// 	calculateGrades();
	// });

    // onMount(() => {
    //     calculateGrades();
    // });
</script>

<h1>Calculator</h1>

<p>Calculate your grade here!</p>

<div>
    <label for="year">Year:</label>
    <select id="year" bind:value={year}>
        <option value="" selected disabled>Select Year</option>
        <!-- Default value -->
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
    </select>
</div>

<div>
    <label for="branch">Branch:</label>
    <select id="branch" bind:value={branch}>
        <option value="" selected disabled>Select Branch</option>
        <!-- Default value -->
        <option value="aids">AIDS</option>
        <option value="iot">IoT</option>
        <option value="cyber">Cyber</option>
    </select>
</div>

<button on:click={calculateGrades}>Next</button>

{#if subject1 || subject2}
    <div>
        <label for={subject1}>{subject1}</label>
        <input type="text" id={subject1}>
    </div>

    <div>
        <label for={subject2}>{subject2}</label>
        <input type="text" id={subject2}>
    </div>
{/if}
