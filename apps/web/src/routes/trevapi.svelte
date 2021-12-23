<script lang="ts">
  let imgText = "";
  let imgSrc = "";

  const fetchImage = async () => {
    const response = await fetch(
      `http://localhost:3001/trev?text=${encodeURI(imgText)}`
    );
    const { data } = await response.json();
    imgSrc = data;
  };
</script>

<div class="w-full min-h-[50vh] grid place-items-center">
  <h1 class="text-4xl font-extrabold">TrevAPI</h1>
</div>

<div class="flex flex-col space-y-12 w-full items-center">
  <div class="flex flex-row space-x-8 justify-center items-center w-[70vh]">
    <input
      type="text"
      name="image text"
      id="img-input"
      class="focus:ring-indigo-500 focus:border-indigo-500 inline px-6 py-4 bg-gray-100 rounded-md flex-auto"
      placeholder="Text here"
      bind:value={imgText}
    />
    <button
      class="bg-indigo-500 hover:bg-indigo-700 text-white font-bold px-6 py-4 rounded-md inline flex-none"
      on:click={() => {
        fetchImage();
      }}
    >
      Generate Image
    </button>
  </div>

  <div class="flex flex-row justify-center items-center w-full">
    <img src={imgSrc} alt="trev result" class="w-1/2" />
  </div>
</div>
