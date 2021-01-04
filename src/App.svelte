<script>
  export let albumId;

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

  async function load() {
    const response = await fetch(
      "https://bandcamp-embed-cors-proxy.nchlswhttkr.workers.dev/?album=" +
        albumId
    )
      .then(r => {
        if (r.status !== 200) {
          throw new Error("Failed to load album");
        }
        return r.text();
      })
      .then(text => JSON.parse(text.match(/playerdata = (.*);/)[1]));
    artwork = response.album_art;
    artist = response.artist;
    album = response.album_title;
    albumUrl = response.linkback + "?from=embed";
    tracks = response.tracks;
    startingTrack =
      tracks.findIndex(track => track.id === response.featured_track_id) || 0;
  }

  function play(trackIndex) {
    if (trackIndex === undefined) {
      // noop
    } else if (currentTrack === trackIndex) {
      audio.play();
    } else {
      currentTime = 0;
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
        currentTime = event.target.value;
        seekingTime = undefined;
        break;
      case "input":
        seekingTime = event.target.value;
        break;
      default:
        break;
    }
  }
</script>

<style>
  button {
    color: #555;
    border: none;
    background-color: #fff;
    padding: 4px;
    line-height: 0;
  }
  button:hover {
    cursor: pointer;
    color: #111;
  }
  button:disabled {
    cursor: auto;
    color: #bbb;
  }

  .bandcamp-mini-embed {
    font-family: sans-serif;
    max-width: 480px;
    border: 1px solid #bbb;
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
    flex-shrink: 1;
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
    flex-grow: 1;
    width: 0; /* force smaller width on Firefox */
  }

  .artwork {
    cursor: pointer;
    flex-grow: 0;
  }

  /* Links along bottom, Bandcamp logo to far right */
  .links {
    box-sizing: border-box;
    padding: 8px 0 8px 8px;
    display: flex;
    align-items: center;
  }
  .links > * {
    margin-right: 16px;
  }
  .links > .spacer {
    flex-grow: 1;
  }
  .links > *:last-child {
    line-height: 0;
    margin-right: 0;
  }
</style>

<audio
  bind:this={audio}
  bind:paused
  bind:currentTime
  on:ended={() => play(nextTrack)} />
<div class="bandcamp-mini-embed">
  {#await load()}
    <p>Loading...</p>
  {:then _}
    <div class="player">
      <img
        height="120"
        width="120"
        class="artwork"
        on:click={toggle}
        src={artwork}
        alt="Cover artwork for {album}, by {artist}" />
      <div class="info">
        <a href={albumUrl}>
          <p>
            {tracks[currentTrack === undefined ? startingTrack : currentTrack].title}
          </p>
        </a>
        <p>
          {tracks[currentTrack === undefined ? startingTrack : currentTrack].artist}
        </p>
        <p>{album}</p>
        <div class="controls">
          {#if paused || currentTrack === undefined}
            <button
              on:click={() => play(currentTrack === undefined ? startingTrack : currentTrack)}>
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
            max={currentTrack === undefined ? undefined : Math.floor(tracks[currentTrack].duration)}
            value={(seekingTime === undefined ? currentTime : seekingTime) || 0}
            on:change={handleSeeking}
            on:input={handleSeeking} />
          <button
            on:click={() => play(previousTrack)}
            disabled={previousTrack === undefined}>
            {@html previousIcon}
          </button>
          <button
            on:click={() => play(nextTrack)}
            disabled={nextTrack === undefined}>
            {@html nextIcon}
          </button>
        </div>
      </div>
    </div>
    <div class="links">
      <a href={`${albumUrl}&action=buy`}>buy</a>
      <a href={`${albumUrl}&action=share`}>share</a>
      <div class="spacer" />
      <a href={albumUrl}>
        <img height="32" width="110" src={bandcampLogo} alt="Bandcamp logo" />
      </a>
    </div>
  {:catch error}
    <p style="color: red">{error}</p>
  {/await}
</div>
