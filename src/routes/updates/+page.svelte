<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { darkMode } from '$lib/dark';

	const updates = [
		{
			date: 'March 24, 2025',
			title: 'Revamping the website',
			content: [
				'UI Redesigned with a focus on user experience and responsiveness',
				'To be implemented soon: Reworked SGPA/CGPA Calculators with Academic Year-specific credits'
			]
		},
		{
			date: 'Aug 06, 2024',
			title: 'CGPA Calculator Release',
			content: [
				'The SGPA storage and CGPA calculator mechanism has been added to this website!',
				'You can now calculate individual SGPAs, store them under your SNU Digital ID, retrieve them and calculate your CGPA with the CGPA Calculator!',
				'Support for all batches including 2023-24 students',
				'Updated credits to be accurate for all departments and programs'
			]
		},
		{
			date: 'Aug 02, 2024',
			title: 'Curriculum Updates',
			content: [
				'B.Com, B.Com PA and B.Sc subjects and credits fixed for Semester 2',
				'User Interface revamped and optimized for desktop and mobile',
				'Fixed credit count errors in Semester 3 and 4 of B.Tech programs'
			]
		},
		{
			date: 'Aug 02, 2024',
			title: 'B.Com and B.Sc Support Added',
			content: [
				'B.Com, B.Com PA and B.Sc programs have been added to the calculator',
				'Credits have been fixed across all courses and programs',
				'We apologize for any inconvenience caused by previous credit errors'
			]
		},
		{
			date: 'Mar 27, 2024',
			title: 'v1.0 of SNUGPA is Now Public!',
			content: [
				'Basic SGPA calculator has been implemented',
				'Courses for first 6 semesters of AI/DS, IoT and Cybersecurity added',
				'B.Com/B.Sc/M.Tech courses, score storage, user login, profiles and more planned for future updates',
				'P.S.: Website run by three lazy assholes, we might get bored of this soon.'
			]
		}
	];
</script>

<div
	class={`content-container ${$darkMode ? 'bg-gray-900' : 'bg-white'}`}
	in:fly={{ y: -15, duration: 400, delay: 100, opacity: 0, easing: cubicOut }}
>
	<div class="max-w-7xl mx-auto">
		<div
			class="text-center mb-4"
			in:fly={{ y: -20, duration: 600, delay: 200, opacity: 0, easing: cubicOut }}
		>
			<h1
				class={`text-4xl md:text-5xl font-extrabold tracking-tight ${$darkMode ? 'text-white' : 'text-gray-900'}`}
			>
				<span class="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-teal-600">
					Updates & Changelog
				</span>
			</h1>
			<p
				class={`mt-3 text-lg max-w-3xl mx-auto ${$darkMode ? 'text-gray-300' : 'text-gray-600'}`}
				in:fly={{ y: -15, duration: 500, delay: 300, opacity: 0, easing: cubicOut }}
			>
				Stay informed about the latest improvements and fixes to the SNUC Grade Calculator
			</p>
		</div>

		<div
			class="text-center mb-8"
			in:fly={{ y: -15, duration: 500, delay: 400, opacity: 0, easing: cubicOut }}
		>
			<p
				class={`inline-block rounded-xl px-6 py-3 border-2 shadow-sm ${
					$darkMode
						? 'bg-green-900/30 text-gray-200 border-green-600'
						: 'bg-green-50 text-gray-700 border-green-400'
				}`}
			>
				For any queries, bug reports, or suggested improvements, visit our
				<a
					href="https://discord.gg/Qr3PsJfRF4"
					class="font-medium text-green-500 hover:text-green-400 transition-colors"
				>
					Discord Server
				</a>
				and let us know!
			</p>
		</div>

		<div
			class={`rounded-2xl shadow-xl p-8 border ${
				$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
			}`}
			in:fly={{ y: -15, duration: 500, delay: 500, opacity: 0, easing: cubicOut }}
		>
			<div class="space-y-10">
				{#each updates as update, i}
					<div
						class="flex flex-col md:flex-row gap-6"
						in:fly={{ y: -20, duration: 600, delay: 600 + i * 150, opacity: 0, easing: cubicOut }}
					>
						<div
							class="md:w-72 flex-shrink-0"
							in:fly={{ y: -10, duration: 400, delay: 650 + i * 150, opacity: 0, easing: cubicOut }}
						>
							<time class={`text-sm font-medium ${$darkMode ? 'text-gray-400' : 'text-gray-500'}`}
								>{update.date}</time
							>
							<h3 class={`text-xl font-bold mt-1 ${$darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
								{update.title}
							</h3>
						</div>

						<div
							class={`rounded-xl p-6 flex-grow ${$darkMode ? 'bg-gray-700/50' : 'bg-green-50'}`}
							in:fly={{ y: -10, duration: 400, delay: 700 + i * 150, opacity: 0, easing: cubicOut }}
						>
							<ul class="space-y-3 list-disc list-inside">
								{#each update.content as item, j}
									<li
										class={$darkMode ? 'text-gray-200' : 'text-gray-700'}
										in:fly={{
											y: -5,
											duration: 300,
											delay: 750 + i * 150 + j * 100,
											opacity: 0,
											easing: cubicOut
										}}
									>
										{item}
									</li>
								{/each}
							</ul>
						</div>
					</div>
				{/each}
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
