<script lang="ts">
	import { onMount } from 'svelte';
	import data from '../../data.json';

	let branch: string;
	let sem: number;
	let grade: string[] = Array(10).fill('');
	let finalGPA: number = 0;
	let weightedSum: number = 0;
	let totalCredits: number = 0;
	function calculateHandler() {
		console.log('Calculating....');

		totalCredits = 0;
		weightedSum = 0;
		// let jsonScore = {};
		for (let idx = 0; idx < Object.keys(data[sem][branch]).length; idx++) {
			const selectedGrade = parseInt(grade[idx]);
			const [courseCode, credit] = Object.entries(data[sem][branch])[idx];
			// jsonScore[courseCode] = selectedGrade;
			if (!isNaN(selectedGrade)) {
				totalCredits += credit as number;
				weightedSum += selectedGrade * (credit as number);
			}
		}
		// console.log('JSON Score:', jsonScore);
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
	import PocketBase from 'pocketbase';
	import credits from '../../credits.json';
	const pb = new PocketBase('https://edita.pockethost.io');
	let isDisabled = false;
	async function getCPGA(id: any) {
		const record = await pb.collection('gpa').getOne(id);
		console.log(record);
		console.log(credits);
		let totalCredits = 0;
		let gpa = 0;
		for (let i = 1; i <= 8; i++) {
			if (record[i] == undefined) {
				continue;
			} else if (credits[i] == undefined) {
				continue;
			}
			console.log(i, record[i], credits[i][record.Dept]);
			totalCredits += credits[i][record.Dept];
			gpa += record[i] * credits[i][record.Dept];
			console.log(gpa);
		}
		finalGPA = gpa / totalCredits;
		let data = {
			id: id,
			CGPA: finalGPA.toFixed(2)
		};
		console.log(data);
		try {
			const record = await pb.collection('gpa').create(data);
		} catch (e) {
			const record = await pb.collection('gpa').update(id, data);
		}
	}

	async function pushToDB(e: any) {
		document.getElementById('load').style.display = 'inline-block';
		isDisabled = true;
		console.log(sem);
		let id = document.getElementById('id').value + 1234567;
		if (id.length != 15) {
			alert('Enter a valid Digital ID!');
			return;
		}
		const data = {
			id: id,
			Dept: branch
		};
		data[sem] = finalGPA.toFixed(2);
		console.log(data);
		try {
			const record = await pb.collection('gpa').create(data);
			document.getElementById('load').style.display = 'none';
			alert('Your SGPA has been saved to our database');
		} catch (e) {
			const record = await pb.collection('gpa').update(id, data);
			document.getElementById('load').style.display = 'none';
			alert('Your SGPA has been updated in our database');
		}
		getCPGA(id);
	}
	function displayDiv() {
		document.getElementById('res').innerText = 'Your calculated SGPA is';
		document.getElementById('result').innerText = finalGPA.toFixed(2);
		document.getElementById('push').style.display = 'block';
	}
	onMount(() => {
		retrieveDataFromLocalStorage();
	});
</script>

<div class="min-h-screen py-20">
	<div class="md:flex md:justify-left">
		<div class="flex justify-center items-start px-5 md:px-10">
			<div class="text-left">
				<h1 class="py-50 md:text-6xl text-3xl">SGPA Calculator</h1>
				<select
					id="sem"
					class="text-blue-400 text-2xl bg-inherit md:py-3"
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
					class="text-blue-400 text-2xl bg-inherit ml-5"
					bind:value={branch}
					on:change={clearItems}
				>
					<option value="" selected disabled>Branch</option>
					<option value="aids">AI/DS</option>
					<option value="iot">IoT</option>
					<option value="cyber">Cyber</option>
					<option value="bcom">B.Com</option>
					<option value="bcompa">B.Com PA</option>
					<option value="bsc">B.Sc</option>
				</select>
				<button
					class="flex-col md:ml-5 bg-[#F4F4F4] shadow-md hover:bg-sky-100 w-fit rounded-2xl px-3 py-3 mt-2 mb-2"
					on:click={calculateHandler}>Calculate</button
				>
				<div class="md:py-5">
					{#if branch && sem}
						<table class="md:px-10 md:py-10 rounded-lg bg-[#DAEDFF]">
							<thead>
								<tr>
									<th class="border-b border-black p-2 md:p-4">Course</th>
									<th class="border-b border-black p-2 md:p-4">Credit</th>
									<th class="border-b border-black p-2 md:p-4">Grade</th>
								</tr>
							</thead>
							<tbody>
								{#each Object.entries(data[sem][branch]) as [courseCode, credit], idx}
									<tr>
										<td class="md:p-4 p-2">{courseCode}</td>
										<td class="md:p-4 p-2 justify-center">{credit}</td>
										<td class="md:p-4 p-2">
											<select
												class="bg-[#DAEDFF] w-10 md:w-20 flex justify-center"
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
					{/if}
				</div>
			</div>
		</div>
		<br />
		<div class="flex-col items-left justify-center px-10">
			<p id="res" class="md:text-6xl text-3xl"></p>
			<p id="result" class="py-5 text-blue-500 md:text-8xl text-4xl"></p>
			<div id="push" class="flex push mt-10">
				<p class="mb-2">
					Save your SGPA to our database, for later reference and to <a
						href="/cgpa"
						class="underline">calculate your CGPA</a
					> with your other SGPAs.
				</p>
				<p class="mb-2">
					Enter your SNU Digital ID for you to access your data anytime across this website. No
					other data is collected from you.
				</p>
				<input
					type="text"
					id="id"
					class="rounded-lg w-fit rounded-2xl px-3 py-3"
					placeholder="Digital ID"
				/>
				<button
					class="flex bg-[#F4F4F4] shadow-md hover:bg-sky-100 w-fit rounded-2xl px-3 py-3 mt-5"
					on:click={pushToDB}
				>
					Save it in database
				</button>
				<div class="lds-dual-ring mt-5" id="load"></div>
			</div>
		</div>
	</div>
</div>

<style>
	.push {
		display: none;
	}

	.lds-dual-ring,
	.lds-dual-ring:after {
		box-sizing: border-box;
	}
	.lds-dual-ring {
		display: none;
		width: 80px;
		height: 80px;
	}
	.lds-dual-ring:after {
		content: ' ';
		display: block;
		width: 64px;
		height: 64px;
		margin: 8px;
		border-radius: 50%;
		border: 6.4px solid currentColor;
		border-color: currentColor transparent currentColor transparent;
		animation: lds-dual-ring 1.2s linear infinite;
	}
	@keyframes lds-dual-ring {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
