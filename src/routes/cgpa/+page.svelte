<script lang="ts">
	import { onMount } from 'svelte';
	import data from '../../data.json';
	// import credits from '../../credits.json'; // REMOVE THIS LINE
	import PocketBase from 'pocketbase';
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { darkMode } from '$lib/dark';

	let branch: string = '';
	let digitalId: string = '';
	let finalGPA: number = 0;
	let sem_wise: Record<number, number | null> = {};
	let isLoading: boolean = false;
	let showResults: boolean = false;
	let errorMessage: string = '';

	const pb = new PocketBase('https://edita.pockethost.io');

	function normalizeBranchName(dept: string): string {
		if (!dept) return dept;
		const map: Record<string, string> = {
			bsc: "b.sc",
			bcom: "b.com (hons)",
			bcompa: "b.com pa",
			cyber: "cyber",
			aids: "aids",
			iot: "iot"
			// Add more as needed
		};
		const key = dept.toLowerCase().replace(/[^a-z]/g, "");
		return map[key] || dept;
	}

	function normalizeBatchKey(batch: string): string {
		// Map '2023-27' -> '2023', '2024-28' -> '2024', etc.
		if (!batch) return batch;
		return batch.split('-')[0];
	}

	async function getCGPA() {
		if (!digitalId) {
			errorMessage = 'Please enter your Digital ID';
			return;
		}

		errorMessage = '';
		isLoading = true;
		showResults = false;

		try {
			const id = digitalId + 1234567;
			if (id.length != 15) {
				errorMessage = 'Please enter a valid Digital ID!';
				isLoading = false;
				return;
			}

			const record = await pb.collection('gpa').getOne(id);

			let totalCredits = 0;
			let gpa = 0;
			sem_wise = {};

			for (let i = 1; i <= 8; i++) {
				sem_wise[i] = null;
			}

			// Determine batch: prefer record.batch, else infer from id
			let batch = record.batch || getBatchFromRoll(record.id);
			batch = normalizeBatchKey(batch);
			const branchKey = normalizeBranchName(record.Dept);

			for (let i = 1; i <= 8; i++) {
				if (record[i] === undefined || record[i] === 0) {
					continue;
				}

				console.log('DEBUG:', { batch, branchKey, semester: i });
				const semesterCredits = getSemesterCredits(batch, branchKey, i);
				console.log('Semester Credits:', semesterCredits);
				if (semesterCredits === 0) continue;

				sem_wise[i] = record[i];
				totalCredits += semesterCredits;
				gpa += record[i] * semesterCredits;
			}

			if (totalCredits === 0) {
				errorMessage = 'No valid semester data found. Please calculate your SGPA first.';
				isLoading = false;
				return;
			}

			finalGPA = gpa / totalCredits;
			branch = record.Dept;
			showResults = true;

			// Save CGPA to PocketBase
			try {
				finalGPA = parseFloat(finalGPA.toFixed(2));
				await pb.collection('gpa').update(record.id, { CGPA: finalGPA });
				console.log('CGPA saved to PocketBase:', finalGPA);
			} catch (err) {
				console.error('Failed to save CGPA to PocketBase:', err);
			}

			localStorage.setItem('cgpa_finalGPA', finalGPA.toFixed(2));
			localStorage.setItem('cgpa_branch', branch);
			localStorage.setItem('cgpa_digitalId', digitalId);
			localStorage.setItem('cgpa_sem_wise', JSON.stringify(sem_wise));
		} catch (error) {
			console.error('Error fetching CGPA:', error);
			errorMessage = 'No data found for the given ID. Make sure you have saved your SGPA first.';
		} finally {
			isLoading = false;
		}
	}

	function clearData() {
		digitalId = '';
		showResults = false;
		errorMessage = '';
	}

	function retrieveDataFromLocalStorage() {
		const storedFinalGPA = localStorage.getItem('cgpa_finalGPA');
		const storedBranch = localStorage.getItem('cgpa_branch');
		const storedDigitalId = localStorage.getItem('cgpa_digitalId');
		const storedSemWise = localStorage.getItem('cgpa_sem_wise');

		if (storedFinalGPA && storedBranch && storedDigitalId && storedSemWise) {
			finalGPA = parseFloat(storedFinalGPA);
			branch = storedBranch;
			digitalId = storedDigitalId;
			sem_wise = JSON.parse(storedSemWise);
			showResults = true;
		}
	}

	function getBatchFromRoll(roll: string): string {
		if (roll.startsWith('23')) return '2023';
		if (roll.startsWith('24')) return '2024';
		// Add more as needed
		return 'Unknown';
	}

	function getSemesterCredits(batch: string, branch: string, semester: number): number {
		const batchData = (data as Record<string, any>)[batch];
		if (!batchData) return 0;
		const branchData = batchData[branch];
		if (!branchData) return 0;
		const semKey = `semester ${semester}`;
		const semCourses = branchData[semKey];
		if (!semCourses) return 0;
		return semCourses.reduce((sum: number, course: { credits?: number }) => sum + (course.credits || 0), 0);
	}

	async function getBatch(roll: string) {
		if (!roll) return 'Unknown';
		if (roll.startsWith('23')) return '2023-27';
		if (roll.startsWith('24')) return '2024-28';
		// Add more rules as needed
		return 'Unknown';
	}

	async function backfill() {
		const records = await pb.collection('grades').getFullList({ batch: 200 }); // adjust collection name and batch size as needed

		for (const record of records) {
			const batch = await getBatch(record.roll_number || record.roll);
			await pb.collection('grades').update(record.id, { batch });
			console.log(`Updated ${record.id} with batch ${batch}`);
		}
	}

	onMount(() => {
		retrieveDataFromLocalStorage();
	});
