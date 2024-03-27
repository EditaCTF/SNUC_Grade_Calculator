<script lang="ts">
    import { onMount } from 'svelte';
    import data from '../../data.json';

    let branch: string;
    let sem: number;
    let grade: string[] = Array(10).fill("");

    function calculateHandler() {
        console.log('Calculating....');

        let totalCredits = 0;
        let weightedSum = 0;

        for (let idx = 0; idx < Object.keys(data[sem][branch]).length; idx++) {
            const selectedGrade = parseInt(grade[idx]);
            const [courseCode, credit] = Object.entries(data[sem][branch])[idx];

            if (!isNaN(selectedGrade)) {
                totalCredits += credit as number;
                weightedSum += selectedGrade * (credit as number);
            }
        }

        const finalGPA = totalCredits !== 0 ? weightedSum / totalCredits : 0;

        console.log('Total Credits:', totalCredits);
        console.log('Weighted Sum:', weightedSum);
        console.log('Final GPA:', finalGPA);

        saveDataToLocalStorage();
    }

    function clearItems() {
        for (let i = 0; i < 10; i++) {
            grade[i] = "";
        }
    }

    function saveDataToLocalStorage() {
        localStorage.setItem('grades', JSON.stringify(grade));
        localStorage.setItem('sem', sem.toString());
        localStorage.setItem('branch', branch);
    }

    function retrieveDataFromLocalStorage() {
        const storedGrades = localStorage.getItem('grades');
        const storedSem = localStorage.getItem('sem');
        const storedBranch = localStorage.getItem('branch');
        if (storedGrades && storedSem && storedBranch) {
            grade = JSON.parse(storedGrades);
            sem = storedSem;
            branch = storedBranch;
        }
    }

    onMount(() => {
        retrieveDataFromLocalStorage();
    });
</script>

<h1 class="flex justify-center text-blue-500 text-5xl">Calculator</h1>

<p class="flex justify-center text-blue-400 text-3xl">Calculate your grade here!</p>

<br>
<br>
<div class="flex pl-40">
    <!-- <label for="sem" class="text-blue-700 text-3xl">Semester</label> -->
    <select id="sem" class="text-blue-400 text-2xl bg-inherit" bind:value={sem} on:change={clearItems}>
        <option value="" class="" selected disabled>Sem</option>
        <!-- Default value -->
        <option value="1">1st Semester</option>
        <option value="2">2nd Semester</option>
        <option value="3">3rd Semester</option>
        <option value="4">4th Semester</option>
        <option value="5">5th Semester</option>
        <option value="6">6th Semester</option>
        <!-- <option value="7" disabled>7</option>
        <option value="8" disabled>8</option> -->
    </select>
</div>

<div class="flex pl-40">
    <!-- <label for="branch" class="">Branch:</label> -->
    <select id="branch" class="text-blue-400 text-2xl bg-inherit" bind:value={branch} on:change={clearItems}>
        <option value="" selected disabled>Branch</option>
        <!-- Default value -->
        <option value="aids">AIDS</option>
        <option value="iot">IoT</option>
        <option value="cyber">Cyber</option>
    </select>
</div>
    
{#if branch && sem}
<table class="rounded-xl border border-black">
    <thead>
      <tr>
        <th class="border border-black p-2">Course Code</th>
        <th class="border border-black p-2">Credit</th>
        <th class="border border-black p-2">Grade</th>
      </tr>
    </thead>
    <tbody>
      {#each Object.entries(data[sem][branch]) as [courseCode, credit], idx}
        <tr>
          <td class="border border-black">{courseCode}</td>
          <td class="border border-black text-center">{credit}</td>
          <td class="border border-black">
            <select id="sem" bind:value={grade[idx]} on:change={() => { console.log(grade)} }>
              <option value="" selected disabled>Select Grade</option>
              <option value=10>O</option>
              <option value=9>A+</option>
              <option value=8>A</option>
              <option value=7>B+</option>
              <option value=6>B</option>
              <option value=5>P</option>
              <option value=0>RE/AB</option>
            </select>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <button on:click={calculateHandler}>Calculate</button>
{/if}
