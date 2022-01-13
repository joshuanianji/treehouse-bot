<!-- src/components/NFTCard.svelte -->
<script lang="ts">
  import { DiscordUser, NFT, getMsgLink } from "custom-types";
  import { format } from "date-fns";

  export let nft: NFT;
  export let user: DiscordUser;

  let msgLink = getMsgLink(nft);
</script>

<!-- The top is the sticker or text -->
<!-- <div class="rounded overflow-hidden shadow-lg"> -->
<div class="rounded overflow-hidden shadow-lg">
  {#if nft.type._type === "asset"}
    <div class="img-wrapper">
      <img class="nft-image" src={nft.type.url} alt="NFT asset" />
    </div>
  {:else if nft.type._type === "text"}
    <div class="nft-text-wrapper">
      <p class="nft-text">
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
    <div class="font-bold text-xl mb-2">
      NFT #{nft.id} owned by {user.username}
    </div>
    <p class="text-gray-800 text-base">
      Created: {format(new Date(nft.createdAt), "MMM d, yyyy 'at' h:mm a")}
    </p>
    <p class="text-gray-800 text-base">
      Type: {nft.type._type}
    </p>
    {#if msgLink._tag === "Some"}
      <a
        href={msgLink.value}
        target="_blank"
        rel="noopener noreferrer"
        class="link"
      >
        Message link
      </a>
    {/if}
  </div>
</div>

<!-- using lang="postcss" for VSCODE not to give out linting warnings. -->
<style lang="postcss">
  .img-wrapper {
    @apply w-full;
    @apply aspect-[4/3];
    @apply overflow-hidden bg-center;
  }
  .nft-text-wrapper {
    @apply px-6 py-4;
    @apply text-gray-500 text-lg;
  }
  .nft-text {
    @apply text-gray-500 text-lg;
    @apply px-2;
    @apply border-l-4 border-gray-300;
    @apply rounded-sm;
  }
  .nft-image {
    @apply object-cover;
    @apply w-full;
  }
  .link {
    @apply text-blue-500;
  }
  .link:hover {
    @apply text-blue-900;
  }
</style>
