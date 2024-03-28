<script lang="ts">
	import { onMount } from 'svelte';
	import data from '../../data.json';

	let branch: string;
	let sem: number;
	let grade: string[] = Array(10).fill('');
	let finalGPA: number = 0;
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

		finalGPA = totalCredits !== 0 ? weightedSum / totalCredits : 0;

		console.log('Total Credits:', totalCredits);
		console.log('Weighted Sum:', weightedSum);
		console.log('Final GPA:', finalGPA);
		// (document.getElementById('result') as HTMLElement).innerText = finalGPA.toFixed(2);
		localStorage.setItem('result', finalGPA.toFixed(2));
		saveDataToLocalStorage();
		displayDiv();
	}

	function clearItems() {
		for (let i = 0; i < 10; i++) {
			grade[i] = '';
		}
	}

	function saveDataToLocalStorage() {
		localStorage.setItem('grades', JSON.stringify(grade));
		localStorage.setItem('sem', sem.toString());
		localStorage.setItem('branch', branch);
		localStorage.setItem('finalGPA', finalGPA.toFixed(2)); // Store final GPA
	}

	function retrieveDataFromLocalStorage() {
		const storedGrades = localStorage.getItem('grades');
		const storedSem = localStorage.getItem('sem');
		const storedBranch = localStorage.getItem('branch');
		const storedFinalGPA = localStorage.getItem('finalGPA');
		if (storedGrades && storedSem && storedBranch) {
			grade = JSON.parse(storedGrades);
			sem = storedSem;
			branch = storedBranch;
		}
		if (storedFinalGPA) {
			finalGPA = parseFloat(storedFinalGPA);
		}
	}

	function displayDiv() {
		document.getElementById('res').innerText = 'Your predicted SGPA is';
		document.getElementById('result').innerText = finalGPA.toFixed(2);
	}
	onMount(() => {
		retrieveDataFromLocalStorage();
	});
</script>

<br />
<div class="flex justify-left">
	<div class="flex justify-left items-start h-screen px-10">
		<div class="text-left">
			<h1 class="py-50 text-6xl">SGPA Calculator</h1>
			<select
				id="sem"
				class="text-blue-400 text-2xl bg-inherit py-3"
				bind:value={sem}
				on:change={clearItems}
			>
				<option value="" class="" selected disabled>Semester</option>
				<option value="1">Semester 1</option>
				<option value="2">Semester 2</option>
				<option value="3">Semester 3</option>
				<option value="4">Semester 4</option>
				<option value="5">Semester 5</option>
				<option value="6">Semester 6</option>
			</select>

			<select
				id="branch"
				class="text-blue-400 text-2xl bg-inherit"
				bind:value={branch}
				on:change={clearItems}
			>
				<option value="" selected disabled>Branch</option>
				<option value="aids">AI/DS</option>
				<option value="iot">IoT</option>
				<option value="cyber">Cyber</option>
			</select>

			<div class="py-5">
				{#if branch && sem}
					<table class="px-10 py-10 rounded-lg bg-[#CFDDEB]">
						<thead>
							<tr>
								<th class="border-b border-black p-4">Course Code</th>
								<th class="border-b border-black p-4">Credit</th>
								<th class="border-b border-black p-4">Grade</th>
							</tr>
						</thead>
						<tbody>
							{#each Object.entries(data[sem][branch]) as [courseCode, credit], idx}
								<tr>
									<td class="p-4">{courseCode}</td>
									<td class="p-4">{credit}</td>
									<td class="p-4">
										<select
											class="bg-[#CFDDEB]"
											id="sem"
											bind:value={grade[idx]}
											on:change={() => {
												console.log(grade);
											}}
										>
											<option value="" selected disabled>Select Grade</option>
											<option value="10">O</option>
											<option value="9">A+</option>
											<option value="8">A</option>
											<option value="7">B+</option>
											<option value="6">B</option>
											<option value="5">P</option>
											<option value="0">RA/AB</option>
										</select>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
					<br />
					<button class="flex bg-[#BCD6FF] w-fit rounded-2xl px-3 py-3" on:click={calculateHandler}
						>Calculate</button
					>
				{/if}
			</div>
		</div>
	</div>
	<div class="flex-col items-left justify-center h-screen px-10">
		<p id="res" class="text-6xl"></p>
		<p id="result" class="py-5 text-blue-500 text-8xl"></p>
	</div>
</div>

<style>
	table {
		/* height: 100px; */
	}
</style>
