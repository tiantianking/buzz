import { Check, ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { toast } from "sonner";

import { mintInvite } from "@/shared/api/invites";
import { writeTextToClipboard } from "@/shared/lib/clipboard";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Input } from "@/shared/ui/input";
import { Spinner } from "@/shared/ui/spinner";

const TTL_OPTIONS: { label: string; value: number }[] = [
  { label: "1 天", value: 24 * 60 * 60 },
  { label: "3 天", value: 3 * 24 * 60 * 60 },
  { label: "7 天", value: 7 * 24 * 60 * 60 },
  { label: "30 天", value: 30 * 24 * 60 * 60 },
];

const MAX_USE_OPTIONS: { label: string; value: number | null }[] = [
  { label: "无限制", value: null },
  { label: "1 次", value: 1 },
  { label: "3 次", value: 3 },
  { label: "5 次", value: 5 },
  { label: "10 次", value: 10 },
  { label: "25 次", value: 25 },
];

export const DEFAULT_INVITE_TTL_SECS = TTL_OPTIONS[1].value;

type CopyStatus = "idle" | "copying" | "copied";
type GenerationStatus = "idle" | "generating" | "failed";

/**
 * Share-with-link footer for the community invite dialog.
 *
 * A database-backed invite link is minted when this section opens and whenever
 * its settings change. Invites may be unlimited or capped to a caller-selected
 * number of successful joins.
 */
