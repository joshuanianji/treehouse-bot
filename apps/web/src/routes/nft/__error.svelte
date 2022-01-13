<script context="module">
  /** @type {import('@sveltejs/kit').ErrorLoad} */
  export function load({ error, status }) {
    return {
      props: {
        status: status,
        error: error,
      },
    };
  }
</script>

<script lang="ts">
  export let status: number;
  export let error: string;
</script>

{#if status === 404}
  <h1>Cannot find nft!</h1>
{:else}
  <h1>Unexpected error {error}!</h1>
  <p>{error}</p>
{/if}
