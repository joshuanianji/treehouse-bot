<script>
  import WindyButton from "../components/WindyButton.svelte";
</script>

<div class="prose-lg">
  <h1>Welcome to SvelteKit</h1>
</div>

<WindyButton
  on:click={() => {
    console.log("WindyButton clicked!");
  }}
/>
