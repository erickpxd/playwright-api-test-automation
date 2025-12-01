import fs from "fs";
import path from "path";
import type {
  FullConfig,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

type ExecutionType = "Smoke" | "Regression" | "Unclassified";

type TestRecord = {
  title: string;
  outcome: string;
  type: ExecutionType;
  area: string;
  durationMs: number;
  file: string;
};

type TeamSummary = {
  team: string;
  area: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  durationMs: number;
  tests: TestRecord[];
};

const TEAM_BY_AREA: Record<string, string> = {
  Auth: "Identity & Access",
  Notes: "Notes",
  "Profile Settings": "User Profile",
};

const REPORTS_DIR = path.join(process.cwd(), "reports");

function ensureReportsDir(): void {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

function formatMs(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`;
}

function normalizeType(raw: string | undefined): ExecutionType {
  const value = raw?.trim().toLowerCase();
  if (value === "smoke") {
    return "Smoke";
  }
  if (value === "regression") {
    return "Regression";
  }
  return "Unclassified";
}

export default class StatusReporter implements Reporter {
  private summaries: Record<string, TeamSummary> = {};
  private seenTests = new Set<string>();

  onBegin(config: FullConfig, suite: Suite): void {
    ensureReportsDir();
    console.log(
      `📊 StatusReporter: iniciando suite com ${suite.allTests().length} testes em ${config.projects.length} projeto(s).`
    );
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (this.seenTests.has(test.id)) {
      return;
    }

    this.seenTests.add(test.id);

    const titlePath = test.titlePath().filter(Boolean);
    const area = this.extractArea(titlePath);
    const type = this.extractType(titlePath);
    const team = TEAM_BY_AREA[area] ?? "Core";
    const outcome = test.outcome();

    const summary = this.summaries[area] ?? {
      team,
      area,
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      durationMs: 0,
      tests: [],
    };

    summary.total += 1;
    summary.durationMs += result.duration;

    switch (outcome) {
      case "expected":
        summary.passed += 1;
        break;
      case "flaky":
        summary.flaky += 1;
        break;
      case "skipped":
        summary.skipped += 1;
        break;
      default:
        summary.failed += 1;
        break;
    }

    summary.tests.push({
      title: test.title,
      outcome,
      type,
      area,
      durationMs: result.duration,
      file: test.location.file,
    });

    this.summaries[area] = summary;
  }

  onEnd(): void {
    const payload = this.buildPayload();
    const markdown = this.buildMarkdown(payload);

    fs.writeFileSync(
      path.join(REPORTS_DIR, "status-report.json"),
      JSON.stringify(payload, null, 2),
      "utf-8"
    );
    fs.writeFileSync(
      path.join(REPORTS_DIR, "status-report.md"),
      markdown,
      "utf-8"
    );

    console.log(`📁 StatusReporter: relatório salvo em ${REPORTS_DIR}`);
  }

  private extractArea(titlePath: string[]): string {
    const areaBlock =
      titlePath.find((part) => part.includes("|")) ?? titlePath[0] ?? "General";
    return areaBlock.split("|")[0].trim();
  }

  private extractType(titlePath: string[]): ExecutionType {
    const typeBlock = titlePath.find((part) =>
      ["smoke", "regression"].includes(part.toLowerCase())
    );
    return normalizeType(typeBlock);
  }

  private buildPayload(): {
    generatedAt: string;
    overall: TeamSummary;
    teams: TeamSummary[];
    suggestions: Record<string, string[]>;
  } {
    const teams = Object.values(this.summaries);
    const overall: TeamSummary = teams.reduce(
      (acc, current) => {
        acc.total += current.total;
        acc.passed += current.passed;
        acc.failed += current.failed;
        acc.skipped += current.skipped;
        acc.flaky += current.flaky;
        acc.durationMs += current.durationMs;
        acc.tests.push(...current.tests);
        return acc;
      },
      {
        team: "All",
        area: "All",
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        flaky: 0,
        durationMs: 0,
        tests: [],
      }
    );

    const suggestions: Record<string, string[]> = {};

    teams.forEach((team) => {
      suggestions[team.team] = this.buildSuggestions(team);
    });

    return {
      generatedAt: new Date().toISOString(),
      overall,
      teams,
      suggestions,
    };
  }

  private buildSuggestions(team: TeamSummary): string[] {
    const messages: string[] = [];
    if (team.failed > 0) {
      messages.push(
        `Resolver ${team.failed} teste(s) quebrado(s) antes do próximo deploy. Priorize os cenários ${this.countType(team, "Smoke")} de fumaça.`
      );
    }
    if (team.flaky > 0) {
      messages.push(
        `Há ${team.flaky} teste(s) flaky. Estabilize dados e isolamentos para evitar falsos positivos.`
      );
    }
    if (team.skipped > 0) {
      messages.push(
        `${team.skipped} teste(s) foram ignorados. Reative ou documente a justificativa para manter cobertura.`
      );
    }
    const avgDuration = team.total ? team.durationMs / team.total : 0;
    if (avgDuration > 1500) {
      messages.push(
        `Tempo médio de ${formatMs(avgDuration)}. Considere paralelizar dados seeds ou reduzir dependências externas.`
      );
    }
    if (messages.length === 0) {
      messages.push("Nenhuma ação urgente. Continue monitorando a saúde do pipeline.");
    }
    return messages;
  }

  private countType(team: TeamSummary, type: ExecutionType): string {
    const count = team.tests.filter((test) => test.type === type).length;
    return `${type.toLowerCase()} (${count})`;
  }

  private buildMarkdown(payload: {
    generatedAt: string;
    overall: TeamSummary;
    teams: TeamSummary[];
    suggestions: Record<string, string[]>;
  }): string {
    const header = [
      "# Test Execution Status",
      `Gerado em: ${payload.generatedAt}`,
      "",
      "## Visão geral",
      `- Total: ${payload.overall.total}`,
      `- Passaram: ${payload.overall.passed}`,
      `- Falharam: ${payload.overall.failed}`,
      `- Ignorados: ${payload.overall.skipped}`,
      `- Flaky: ${payload.overall.flaky}`,
      `- Duração acumulada: ${formatMs(payload.overall.durationMs)}`,
      "",
      "## Status por equipe",
      "| Equipe | Área | Total | Passaram | Falharam | Ignorados | Flaky | Duração |",
      "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ];

    const rows = payload.teams.map((team) =>
      `| ${team.team} | ${team.area} | ${team.total} | ${team.passed} | ${team.failed} | ${team.skipped} | ${team.flaky} | ${formatMs(team.durationMs)} |`
    );

    const suggestions = Object.entries(payload.suggestions).flatMap(
      ([team, messages]) => [
        `### Sugestões para ${team}`,
        ...messages.map((message) => `- ${message}`),
        "",
      ]
    );

    return [...header, ...rows, "", ...suggestions].join("\n");
  }
}
