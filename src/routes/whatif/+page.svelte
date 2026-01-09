<script lang="ts">
	import { onMount } from 'svelte';
	import data from '../../data.json';
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { darkMode } from '$lib/dark';
	import { browser } from '$app/environment';
	import posthog from 'posthog-js';

	// Grade point mapping
	const gradePoints: Record<string, number> = {
		'O': 10,
		'A+': 9,
		'A': 8,
		'B+': 7,
		'B': 6,
		'P': 5,
		'RA/AB': 0
	};

	const gradePointToLetter: Record<number, string> = {
		10: 'O',
		9: 'A+',
		8: 'A',
		7: 'B+',
		6: 'B',
		5: 'P',
		0: 'RA/AB'
	};

	interface CourseEntry {
		course_code: string;
		course_name: string;
		credits: number;
		grade: string;
		isPending: boolean;
	}

	// Mode switching
	type CalculatorMode = 'course' | 'semester';
	let mode: CalculatorMode = 'course';

	// SGPA (Course) Mode State
	let year: string = '';
	let branch: string = '';
	let sem: string = '';
	let targetGPA: number = 8.0;
	let courses: CourseEntry[] = [];
	let showResults: boolean = false;
	let requiredGrades: { course: CourseEntry; requiredGrade: string; achievable: boolean }[] = [];

	// CGPA (Semester) Mode State
	let currentCGPA: number | null = null;
	let completedCredits: number | null = null;
	let upcomingCredits: number | null = null;
	let targetCGPA: number = 8.5;
	let requiredSGPA: { val: number; achievable: boolean; message: string } | null = null;

	function clearItems(level: 'year' | 'branch' | 'sem' = 'sem') {
		if (level === 'year') {
			branch = '';
			sem = '';
		} else if (level === 'branch') {
			sem = '';
		}
		courses = [];
		showResults = false;
		requiredGrades = [];
	}

	function initializeCourses() {
		if (year && branch && sem && data[year]?.[branch]?.[`semester ${sem}`]) {
			courses = data[year][branch][`semester ${sem}`].map((course: any) => ({
				course_code: course.course_code,
				course_name: course.course_name,
				credits: parseInt(course.credits),
				grade: '',
				isPending: false
			}));
		}
		showResults = false;
		requiredGrades = [];
	}

	function togglePending(idx: number) {
		courses[idx].isPending = !courses[idx].isPending;
		if (courses[idx].isPending) {
			courses[idx].grade = '';
		}
		courses = courses;
	}

	function convertToLetterGrade(gradePoint: number): { grade: string; achievable: boolean } {
		if (gradePoint > 10) {
			return { grade: 'Not Possible', achievable: false };
		}
		if (gradePoint < 0) {
			return { grade: 'Any Grade Works!', achievable: true };
		}

		// Find the minimum grade needed
		const grades = [
			{ letter: 'P', points: 5 },
			{ letter: 'B', points: 6 },
			{ letter: 'B+', points: 7 },
			{ letter: 'A', points: 8 },
			{ letter: 'A+', points: 9 },
			{ letter: 'O', points: 10 }
		];

		for (const g of grades) {
			if (g.points >= gradePoint) {
				return { grade: g.letter, achievable: true };
			}
		}

		return { grade: 'Not Possible', achievable: false };
	}

	function calculateRequiredGrades() {
		const completedCourses = courses.filter((c) => !c.isPending && c.grade !== '');
		const pendingCourses = courses.filter((c) => c.isPending);

		if (pendingCourses.length === 0) {
			alert('Please mark at least one course as pending');
			return;
		}

		// Calculate current weighted sum and credits from completed courses
		let currentWeightedSum = 0;
		let currentCredits = 0;

		for (const course of completedCourses) {
			const gradePoint = gradePoints[course.grade] ?? 0;
			currentWeightedSum += gradePoint * course.credits;
			currentCredits += course.credits;
		}

		// Calculate total credits including pending courses
		const pendingCredits = pendingCourses.reduce((sum, c) => sum + c.credits, 0);
		const totalCredits = currentCredits + pendingCredits;

		// Calculate required total weighted sum for target GPA
		const requiredTotalSum = targetGPA * totalCredits;
		const requiredPendingSum = requiredTotalSum - currentWeightedSum;

		// For single pending course, direct calculation
		if (pendingCourses.length === 1) {
			const course = pendingCourses[0];
			const requiredGradePoint = requiredPendingSum / course.credits;
			const result = convertToLetterGrade(requiredGradePoint);

			requiredGrades = [
				{
					course,
					requiredGrade: result.grade,
					achievable: result.achievable
				}
			];
		} else {
			// For multiple pending courses, calculate minimum average needed
			const avgRequired = requiredPendingSum / pendingCredits;
			const baseResult = convertToLetterGrade(avgRequired);

			requiredGrades = pendingCourses.map((course) => {
				// Calculate individual required grade assuming others get minimum passing (P = 5)
				const otherPendingCredits = pendingCredits - course.credits;
				const otherMinSum = otherPendingCredits * 5; // Assume others get P
				const thisRequired = (requiredPendingSum - otherMinSum) / course.credits;
				const result = convertToLetterGrade(thisRequired);

				return {
					course,
					requiredGrade: result.achievable
						? `${result.grade} (if others get P)`
						: result.grade,
					achievable: result.achievable
				};
			});

			// Add average scenario info
			requiredGrades.unshift({
				course: {
					course_code: 'AVG',
					course_name: 'Average Grade Needed (across all pending)',
					credits: pendingCredits,
					grade: '',
					isPending: true
				},
				requiredGrade: baseResult.grade,
				achievable: baseResult.achievable
			});
		}

		showResults = true;

		if (browser) {
			posthog.capture('whatif_calculated_sgpa', {
				year,
				branch,
				semester: sem,
				target_gpa: targetGPA,
				pending_courses: pendingCourses.length
			});
		}
	}

	function calculateRequiredSGPA() {
		if (
			currentCGPA === null ||
			completedCredits === null ||
			upcomingCredits === null ||
			upcomingCredits <= 0
		)
			return;

		const totalCredits = completedCredits + upcomingCredits;
		const targetPoints = targetCGPA * totalCredits;
		const currentPoints = currentCGPA * completedCredits;
		const requiredPoints = targetPoints - currentPoints;
		const requiredVal = requiredPoints / upcomingCredits;

		let achievable = true; 
		let message = "Achievable";

		if (requiredVal > 10) {
			achievable = false;
			const maxPoints = currentPoints + 10 * upcomingCredits;
			const maxCGPA = maxPoints / totalCredits;
			message = `Not possible. Max CGPA achievable is ${maxCGPA.toFixed(2)} (with 10 SGPA)`;
		} else if (requiredVal <= 0) {
			message = 'Already achieved! Even 0 SGPA works.';
		} else if (requiredVal > 9.5) {
			message = 'Extremely Challenging (Need near perfect score)';
		}

		requiredSGPA = {
			val: requiredVal,
			achievable,
			message
		};

		if (browser) {
			posthog.capture('whatif_calculated_cgpa', {
				current_cgpa: currentCGPA,
				target_cgpa: targetCGPA,
				completed_credits: completedCredits,
				upcoming_credits: upcomingCredits
			});
		}
	}

	function getGradeColor(achievable: boolean, grade: string): string {
		if (!achievable || grade === 'Not Possible') {
			return 'text-red-500';
		}
		if (grade.includes('Any Grade') || grade === 'P' || grade === 'B') {
			return 'text-green-500';
		}
		if (grade === 'B+' || grade === 'A') {
			return 'text-yellow-500';
		}
		return 'text-orange-500';
	}

	$: if (sem) initializeCourses();
	$: hasPendingCourses = courses.some((c) => c.isPending);
	$: hasCompletedGrades = courses.some((c) => !c.isPending && c.grade !== '');
	$: canCalculateSGPA = hasPendingCourses && (hasCompletedGrades || courses.every((c) => c.isPending));
	$: canCalculateCGPA =
		currentCGPA !== null &&
		completedCredits !== null &&
		upcomingCredits !== null &&
		upcomingCredits > 0;
