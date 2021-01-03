import App from "./App.svelte";

{
  const albumId = document.currentScript.getAttribute("data-album-id");
  const target = document.currentScript.getAttribute("data-target");

  const app = new App({
    target: document.getElementById(target),
    props: { albumId },
  });
}
