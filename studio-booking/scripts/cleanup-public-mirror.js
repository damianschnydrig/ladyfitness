const fs = require("fs");
const path = require("path");

const appRoot = path.resolve(__dirname, "..");
const staleMirror = path.join(appRoot, "public", "studio-booking");

if (fs.existsSync(staleMirror)) {
  fs.rmSync(staleMirror, { recursive: true, force: true });
  console.log("cleanup-public-mirror: removed public/studio-booking");
} else {
  console.log("cleanup-public-mirror: nothing to remove");
}