</script>

<div
	class={`content-container ${$darkMode ? 'bg-gray-900' : 'bg-white'}`}
	in:fly={{ y: -15, duration: 400, delay: 100, opacity: 0, easing: cubicOut }}
>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
		<div class="text-center mb-8">
			<h1
				class={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight ${$darkMode ? 'text-white' : 'text-gray-900'}`}
				in:fly={{ y: -15, duration: 400, delay: 100, opacity: 0, easing: cubicOut }}
			>
				<span class="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
					What-If Calculator
				</span>
			</h1>
			<p
				class={`mt-2 sm:mt-3 text-base sm:text-lg max-w-3xl mx-auto ${$darkMode ? 'text-gray-300' : 'text-gray-600'}`}
				in:fly={{ y: -10, duration: 400, delay: 250, opacity: 0, easing: cubicOut }}
			>
				Plan your academic goals effectively.
			</p>
		</div>

		<!-- Mode Toggles -->
		<div
			class="flex justify-center mb-8"
			in:fly={{ y: -10, duration: 400, delay: 300, opacity: 0, easing: cubicOut }}
		>
			<div class={`inline-flex rounded-xl p-1 ${$darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
				<button
					class={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
						mode === 'course'
							? 'bg-white text-amber-600 shadow-sm'
							: 'text-gray-500 hover:text-gray-700'
					} ${$darkMode && mode === 'course' ? 'bg-gray-700 text-amber-400' : ''}`}
					on:click={() => (mode = 'course')}
				>
					Target SGPA (Course Wise)
				</button>
				<button
					class={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
						mode === 'semester'
							? 'bg-white text-amber-600 shadow-sm'
							: 'text-gray-500 hover:text-gray-700'
					} ${$darkMode && mode === 'semester' ? 'bg-gray-700 text-amber-400' : ''}`}
					on:click={() => (mode = 'semester')}
				>
					Target CGPA (Semester Wise)
				</button>
			</div>
		</div>

		{#if mode === 'course'}
			<!-- SGPA Calculator Section -->
			<div
				class="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8"
				in:fly={{ y: 20, duration: 300, delay: 100 }}
			>
				<div
					class={`lg:col-span-3 rounded-2xl shadow-xl p-4 sm:p-6 border ${$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
				>
					<div class="space-y-5">
						<!-- Selectors -->
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label
									for="year"
									class={`block text-sm font-medium mb-1 ${$darkMode ? 'text-gray-200' : 'text-gray-700'}`}
								>
									Batch
								</label>
								<select
									id="year"
									class={`block w-full p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${$darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-amber-50 border-amber-200 text-gray-800'}`}
									bind:value={year}
									on:change={() => clearItems('year')}
								>
									<option value="" selected disabled>Select Year</option>
									{#each Object.keys(data) as yearOption}
										<option value={yearOption}>
											{yearOption.replace(
												/^(\d{4})$/,
												'$1-' + (parseInt(yearOption.substring(2)) + 4)
											)}
										</option>
									{/each}
								</select>
							</div>

							<div>
								<label
									for="branch"
									class={`block text-sm font-medium mb-1 ${$darkMode ? 'text-gray-200' : 'text-gray-700'}`}
								>
									Branch
								</label>
								<select
									id="branch"
									class={`block w-full p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${$darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-amber-50 border-amber-200 text-gray-800'}`}
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
									class={`block text-sm font-medium mb-1 ${$darkMode ? 'text-gray-200' : 'text-gray-700'}`}
								>
									Semester
								</label>
								<select
									id="sem"
									class={`block w-full p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${$darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-amber-50 border-amber-200 text-gray-800'}`}
									bind:value={sem}
									disabled={!year || !branch}
								>
									<option value="" selected disabled>Select Semester</option>
									{#if year && branch && data[year]?.[branch]}
										{#each Object.keys(data[year][branch]).map((sem) => parseInt(sem.split(' ')[1])) as semNum}
											<option value={semNum}>Semester {semNum}</option>
										{/each}
									{/if}
								</select>
							</div>
						</div>

						<!-- Target GPA Slider -->
						{#if courses.length > 0}
							<div
								class={`p-4 rounded-xl ${$darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}
								transition:slide
							>
								<label
									for="targetGPA"
									class={`block text-sm font-medium mb-2 ${$darkMode ? 'text-gray-200' : 'text-gray-700'}`}
								>
									Target SGPA: <span class="text-amber-600 font-bold text-lg"
										>{targetGPA.toFixed(1)}</span
									>
								</label>
								<input
									type="range"
									id="targetGPA"
									min="5"
									max="10"
									step="0.1"
									bind:value={targetGPA}
									class="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-amber-500"
								/>
								<div
									class="flex justify-between text-xs mt-1 {$darkMode ? 'text-gray-400' : 'text-gray-500'}"
								>
									<span>5.0</span>
									<span>6.0</span>
									<span>7.0</span>
									<span>8.0</span>
									<span>9.0</span>
									<span>10.0</span>
								</div>
							</div>
						{/if}

						<!-- Instructions -->
						{#if courses.length > 0}
							<div
								class={`p-4 rounded-xl text-sm ${$darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-amber-50/50 text-gray-600'}`}
								in:fade
							>
								<p class="font-medium mb-1">How to use:</p>
								<ol class="list-decimal list-inside space-y-1">
									<li>Click "Mark Pending" for courses you need to take</li>
									<li>Enter grades for completed courses</li>
									<li>Set your target SGPA</li>
									<li>Calculate!</li>
								</ol>
							</div>
						{/if}

						<!-- Courses Table -->
						{#if courses.length > 0}
							<div class="mt-6">
								<!-- Mobile View -->
								<div class="sm:hidden space-y-4">
									{#each courses as course, idx}
										<div
											class={`rounded-xl border p-4 shadow-sm ${
												course.isPending
													? $darkMode
														? 'bg-amber-900/30 border-amber-700'
														: 'bg-amber-100 border-amber-300'
													: idx % 2 === 0
														? $darkMode
															? 'bg-gray-800 border-gray-700'
															: 'bg-white border-gray-200'
														: $darkMode
															? 'bg-gray-700 border-gray-600'
															: 'bg-gray-50 border-gray-200'
											}`}
										>
											<div class="flex flex-col space-y-3">
												<div class="flex justify-between items-center">
													<span
														class={`text-xs font-medium ${$darkMode ? 'text-amber-300' : 'text-amber-600'}`}
													>
														{course.course_code || `Course ${idx + 1}`}
													</span>
													<span
														class={`text-xs px-2 py-1 rounded-lg ${$darkMode ? 'bg-gray-900 text-gray-300' : 'bg-amber-100 text-amber-800'}`}
													>
														{course.credits} Credits
													</span>
												</div>

												<h3 class={`text-sm font-medium ${$darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
													{course.course_name}
												</h3>

												<div class="flex justify-between items-center pt-2 gap-2">
													<button
														class={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
															course.isPending
																? 'bg-amber-500 text-white'
																: $darkMode
																	? 'bg-gray-600 text-gray-300 hover:bg-amber-600 hover:text-white'
																	: 'bg-gray-200 text-gray-600 hover:bg-amber-500 hover:text-white'
														}`}
														on:click={() => togglePending(idx)}
													>
														{course.isPending ? '✓ Pending' : 'Mark Pending'}
													</button>

													{#if !course.isPending}
														<select
															class={`rounded-lg px-3 py-1 w-24 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
																$darkMode
																	? 'bg-gray-900 border-gray-600 text-gray-200'
																	: 'bg-white border-amber-300 text-gray-900'
															}`}
															bind:value={course.grade}
														>
															<option value="" selected disabled>Grade</option>
															<option value="O">O</option>
															<option value="A+">A+</option>
															<option value="A">A</option>
															<option value="B+">B+</option>
															<option value="B">B</option>
															<option value="P">P</option>
															<option value="RA/AB">RA/AB</option>
														</select>
													{:else}
														<span class="text-xs text-amber-600 font-medium italic">Grade pending...</span>
													{/if}
												</div>
											</div>
										</div>
									{/each}
								</div>

								<!-- Desktop Table -->
								<div
									class="hidden sm:block overflow-x-auto rounded-xl border border-amber-100 shadow-md"
								>
									<table class={`min-w-full divide-y ${$darkMode ? 'divide-gray-700' : 'divide-amber-200'}`}>
										<thead class={$darkMode ? 'bg-gray-700' : 'bg-amber-50'}>
											<tr>
												<th
													class={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${$darkMode ? 'text-amber-300' : 'text-amber-800'}`}
												>
													Course
												</th>
												<th
													class={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider ${$darkMode ? 'text-amber-300' : 'text-amber-800'}`}
												>
													Credits
												</th>
												<th
													class={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider ${$darkMode ? 'text-amber-300' : 'text-amber-800'}`}
												>
													Status
												</th>
												<th
													class={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider ${$darkMode ? 'text-amber-300' : 'text-amber-800'}`}
												>
													Grade
												</th>
											</tr>
										</thead>
										<tbody
											class={`divide-y ${$darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-amber-100'}`}
										>
											{#each courses as course, idx}
												<tr
													class={`${
														course.isPending
															? $darkMode
																? 'bg-amber-900/30'
																: 'bg-amber-100'
															: idx % 2 === 0
																? $darkMode
																	? 'bg-gray-800'
																	: 'bg-white'
																: $darkMode
																	? 'bg-gray-700'
																	: 'bg-gray-50'
													}`}
												>
													<td
														class={`px-4 py-4 text-sm ${$darkMode ? 'text-gray-200' : 'text-gray-700'}`}
													>
														<div class="font-medium">{course.course_name}</div>
														{#if course.course_code}
															<div class="text-xs text-gray-500">{course.course_code}</div>
														{/if}
													</td>
													<td
														class={`px-4 py-4 text-sm text-center ${$darkMode ? 'text-gray-200' : 'text-gray-700'}`}
													>
														{course.credits}
													</td>
													<td class="px-4 py-4 text-center">
														<button
															class={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
																course.isPending
																	? 'bg-amber-500 text-white shadow-md'
																	: $darkMode
																		? 'bg-gray-600 text-gray-300 hover:bg-amber-600 hover:text-white'
																		: 'bg-gray-200 text-gray-600 hover:bg-amber-500 hover:text-white'
															}`}
															on:click={() => togglePending(idx)}
														>
															{course.isPending ? '✓ Pending' : 'Mark Pending'}
														</button>
													</td>
													<td class="px-4 py-4 text-center">
														{#if !course.isPending}
															<select
																class={`rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
																	$darkMode
																		? 'bg-gray-900 border-gray-600 text-gray-200'
																		: 'bg-white border-amber-300 text-gray-900'
																}`}
																bind:value={course.grade}
															>
																<option value="" selected disabled>Select</option>
																<option value="O">O</option>
																<option value="A+">A+</option>
																<option value="A">A</option>
																<option value="B+">B+</option>
																<option value="B">B</option>
																<option value="P">P</option>
																<option value="RA/AB">RA/AB</option>
															</select>
														{:else}
															<span class="text-sm text-amber-600 font-medium italic">Pending...</span>
														{/if}
													</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							</div>
						{/if}

						<!-- Calculate Button -->
						{#if courses.length > 0}
							<div class="flex justify-center mt-6">
								<button
									class="px-8 py-3 font-medium rounded-xl text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-lg transform transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
									on:click={calculateRequiredGrades}
									disabled={!canCalculateSGPA}
								>
									Calculate Required Grades
								</button>
							</div>
						{/if}
					</div>
				</div>

				<!-- Results Panel -->
				<div class="lg:col-span-2">
					{#if showResults && requiredGrades.length > 0}
						<div
							class={`rounded-2xl shadow-xl p-4 sm:p-6 border ${$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
							transition:fade={{ duration: 300 }}
						>
							<div class="text-center mb-4">
								<h2 class={`text-xl sm:text-2xl font-bold ${$darkMode ? 'text-white' : 'text-gray-800'}`}>
									Required Grades
								</h2>
								<p class={`text-sm mt-1 ${$darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
									To achieve SGPA <span class="font-bold text-amber-600">{targetGPA.toFixed(1)}</span>
								</p>
							</div>

							<div class="space-y-3">
								{#each requiredGrades as result, idx}
									<div
										class={`p-4 rounded-xl border ${
											result.achievable
												? $darkMode
													? 'bg-gray-700 border-gray-600'
													: 'bg-gray-50 border-gray-200'
												: $darkMode
													? 'bg-red-900/30 border-red-700'
													: 'bg-red-50 border-red-200'
										}`}
										in:fly={{ y: -5, duration: 300, delay: 100 + idx * 100, opacity: 0, easing: cubicOut }}
									>
										<div class="flex justify-between items-start">
											<div class="flex-1">
												<h3 class={`font-medium text-sm ${$darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
													{result.course.course_name}
												</h3>
												<p class={`text-xs mt-0.5 ${$darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
													{result.course.credits} Credits
												</p>
											</div>
											<div class="text-right">
												<span
													class={`text-lg font-bold ${getGradeColor(result.achievable, result.requiredGrade)}`}
												>
													{result.requiredGrade}
												</span>
												{#if result.achievable && !result.requiredGrade.includes('Any Grade') && !result.requiredGrade.includes('Not Possible')}
													<p class="text-xs text-green-500 mt-0.5">✓ Achievable</p>
												{:else if !result.achievable}
													<p class="text-xs text-red-500 mt-0.5">✗ Very Difficult</p>
												{/if}
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<div
							class={`rounded-2xl shadow-xl p-4 sm:p-6 border h-full flex flex-col items-center justify-center text-center ${$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class={`h-16 w-16 sm:h-20 sm:w-20 mb-3 sm:mb-4 ${$darkMode ? 'text-amber-400' : 'text-amber-200'}`}
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
								/>
							</svg>
							<h3
								class={`text-lg sm:text-xl font-semibold mb-1 sm:mb-2 ${$darkMode ? 'text-gray-200' : 'text-gray-700'}`}
							>
								Plan Your Success
							</h3>
							<p class={`text-sm sm:text-base ${$darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
								Mark pending courses to see what you need.
							</p>
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<!-- CGPA Calculator Section -->
			<div
				class="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8"
				in:fly={{ y: 20, duration: 300, delay: 100 }}
			>
				<div
					class={`lg:col-span-3 rounded-2xl shadow-xl p-4 sm:p-6 border ${$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
				>
					<div class="space-y-5">
						<h3 class={`text-lg font-semibold ${$darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
							CGPA Goal Settings
						</h3>
						
						<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
							<div>
								<label
									class={`block text-sm font-medium mb-1 ${$darkMode ? 'text-gray-300' : 'text-gray-700'}`}
								>
									Current CGPA
								</label>
								<input
									type="number"
									step="0.01"
									min="0"
									max="10"
									placeholder="e.g. 8.2"
									bind:value={currentCGPA}
									class={`block w-full p-3 rounded-xl border focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all ${$darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
								/>
							</div>
							<div>
								<label
									class={`block text-sm font-medium mb-1 ${$darkMode ? 'text-gray-300' : 'text-gray-700'}`}
								>
									Credits Completed So Far
								</label>
								<input
									type="number"
									min="0"
									placeholder="e.g. 80"
									bind:value={completedCredits}
									class={`block w-full p-3 rounded-xl border focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all ${$darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
								/>
							</div>
							<div class="md:col-span-2">
								<label
									class={`block text-sm font-medium mb-1 ${$darkMode ? 'text-gray-300' : 'text-gray-700'}`}
								>
									Credits in Upcoming Semester
								</label>
								<input
									type="number"
									min="0"
									placeholder="e.g. 24"
									bind:value={upcomingCredits}
									class={`block w-full p-3 rounded-xl border focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all ${$darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
								/>
								<p class="text-xs text-gray-500 mt-1">Include all credits for next semester (Labs + Theory)</p>
							</div>
						</div>

						<!-- Target CGPA Slider -->
						<div
							class={`p-4 rounded-xl ${$darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}
						>
							<label
								for="targetCGPA"
								class={`block text-sm font-medium mb-2 ${$darkMode ? 'text-gray-200' : 'text-gray-700'}`}
							>
								Target CGPA: <span class="text-amber-600 font-bold text-lg"
									>{targetCGPA.toFixed(2)}</span
								>
							</label>
							<input
								type="range"
								id="targetCGPA"
								min="5"
								max="10"
								step="0.05"
								bind:value={targetCGPA}
								class="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-amber-500"
							/>
						</div>

						<div class="flex justify-center mt-6">
							<button
								class="px-8 py-3 font-medium rounded-xl text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-lg transform transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
								on:click={calculateRequiredSGPA}
								disabled={!canCalculateCGPA}
							>
								Check Required SGPA
							</button>
						</div>
					</div>
				</div>

				<!-- Result -->
				<div class="lg:col-span-2">
					{#if requiredSGPA}
						<div
							class={`rounded-2xl shadow-xl p-6 border ${$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
							transition:fade
						>
							<h3 class={`text-xl font-bold mb-4 ${$darkMode ? 'text-white' : 'text-gray-800'}`}>
								Results
							</h3>
							
							<div class="space-y-6">
								<div class="text-center p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-600">
									<p class={`text-sm mb-1 ${$darkMode ? 'text-gray-300' : 'text-gray-600'}`}>You need an SGPA of</p>
									<p class={`text-4xl font-extrabold my-2 ${requiredSGPA.achievable ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
										{requiredSGPA.val > 10 ? '> 10.00' : requiredSGPA.val.toFixed(2)}
									</p>
									<p class={`text-sm font-medium ${$darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
										in the upcoming semester
									</p>
								</div>

								<div class={`p-4 rounded-xl border text-center ${requiredSGPA.achievable ? 'bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50/50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
									<p class={`font-medium ${requiredSGPA.achievable ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
										{requiredSGPA.message}
									</p>
								</div>
							</div>
						</div>
					{:else}
						<div
							class={`rounded-2xl shadow-xl p-4 sm:p-6 border h-full flex flex-col items-center justify-center text-center ${$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
						>
							<div class={`p-4 rounded-full mb-4 ${$darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
								<svg xmlns="http://www.w3.org/2000/svg" class={`h-10 w-10 ${$darkMode ? 'text-amber-400' : 'text-amber-500'}`} viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
								</svg>
							</div>
							<h3 class={`text-lg font-medium ${$darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
								CGPA Calculator
							</h3>
							<p class={`text-sm mt-2 max-w-xs ${$darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
								Find out exactly what SGPA you need next semester to hit your overall CGPA goal.
							</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}
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

	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: linear-gradient(to right, #f59e0b, #ea580c);
		cursor: pointer;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
	}

	input[type='range']::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: linear-gradient(to right, #f59e0b, #ea580c);
		cursor: pointer;
		border: none;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
	}
</style>