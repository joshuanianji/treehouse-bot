<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
  import { variables } from "$lib/variables";

  const load: Load = async ({ params, fetch, session, stuff }) => {
    console.log("load", params, "session", session);
    const url = `${variables.apiEndpoint}/nft?userId=${params.userid}`;
    const res = await fetch(url);

    if (res.ok) {
      return {
        props: {
          data: await res.json(),
        },
      };
    }

    console.log(res);
    return {
      status: res.status,
      error: new Error(
        `Could not access: ${variables.apiEndpoint}/nft?userId=${params.userid}`
      ),
    };
  };
  export { load };
</script>

<script lang="ts">
  import { page } from "$app/stores";

  // so the load() function can pass data to the `data` variable
  export let data: any;
  const userid = $page.params.userid;
</script>

<div class="w-full min-h-[50vh] grid place-items-center">
  <h1 class="text-4xl font-extrabold">NFts for User {userid}</h1>
</div>

<div class="w-full gris place-items-center">
  <h2 class="text-xl text-center">Unseralized User Data</h2>

  <code>{JSON.stringify(data, null, 4)}</code>
</div>
