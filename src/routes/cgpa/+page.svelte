<script lang="ts">
	import { onMount } from 'svelte';
	import data from '../../data.json';
	import credits from '../../credits.json';
	let branch: string;
	let sem: number;
	let grade: string[] = Array(10).fill('');
	let finalGPA: number = 0;

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
	import PocketBase from 'pocketbase';
	const pb = new PocketBase('https://edita.pockethost.io');
	async function getCGPA() {
		let id = document.getElementById('id').value + 1234567;
		const record = await pb.collection('gpa').getOne(id);
		console.log(record);
		console.log(credits);
		let totalCredits = 0;
		let gpa = 0;
		for (let i = 1; i <= 8; i++) {
			if (record[i] == undefined || record[i] == 0) {
				continue;
			} else if (credits[i] == undefined) {
				continue;
			}
			console.log(i, record[i], credits[i][record.Dept]);
			totalCredits += credits[i][record.Dept];
			gpa += record[i] * credits[i][record.Dept];
			console.log(gpa);
		}
		console.log(totalCredits);
		console.log(gpa);
		finalGPA = gpa / totalCredits;
		document.getElementById('result').innerText = finalGPA.toFixed(4);
	}

	onMount(() => {
		retrieveDataFromLocalStorage();
	});
</script>

<div class="min-h-screen">
	<div class="md:flex md:justify-left">
		<div class="flex justify-center items-start px-5 md:px-10">
			<div class="text-left">
				<h1 class="py-50 md:text-6xl text-3xl flex flex-row ">CGPA Calculator<h1 class="ml-4 bg-blue-300 rounded-md">BETA</h1></h1>
				<div class="flex mt-10 flex-col">
					<div class="flex items-center space-x-3">
						<input
							type="text"
							id="id"
							class="rounded-lg w-fit rounded-2xl px-3 py-3"
							placeholder="Digital ID"
						/>
						<button
							class="flex bg-[#F4F4F4] shadow-md hover:bg-sky-100 w-fit rounded-2xl px-3 py-3"
							on:click={getCGPA}
						>
							Retrieve stored Grades
						</button>
					</div>
					<div class="text-5xl mt-5 ">Your CGPA is</div>
					<div class="ml-10 mt-5 text-blue-500 text-7xl" id="result"></div>
				</div>
			</div>
		</div>
		<br />
	</div>
</div>

<style>
</style>
