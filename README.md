# QA3 API Test Automation

[![CI](https://github.com/erickpxd/playwright-api-test-automation/actions/workflows/ci.yml/badge.svg)](https://github.com/erickpxd/playwright-api-test-automation/actions/workflows/ci.yml)

Framework de automação de testes para a API pública [Notes API](https://practice.expandtesting.com/notes/api), desenvolvido com Playwright, TypeScript e Node.js.

O projeto cobre os fluxos de autenticação, gerenciamento de notas e perfil do usuário. Além dos testes funcionais, inclui cenários E2E, testes unitários do framework, validação de contratos JSON, métricas de desempenho, cobertura e geração de relatórios.

## Tecnologias

- Node.js e npm
- TypeScript
- Playwright Test
- ESLint
- AJV para validação de schemas
- C8 para cobertura
- GitHub Actions

## Cobertura dos testes

| Área | Cenários |
| --- | --- |
| Autenticação | Registro, login e exclusão de conta |
| Notas | Criação, consulta, atualização e exclusão |
| Perfil | Consulta e atualização de dados |
| E2E | Ciclo completo de autenticação e gerenciamento de notas |
| Performance | Tempo de resposta e percentil 95 do login |
| Framework | Ciclo de vida e comportamento singleton do `RequestManager` |

Os testes funcionais são classificados como `Smoke` ou `Regression`, permitindo executar somente o conjunto necessário.

## Estrutura do projeto

```text
.
├── config/                 # Ambiente e endpoints da API
├── docs/                   # Documentação complementar do framework
├── framework/
│   ├── core/               # RequestManager, Logger e contexto dos testes
│   ├── helpers/            # Autenticação, logs, schemas e performance
│   └── reporters/          # Relatório de status por área
├── tests/
│   ├── auth/               # Testes de autenticação
│   ├── e2e/                # Fluxos completos da API
│   ├── notes/              # Testes CRUD de notas
│   ├── performance/        # Testes de desempenho
│   ├── profileSettings/    # Testes de perfil
│   ├── schemas/            # Contratos JSON
│   └── unit/               # Testes unitários do framework
├── .github/workflows/      # Pipeline de integração contínua
├── globalSetup.ts          # Autenticação antes da suíte
├── globalTeardown.ts       # Liberação dos recursos
└── playwright.config.ts    # Configuração do Playwright
```

Uma descrição mais detalhada dos componentes está disponível em [docs/README.md](docs/README.md).

## Pré-requisitos

- Node.js 20 ou superior
- npm
- Acesso à internet para consumir a Notes API
- Um usuário válido cadastrado na API para o setup global

## Instalação

Clone o repositório e instale as dependências exatamente como registradas no lockfile:

```bash
git clone https://github.com/erickpxd/playwright-api-test-automation.git
cd playwright-api-test-automation
npm ci
```

Como os testes utilizam o contexto de requisições HTTP do Playwright, não é necessário instalar navegadores.

## Configuração

Copie o arquivo de exemplo e preencha as credenciais do usuário de teste:

```bash
cp .env.example .env.test
```

O arquivo deve conter:

```dotenv
NOTES_URL=https://practice.expandtesting.com/notes/api
API_URL=https://practice.expandtesting.com/notes/api
TEST_EMAIL=usuario_de_teste@example.com
TEST_PASSWORD=senha_do_usuario
```

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `NOTES_URL` | Sim | URL base usada pelo `RequestManager` e pelos helpers |
| `TEST_EMAIL` | Sim | E-mail utilizado pelo setup global |
| `TEST_PASSWORD` | Sim | Senha utilizada pelo setup e pelos testes |
| `API_URL` | Não | URL base disponibilizada pela configuração do Playwright |
| `TEST_SUITE` | Não | Filtra a execução por `smoke` ou `regression` |
| `FAIL_FAST` | Não | Use `1` para interromper após a primeira falha |

O setup global autentica o usuário e grava temporariamente o token em `auth.json`. O `.env.test`, esse token, os logs e os relatórios são ignorados pelo Git.

## Execução

Executar toda a suíte:

```bash
npm test
```

Executar somente os testes Smoke:

```bash
TEST_SUITE=smoke npm test
```

Executar somente os testes de regressão:

```bash
TEST_SUITE=regression npm test
```

Executar um arquivo específico:

```bash
npx playwright test tests/auth/login.spec.ts
```

Interromper a suíte na primeira falha:

```bash
FAIL_FAST=1 npm test
```

Executar lint:

```bash
npm run lint
```

Executar testes com cobertura:

```bash
npm run test:coverage
```

## Teste de performance

O cenário de login mede múltiplas requisições, calcula média, mínimo, máximo, p50 e p95 e valida o p95 contra um SLA configurável.

```bash
PERF_LOGIN_ITERATIONS=20 \
PERF_LOGIN_WARMUP=2 \
PERF_LOGIN_P95_MS=400 \
PERF_LOGIN_STRICT=true \
npx playwright test tests/performance/login.perf.spec.ts
```

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PERF_LOGIN_ITERATIONS` | `20` | Número de medições consideradas |
| `PERF_LOGIN_WARMUP` | `2` | Requisições de aquecimento descartadas |
| `PERF_LOGIN_P95_MS` | `400` | SLA máximo do p95 em milissegundos |
| `PERF_LOGIN_STRICT` | `true` | Falha o teste quando o SLA é ultrapassado |

## Relatórios

Cada execução pode gerar:

- `playwright-report/`: relatório HTML do Playwright;
- `reports/status-report.json`: resultado estruturado por área;
- `reports/status-report.md`: resumo legível com sugestões;
- `test-logs/`: logs de passos, requisições e respostas;
- `coverage/`: cobertura gerada pelo C8.

Para abrir o relatório HTML:

```bash
npx playwright show-report
```

## Pipeline

O GitHub Actions instala as dependências com `npm ci`, valida os arquivos TypeScript com ESLint e executa a suíte de API. Relatórios e resultados são mantidos como artefatos por sete dias.

Para habilitar os testes de API na pipeline, cadastre `TEST_EMAIL` e `TEST_PASSWORD` em **Settings > Secrets and variables > Actions**. Sem esses secrets, o lint continua sendo executado e os testes externos são ignorados com um aviso.

Localmente, os mesmos checks podem ser reproduzidos com:

```bash
npm ci
npm run lint
npm test -- --reporter=list
```

## Autor

Desenvolvido por Erick Monteiro (`erickpxd`).
