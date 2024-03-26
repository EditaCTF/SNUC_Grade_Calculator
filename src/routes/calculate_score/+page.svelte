<script lang="ts">
    import data from '../../data.json';

    let branch: string = "";
    let year: number = 0;
    let subject1: string = "";
    let subject2: string = "";

    const calculateGrades = () => {
        if (year === 1 && branch === "cyber") {
            subject1 = "cyber1";
            subject2 = "cyber2";
        } else if (year === 1 && branch === "aids") {
            subject1 = "aids1";
            subject2 = "aids2";
        } else if (year === 1 && branch === "iot") {
            subject1 = "iot1";
            subject2 = "iot2";
        } else {
            subject1 = "";
            subject2 = "";
        }
    };
</script>

<h1>Calculator</h1>

<p>Calculate your grade here!</p>

<div>
    <label for="year">Year:</label>
    <select id="year" bind:value={year} >
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
        <option value="aids">AIDS</option>
        <option value="iot">IoT</option>
        <option value="cyber">Cyber</option>
    </select>
</div>

{#if subject1 || subject2}
    <div id={subject1}>
        <!-- Display content for subject 1 based on selected year and branch -->
    </div>

    <div id={subject2}>
        <!-- Display content for subject 2 based on selected year and branch -->
    </div>
{/if}

<button on:click={calculateGrades}>Calculate</button>
