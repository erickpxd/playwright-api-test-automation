import fs from "fs";
import { env } from "./config/environment";

async function globalSetup() {
  const res = await fetch(`${env.notesUrl}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: env.testEmail,
      password: env.testPassword,
    }),
  });

  const json = await res.json();
  const token = json.data.token;

  fs.writeFileSync("auth.json", JSON.stringify({ token }));
  console.log("Token gerado e salvo em auth.json");
}

export default globalSetup;
