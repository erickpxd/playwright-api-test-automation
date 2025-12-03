import fs from "fs";

export function getToken(): string {
  if (process.env.AUTH_TOKEN) {
    return process.env.AUTH_TOKEN;
  }

  try {
    const raw = fs.readFileSync("auth.json", "utf-8");
    const parsed = JSON.parse(raw);

    if (!parsed.token) {
      throw new Error("auth.json não contém o campo token");
    }

    return parsed.token;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido ao ler o token";
    throw new Error(`Não foi possível recuperar o token de autenticação: ${message}`);
  }
}
