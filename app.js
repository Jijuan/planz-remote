const child = require("child_process");
const express = require("express");
const app = express();
const port = 3000;
const status = {
  kiosk: {
    online: true,
  },
  pii: {
    online: true,
  },
};
const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

const execSync = child.execSync("cat ~/.profile | grep IP", {
  encoding: "utf-8",
});
const IP = execSync
  .slice(execSync.indexOf("=") + 1)
  .replace(/(\r\n|\n|\r)/gm, "")
  .replace(/"/g, "");

// 상태 정보
app.get("/", (req, res) => {
  // updateStatus(status);
  res.send(status);
});

// 터치 재보정
app.get("/touch", (req, res) => {
  child.execSync("bash ~/scripts/touchScreenCali.sh", {
    encoding: "utf-8",
  });
});

// 재부팅
app.get("/reboot", (req, res) => {
  child.execSync("reboot", {
    encoding: "utf-8",
  });
});

// pii, kiosk 재부팅
app.get("/restart", async (req, res) => {
  // kiosk 종료
  child.execSync("killall -9 pkb", {
    encoding: "utf-8",
  });

  await delay(500);

  // pii restart
  child.execSync("pm2 restart PII", {
    encoding: "utf-8",
  });

  await delay(1000);

  // kiosk 재실행,
  child.execSync("bash ~/scripts/kiosk-auto.sh", {
    encoding: "utf-8",
  });
});

app.listen(port, IP || "localhost", () => {
  console.log(IP);
  console.log("서버가 실행됩니다.");
});
