import type { ManagedAgentBackend } from "@/shared/api/types";

import { summarizeRunOn } from "./runOnSummary";

/**
 * Read-only "Run on" summary for the edit-agent dialog.
 *
 * Read-only on purpose: `UpdateManagedAgentRequest` has no backend field —
 * where an agent runs is fixed at creation (a provider-backed agent's
 * deployment holds its private key; there is no migrate operation). This
 * section shows the *saved* provider config from the record, without probing
 * the provider binary: an edit dialog must not do executable work as a side
 * effect, and a live probe would show today's schema defaults instead of
 * what this agent actually deployed with.
 *
 * Named "Run on" (matching the create flow) rather than "Provider" because
 * this dialog already uses "Provider" for the ACP harness selector.
 */
export function RunOnSummarySection({
  backend,
}: {
  backend: ManagedAgentBackend;
}) {
  const summary = summarizeRunOn(backend);

  return (
    <div className="space-y-1.5" data-testid="edit-agent-run-on">
      <span className="text-sm font-medium text-foreground">运行环境</span>
      {summary.location === "local" ? (
        <p
          className="text-sm text-muted-foreground"
          data-testid="edit-agent-run-on-location"
        >
          本机计算机
        </p>
      ) : (
        <div className="space-y-2 rounded-2xl border border-border bg-muted/30 px-4 py-3">
          <p
            className="text-sm font-medium"
            data-testid="edit-agent-run-on-location"
          >
            {summary.providerId}
          </p>
          {summary.rows.length > 0 ? (
            <dl className="space-y-1">
              {summary.rows.map((row) => (
                <div
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5"
                  data-testid={`edit-agent-run-on-${row.key}`}
                  key={row.key}
                >
                  <dt className="text-xs text-muted-foreground">{row.label}</dt>
                  <dd className="min-w-0 break-all font-mono text-xs text-foreground">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-xs text-muted-foreground">
              暂无自定义设置 — 使用提供方默认值。
            </p>
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        这是创建智能体时保存的运行环境。智能体的宿主环境在创建后不可更改。
      </p>
    </div>
  );
}