</script>

<div
	class={`content-container ${$darkMode ? 'bg-gray-900' : 'bg-white'}`}
	in:fly={{ y: -15, duration: 400, delay: 100, opacity: 0, easing: cubicOut }}
>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
		<div class="text-center mb-8">
			<h1
				class={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight ${
					$darkMode ? 'text-white' : 'text-gray-900'
				}`}
				in:fly={{ y: -15, duration: 400, delay: 100, opacity: 0, easing: cubicOut }}
			>
				<span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
					CGPA Calculator
				</span>
			</h1>
			<p
				class={`mt-2 sm:mt-3 text-base sm:text-lg max-w-3xl mx-auto ${
					$darkMode ? 'text-gray-300' : 'text-gray-600'
				}`}
				in:fly={{ y: -10, duration: 400, delay: 250, opacity: 0, easing: cubicOut }}
			>
				Check your cumulative grade point average based on your stored semester GPAs
			</p>
		</div>

		<div
			class="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8"
			in:fly={{ y: -5, duration: 400, delay: 400, opacity: 0, easing: cubicOut }}
		>
			<div
				class={`lg:col-span-3 rounded-2xl shadow-xl p-4 sm:p-6 border ${
					$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
				}`}
				in:fly={{ y: -5, duration: 400, delay: 500, opacity: 0, easing: cubicOut }}
			>
				<div class="space-y-4 sm:space-y-6">
					<p class={`text-sm sm:text-base ${$darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
						Before using this calculator, make sure you have calculated and saved your SGPAs using
						the
						<a href="/sgpa" class="text-indigo-600 hover:text-indigo-400">SGPA Calculator</a>.
					</p>

					<div class="mt-4 sm:mt-6">
						<label
							class={`block text-sm font-medium mb-1 ${
								$darkMode ? 'text-gray-200' : 'text-gray-700'
							}`}
						>
							Digital ID
						</label>
						<div class="flex flex-col sm:flex-row gap-3">
							<input
								type="text"
								bind:value={digitalId}
								class={`flex-1 p-2.5 sm:p-3 rounded-xl border transition-all ${
									$darkMode
										? 'bg-gray-700 border-gray-600 text-gray-200'
										: 'bg-indigo-50 border-indigo-200 text-gray-800'
								}`}
								placeholder="Enter your Digital ID"
							/>
							<button
								on:click={getCGPA}
								class={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium text-white transition transform hover:-translate-y-0.5
									bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
									focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md`}
								disabled={isLoading}
							>
								{#if isLoading}
									<span class="flex items-center">
										<svg
											class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Loading...
									</span>
								{:else}
									Calculate
								{/if}
							</button>
						</div>

						{#if errorMessage}
							<p class="mt-2 text-red-500 text-sm" in:fade={{ duration: 200 }}>
								{errorMessage}
							</p>
						{/if}
					</div>

					<div
						class={`mt-4 sm:mt-6 p-3 sm:p-5 rounded-xl text-sm sm:text-base ${
							$darkMode ? 'bg-gray-700' : 'bg-indigo-50'
						}`}
					>
						<h3 class={`font-medium mb-2 ${$darkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
							Important Notes:
						</h3>
						<ul
							class={`list-disc list-inside space-y-1 ${
								$darkMode ? 'text-gray-300' : 'text-gray-700'
							}`}
						>
							<li>This calculator retrieves your semester GPAs from our database</li>
							<li>Your CGPA is calculated based on the credit weightages of each semester</li>
							<li>For accurate results, ensure all your semester GPAs are saved correctly</li>
							<li>The calculator supports all batches and departments at SNU Chennai</li>
						</ul>
					</div>
				</div>
			</div>

			<div
				class="lg:col-span-2"
				in:fly={{ y: -5, duration: 400, delay: 600, opacity: 0, easing: cubicOut }}
			>
				{#if showResults}
					<div
						class={`rounded-2xl shadow-xl p-4 sm:p-6 border ${
							$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
						}`}
					>
						<div class="text-center">
							<h2
								class={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${
									$darkMode ? 'text-white' : 'text-gray-800'
								}`}
							>
								Your CGPA Result
							</h2>

							<div class="flex justify-center items-center mb-4 sm:mb-6">
								<div
									class="bg-gradient-to-r from-indigo-500 to-purple-600 p-1 rounded-full h-32 w-32 sm:h-40 sm:w-40 flex items-center justify-center"
								>
									<div
										class={`rounded-full h-28 w-28 sm:h-36 sm:w-36 flex items-center justify-center ${
											$darkMode ? 'bg-gray-800' : 'bg-white'
										}`}
									>
										<span
											class="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700"
										>
											{finalGPA.toFixed(2)}
										</span>
									</div>
								</div>
							</div>

							<div class="mt-4 sm:mt-6">
								<h3
									class={`text-base sm:text-lg font-semibold mb-2 sm:mb-3 ${
										$darkMode ? 'text-gray-200' : 'text-gray-700'
									}`}
								>
									Semester Breakdown
								</h3>
								<div class="space-y-1 sm:space-y-2 text-sm sm:text-base">
									{#each Object.entries(sem_wise) as [semNum, gpa], i}
										{#if gpa !== null}
											<div
												class={`flex justify-between items-center py-1.5 sm:py-2 border-b ${
													$darkMode ? 'border-gray-700' : 'border-indigo-100'
												}`}
											>
												<span
													class={`font-medium ${$darkMode ? 'text-gray-300' : 'text-gray-700'}`}
												>
													Semester {semNum}
												</span>
												<span class="text-indigo-600">
													{gpa}
												</span>
											</div>
										{/if}
									{/each}
								</div>
							</div>
						</div>
					</div>
				{:else}
					<div
						class={`rounded-2xl shadow-xl p-4 sm:p-6 border h-full flex flex-col items-center justify-center text-center ${
							$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
						}`}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class={`h-16 w-16 sm:h-20 sm:w-20 mb-3 sm:mb-4 ${
								$darkMode ? 'text-indigo-400' : 'text-indigo-200'
							}`}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							/>
						</svg>
						<h3
							class={`text-lg sm:text-xl font-semibold mb-1 sm:mb-2 ${
								$darkMode ? 'text-gray-200' : 'text-gray-700'
							}`}
						>
							Your results will appear here
						</h3>
						<p class={`text-sm sm:text-base ${$darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
							Enter your Digital ID and click Calculate to view your CGPA
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	@media (prefers-reduced-motion: no-preference) {
		h1 span {
			background-size: 300% 100%;
			animation: gradient-shift 8s ease infinite;
		}

		@keyframes gradient-shift {
			0%,
			100% {
				background-position: 0% 50%;
			}
			50% {
				background-position: 100% 50%;
			}
		}
	}
</style>
