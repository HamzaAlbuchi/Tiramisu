import { useState } from "react";
import { testCustomLlmConnection } from "@/services/api";

const STYLES = ["balanced", "formal", "casual", "technical"] as const;

export type DebateProviderMode = "gemini" | "custom";

export interface DebateFormValues {
  topic: string;
  rounds: number;
  style: string;
  provider: DebateProviderMode;
  customEndpointUrl: string;
  customApiKey: string;
  customModelId: string;
  customModelLabel: string;
}

interface Props {
  loading: boolean;
  onSubmit: (v: DebateFormValues) => void;
  variant?: "default" | "compact";
  className?: string;
  headerDense?: boolean;
  /** Explorer (explore) space — BYO model is read-only with tooltip. */
  byoLocked?: boolean;
}

const field =
  "w-full border border-arb-border bg-arb-bg px-3 py-2 font-mono text-xs text-arb-text outline-none transition focus:border-arb-muted focus:ring-1 focus:ring-arb-border";
const labelMono = "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-arb-muted";

export function DebateForm({ loading, onSubmit, variant = "default", className, byoLocked = false }: Props) {
  const [topic, setTopic] = useState("Should cities prioritize public transit over cars?");
  const [rounds, setRounds] = useState(3);
  const [style, setStyle] = useState<string>("balanced");
  const [provider, setProvider] = useState<DebateProviderMode>("gemini");
  const [customEndpointUrl, setCustomEndpointUrl] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");
  const [customModelId, setCustomModelId] = useState("");
  const [customModelLabel, setCustomModelLabel] = useState("");
  const [testState, setTestState] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [testMessage, setTestMessage] = useState("");

  const compact = variant === "compact";
  const allowCustom = !byoLocked;
  const effectiveProvider = byoLocked ? "gemini" : provider;

  const runTest = async () => {
    if (!customEndpointUrl.trim()) {
      setTestState("fail");
      setTestMessage("Enter an endpoint URL first.");
      return;
    }
    setTestState("testing");
    setTestMessage("");
    try {
      const r = await testCustomLlmConnection({
        endpointUrl: customEndpointUrl,
        apiKey: customApiKey,
        modelId: customModelId,
      });
      setTestState(r.ok ? "ok" : "fail");
      setTestMessage(r.message || (r.ok ? "Connected" : "Failed"));
    } catch (e) {
      setTestState("fail");
      setTestMessage(e instanceof Error ? e.message : "Request failed");
    }
  };

  return (
    <form
      className={["space-y-6", className].filter(Boolean).join(" ")}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          topic,
          rounds,
          style,
          provider: effectiveProvider,
          customEndpointUrl,
          customApiKey,
          customModelId,
          customModelLabel,
        });
      }}
    >
      <div>
        <label className={labelMono} htmlFor="topic">
          Motion
        </label>
        <textarea
          id="topic"
          rows={compact ? 2 : 4}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={`${field} min-h-[5.5rem] resize-y font-serif text-lg italic leading-snug placeholder:text-arb-muted/60 sm:text-xl`}
          placeholder="State the proposition under review…"
          aria-label="Debate topic"
        />
      </div>

      <div>
        <p className={labelMono}>Model provider</p>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-arb-text">
              <input
                type="radio"
                name="provider"
                checked={effectiveProvider === "gemini"}
                onChange={() => setProvider("gemini")}
                className="border-arb-border text-arb-accent focus:ring-arb-accent"
              />
              Default (Gemini)
            </label>
            <span
              className={allowCustom ? "inline-flex items-center gap-2" : "inline-flex cursor-not-allowed items-center gap-2 opacity-55"}
              title={
                allowCustom
                  ? undefined
                  : "Bring-your-own endpoints are available on Developer and Enterprise. Switch space in the header or upgrade via Plans."
              }
            >
              <label className="flex items-center gap-2 font-mono text-xs text-arb-text">
                <input
                  type="radio"
                  name="provider"
                  checked={effectiveProvider === "custom"}
                  onChange={() => allowCustom && setProvider("custom")}
                  disabled={!allowCustom}
                  className="border-arb-border text-arb-accent focus:ring-arb-accent disabled:cursor-not-allowed"
                />
                BYO model
              </label>
              {!allowCustom ? (
                <span className="rounded border border-arb-border bg-arb-bg px-1.5 py-px font-mono text-[8px] uppercase tracking-wider text-arb-muted">
                  Locked
                </span>
              ) : null}
            </span>
          </div>

          {effectiveProvider === "gemini" ? (
            <p className="font-mono text-[0.65rem] leading-relaxed text-arb-muted">
              Debate runs on hosted Gemini with Pro / Against personas (same pipeline as before).
            </p>
          ) : (
            <div className="space-y-3 border border-arb-border border-dashed bg-arb-bg/30 p-4">
              <div>
                <label className={labelMono} htmlFor="custom-endpoint">
                  Endpoint URL
                </label>
                <input
                  id="custom-endpoint"
                  type="url"
                  placeholder="https://api.openai.com or …/v1/chat/completions"
                  value={customEndpointUrl}
                  onChange={(e) => {
                    setCustomEndpointUrl(e.target.value);
                    setTestState("idle");
                  }}
                  className={field}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelMono} htmlFor="custom-key">
                    API key (optional)
                  </label>
                  <input
                    id="custom-key"
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className={field}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className={labelMono} htmlFor="custom-model-id">
                    Model id (optional)
                  </label>
                  <input
                    id="custom-model-id"
                    type="text"
                    placeholder="e.g. gpt-4o-mini"
                    value={customModelId}
                    onChange={(e) => setCustomModelId(e.target.value)}
                    className={field}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div>
                <label className={labelMono} htmlFor="custom-label">
                  Display name (optional)
                </label>
                <input
                  id="custom-label"
                  type="text"
                  placeholder="Shown in transcript (defaults to host)"
                  value={customModelLabel}
                  onChange={(e) => setCustomModelLabel(e.target.value)}
                  className={field}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void runTest()}
                  disabled={testState === "testing"}
                  className="border border-arb-pro/50 bg-arb-pro/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-arb-pro transition enabled:hover:border-arb-pro enabled:hover:bg-arb-pro/20 disabled:cursor-wait disabled:opacity-50"
                >
                  {testState === "testing" ? "Testing…" : "Test connection"}
                </button>
                {testState !== "idle" && testState !== "testing" ? (
                  <span
                    role="status"
                    className={`font-mono text-[10px] uppercase tracking-wider ${
                      testState === "ok" ? "text-emerald-400" : "text-red-300"
                    }`}
                  >
                    {testState === "ok" ? "● Connected" : "● Failed"}
                    {testMessage ? ` — ${testMessage}` : ""}
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelMono} htmlFor="rounds">
            Rounds
          </label>
          <input
            id="rounds"
            type="number"
            min={1}
            max={12}
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
            className={field}
          />
        </div>
        <div>
          <label className={labelMono} htmlFor="style">
            Style
          </label>
          <select id="style" value={style} onChange={(e) => setStyle(e.target.value)} className={field}>
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelMono} htmlFor="judge-note">
            Judge
          </label>
          <p id="judge-note" className={`${field} cursor-default text-arb-muted`}>
            Internal arbitre (Gemini)
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={
          loading ||
          !topic.trim() ||
          (effectiveProvider === "custom" && !customEndpointUrl.trim())
        }
        className="group relative w-full border border-arb-accent/80 bg-arb-accent py-3.5 font-mono text-sm font-medium uppercase tracking-[0.16em] text-arb-bg transition enabled:hover:-translate-y-px enabled:hover:shadow-[0_6px_24px_-6px_rgba(232,255,71,0.45)] disabled:cursor-not-allowed disabled:opacity-35"
      >
        <span className={loading ? "animate-eval-pulse inline-block" : ""}>
          {loading ? "EVALUATING…" : "⚡ RUN DEBATE"}
        </span>
      </button>
    </form>
  );
}
