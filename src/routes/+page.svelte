<script lang="ts">
</script>

<div class="flex items-center min-h-screen w-full px-10">
	<div class="">
		<h1 class="py-50 text-6xl">GPA Calculator</h1>
		<br />
		<p class="text-xl">Tailor-made by and for SNU Chennai students.</p>
		<p class="text-xl py-1">
			Calculate your SGPA & CGPA and store them for future access and calculations,
		</p>
		<p class="text-xl">when doom strikes back again next semester.</p>
		<br />
		<div class="bg-[#F4F4F4] shadow-md hover:bg-sky-100 w-fit rounded-2xl px-3 py-3">
			<button
				on:click={() => {
					window.location.href = '/calculator';
				}}>Calculate your GPA</button
			>
		</div>
	</div>
</div>
