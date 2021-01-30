<script lang="ts">
  import Loader from "./Loader.svelte";
  import { onMount } from "svelte";
  import fuzzysort from "fuzzysort";
  import axios from "axios";
  import { endpoints } from "../../shared";
  import type { File } from "../../types";

  interface ParsedFile extends File {
    relative: string;
  }

  let files: ParsedFile[] = [];
  let loaded = false;

  onMount(async () => {
    const response = await axios.get<{ files: File[]; cwd: string }>(
      `${endpoints.extension.url}/files`
    );
    files = response.data.files.map((file) => ({
      absolute: file.absolute,
      relative: file.absolute.replace(response.data.cwd, ""),
    }));
    loaded = true;
  });

  const nameOnly = (file: ParsedFile) => {
    const split = file.absolute.split("/");
    return split[split.length - 1];
  };

  let search: string = "";
  let fileIndex = 0;

  document.addEventListener("keyup", (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      searchInput.focus();
      fileIndex += 1;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      searchInput.focus();

      if (fileIndex === 0) {
        return;
      }

      fileIndex -= 1;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      axios.get(
        `${endpoints.extension.url}/focus?file=${matches[fileIndex].absolute}`
      );
      window.minimize();
    }
  });

  const FILES_TO_SHOW = 8;

  let searchInput: HTMLInputElement;

  const fill = (arr: ParsedFile[]) => {
    while (arr.length < FILES_TO_SHOW) {
      arr.push({ absolute: "", relative: "" });
    }
    return arr;
  };

  const runFizzySearch = (search: string, files: ParsedFile[]) => {
    if (!files.length || !search.length) {
      return fill(files.slice(0, FILES_TO_SHOW));
    }

    const result = fuzzysort
      .go(search, files, { key: "relative" })
      .slice(0, FILES_TO_SHOW)
      .map((result) => ({ ...result.obj }));

    return fill(result);
  };

  $: matches = runFizzySearch(search, files);
</script>

<main>
  {#if !loaded}
    <Loader />
  {/if}

  <div class="finder">
    <div>
      <!-- svelte-ignore a11y-autofocus -->
      <input
        class="file__search"
        bind:value={search}
        autofocus
        bind:this={searchInput}
      />

      <ul class="files">
        {#each matches as file, idx}
          <li class="{idx === fileIndex ? 'file__highlight' : ''} file">
            <ul class="file__names">
              <li class="file__name">
                {nameOnly(file)}
              </li>
              <li class="file__name file__absolute">{file.absolute}</li>
            </ul>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>

<style>
  main {
    --item-height: 50px;
    position: relative;
    width: 100%;
    height: 100%;
    color: #333;
    margin: 0px;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    width: 100%;
    /* height: 650px; */
  }

  ul,
  li {
    margin: 0;
    padding: 0;
  }

  .finder {
    padding: 0 10px 10px 10px;
    background: #202123;
    width: 100%;
    box-sizing: border-box;
  }

  .file__search {
    margin: 10px 0 0 0;
    border: 1px solid black;
    color: white;
    background: #2d2f31;
    font-size: 20px;
    box-sizing: border-box;
    padding: 8px;
    height: 40px;
    outline: none;
    width: 100%;
  }

  .file {
    padding: 10px;
    margin: 10px 0 0 0;
    min-height: var(--item-height);
    background: #27292b;
    color: #a4a5a5;
    list-style: none;
  }

  .file__name {
    list-style: none;
  }

  .file__highlight {
    background: #4d80c1;
    color: white;
  }

  .file__absolute {
    color: #4e4e4e;
  }

  .file__highlight > .file__names > .file__absolute {
    color: #c1c1c1;
  }
</style>
