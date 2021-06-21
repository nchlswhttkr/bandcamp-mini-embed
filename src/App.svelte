<script>
  export let albumId;
  export let proxyRoot;
  export let fallbackText;
  export let fallbackUrl;

  import Links from "./Links.svelte";
  import Tracklist from "./Tracklist.svelte";
  import Player from "./Player.svelte";

  let tracks;
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
    // Seek back/forwards to find the next streamable track (may not exist!)
    if (tracks !== undefined) {
      let seekingPreviousTrack = currentTrack;
      do {
        seekingPreviousTrack--;
      } while (
        seekingPreviousTrack >= 0 &&
        !tracks[seekingPreviousTrack].track_streaming
      );
      if (seekingPreviousTrack >= 0) {
        previousTrack = seekingPreviousTrack;
      } else {
        previousTrack = undefined;
      }

      let seekingNextTrack = currentTrack;
      do {
        seekingNextTrack++;
      } while (
        seekingNextTrack < tracks.length &&
        !tracks[seekingNextTrack].track_streaming
      );
      if (seekingNextTrack < tracks.length) {
        nextTrack = seekingNextTrack;
      } else {
        nextTrack = undefined;
      }
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
      currentTrack =
        tracks.findIndex(({ id }) => id === response.featured_track_id) || 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  function play(trackIndex) {
    if (trackIndex === undefined) return; // noop, occurs after last song

    // Will start a new song if it's changed, or no song has played so far
    if (currentTrack !== trackIndex || audio.src === "") {
      seek(0);
      currentTrack = trackIndex;
      audio.src = tracks[currentTrack].file["mp3-128"];
    }
    audio.play();
  }

  function pause() {
    audio.pause();
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
    <Player
      {artwork}
      {album}
      {albumUrl}
      {tracks}
      {currentTrack}
      paused={paused || /* unloaded audio shows as playing */ audio.src === ""}
      {play}
      {pause}
      {seek}
      {currentTime}
      {previousTrack}
      {nextTrack}
    />
    <Tracklist {tracks} {currentTrack} {play} {artist} />
    <Links {albumUrl} />
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
  .root :global(:not(button *)) {
    all: revert;
  }
</style>
