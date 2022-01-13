<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
  import { variables } from "$lib/variables";

  const load: Load = async ({ params, fetch, session, stuff }) => {
    console.log("load", params, "session", session);
    const url = `${variables.apiEndpoint}/nft?id=${params.nftId}`;
    const res = await fetch(url);
    const data = await res.json();

    if (res.ok) {
      return {
        props: {
          nft: data.data,
        },
      };
    }

    console.log(res);
    return {
      status: res.status,
      error: new Error(
        `Could not access: ${variables.apiEndpoint}/nft?id=${params.userId}`
      ),
    };
  };
  export { load };
</script>

<script lang="ts">
  import { page } from "$app/stores";
  import type { NFT } from "custom-types";
  import NftCard from "$components/NftCard.svelte";

  // so the load() function can pass data to the `data` variable
  export let nft: NFT;
  const nftId = $page.params.nftId;
</script>

<div class="w-full min-h-[50vh] grid place-items-center">
  <h1 class="text-4xl font-extrabold">NFT {nftId}</h1>
</div>

<div class="wrapper">
  <div class="sm:w-2/3 md:w-2/5">
    {#if nft === undefined}
      <p>Loading...</p>
    {:else}
      <NftCard {nft} />
    {/if}
  </div>
</div>

<!-- using lang="postcss" for VSCODE not to give out linting warnings. -->
<style lang="postcss">
  .wrapper {
    @apply w-full;
    @apply grid place-items-center;
  }
</style>
