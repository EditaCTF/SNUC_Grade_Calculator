<script lang="ts">
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { darkMode } from '$lib/dark';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	const shouldAnimate = writable(false);
	let mounted = false;

	onMount(() => {
		mounted = true;

		setTimeout(() => {
			shouldAnimate.set(true);
		}, 50);
	});

	type ColorKey = keyof typeof colorMap;

	const editaMember: {
		name: string;
		image: string;
		color: ColorKey;
		links: { type: string; url: string }[];
	} = {
		name: 'Team Edita',
		image: '/edita.webp',
		color: 'blue',
		links: [
			{ type: 'discord', url: 'https://discord.gg/Qr3PsJfRF4' },
			{ type: 'github', url: 'https://github.com/EditaCTF' },
			{ type: 'x', url: 'https://x.com/editactf' }
		]
	};

	const teamMembers: {
		name: string;
		image: string;
		color: ColorKey;
		links: { type: string; url: string }[];
	}[] = [
		{
			name: 'FrenzyVJN',
			image: '/frenzy.webp',
			color: 'skyblue',
			links: [
				{ type: 'github', url: 'https://github.com/FrenzyVJN' },
				{ type: 'linkedin', url: 'https://www.linkedin.com/in/vijayan-sankar/' }
			]
		},
		{
			name: 'hotaru',
			image: '/hotaru.webp',
			color: 'pastel',
			links: [
				{ type: 'github', url: 'https://github.com/hotaru-py' },
				{ type: 'linkedin', url: 'https://www.linkedin.com/in/prajesh-raam/' }
			]
		},
		{
			name: 'DrunkenCloud',
			image: '/nira.webp',
			color: 'purple',
			links: [
				{ type: 'github', url: 'https://github.com/DrunkenCloud' },
				{ type: 'linkedin', url: 'https://www.linkedin.com/in/niranjhan-su/' },
				{ type: 'x', url: 'https://x.com/drunkencloud99' }
			]
		},
		{
			name: 'Try3D',
			image: '/try3d.webp',
			color: 'rose',
			links: [
				{ type: 'github', url: 'https://github.com/Try3D' },
				{ type: 'linkedin', url: 'https://www.linkedin.com/in/saranshankar/' },
				{ type: 'x', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
			]
		}
	];

	const colorMap = {
		blue: {
			gradient: 'from-blue-500 to-indigo-600',
			bg: 'bg-blue-50',
			border: 'border-blue-200',
			hover: 'group-hover:bg-blue-100'
		},
		skyblue: {
			gradient: 'from-sky-400 to-blue-600',
			bg: 'bg-sky-50',
			border: 'border-sky-200',
			hover: 'group-hover:bg-sky-100'
		},
		pastel: {
			gradient: 'from-blue-300 to-green-300',
			bg: 'bg-blue-50',
			border: 'border-green-200',
			hover: 'group-hover:bg-green-50'
		},

		rose: {
			gradient: 'from-rose-500 to-pink-600',
			bg: 'bg-rose-50',
			border: 'border-rose-200',
			hover: 'group-hover:bg-rose-100'
		},
		purple: {
			gradient: 'from-purple-500 to-indigo-500',
			bg: 'bg-purple-50',
			border: 'border-purple-200',
			hover: 'group-hover:bg-purple-100'
		}
	};
</script>

{#if mounted}
	<div
		class={`content-container ${$darkMode ? 'bg-gray-900' : 'bg-white'}`}
		in:fly={{ y: -15, duration: 400, delay: 100, opacity: 0, easing: cubicOut }}
	>
		<div class="max-w-7xl mx-auto">
			<div
				class="text-center mb-12"
				in:fly={{ y: -15, duration: 400, delay: 250, opacity: 0, easing: cubicOut }}
			>
				<h1
					class={`text-4xl md:text-5xl font-extrabold tracking-tight ${$darkMode ? 'text-white' : 'text-gray-900'}`}
				>
					<span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
						Made without ❤️ by
					</span>
				</h1>
			</div>

			<div
				class="w-full flex flex-col md:flex-row items-center justify-center mb-8"
				style="min-height: 120px;"
			>
				<div
					class={`flex-1 flex flex-row items-center justify-between rounded-2xl shadow-xl border overflow-hidden group transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 ${$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
					style="height: 120px; min-height: 120px;"
				>
					<div
						class={`h-[120px] w-3 bg-gradient-to-b rounded-l-2xl ${colorMap[editaMember.color].gradient}`}
						style="min-width: 0.75rem;"
					></div>
					<div class="flex items-center px-6 py-2 flex-1">
						<div
							class={`w-20 h-20 aspect-square rounded-full border-4 mr-6 ${$darkMode ? 'bg-gray-700 border-gray-600' : `${colorMap[editaMember.color].bg} ${colorMap[editaMember.color].border}`} overflow-hidden`}
							style="min-width: 5rem; min-height: 5rem;"
						>
							<img
								src={editaMember.image}
								alt={editaMember.name}
								class="w-full h-full rounded-full object-cover aspect-square"
								style="min-width: 100%; min-height: 100%; object-fit: cover;"
							/>
						</div>
						<h3
							class={`text-xl md:text-2xl font-bold ${$darkMode ? 'text-white' : 'text-gray-800'}`}
						>
							{editaMember.name}
						</h3>
					</div>
					<div class="flex items-center pr-6">
						<div class="flex space-x-2">
							{#each editaMember.links as link, j}
								<a
									href={link.url}
									target="_blank"
									rel="noopener noreferrer"
									class={`p-2 rounded-full transition-colors duration-200 flex items-center justify-center w-8 ${$darkMode ? 'bg-gray-700 hover:bg-gray-600' : `${colorMap[editaMember.color].bg} ${colorMap[editaMember.color].hover}`}`}
								>
									<img
										class={`${link.type === 'discord' ? 'h-3 w-auto' : link.type === 'x' ? 'h-3 w-3' : 'h-3.5 w-3.5'}`}
										src={`/${link.type}${$darkMode ? '_white' : ''}.webp`}
										alt={link.type}
									/>
								</a>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<div
				class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12"
				in:fly={{ y: -10, duration: 400, delay: 400, opacity: 0, easing: cubicOut }}
			>
				{#each teamMembers as member, i}
					<div
						class={`rounded-2xl shadow-xl border overflow-hidden group transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 ${$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
						in:fly={{ y: -5, duration: 400, delay: 500 + i * 150, opacity: 0, easing: cubicOut }}
					>
						<div
							class={`h-3 w-full bg-gradient-to-r ${colorMap[member.color].gradient}`}
							in:scale={{ duration: 300, delay: 500 + i * 150, opacity: 0, easing: cubicOut }}
						/>
						<div class="p-6">
							<div class="flex flex-col items-center">
								<div
									class={`relative w-32 h-32 rounded-full p-1 mb-4 ${$darkMode ? 'bg-gray-700 border-gray-600' : `${colorMap[member.color].bg} ${colorMap[member.color].border}`} border-2 overflow-hidden`}
									in:scale={{
										start: 0.8,
										duration: 400,
										delay: 600 + i * 150,
										opacity: 0,
										easing: cubicOut
									}}
								>
									<img
										src={member.image}
										alt={member.name}
										class="w-full h-full rounded-full object-cover"
									/>
								</div>
								<h3
									class={`text-2xl font-bold mb-2 ${$darkMode ? 'text-white' : 'text-gray-800'}`}
									in:fly={{
										y: -10,
										duration: 300,
										delay: 700 + i * 150,
										opacity: 0,
										easing: cubicOut
									}}
								>
									{member.name}
								</h3>
								<div class="flex space-x-3 mt-3">
									{#each member.links as link, j}
										<a
											href={link.url}
											target="_blank"
											rel="noopener noreferrer"
											class={`p-2 rounded-full transition-colors duration-200 flex items-center justify-center w-9 ${$darkMode ? 'bg-gray-700 hover:bg-gray-600' : `${colorMap[member.color].bg} ${colorMap[member.color].hover}`}`}
											in:fly={{
												y: -5,
												duration: 300,
												delay: 800 + i * 150 + j * 100,
												opacity: 0,
												easing: cubicOut
											}}
										>
											<img
												class={`${link.type === 'discord' ? 'h-3.5 w-auto' : link.type === 'x' ? 'h-3.5 w-3.5' : 'h-4 w-4'}`}
												src={`/${link.type}${$darkMode ? '_white' : ''}.webp`}
												alt={link.type}
											/>
										</a>
									{/each}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	@media (prefers-reduced-motion: no-preference) {
		h1 span {
			background-size: 300% 100%;
			animation: gradient-shift 8s ease infinite;
		}

		.group:hover .relative > img {
			animation: subtle-pulse 2s infinite ease-in-out;
		}

		.group:hover .flex.space-x-3 img {
			animation: none;
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

		@keyframes subtle-pulse {
			0%,
			100% {
				transform: scale(1);
			}
			50% {
				transform: scale(1.05);
			}
		}
	}
</style>
