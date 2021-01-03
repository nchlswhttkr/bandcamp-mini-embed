<script>
  export let albumId;

  let tracks;
  let previousTrack;
  let currentTrack;
  let nextTrack;
  let artist;
  let album;
  let artwork;
  let startingTrack = 0;
  let audio;
  let paused;

  $: {
    // Update currently playing audio as track changes
    if (audio !== undefined) {
      if (currentTrack !== undefined) {
        audio.src = tracks[currentTrack].file["mp3-128"];
      } else {
        audio.src = "";
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
      currentTrack = trackIndex;
    }
  }

  function pause() {
    audio.pause();
  }
</script>

{#await load()}
  <p>Loading...</p>
{:then _}
  <div>
    <img src={artwork} alt="Cover artwork for {album}, by {artist}" />
    <audio
      bind:this={audio}
      bind:paused
      on:ended={() => play(nextTrack)}
      autoplay="true" />
    <p>{album} - {artist}</p>
    {#if paused || currentTrack === undefined}
      <button
        on:click={() => play(currentTrack === undefined ? startingTrack : currentTrack)}>
        Play
      </button>
    {:else}
      <button on:click={pause}>Pause</button>
    {/if}
    <button
      on:click={() => play(previousTrack)}
      disabled={previousTrack === undefined}>
      Previous
    </button>
    <button on:click={() => play(nextTrack)} disabled={nextTrack === undefined}>
      Next
    </button>
  </div>
{:catch error}
  <p style="color: red">{error}</p>
{/await}
