const cp = require("child_process");
const fs = require("fs");

console.log("--- Building Svelte embed");
cp.execSync("rollup -c");

console.log("--- Precompiling Handlebars templates");
fs.mkdirSync("build/templates/", { recursive: true });
cp.execSync(
  "handlebars src/worker/templates/home.hbs -f build/templates/home.hbs.js"
);
cp.execSync(
  "handlebars src/worker/templates/embed.hbs -f build/templates/embed.hbs.js"
);

console.log("--- Bundling worker code");
cp.execSync(
  "esbuild src/worker/main.js --bundle --loader:.html=text --external:fs --outfile=build/worker.js"
);
