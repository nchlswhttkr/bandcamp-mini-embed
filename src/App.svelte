<script>
  export let albumId;
  export let proxyRoot;
  export let fallbackText;
  export let fallbackUrl;

  import bandcampLogo from "./icons/bandcamp-logotype-color.png";
  import playIcon from "./icons/play.svg";
  import pauseIcon from "./icons/pause.svg";
  import previousIcon from "./icons/previous.svg";
  import nextIcon from "./icons/next.svg";

  let tracks;
  let startingTrack;
  let previousTrack;
  let currentTrack;
  let nextTrack;
  let artist;
  let album;
  let albumUrl;
  let artwork;
  let audio;
  let paused;
  let currentTime;

  $: {
    // Update currently playing audio as track changes
    if (audio !== undefined) {
      if (currentTrack !== undefined) {
        audio.src = tracks[currentTrack].file["mp3-128"];
        audio.play();
      }
    }
  }
  $: {
    // Seek back/forwards to find the next streamable track (may not exist!)
    if (tracks !== undefined) {
      let seekingPreviousTrack =
        currentTrack === undefined ? startingTrack : currentTrack;
      do {
        seekingPreviousTrack--;
      } while (
        seekingPreviousTrack >= 0 &&
        !tracks[seekingPreviousTrack].track_streaming
      );
      previousTrack =
        seekingPreviousTrack >= 0 ? seekingPreviousTrack : undefined;

      let seekingNextTrack =
        currentTrack === undefined ? startingTrack : currentTrack;
      do {
        seekingNextTrack++;
      } while (
        seekingNextTrack < tracks.length &&
        !tracks[seekingNextTrack].track_streaming
      );
      nextTrack =
        seekingNextTrack < tracks.length ? seekingNextTrack : undefined;
    }
  }
  $: {
    // Since we don't know the album's main artist, treating the current
    // artist as the album artist and change with each track
    if (tracks === undefined) {
      artist = undefined;
    } else if (currentTrack === undefined) {
      artist = tracks[startingTrack].artist;
    } else {
      artist = tracks[currentTrack].artist;
    }
  }

  async function load() {
    try {
      const response = await fetch(`${proxyRoot}?album=${albumId}`).then(
        async (r) => {
          if (r.status !== 200) {
            throw new Error(await r.text());
          }
          return r.json();
        }
      );
      artwork = response.album_art;
      album = response.album_title;
      albumUrl = response.linkback + "?from=embed";
      tracks = response.tracks;
      startingTrack =
        tracks.findIndex((track) => track.id === response.featured_track_id) ||
        0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  function play(trackIndex) {
    if (trackIndex === undefined) {
      // noop
    } else if (currentTrack === trackIndex) {
      audio.play();
    } else {
      seek(0);
      currentTrack = trackIndex;
    }
  }

  function pause() {
    audio.pause();
  }

  function toggle() {
    if (currentTrack === undefined) {
      play(startingTrack);
    } else if (paused) {
      play(currentTrack);
    } else {
      pause();
    }
  }

  let seekingTime;
  function handleSeeking(event) {
    switch (event.type) {
      case "change":
        seek(event.target.value);
        seekingTime = undefined;
        break;
      case "input":
        seekingTime = event.target.value;
        break;
      default:
        break;
    }
  }

  function seek(time) {
    // Seeking via currentTime is inconsistent in Firefox, seems to be a
    // regression of https://github.com/sveltejs/svelte/issues/3524
    // Instead, rely on setting it via DOM
    document.getElementById(`bandcamp-audio-${albumId}`).currentTime = time;
    // currentTime = time
  }
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<audio
  id={`bandcamp-audio-${albumId}`}
  bind:this={audio}
  bind:paused
  bind:currentTime
  on:ended={() => play(nextTrack)}
/>
<div class="root">
  {#await load() then _}
    <div class="player">
      <div class="artwork">
        <img on:click={toggle} src={artwork} alt="Cover artwork for {album}" />
      </div>
      <div class="info">
        <a href={albumUrl}>
          <p>
            {tracks[currentTrack === undefined ? startingTrack : currentTrack]
              .title}
          </p>
        </a>
        <p>
          {tracks[currentTrack === undefined ? startingTrack : currentTrack]
            .artist}
        </p>
        <p>{album}</p>
        <div class="controls">
          {#if paused || currentTrack === undefined}
            <button
              on:click={() =>
                play(currentTrack === undefined ? startingTrack : currentTrack)}
            >
              {@html playIcon}
            </button>
          {:else}
            <button on:click={pause}>
              {@html pauseIcon}
            </button>
          {/if}
          <input
            type="range"
            min="0"
            max={currentTrack === undefined
              ? undefined
              : Math.floor(tracks[currentTrack].duration)}
            value={(seekingTime === undefined ? currentTime : seekingTime) || 0}
            on:change={handleSeeking}
            on:input={handleSeeking}
          />
          <button
            on:click={() => play(previousTrack)}
            disabled={previousTrack === undefined}
          >
            {@html previousIcon}
          </button>
          <button
            on:click={() => play(nextTrack)}
            disabled={nextTrack === undefined}
          >
            {@html nextIcon}
          </button>
        </div>
      </div>
    </div>
    <ul class="tracks">
      {#each tracks as track, i}
        <li
          class:now-playing={i === currentTrack}
          class:unstreamable={!tracks[i].track_streaming}
          on:click={() => tracks[i].track_streaming && play(i)}
        >
          <span>
            {Math.floor(track.duration / 60)
              .toString()
              .padStart(2, " ")}:{Math.floor(track.duration % 60)
              .toString()
              .padStart(2, "0")}
          </span>
          {"  " + track.title}
          {#if track.artist !== artist}– {track.artist}{/if}
        </li>
      {/each}
    </ul>
    <div class="links">
      <a href={`${albumUrl}&action=buy`}>buy</a>
      &nbsp;
      <a href={`${albumUrl}&action=share`}>share</a>
      <a class="logo" href={albumUrl}>
        <img src={bandcampLogo} alt="Bandcamp logo" />
      </a>
    </div>
  {:catch _}
    {#if fallbackText && fallbackUrl}
      <p style="margin: 16px;"><a href={fallbackUrl}>{fallbackText}</a></p>
    {:else}
      <p style="color: red; margin: 16px;">
        An error occured and this Bandcamp album could not be loaded.
      </p>
    {/if}
  {/await}
</div>

<style>
  .root {
    all: revert;
    font-family: sans-serif;
    width: 100%;
    max-width: 480px;
    box-sizing: border-box;
    height: 336px;
    border: 1px solid #bbb;
  }
  /* This interferes the SVGs inside buttons, ignore them */
  .root :global(*):not(button *) {
    all: revert;
  }

  button {
    cursor: pointer;
    color: #555;
    border: none;
    background-color: #fff;
    padding: 4px;
    line-height: 0;
  }
  button:hover {
    color: #111;
  }
  button:disabled {
    cursor: auto;
    color: #bbb;
  }
  a {
    color: #61929c;
    font-weight: 700;
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

  .links {
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .links > *:first-child {
    margin-right: 8px; /* fix space between buy/share links */
  }
  .links > .logo {
    line-height: 0;
  }
  .links > .logo > img {
    height: 32px;
    width: 110px;
  }

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
    padding: 8px 8px;
    list-style-type: none;
    border-bottom: 1px solid #bbb;
    white-space: pre;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tracks > .now-playing {
    background-color: #eee;
    font-weight: 700;
  }
  .tracks > .unstreamable {
    cursor: default;
    color: #bbb;
  }
  .tracks span {
    font-family: monospace;
  }
</style>
