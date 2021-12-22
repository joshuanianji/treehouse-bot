<!-- src/components/WindyButton.svelte -->

<!-- Svelte event forwarding -->
<button on:click>Click me!</button>

<!-- using lang="postcss" for VSCODE not to give out linting warnings. -->
<style lang="postcss">
  button {
    @apply bg-black text-white;
    @apply p-2 m-2;
    @apply font-bold;
    @apply border-2 rounded-md border-gray-200;
  }
</style>
