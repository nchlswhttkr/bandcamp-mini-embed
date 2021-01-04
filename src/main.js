import App from "./App.svelte";

{
  const albumId = document.currentScript.getAttribute("data-album-id");
  const proxyRoot = document.currentScript.getAttribute("data-proxy-root");

  const app = new App({
    target: document.currentScript.previousElementSibling,
    props: { albumId, proxyRoot },
  });
}
