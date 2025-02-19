<script lang="ts">
	import { onMount } from 'svelte';
	import data from '../../data.json';
	import PocketBase from 'pocketbase';

	let year: string = '';
	let branch: string = '';
	let sem: string = '';  // Changed from number to string for better state handling
	let grade: string[] = Array(10).fill('');
	let finalGPA: number = 0;
	let weightedSum: number = 0;
	let totalCredits: number = 0;
	let showResults: boolean = false;  // New state to control result visibility

	function clearItems(level: 'year' | 'branch' | 'sem' = 'sem') {
		if (level === 'year') {
			branch = '';
			sem = '';
			showResults = false;  // Hide results when year changes
		} else if (level === 'branch') {
			sem = '';
		}
		grade = Array(10).fill('');
	}

	function calculateHandler() {
		console.log('Calculating....');
		totalCredits = 0;
		weightedSum = 0;

		const courses = data[year][branch][`semester ${sem}`];
		
		for (let idx = 0; idx < courses.length; idx++) {
			const selectedGrade = parseInt(grade[idx]);
			const credit = parseInt(courses[idx].credits);
			if (!isNaN(selectedGrade) && !isNaN(credit)) {
				totalCredits += credit;
				weightedSum += selectedGrade * credit;
			}
		}

		finalGPA = totalCredits !== 0 ? weightedSum / totalCredits : 0;
		localStorage.setItem('result', finalGPA.toFixed(2));
		saveDataToLocalStorage();
		showResults = true;  // Show results after calculation
		displayDiv();
	}

	function saveDataToLocalStorage() {
		localStorage.setItem('grades', JSON.stringify(grade));
		localStorage.setItem('year', year);
		localStorage.setItem('sem', sem?.toString());
		localStorage.setItem('branch', branch);
		localStorage.setItem('finalGPA', finalGPA.toFixed(2));
	}

	function retrieveDataFromLocalStorage() {
		const storedGrades = localStorage.getItem('grades');
		const storedYear = localStorage.getItem('year');
		const storedSem = localStorage.getItem('sem');
		const storedBranch = localStorage.getItem('branch');
		const storedFinalGPA = localStorage.getItem('finalGPA');
		
		if (storedGrades && storedYear && storedSem && storedBranch) {
			grade = JSON.parse(storedGrades);
			year = storedYear;
			sem = storedSem;
			branch = storedBranch;
		}
		if (storedFinalGPA) {
			finalGPA = parseFloat(storedFinalGPA);
		}
	}

	const pb = new PocketBase('https://edita.pockethost.io');
	let isDisabled = false;

	function getSemesterCredits(year: string, branch: string, semester: string): number {
		if (!data[year]?.[branch]?.[`semester ${semester}`]) return 0;
		return data[year][branch][`semester ${semester}`].reduce((sum, course) => 
			sum + parseInt(course.credits || '0'), 0);
	}

	async function getCPGA(id: any) {
		const record = await pb.collection('gpa').getOne(id);
		console.log(record);
		
		let totalCredits = 0;
		let gpa = 0;
		
		// Calculate for each semester
		for (let i = 1; i <= 8; i++) {
			if (record[i] === undefined) continue;
			
			// Calculate credits for this semester
			const semesterCredits = getSemesterCredits(year, record.Dept, i.toString());
			if (semesterCredits === 0) continue;
			
			totalCredits += semesterCredits;
			gpa += record[i] * semesterCredits;
		}

		finalGPA = totalCredits > 0 ? gpa / totalCredits : 0;
		let updatedData = {
			id: id,
			CGPA: finalGPA.toFixed(2)
		};
		
		try {
			await pb.collection('gpa').create(updatedData);
		} catch (e) {
			await pb.collection('gpa').update(id, updatedData);
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
		if (!showResults) return;
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
					id="year"
					class="text-blue-400 text-2xl bg-inherit md:py-3"
					bind:value={year}
					on:change={() => clearItems('year')}
				>
					<option value="" selected disabled>Year</option>
					{#each Object.keys(data) as yearOption}
						<option value={yearOption}>{yearOption}</option>
					{/each}
				</select>

				<select
					id="branch"
					class="text-blue-400 text-2xl bg-inherit ml-5"
					bind:value={branch}
					on:change={() => clearItems('branch')}
					disabled={!year}
				>
					<option value="" selected disabled>Branch</option>
					<option value="aids">AI/DS</option>
					<option value="iot">IoT</option>
					<option value="cyber">Cyber</option>
					<option value="b.com (hons)">B.Com</option>
					<option value="b.com pa">B.Com PA</option>
					<option value="b.sc">B.Sc</option>
				</select>

				<select
					id="sem"
					class="text-blue-400 text-2xl bg-inherit ml-5"
					bind:value={sem}
					on:change={() => clearItems('sem')}
					disabled={!year || !branch}
				>
					<option value="" selected disabled>Semester</option>
					{#if year && branch}
						{#each Object.keys(data[year][branch]).map(sem => parseInt(sem.split(' ')[1])) as semNum}
							<option value={semNum}>Semester {semNum}</option>
						{/each}
					{/if}
				</select>

				<button
					class="flex-col md:ml-5 bg-[#F4F4F4] shadow-md hover:bg-sky-100 w-fit rounded-2xl px-3 py-3 mt-2 mb-2"
					on:click={calculateHandler}>Calculate</button
				>
				<div class="md:py-5">
					{#if year && branch && sem}
						<table class="md:px-10 md:py-10 rounded-lg bg-[#DAEDFF]">
							<thead>
								<tr>
									<th class="border-b border-black p-2 md:p-4">Course Code</th>
									<th class="border-b border-black p-2 md:p-4">Course Name</th>
									<th class="border-b border-black p-2 md:p-4">Credits</th>
									<th class="border-b border-black p-2 md:p-4">Grade</th>
								</tr>
							</thead>
							<tbody>
								{#each data[year][branch][`semester ${sem}`] as course, idx}
									<tr>
										<td class="md:p-4 p-2">{course.course_code}</td>
										<td class="md:p-4 p-2">{course.course_name}</td>
										<td class="md:p-4 p-2 justify-center">{course.credits}</td>
										<td class="md:p-4 p-2">
											<select
												class="bg-[#DAEDFF] w-10 md:w-20 flex justify-center"
												bind:value={grade[idx]}
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
		{#if showResults}
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
		{/if}
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

	/* Add these new styles */
	select:disabled {
		opacity: 1 !important;
		background-color: inherit !important;
		color: rgb(96 165 250) !important;
		cursor: not-allowed;
	}

	select:disabled option {
		color: rgb(96 165 250);
		background-color: white;
	}
</style>
