<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { darkMode } from '$lib/dark';

	let currentRoute = '';
	let isMenuOpen = false;
	let mounted = false;

	onMount(() => {
		currentRoute = window.location.pathname.substring(1) || 'home';

		darkMode.initialize();

		mounted = true;
	});

	afterNavigate(() => {
		currentRoute = window.location.pathname.substring(1) || 'home';
		isMenuOpen = false;
	});

	function updateRoute(route: string) {
		currentRoute = route;
	}

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}
</script>

<div class="fixed top-0 left-0 right-0 w-full z-50 flex justify-center p-4">
	<nav
		class={`backdrop-blur-md nav-shadow rounded-full px-4 md:px-8 py-2 max-w-3xl mx-auto w-full transition-colors duration-200
    ${$darkMode ? 'bg-gray-900/5 text-white' : 'bg-white/5 text-black'}`}
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center">
				<a href="/" class="flex items-center" on:click={() => updateRoute('home')}>
					{#if $darkMode}
						<img src="/edita_white.webp" alt="Edita" class="h-8 md:h-10" />
					{:else}
						<img src="/edita_logo.webp" alt="Edita" class="h-8 md:h-10" />
					{/if}
				</a>
			</div>

			<div class="hidden md:flex md:space-x-8 items-center">
				<a
					href="/sgpa"
					on:click={() => updateRoute('sgpa')}
					class={`font-medium transition-colors hover:text-blue-600 text-base ${
						currentRoute === 'sgpa' ? 'text-blue-600' : $darkMode ? 'text-white' : 'text-gray-900'
					}`}
				>
					SGPA
				</a>
				<a
					href="/cgpa"
					on:click={() => updateRoute('cgpa')}
					class={`font-medium transition-colors hover:text-indigo-600 text-base ${
						currentRoute === 'cgpa' ? 'text-indigo-600' : $darkMode ? 'text-white' : 'text-gray-900'
					}`}
				>
					CGPA
				</a>
				<a
					href="/updates"
					on:click={() => updateRoute('updates')}
					class={`font-medium transition-colors hover:text-green-600 text-base ${
						currentRoute === 'updates'
							? 'text-green-600'
							: $darkMode
								? 'text-white'
								: 'text-gray-900'
					}`}
				>
					Updates
				</a>
				<a
					href="/about"
					on:click={() => updateRoute('about')}
					class={`font-medium transition-colors hover:text-purple-600 text-base ${
						currentRoute === 'about'
							? 'text-purple-600'
							: $darkMode
								? 'text-white'
								: 'text-gray-900'
					}`}
				>
					About
				</a>
				<button
					on:click={darkMode.toggle}
					class="p-2 rounded-full transition-all duration-300 text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
					aria-label="Toggle dark mode"
				>
					{#if $darkMode}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#ffffff"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="5"></circle>
							<line x1="12" y1="1" x2="12" y2="3"></line>
							<line x1="12" y1="21" x2="12" y2="23"></line>
							<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
							<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
							<line x1="1" y1="12" x2="3" y2="12"></line>
							<line x1="21" y1="12" x2="23" y2="12"></line>
							<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
							<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#000000"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
						</svg>
					{/if}
				</button>
			</div>

			<div class="flex items-center md:hidden">
				<button
					on:click={darkMode.toggle}
					class="mr-2 p-2 rounded-full transition-all duration-300 text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
					aria-label="Toggle dark mode"
				>
					{#if $darkMode}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#ffffff"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="5"></circle>
							<line x1="12" y1="1" x2="12" y2="3"></line>
							<line x1="12" y1="21" x2="12" y2="23"></line>
							<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
							<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
							<line x1="1" y1="12" x2="3" y2="12"></line>
							<line x1="21" y1="12" x2="23" y2="12"></line>
							<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
							<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#000000"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
						</svg>
					{/if}
				</button>

				<button
					on:click={toggleMenu}
					class="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
				>
					{#if isMenuOpen}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					{/if}
				</button>
			</div>
		</div>
	</nav>
</div>

{#if isMenuOpen && mounted}
	<div
		class="fixed z-40 top-20 inset-x-4 mx-auto rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 overflow-hidden max-w-3xl"
		transition:fly={{ y: -20, duration: 300, easing: cubicOut }}
	>
		<div class="p-4 flex flex-col space-y-3">
			<a
				href="/sgpa"
				on:click={() => {
					updateRoute('sgpa');
					isMenuOpen = false;
				}}
				class={`px-4 py-3 rounded-xl font-medium transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
					currentRoute === 'sgpa'
						? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
						: 'text-gray-700 dark:text-gray-200'
				}`}
			>
				SGPA Calculator
			</a>
			<a
				href="/cgpa"
				on:click={() => {
					updateRoute('cgpa');
					isMenuOpen = false;
				}}
				class={`px-4 py-3 rounded-xl font-medium transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20 ${
					currentRoute === 'cgpa'
						? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
						: 'text-gray-700 dark:text-gray-200'
				}`}
			>
				CGPA Calculator
			</a>
			<a
				href="/updates"
				on:click={() => {
					updateRoute('updates');
					isMenuOpen = false;
				}}
				class={`px-4 py-3 rounded-xl font-medium transition-colors hover:bg-green-50 dark:hover:bg-green-900/20 ${
					currentRoute === 'updates'
						? 'text-green-600 bg-green-50 dark:bg-green-900/20'
						: 'text-gray-700 dark:text-gray-200'
				}`}
			>
				Updates & Changelog
			</a>
			<a
				href="/about"
				on:click={() => {
					updateRoute('about');
					isMenuOpen = false;
				}}
				class={`px-4 py-3 rounded-xl font-medium transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/20 ${
					currentRoute === 'about'
						? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
						: 'text-gray-700 dark:text-gray-200'
				}`}
			>
				About Us
			</a>
		</div>
	</div>

	<div
		class="fixed inset-0 bg-black/20 dark:bg-black/50 z-30"
		on:click={() => (isMenuOpen = false)}
		transition:fade={{ duration: 200 }}
	></div>
{/if}

<style>
	/* Create radial shadow effect */
	.nav-shadow {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
	}

	/* Apply subtle glow effect for depth */
	@media (prefers-reduced-motion: no-preference) {
		.nav-shadow {
			animation: glow 15s infinite alternate;
		}

		@keyframes glow {
			0% {
				box-shadow: 0 5px 15px rgba(59, 130, 246, 0.1); /* Blue tint */
			}
			50% {
				box-shadow: 0 5px 15px rgba(99, 102, 241, 0.1); /* Indigo tint */
			}
			100% {
				box-shadow: 0 5px 15px rgba(79, 70, 229, 0.1); /* Purple tint */
			}
		}
	}

	/* Dark mode glow effects */
	:global(.dark) .nav-shadow {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
	}

	@media (prefers-reduced-motion: no-preference) {
		:global(.dark) .nav-shadow {
			animation: dark-glow 15s infinite alternate;
		}

		@keyframes dark-glow {
			0% {
				box-shadow: 0 5px 15px rgba(59, 130, 246, 0.2); /* Blue tint */
			}
			50% {
				box-shadow: 0 5px 15px rgba(99, 102, 241, 0.2); /* Indigo tint */
			}
			100% {
				box-shadow: 0 5px 15px rgba(79, 70, 229, 0.2); /* Purple tint */
			}
		}
	}
</style>
