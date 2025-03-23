<script lang="ts">
	import { onMount } from 'svelte';
	import data from '../../data.json';
	import PocketBase from 'pocketbase';

	let year: string = '';
	let branch: string = '';
	let sem: string = ''; // Changed from number to string for better state handling
	let grade: string[] = Array(10).fill('');
	let finalGPA: number = 0;
	let weightedSum: number = 0;
	let totalCredits: number = 0;
	let showResults: boolean = false; // New state to control result visibility

	function clearItems(level: 'year' | 'branch' | 'sem' = 'sem') {
		if (level === 'year') {
			branch = '';
			sem = '';
			showResults = false; // Hide results when year changes
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
		showResults = true; // Show results after calculation
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
		return data[year][branch][`semester ${semester}`].reduce(
			(sum, course) => sum + parseInt(course.credits || '0'),
			0
		);
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

<div class="min-h-screen py-20 px-5 md:px-10 flex flex-col md:flex-row justify-between">
	<!-- Left Section: Calculation Form -->
	<div class="w-full md:w-1/2">
		<h1 class="text-3xl md:text-5xl font-bold">SGPA Calculator</h1>
		<div class="mt-5 space-y-3">
			<select
				id="year"
				class="text-blue-400 text-xl bg-inherit py-2 px-3 rounded-lg border border-blue-400"
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
				class="text-blue-400 text-xl bg-inherit py-2 px-3 rounded-lg border border-blue-400"
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
				class="text-blue-400 text-xl bg-inherit py-2 px-3 rounded-lg border border-blue-400"
				bind:value={sem}
				on:change={() => clearItems('sem')}
				disabled={!year || !branch}
			>
				<option value="" selected disabled>Semester</option>
				{#if year && branch}
					{#each Object.keys(data[year][branch]).map( (sem) => parseInt(sem.split(' ')[1]) ) as semNum}
						<option value={semNum}>Semester {semNum}</option>
					{/each}
				{/if}
			</select>
			<button
				class="bg-blue-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-600"
				on:click={calculateHandler}>Calculate</button
			>
		</div>

		{#if year && branch && sem}
			<div class="mt-5 overflow-x-auto">
				<table class="w-full bg-blue-100 rounded-xl shadow-md">
					<thead>
						<tr class="bg-blue-300">
							<th class="p-3 border-b border-black">Course Code</th>
							<th class="p-3 border-b border-black">Course Name</th>
							<th class="p-3 border-b border-black">Credits</th>
							<th class="p-3 border-b border-black">Grade</th>
						</tr>
					</thead>
					<tbody>
						{#each data[year][branch][`semester ${sem}`] as course, idx}
							<tr>
								<td class="p-3">{course.course_code}</td>
								<td class="p-3">{course.course_name}</td>
								<td class="p-3 text-center">{course.credits}</td>
								<td class="p-3">
									<select
										class="bg-blue-100 border border-blue-400 rounded-lg px-2 py-1"
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
			</div>
		{/if}
	</div>

	<!-- Right Section: Results -->
	{#if showResults}
		<div class="w-full md:w-1/3 flex flex-col items-center mt-10 md:mt-0">
			<p class="text-3xl md:text-5xl font-semibold">SGPA</p>
			<p id="result" class="text-blue-500 text-5xl md:text-7xl font-bold mt-2"></p>
			<div class="mt-10 w-full text-center">
				<p class="mb-2">Save your SGPA for future reference and CGPA calculation.</p>
				<input
					type="text"
					id="id"
					class="border border-gray-400 rounded-lg px-3 py-2 w-full text-center"
					placeholder="Enter Digital ID"
				/>
				<button
					class="bg-blue-500 text-white px-5 py-2 mt-3 rounded-lg shadow-md hover:bg-blue-600"
					on:click={pushToDB}>Save in Database</button
				>
			</div>
		</div>
	{/if}
</div>

<style>
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
