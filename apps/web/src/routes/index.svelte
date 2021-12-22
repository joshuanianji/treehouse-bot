<script>
  import WindyButton from "../components/WindyButton.svelte";
</script>

<div
  class="w-full min-h-screen flex flex-col space-y-8 justify-center items-center h-screen"
>
  <h1 class="text-4xl font-extrabold">Poopoo Bot Home</h1>
  <img src="squat.png" class="w-1/5 h-auto" alt="Omniman Squat" />
</div>

<WindyButton
  on:click={() => {
    console.log("WindyButton clicked!");
  }}
/>
