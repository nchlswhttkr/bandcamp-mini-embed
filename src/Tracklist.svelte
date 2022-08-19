<script>
  export let tracks;
  export let currentTrack;
  export let play;

  import downChevron from "./icons/chevron-down.svg";

  let collapsed = true;

  function showTracklist() {
    collapsed = false;
  }

  $: artist = tracks[currentTrack].artist;
</script>

<div class="tracklist" class:collapsed>
  {#if collapsed}
    <button class="expand" on:click={showTracklist}>
      {@html downChevron} Show tracklist
    </button>
  {:else}
    <ul class="tracks">
      {#each tracks as track, i}
        <li
          tabindex={tracks[i].track_streaming ? 0 : -1}
          class:now-playing={i === currentTrack}
          class:unstreamable={!tracks[i].track_streaming}
          on:click={() => tracks[i].track_streaming && play(i)}
          on:keydown={(e) => {
            if (
              tracks[i].track_streaming &&
              (e.key === " " || e.key === "Enter")
            ) {
              e.preventDefault();
              play(i);
            }
          }}
        >
          <span>
            {Math.floor(track.duration / 60)
              .toString()
              .padStart(2, " ")}:{Math.floor(track.duration % 60)
              .toString()
              .padStart(2, "0")}
          </span>
          {@html "  " + track.title}
          {#if track.artist !== artist}– {track.artist}{/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .tracklist {
    box-sizing: border-box;
    overflow-y: scroll;
    max-height: 200px;
    transition: max-height 0.2s;
  }

  .tracklist.collapsed {
    max-height: 40px; /* forces transition when expanding */
  }

  button.expand {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    opacity: 0.8;
    color: inherit;
    border: none;
    background-color: unset;
    padding: 4px;
    font-size: 16px;
    width: 100%;
    height: 40px; /* match to parent container height */
  }
  button:hover.expand {
    opacity: 1;
  }

  .tracks {
    margin: 0;
    padding: 8px 0;
  }
  .tracks > * {
    font-size: 12px;
    cursor: pointer;
    margin: 0px 12px;
    padding: 10px 8px;
    list-style-type: none;
    border-bottom: 1px solid #bbb;
    white-space: pre;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tracks > .now-playing {
    font-weight: 700;
  }
  .tracks > .unstreamable {
    cursor: default;
    opacity: 0.5;
  }
  .tracks span {
    font-family: monospace;
  }
</style>
