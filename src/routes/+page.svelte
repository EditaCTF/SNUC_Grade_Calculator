<script>
	import { fade, fly } from 'svelte/transition';
	import { darkMode } from '$lib/dark';
	import { cubicOut } from 'svelte/easing';
</script>

<div class={`min-h-screen ${$darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
		<div class="text-center mb-8">
			<h1
				class={`text-4xl md:text-5xl font-extrabold tracking-tight ${$darkMode ? 'text-white' : 'text-gray-900'}`}
				in:fly={{ y: -15, duration: 400, delay: 100, opacity: 0, easing: cubicOut }}
			>
				<span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
					SNUC Grade Calculator
				</span>
			</h1>
			<p
				class={`mt-3 text-lg max-w-3xl mx-auto ${$darkMode ? 'text-gray-300' : 'text-gray-600'}`}
				in:fly={{ y: -10, duration: 400, delay: 250, opacity: 0, easing: cubicOut }}
			>
				Calculate your SGPA & CGPA and store them for future access,<br />when doom strikes again
				next semester
			</p>
		</div>

		<div
			class="grid grid-cols-1 gap-8 md:gap-12 items-center"
			in:fly={{ y: -15, duration: 500, delay: 350, opacity: 0, easing: cubicOut }}
		>
			<div
				class="sm:hidden flex justify-center items-center"
				in:fly={{ y: -10, duration: 400, delay: 450, opacity: 0, easing: cubicOut }}
			>
				<div
					class={`rounded-xl border p-4 w-full ${
						$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
					} shadow-md`}
				>
					<div class="flex items-center">
						<div
							class={`flex-shrink-0 ${$darkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full p-2 mr-3`}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5 text-blue-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div>
							<p class={`text-sm font-medium ${$darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
								Made for and by students of SNU Chennai
							</p>
						</div>
					</div>
				</div>
			</div>

			<div
				class="hidden sm:flex justify-center items-center overflow-visible"
				in:fly={{ y: -20, duration: 600, delay: 450, opacity: 0, easing: cubicOut }}
			>
				<div class="relative w-full max-w-3xl mx-auto">
					<div
						class={`absolute inset-0 ${$darkMode ? 'bg-gradient-to-r from-blue-900 to-indigo-900' : 'bg-gradient-to-r from-blue-100 to-green-100'} rounded-full filter blur-3xl opacity-60 transform scale-125`}
					></div>
					<img
						src="/home_graphic.webp"
						alt="SNUC Grade Calculator"
						class="relative z-10 w-full max-w-[85%] lg:max-w-full mx-auto object-contain"
					/>
				</div>
			</div>

			<div
				class="sm:mx-auto sm:max-w-3xl"
				in:fly={{ y: -10, duration: 600, delay: 550, opacity: 0, easing: cubicOut }}
			>
				<div class="flex flex-col sm:flex-row gap-4 justify-center w-full">
					<a href="/sgpa" class="inline-block w-full sm:w-auto">
						<button
							class="w-full px-6 sm:px-8 py-3 sm:py-4 font-medium rounded-xl text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg transform transition hover:-translate-y-0.5"
						>
							Calculate SGPA
						</button>
					</a>

					<a href="/cgpa" class="inline-block w-full sm:w-auto">
						<button
							class="w-full px-6 sm:px-8 py-3 sm:py-4 font-medium rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg transform transition hover:-translate-y-0.5"
						>
							Check CGPA
						</button>
					</a>
				</div>
			</div>

			<div
				class="hidden sm:block"
				in:fly={{ y: -15, duration: 600, delay: 500, opacity: 0, easing: cubicOut }}
			>
				<div
					class={`mx-auto max-w-3xl rounded-xl border p-4 ${
						$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
					} shadow-md`}
				>
					<div class="flex items-center justify-center">
						<div
							class={`flex-shrink-0 ${$darkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full p-2 mr-3 sm:mr-4`}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5 sm:h-6 sm:w-6 text-blue-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div>
							<p
								class={`text-sm sm:text-base font-medium ${$darkMode ? 'text-gray-200' : 'text-gray-700'}`}
							>
								Made for and by students of SNU Chennai
							</p>
						</div>
					</div>
				</div>
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

	@media (max-width: 640px) {
		.blur-3xl {
			filter: blur-xl;
			opacity: 0.5;
		}
	}
</style>
