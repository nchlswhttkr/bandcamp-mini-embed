<script>
  export let toggle;
  export let artwork;
  export let album;
  export let albumUrl;
  export let tracks;
  export let currentTrack;
  export let paused;
  export let play;
  export let pause;
  export let seekingTime;
  export let currentTime;
  export let handleSeeking;
  export let previousTrack;
  export let nextTrack;

  import playIcon from "./icons/play.svg";
  import pauseIcon from "./icons/pause.svg";
  import previousIcon from "./icons/previous.svg";
  import nextIcon from "./icons/next.svg";
</script>

<div class="player">
  <div class="artwork">
    <img on:click={toggle} src={artwork} alt="Cover artwork for {album}" />
  </div>
  <div class="info">
    <p>
      <a href={albumUrl}>
        {@html tracks[currentTrack].title}
      </a>
    </p>
    <p>
      {@html tracks[currentTrack].artist}
    </p>
    <p>{@html album}</p>
    <div class="controls">
      {#if paused}
        <button
          aria-label="Play current song"
          on:click={() => play(currentTrack)}
        >
          {@html playIcon}
        </button>
      {:else}
        <button aria-label="Pause current song" on:click={pause}>
          {@html pauseIcon}
        </button>
      {/if}
      <input
        aria-label="Seek"
        type="range"
        min="0"
        max={Math.floor(tracks[currentTrack].duration)}
        value={(seekingTime === undefined ? currentTime : seekingTime) || 0}
        on:change={handleSeeking}
        on:input={handleSeeking}
      />
      <button
        aria-label="Play previous song"
        on:click={() => play(previousTrack)}
        disabled={previousTrack === undefined}
      >
        {@html previousIcon}
      </button>
      <button
        aria-label="Play next song"
        on:click={() => play(nextTrack)}
        disabled={nextTrack === undefined}
      >
        {@html nextIcon}
      </button>
    </div>
  </div>
</div>

<style>
  button {
    cursor: pointer;
    opacity: 0.8;
    color: inherit;
    border: none;
    background-color: unset;
    padding: 4px;
    line-height: 0;
  }
  button:hover {
    opacity: 1;
  }
  button:disabled {
    cursor: auto;
    opacity: 0.5;
  }
  a {
    color: #537d86;
    text-decoration: underline;
    font-weight: 700;
  }
  @media (prefers-color-scheme: dark) {
    a {
      color: inherit;
    }
  }

  .player {
    display: flex;
    height: 120px;
  }

  .info {
    flex: 1 1 0;
    min-width: 198px;
    padding: 12px 0 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }
  .info p {
    margin: 0 8px 0 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .info > p:last-of-type {
    font-style: italic;
  }

  .controls {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding-right: 4px; /* line up with links below */
  }
  .controls > *:first-child {
    padding-left: 8px; /* keep space between play button/artwork interactive */
  }
  .controls > input {
    cursor: grab;
    flex-grow: 1;
    width: 0; /* force smaller width on Firefox */
  }
  .controls > input:active {
    cursor: grabbing;
  }

  .artwork {
    cursor: pointer;
    height: 120px;
    width: 120px;
    min-width: 80px;
    display: flex;
    justify-content: center;
    overflow: hidden;
  }
</style>
