<script lang="ts">
	import { onMount } from 'svelte';
	import data from '../../data.json';
	import PocketBase from 'pocketbase';
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { darkMode } from '$lib/dark';
	import { browser } from '$app/environment';
	import posthog from 'posthog-js';

	let year: string = '';
	let branch: string = '';
	let sem: string = '';
	let grade: string[] = Array(10).fill('');
	let finalGPA: number = 0;
	let weightedSum: number = 0;
	let totalCredits: number = 0;
	let showResults: boolean = false;
	let isLoading: boolean = false;
	let digitalId: string = '';
	let saveSuccess: boolean = false;
	let saveMessage: string = '';

	function clearItems(level: 'year' | 'branch' | 'sem' = 'sem') {
		if (level === 'year') {
			branch = '';
			sem = '';
			showResults = false;
		} else if (level === 'branch') {
			sem = '';
			showResults = false;
		}
		grade = Array(10).fill('');
	}

	function calculateHandler() {
		isLoading = true;
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

		if (browser) {
			posthog.capture('sgpa_calculated', {
				year: year,
				branch: branch,
				semester: sem,
				gpa_result: parseFloat(finalGPA.toFixed(2)),
				total_credits: totalCredits,
				courses_count: courses.length
			});
		}

		setTimeout(() => {
			showResults = true;
			isLoading = false;
		}, 600);
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

			if (storedFinalGPA) {
				finalGPA = parseFloat(storedFinalGPA);
				showResults = true;
			}
		}
	}

	const pb = new PocketBase('https://edita.pockethost.io');

	function getSemesterCredits(year: string, branch: string, semester: string): number {
		if (!data[year]?.[branch]?.[`semester ${semester}`]) return 0;
		return data[year][branch][`semester ${semester}`].reduce(
			(sum, course) => sum + parseInt(course.credits || '0'),
			0
		);
	}

	async function getCPGA(id: any) {
		try {
			const record = await pb.collection('gpa').getOne(id);

			let totalCredits = 0;
			let gpa = 0;

			for (let i = 1; i <= 8; i++) {
				if (record[i] === undefined) continue;

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
		} catch (error) {
			console.error('Error fetching CGPA:', error);
		}
	}

	async function pushToDB() {
		isLoading = true;
		saveSuccess = false;

		let id = digitalId + 1234567;
		if (id.length != 15) {
			saveMessage = 'Please enter a valid Digital ID!';
			isLoading = false;
			saveSuccess = false;
			return;
		}

		const dataToSave = {
			id: id,
			Dept: branch
		};
		dataToSave[sem] = finalGPA.toFixed(2);

		try {
			try {
				await pb.collection('gpa').create(dataToSave);
				saveMessage = 'Your SGPA has been saved to our database';
			} catch (e) {
				await pb.collection('gpa').update(id, dataToSave);
				saveMessage = 'Your SGPA has been updated in our database';
			}

			saveSuccess = true;
			
			if (browser) {
				posthog.capture('sgpa_saved_to_database', {
					year: year,
					branch: branch,
					semester: sem,
					gpa_result: parseFloat(finalGPA.toFixed(2)),
					digital_id_length: digitalId.length
				});
			}
			
			await getCPGA(id);
		} catch (error) {
			saveMessage = 'Error saving data. Please try again.';
			saveSuccess = false;
			
			
			if (browser) {
				posthog.capture('sgpa_save_error', {
					year: year,
					branch: branch,
					semester: sem,
					error_message: error.message || 'Unknown error'
				});
			}
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		retrieveDataFromLocalStorage();
	});

	$: hasAllGrades = grade.some((g) => g !== '') && grade.length > 0;
	$: canCalculate = year && branch && sem && hasAllGrades;
</script>

<div
	class={`content-container ${$darkMode ? 'bg-gray-900' : 'bg-white'}`}
	in:fly={{ y: -15, duration: 400, delay: 100, opacity: 0, easing: cubicOut }}
>
	<div class="max-w-7xl mx-auto">
		<div class="text-center mb-8">
			<h1
				class={`text-4xl md:text-5xl font-extrabold tracking-tight ${$darkMode ? 'text-white' : 'text-gray-900'}`}
				in:fly={{ y: -15, duration: 400, delay: 100, opacity: 0, easing: cubicOut }}
			>
				<span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
					SGPA Calculator
				</span>
			</h1>
			<p
				class={`mt-3 text-lg max-w-3xl mx-auto ${$darkMode ? 'text-gray-300' : 'text-gray-600'}`}
				in:fly={{ y: -10, duration: 400, delay: 250, opacity: 0, easing: cubicOut }}
			>
				Calculate your semester GPA and save it for future reference
			</p>
		</div>

		<div
			class="grid grid-cols-1 lg:grid-cols-5 gap-8"
			in:fly={{ y: -15, duration: 500, delay: 350, opacity: 0, easing: cubicOut }}
		>
			<div
				class={`lg:col-span-3 rounded-2xl shadow-xl p-6 border ${
					$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
				}`}
				in:fly={{ y: -20, duration: 600, delay: 450, opacity: 0, easing: cubicOut }}
			>
				<div class="space-y-5">
					<div
						class="grid grid-cols-1 md:grid-cols-3 gap-4"
						in:fly={{ y: -10, duration: 400, delay: 550, opacity: 0, easing: cubicOut }}
					>
						<div>
							<label
								for="year"
								class={`block text-sm font-medium mb-1 ${
									$darkMode ? 'text-gray-200' : 'text-gray-700'
								}`}
							>
								Batch
							</label>
							<select
								id="year"
								class={`block w-full p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
									$darkMode
										? 'bg-gray-700 border-gray-600 text-gray-200'
										: 'bg-blue-50 border-blue-200 text-gray-800'
								}`}
								bind:value={year}
								on:change={() => clearItems('year')}
							>
								<option value="" selected disabled>Select Year</option>
								{#each Object.keys(data) as yearOption}
									<option value={yearOption}
										>{yearOption.replace(
											/^(\d{4})$/,
											'$1-' + (parseInt(yearOption.substring(2)) + 4)
										)}</option
									>
								{/each}
							</select>
						</div>

						<div>
							<label
								for="branch"
								class={`block text-sm font-medium mb-1 ${
									$darkMode ? 'text-gray-200' : 'text-gray-700'
								}`}
							>
								Branch
							</label>
							<select
								id="branch"
								class={`block w-full p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
									$darkMode
										? 'bg-gray-700 border-gray-600 text-gray-200'
										: 'bg-blue-50 border-blue-200 text-gray-800'
								}`}
								bind:value={branch}
								on:change={() => clearItems('branch')}
								disabled={!year}
							>
								<option value="" selected disabled>Select Branch</option>
								<option value="aids">AI/DS</option>
								<option value="iot">IoT</option>
								<option value="cyber">Cyber</option>
								<option value="b.com (hons)">B.Com</option>
								<option value="b.com pa">B.Com PA</option>
								<option value="b.sc">B.Sc</option>
							</select>
						</div>

						<div>
							<label
								for="sem"
								class={`block text-sm font-medium mb-1 ${
									$darkMode ? 'text-gray-200' : 'text-gray-700'
								}`}
							>
								Semester
							</label>
							<select
								id="sem"
								class={`block w-full p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
									$darkMode
										? 'bg-gray-700 border-gray-600 text-gray-200'
										: 'bg-blue-50 border-blue-200 text-gray-800'
								}`}
								bind:value={sem}
								on:change={() => clearItems('sem')}
								disabled={!year || !branch}
							>
								<option value="" selected disabled>Select Semester</option>
								{#if year && branch}
									{#each Object.keys(data[year][branch]).map( (sem) => parseInt(sem.split(' ')[1]) ) as semNum}
										<option value={semNum}>Semester {semNum}</option>
									{/each}
								{/if}
							</select>
						</div>
					</div>

					{#if year && branch && sem}
						<div
							class="mt-6"
							in:fly={{ y: -10, duration: 400, delay: 650, opacity: 0, easing: cubicOut }}
						>
							<div class="sm:hidden space-y-4">
								{#each data[year][branch][`semester ${sem}`] as course, idx}
									<div
										class={`rounded-xl border p-4 shadow-sm ${
											idx % 2 === 0
												? $darkMode
													? 'bg-gray-800 border-gray-700'
													: 'bg-white border-gray-200'
												: $darkMode
													? 'bg-gray-700 border-gray-600'
													: 'bg-blue-50 border-blue-200'
										}`}
										in:fly={{
											y: -5,
											duration: 300,
											delay: 750 + idx * 50,
											opacity: 0,
											easing: cubicOut
										}}
									>
										<div class="flex flex-col space-y-3">
											<div class="flex justify-between items-center">
												<span
													class={`text-xs font-medium ${$darkMode ? 'text-blue-300' : 'text-blue-600'}`}
												>
													{course.course_code}
												</span>
												<span
													class={`text-xs px-2 py-1 rounded-lg ${$darkMode ? 'bg-gray-900 text-gray-300' : 'bg-blue-100 text-blue-800'}`}
												>
													{course.credits} Credits
												</span>
											</div>

											<h3
												class={`text-sm font-medium ${$darkMode ? 'text-gray-200' : 'text-gray-800'}`}
											>
												{course.course_name}
											</h3>

											<div class="flex justify-between items-center pt-2">
												<span class={`text-xs ${$darkMode ? 'text-gray-400' : 'text-gray-500'}`}
													>Select Grade:</span
												>
												<select
													class={`rounded-lg px-3 py-1 w-24 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
														$darkMode
															? 'bg-gray-900 border-gray-600 text-gray-200'
															: 'bg-white border-blue-300 text-gray-900'
													}`}
													bind:value={grade[idx]}
												>
													<option value="" selected disabled>Select</option>
													<option value="10">O</option>
													<option value="9">A+</option>
													<option value="8">A</option>
													<option value="7">B+</option>
													<option value="6">B</option>
													<option value="5">P</option>
													<option value="0">RA/AB</option>
												</select>
											</div>
										</div>
									</div>
								{/each}
							</div>

							<div
								class="hidden sm:block overflow-x-auto rounded-xl border border-blue-100 shadow-md"
							>
								<table
									class={`min-w-full divide-y ${$darkMode ? 'divide-gray-700' : 'divide-blue-200'}`}
								>
									<thead class={$darkMode ? 'bg-gray-700' : 'bg-blue-50'}>
										<tr>
											<th
												class={`px-3 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
													$darkMode ? 'text-blue-300' : 'text-blue-800'
												}`}
											>
												Code
											</th>
											<th
												class={`px-3 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
													$darkMode ? 'text-blue-300' : 'text-blue-800'
												} w-full`}
											>
												Course
											</th>
											<th
												class={`px-2 sm:px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider ${
													$darkMode ? 'text-blue-300' : 'text-blue-800'
												} whitespace-nowrap`}
											>
												Cr
											</th>
											<th
												class={`px-2 sm:px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider ${
													$darkMode ? 'text-blue-300' : 'text-blue-800'
												}`}
											>
												Grade
											</th>
										</tr>
									</thead>
									<tbody
										class={`divide-y ${$darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-blue-100'}`}
									>
										{#each data[year][branch][`semester ${sem}`] as course, idx}
											<tr
												class={`${
													idx % 2 === 0
														? $darkMode
															? 'bg-gray-800'
															: 'bg-white'
														: $darkMode
															? 'bg-gray-700'
															: 'bg-blue-50'
												}`}
												in:fly={{
													y: -5,
													duration: 300,
													delay: 750 + idx * 50,
													opacity: 0,
													easing: cubicOut
												}}
											>
												<td
													class={`px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium ${
														$darkMode ? 'text-gray-200' : 'text-gray-700'
													}`}
												>
													{course.course_code}
												</td>
												<td
													class={`px-3 sm:px-6 py-4 text-xs sm:text-sm ${$darkMode ? 'text-gray-200' : 'text-gray-700'} max-w-[150px] sm:max-w-none truncate sm:whitespace-normal`}
												>
													{course.course_name}
												</td>
												<td
													class={`px-2 sm:px-6 py-4 text-xs sm:text-sm text-center ${
														$darkMode ? 'text-gray-200' : 'text-gray-700'
													}`}
												>
													{course.credits}
												</td>
												<td class="px-2 sm:px-6 py-4 text-xs sm:text-sm text-center">
													<select
														class={`rounded-lg px-2 py-1 sm:px-3 sm:py-2 w-16 sm:w-auto text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
															$darkMode
																? idx % 2 === 0
																	? 'bg-gray-800 border-gray-600 text-gray-200'
																	: 'bg-gray-700 border-gray-600 text-gray-200'
																: idx % 2 === 0
																	? 'bg-white border-blue-300 text-gray-900'
																	: 'bg-blue-50 border-blue-300 text-gray-900'
														}`}
														bind:value={grade[idx]}
													>
														<option value="" selected disabled>Select</option>
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
						</div>
					{/if}

					<div
						class="flex justify-center mt-6"
						in:fly={{ y: -5, duration: 300, delay: 850, opacity: 0, easing: cubicOut }}
					>
						<button
							class="px-8 py-3 font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transform transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
							on:click={calculateHandler}
							disabled={!canCalculate || isLoading}
						>
							{#if isLoading && !showResults}
								<svg
									class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
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
								Calculating...
							{:else}
								Calculate SGPA
							{/if}
						</button>
					</div>
				</div>
			</div>

			<div
				class="lg:col-span-2"
				in:fly={{ y: -20, duration: 600, delay: 500, opacity: 0, easing: cubicOut }}
			>
				{#if showResults}
					<div
						class={`rounded-2xl shadow-xl p-6 border ${
							$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
						}`}
						transition:fade={{ duration: 300 }}
					>
						<div class="text-center">
							<h2
								class={`text-2xl font-bold mb-2 ${$darkMode ? 'text-white' : 'text-gray-800'}`}
								in:fly={{ y: -10, duration: 400, delay: 600, opacity: 0, easing: cubicOut }}
							>
								Your SGPA Result
							</h2>
							<div
								class="flex items-center justify-center my-6"
								in:fly={{ y: -10, duration: 500, delay: 700, opacity: 0, easing: cubicOut }}
							>
								<div
									class="bg-gradient-to-r from-blue-500 to-indigo-600 p-1 rounded-full h-40 w-40 flex items-center justify-center shadow-xl"
								>
									<div
										class={`rounded-full h-36 w-36 flex items-center justify-center ${
											$darkMode ? 'bg-gray-900' : 'bg-white'
										}`}
									>
										<span
											class="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700"
										>
											{finalGPA.toFixed(2)}
										</span>
									</div>
								</div>
							</div>

							<p
								class="text-gray-600 mb-6"
								in:fly={{ y: -5, duration: 300, delay: 800, opacity: 0, easing: cubicOut }}
							>
								Save your SGPA for future reference and CGPA calculation
							</p>

							<div
								class="space-y-4"
								in:fly={{ y: -5, duration: 300, delay: 900, opacity: 0, easing: cubicOut }}
							>
								<div class="relative">
									<input
										type="text"
										bind:value={digitalId}
										class={`block w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
											$darkMode
												? 'bg-gray-700 border-gray-600 text-gray-200'
												: 'bg-gray-50 border-gray-200 text-gray-800'
										}`}
										placeholder="Enter Digital ID"
									/>
								</div>

								<button
									class="w-full px-6 py-3 font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg transform transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
									on:click={pushToDB}
									disabled={isLoading || !digitalId}
								>
									{#if isLoading}
										<svg
											class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
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
										Saving...
									{:else}
										Save to Database
									{/if}
								</button>

								{#if saveMessage}
									<div
										class={`text-sm p-3 rounded-lg ${saveSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
										in:fly={{ y: -5, duration: 300, delay: 300, opacity: 0, easing: cubicOut }}
									>
										{saveMessage}
									</div>
								{/if}
							</div>
						</div>
					</div>
				{:else}
					<div
						class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col items-center justify-center text-center"
						in:fly={{ y: -10, duration: 400, delay: 600, opacity: 0, easing: cubicOut }}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-20 w-20 text-blue-200 dark:text-blue-400 mb-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							in:fly={{ y: -10, duration: 400, delay: 700, opacity: 0, easing: cubicOut }}
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							/>
						</svg>
						<h3
							class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2"
							in:fly={{ y: -5, duration: 300, delay: 800, opacity: 0, easing: cubicOut }}
						>
							Your results will appear here
						</h3>
						<p
							class="text-gray-500 dark:text-gray-400"
							in:fly={{ y: -5, duration: 300, delay: 900, opacity: 0, easing: cubicOut }}
						>
							Select your academic details and grades, then click calculate
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

	select:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		table {
			display: block;
			overflow-x: auto;
			white-space: nowrap;
			-webkit-overflow-scrolling: touch;
		}
	}

	@media (max-width: 360px) {
		/* Extra tight spacing for very small screens */
		table th,
		table td {
			padding-left: 2px !important;
			padding-right: 2px !important;
		}
	}
</style>