export function InviteLinkSection({
  onTtlSecsChange,
  ttlSecs,
}: {
  onTtlSecsChange: (ttlSecs: number) => void;
  ttlSecs: number;
}) {
  const [copyStatus, setCopyStatus] = React.useState<CopyStatus>("idle");
  const [generationStatus, setGenerationStatus] =
    React.useState<GenerationStatus>("generating");
  const [inviteUrl, setInviteUrl] = React.useState("");
  const [maxUses, setMaxUses] = React.useState<number | null>(null);
  const generationRequestId = React.useRef(0);
  // React StrictMode replays effects in development. Keep one in-flight mint
  // per setting set so the replay observes the original request instead of
  // creating a second durable invite.
  const inviteRequests = React.useRef(
    new Map<string, ReturnType<typeof mintInvite>>(),
  );
  const shouldReduceMotion = useReducedMotion();
  const ttlLabel =
    TTL_OPTIONS.find((option) => option.value === ttlSecs)?.label ?? "3 天";
  const maxUsesLabel =
    MAX_USE_OPTIONS.find((option) => option.value === maxUses)?.label ??
    "无限制";
  const isGenerating = generationStatus === "generating";
  const hasGenerationFailed = generationStatus === "failed";
  const inviteSettingsKey = `${ttlSecs}:${maxUses ?? "no-limit"}`;
  const isWorking = isGenerating || copyStatus === "copying";
  const copyLabel = hasGenerationFailed
    ? "重试"
    : copyStatus === "copied"
      ? "已复制"
      : "复制链接";
  const copyButtonWidth = isWorking
    ? "6.25rem"
    : copyStatus === "copied"
      ? "5.25rem"
      : "5rem";
  const copyButtonTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.12, ease: [0.77, 0, 0.175, 1] as const };

  React.useEffect(() => {
    if (copyStatus !== "copied") return;
    const resetTimer = window.setTimeout(() => setCopyStatus("idle"), 2000);
    return () => window.clearTimeout(resetTimer);
  }, [copyStatus]);

  const generateInviteLink = React.useCallback(async () => {
    const requestId = generationRequestId.current + 1;
    generationRequestId.current = requestId;
    setGenerationStatus("generating");
    setInviteUrl("");
    setCopyStatus("idle");
    const existingRequest = inviteRequests.current.get(inviteSettingsKey);
    const inviteRequest = existingRequest ?? mintInvite({ ttlSecs, maxUses });
    if (!existingRequest) {
      inviteRequests.current.set(inviteSettingsKey, inviteRequest);
    }

    try {
      const invite = await inviteRequest;
      if (inviteRequests.current.get(inviteSettingsKey) === inviteRequest) {
        inviteRequests.current.delete(inviteSettingsKey);
      }
      if (generationRequestId.current === requestId) {
        setInviteUrl(invite.url);
        setGenerationStatus("idle");
      }
    } catch {
      if (inviteRequests.current.get(inviteSettingsKey) === inviteRequest) {
        inviteRequests.current.delete(inviteSettingsKey);
      }
      if (generationRequestId.current === requestId) {
        setGenerationStatus("failed");
        toast.error("无法创建邀请链接。");
      }
    }
  }, [inviteSettingsKey, maxUses, ttlSecs]);

  React.useEffect(() => {
    void generateInviteLink();
    return () => {
      generationRequestId.current += 1;
    };
  }, [generateInviteLink]);

  function retryInviteGeneration() {
    if (!hasGenerationFailed) return;
    void generateInviteLink();
  }

  async function handleCopy() {
    if (!inviteUrl || isGenerating || copyStatus === "copying") return;
    setCopyStatus("copying");
    try {
      await writeTextToClipboard(inviteUrl);
      setCopyStatus("copied");
      toast.success("邀请链接已复制");
    } catch {
      setCopyStatus("idle");
      toast.error("无法复制邀请链接。请重试。");
    }
  }

  return (
    <section data-testid="community-invite-link-section">
      <div className="relative">
        <Input
          aria-label="社区邀请链接"
          className="h-11 pr-28 text-transparent caret-transparent selection:bg-transparent"
          data-testid="invite-link-url"
          disabled={isGenerating}
          placeholder={
            hasGenerationFailed
              ? "无法创建邀请链接"
              : "正在创建邀请链接…"
          }
          readOnly
          value={inviteUrl}
        />
        {inviteUrl ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3 right-28 flex items-center truncate text-sm text-muted-foreground"
            data-testid="invite-link-preview"
          >
            {inviteUrl}
          </span>
        ) : null}
        <motion.div
          className="absolute right-1 top-1"
          animate={{ width: copyButtonWidth }}
          initial={false}
          transition={copyButtonTransition}
        >
          <Button
            className="h-9 w-full px-3"
            data-copy-status={copyStatus}
            data-testid="copy-invite-link"
            disabled={
              !hasGenerationFailed &&
              (isGenerating || !inviteUrl || copyStatus === "copying")
            }
            onClick={() =>
              hasGenerationFailed ? retryInviteGeneration() : void handleCopy()
            }
            size="sm"
            type="button"
          >
            {isWorking ? (
              <Spinner aria-hidden="true" className="h-4 w-4 border-2" />
            ) : copyStatus === "copied" ? (
              <Check aria-hidden="true" className="h-4 w-4" />
            ) : null}
            {copyLabel}
          </Button>
        </motion.div>
      </div>

      <div className="mt-3 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">有效期</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="选择邀请有效期"
                className="h-8 shrink-0 gap-1.5 px-2 text-sm text-muted-foreground"
                data-testid="invite-link-ttl-trigger"
                disabled={isGenerating || copyStatus === "copying"}
                size="sm"
                type="button"
                variant="ghost"
              >
                {ttlLabel}
                <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuRadioGroup
                onValueChange={(value) => onTtlSecsChange(Number(value))}
                value={String(ttlSecs)}
              >
                {TTL_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem
                    data-testid={`invite-link-ttl-${option.value}`}
                    key={option.value}
                    value={String(option.value)}
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">使用次数限制</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="选择最大使用次数"
                className="h-8 shrink-0 gap-1.5 px-2 text-sm text-muted-foreground"
                data-testid="invite-link-max-uses-trigger"
                disabled={isGenerating || copyStatus === "copying"}
                size="sm"
                type="button"
                variant="ghost"
              >
                {maxUsesLabel}
                <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuRadioGroup
                onValueChange={(value) =>
                  setMaxUses(value === "no-limit" ? null : Number(value))
                }
                value={String(maxUses ?? "no-limit")}
              >
                {MAX_USE_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem
                    data-testid={`invite-link-max-uses-${option.value ?? "no-limit"}`}
                    key={option.value ?? "no-limit"}
                    value={String(option.value ?? "no-limit")}
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </section>
  );
}
