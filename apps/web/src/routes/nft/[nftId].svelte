<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
  import { variables } from "$lib/variables";
  import { DiscordUser } from "custom-types";
  import { sequenceT } from "fp-ts/lib/Apply";
  import { pipe } from "fp-ts/lib/function";
  import { bimap } from "fp-ts/lib/Tuple";
  import * as E from "fp-ts/lib/Either";

  const load: Load = async ({ params, fetch, session, stuff }) => {
    console.log("load", params, "session", session);
    const nftUrl = `${variables.apiEndpoint}/nft?id=${params.nftId}`;
    const res = await fetch(nftUrl);

    if (res.ok) {
      const nftRes = await res.json();
      const nftData = nftRes.data;

      // bring a little lazy and not typechecking nftData before we use it
      // and then we typecheck it later LOL
      // Should I put it in the pipe?
      console.log("NFT Data (fetched from server):", nftData);
      const userUrl = `${variables.apiEndpoint}/user?id=${nftData.ownedBy}`;
      const userRes = await fetch(userUrl);
      const userData = await userRes.json();

      const decodedStatus = pipe(
        [nftData, userData],
        bimap(DiscordUser.decode, NFT.decode), // somehow, mapfst and mapsnd switch the order
        (args) => {
          return sequenceT(E.Apply)(...args);
        }
      );

      if (decodedStatus._tag === "Right") {
        const [nft, user] = decodedStatus.right;
        return {
          props: {
            nft: nft,
            user: user,
          },
        };
      } else {
        const err = decodedStatus.left;
        console.log("Error decoding NFT or DiscordUser!");
        console.log(err);
        return {
          status: 500,
          body: new Error(`Error decoding NFT or DiscordUser!`),
        };
      }
    }

    if (res.status === 404) {
      return {
        status: 404,
        error: "NFT Not Found!",
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
  import { NFT } from "custom-types";
  import NftCard from "$components/NftCard.svelte";

  // so the load() function can pass data to the `data` variable
  export let nft: NFT;
  export let user: DiscordUser;
  const nftId = $page.params.nftId;
</script>

<div class="w-full min-h-[25vh] grid place-items-center">
  <h1 class="text-4xl font-extrabold">NFT {nftId}</h1>
</div>

<div class="wrapper">
  <div class="sm:w-2/3 md:w-2/5">
    {#if nft === undefined}
      <p>Loading...</p>
    {:else}
      <NftCard {user} {nft} />
    {/if}
  </div>
</div>

<!-- using lang="postcss" for VSCODE not to give out linting warnings. -->
<style lang="postcss">
  .wrapper {
    @apply w-full;
    @apply grid place-items-center;
    @apply pb-8;
  }
</style>
