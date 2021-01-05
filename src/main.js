import App from "./App.svelte";

{
  const albumId = document.currentScript.getAttribute("data-album-id");
  const proxyRoot = document.currentScript.getAttribute("data-proxy-root");
  const target = document.currentScript.previousElementSibling;

  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) {
      return;
    }
    observer.disconnect();
    new App({
      target,
      props: { albumId, proxyRoot },
    });
  }).observe(target);
}
