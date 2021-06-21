<script>
  export let tracks;
  export let currentTrack;
  export let play;

  $: artist = tracks[currentTrack].artist;
</script>

<ul class="tracks">
  {#each tracks as track, i}
    <li
      tabindex={tracks[i].track_streaming ? 0 : -1}
      class:now-playing={i === currentTrack}
      class:unstreamable={!tracks[i].track_streaming}
      on:click={() => tracks[i].track_streaming && play(i)}
      on:keydown={(e) => {
        if (tracks[i].track_streaming && e.key === " ") {
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

<style>
  .tracks {
    margin: 8px 0 0;
    padding: 0;
    height: 160px;
    overflow-y: scroll;
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
