const child = require("child_process");
const express = require("express");
const app = express();
const port = 3000;

const execSync = child.execSync("cat ~/.profile | grep IP", {
  encoding: "utf-8",
});
const IP = execSync
  .slice(execSync.indexOf("=") + 1)
  .replace(/(\r\n|\n|\r)/gm, "")
  .replace(/"/g, "");

app.get("/", (req, res) => {
  child.execSync("bash ~/scripts/touchScreenCali.sh", {
    encoding: "utf-8",
  });
});

app.listen(port, IP || "localhost", () => {
  console.log(IP);
  console.log("서버가 실행됩니다.");
});
