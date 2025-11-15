import fs from "fs";

export function getToken() {
  const raw = fs.readFileSync("auth.json", "utf-8");
  return JSON.parse(raw).token;
}
