<!-- src/components/NFTCard.svelte -->
<script lang="ts">
  import type { NFT } from "custom-types";

  export let nft: NFT;
</script>

<!-- The top is the sticker or text -->
<!-- <div class="rounded overflow-hidden shadow-lg"> -->
<div class="rounded overflow-hidden shadow-lg">
  {#if nft.type._type === "asset"}
    <div class="img-wrapper">
      <img class="nft-image" src={nft.type.url} alt="NFT asset" />
    </div>
  {:else if nft.type._type === "text"}
    <div class="nft-img px-6 py-4">
      <p class="text-gray-700 text-base">
        {nft.type.content}
      </p>
    </div>
  {:else}
    <div class="img-wrapper">
      <img class="nft-image" src={nft.type.url} alt="NFT sticker" />
    </div>
  {/if}
  <!-- body -->
  <div class="px-6 py-4">
    <div class="font-bold text-xl mb-2">NFT ID {nft.id}</div>
    <p class="text-gray-200 text-base">
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus
      quia, Nonea! Maiores et perferendis eaque, exercitationem praesentium
      nihil.
    </p>
  </div>
</div>
<!-- </div> -->

<!-- using lang="postcss" for VSCODE not to give out linting warnings. -->
<style lang="postcss">
  .img-wrapper {
    @apply w-full;
    @apply aspect-square;
    @apply overflow-hidden;
  }
  .nft-image {
    @apply object-cover;
    @apply w-full;
  }
</style>
