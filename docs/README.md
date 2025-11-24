# Documentação do Framework de Testes

Este documento descreve a funcionalidade e os componentes do diretório `framework` do projeto.

## Componentes principais

**1) Logger** (`framework/core/logger.ts`)
- O que é: Singleton `Logger` que registra eventos em console e em arquivo.
- Exportações principais:
  - `LogLevel` (enum): `INFO`, `WARN`, `ERROR`.
  - `LogEntry` (interface): `{ timestamp, level, message, metadata? }`.
  - `Logger` (classe singleton) com métodos:
    - `getInstance(): Logger` — obtém a instância singleton.
    - `info(message, metadata?)`, `warn(...)`, `error(...)` — logs por nível.
    - `step(stepName, metadata?)` — registra um passo de teste.
    - `request(method, url, data?)` — registra uma requisição.
    - `response(status, url, responseTime)` — registra resposta com nível `WARN` para status >= 400.
    - `getLogs()` — retorna cópia dos logs em memória.
    - `clear()` — limpa os logs em memória.
    - `static reset()` — reseta a instância singleton (útil em testes isolados).
- Comportamento:
  - Escreve no console (`console.log`, `console.warn`, `console.error`).
  - Append em arquivo: `./test-logs/test-execution-YYYY-MM-DD.log` usando `fs.appendFileSync`.
  - Formata metadata com `JSON.stringify(..., null, 2)` para legibilidade.
- Observações e sugestões:
  - Uso de `appendFileSync` é síncrono e pode bloquear em execuções muito intensas; considerar `fs.createWriteStream` ou APIs assíncronas se houver necessidade de alto volume.
  - `outputDir` está hardcoded como `./test-logs`. Se desejar configurabilidade, leve em conta uma variável de ambiente ou parâmetro no `getInstance()`.

**2) RequestManager** (`framework/core/requestManager.ts`)
- O que é: Singleton que encapsula o `APIRequestContext` do Playwright.
- Comportamento e API:
  - `static getInstance(): Promise<RequestManager>` — cria e inicializa a instância (chama `request.newContext` com `baseURL: env.notesUrl`).
  - `client` (getter) retorna o `APIRequestContext` para uso em requisições.
  - `static dispose(): Promise<void>` — descarta o contexto (`apiContext.dispose()`) e reseta a instância.
- Observações:
  - Chamadas assíncronas: sempre await em `getInstance()` antes de usar `client`.
  - `env.notesUrl` vem de `config/environment.ts`; garantir que esteja definido em cada ambiente.
  - Recomenda-se chamar `RequestManager.dispose()` no teardown global (ex.: `globalTeardown` ou `afterAll`) para liberar conexões.

**3) TestContext** (`framework/core/testContext.ts`)
- O que é: objeto simples para armazenar IDs temporários entre passos de teste.
- Estrutura:
  - Campos opcionais: `noteId?: string`, `userId?: string`.
- Observações:
  - É uma classe leve. Se o objetivo for manter contexto por execução, instancie um objeto `new TestContext()` no início do teste e passe entre helpers, ou torne-a singleton se preferir estado global.

**4) authHelper** (`framework/helpers/authHelper.ts`)
- O que é: helper para ler token de `auth.json` no repositório.
- API:
  - `getToken(): string` — lê o arquivo `auth.json` e retorna `JSON.parse(...).token`.
- Observações e melhorias:
  - A função usa `fs.readFileSync` sem tratamento de erros: se `auth.json` estiver ausente ou inválido, lançará uma exceção. Envolver com `try/catch` melhora robustez.
  - Se múltiplos acessos ao token aparecem, considerar cache (ler uma vez) ou suportar fallback por variáveis de ambiente.

**5) LoggingHelper** (`framework/helpers/loggingHelper.ts`)
- O que é: adaptador que combina `Logger` com um `APIRequestContext` para realizar requisições instrumentadas.
- API:
  - `constructor(logger: Logger)` — injeta dependência de log.
  - `makeRequest(client, method, url, options?) : Promise<APIResponse>` — executa a chamada usando o `client` do Playwright, mede tempo de resposta e registra `request` e `response`.
    - `method` aceita: `GET | POST | PUT | PATCH | DELETE`.
    - `options` opcional: `{ headers?, data?, params? }` — repassado para o método do `client`.
  - `logStep(stepName, metadata?)` — wrapper para `logger.step`.
- Observações:
  - A medição de tempo é feita com `Date.now()` (suficiente para métricas simples).
  - O switch cobre os métodos suportados; por tipagem TypeScript o `method` está controlado.
  - Certifique-se de que `options` esteja no formato esperado pelo Playwright `APIRequestContext` (ex.: `data` para body, `params` para query string se suportado pela versão do Playwright).

## Exemplos de uso

1) Cenário típico dentro de um `describe`/`test` Playwright:

```ts
import { RequestManager } from "../framework/core/requestManager";
import { Logger } from "../framework/core/logger";
import { LoggingHelper } from "../framework/helpers/loggingHelper";
import { getToken } from "../framework/helpers/authHelper";

const logger = Logger.getInstance();
const loggingHelper = new LoggingHelper(logger);

beforeAll(async () => {
  await RequestManager.getInstance();
});

afterAll(async () => {
  await RequestManager.dispose();
  Logger.reset();
});

test('example: list notes', async () => {
  const client = (await RequestManager.getInstance()).client;
  const token = getToken();

  const res = await loggingHelper.makeRequest(client, 'GET', '/notes', {
    headers: { "x-auth-token": token }
  });

  expect(res.status()).toBe(200);
});
```

2) Exemplo de uso do `Logger` diretamente:

```ts
const logger = Logger.getInstance();
logger.step('Initializing test...');
logger.info('Initial data', { name: 'teste' });
```