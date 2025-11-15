import fs from "fs";

async function globalSetup() {
  const res = await fetch(`${process.env.NOTES_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.TEST_EMAIL,
      password: process.env.TEST_PASSWORD
    })
  });

  const json = await res.json();
  const token = json.data.token;

  fs.writeFileSync("auth.json", JSON.stringify({ token }));
  console.log("Token gerado e salvo em auth.json");
}

export default globalSetup;
