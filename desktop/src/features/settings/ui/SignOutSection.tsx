import * as React from "react";
import { toast } from "sonner";

import { NsecMaskedDisplay } from "@/features/onboarding/ui/NsecMaskedDisplay";
import { getNsec, signOut } from "@/shared/api/tauriIdentity";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Spinner } from "@/shared/ui/spinner";
import { SettingsOptionGroup, SettingsOptionRow } from "./SettingsOptionGroup";

/**
 * The exact phrase the user must type before the destructive sign-out button
 * unlocks. Kept lowercase; the comparison trims and lowercases input so a
 * stray capital or trailing space does not trip people up — the friction is
 * deliberate typing, not case sensitivity.
 */
export const SIGNOUT_CONFIRM_PHRASE = "清空我的所有数据";
export const SIGNOUT_CONFIRM_PHRASE_EN = "wipe all my data";

/**
 * Sign-out card + destructive confirmation flow.
 *
 * Signing out wipes the identity key and all local data, so the confirm
 * dialog gates the delete button behind two explicit steps:
 *
 * 1. Confirm recovery — Settings offers a tested password-protected backup;
 *    the dialog also shows the raw nsec as a last-chance fallback, and the
 *    user checks a box confirming they can restore their identity.
 * 2. Typed confirmation — the user must type the exact phrase
 *    "wipe all my data" or "清空我的所有数据".
 *
 * Only when both gates pass does "Delete my data" become clickable.
 */
export function SignOutSection() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  // Backup gate.
  const [nsec, setNsec] = React.useState<string | null>(null);
  const [nsecError, setNsecError] = React.useState<string | null>(null);
  const [isNsecLoading, setIsNsecLoading] = React.useState(false);
  const [hasConfirmedBackup, setHasConfirmedBackup] = React.useState(false);
  // Guards against a late-resolving getNsec() repopulating state after the
  // dialog closes.
  const fetchCancelledRef = React.useRef(false);

  // Typed-confirmation gate.
  const [confirmText, setConfirmText] = React.useState("");
  const trimmed = confirmText.trim().toLowerCase();
  const isPhraseConfirmed =
    trimmed === SIGNOUT_CONFIRM_PHRASE ||
    trimmed === SIGNOUT_CONFIRM_PHRASE_EN;

  const canDelete = hasConfirmedBackup && isPhraseConfirmed && !isPending;

  function resetDialogState() {
    fetchCancelledRef.current = true;
    setNsec(null);
    setNsecError(null);
    setIsNsecLoading(false);
    setHasConfirmedBackup(false);
    setConfirmText("");
  }

  React.useEffect(() => {
    return () => {
      fetchCancelledRef.current = true;
      setNsec(null);
    };
  }, []);

  async function openDialog() {
    setIsOpen(true);
    fetchCancelledRef.current = false;
    setIsNsecLoading(true);
    setNsecError(null);
    try {
      const value = await getNsec();
      if (!fetchCancelledRef.current) setNsec(value);
    } catch (err) {
      if (!fetchCancelledRef.current)
        setNsecError(
          err instanceof Error
            ? err.message
            : "无法获取私钥。",
        );
    } finally {
      if (!fetchCancelledRef.current) setIsNsecLoading(false);
    }
  }

  function handleSignOut() {
    setIsPending(true);
    // Keep the pending state if signOut() resolves before restart.
    signOut()
      .then(() => {
        // Clear web storage for this origin on the success path only.
        window.localStorage.clear();
        window.sessionStorage.clear();
      })
      .catch((err: unknown) => {
        setIsPending(false);
        setIsOpen(false);
        resetDialogState();
        toast.error(err instanceof Error ? err.message : "退出登录失败。");
      });
  }

  return (
    <div className="mt-12 pb-6" data-testid="settings-signout">
      <SettingsOptionGroup title="退出登录">
        <SettingsOptionRow>
          <div className="min-w-0">
            <p
              className="text-sm font-normal text-muted-foreground/70"
              data-settings-subcopy
            >
              从当前设备中移除你的身份密钥及所有本地应用数据。在退出之前，请务必在上方创建并测试受密码保护的密钥备份——此操作无法撤销。
            </p>
          </div>
          <Button
            data-testid="signout-open-dialog"
            disabled={isPending}
            onClick={() => void openDialog()}
            type="button"
            variant="destructive"
          >
            {isPending ? (
              <Spinner aria-label="正在退出登录" className="h-4 w-4 border-2" />
            ) : null}
            {isPending ? "正在退出登录…" : "删除我的数据"}
          </Button>
        </SettingsOptionRow>
      </SettingsOptionGroup>
      <AlertDialog
        onOpenChange={(open) => {
          if (!open && !isPending) {
            setIsOpen(false);
            resetDialogState();
          }
        }}
        open={isOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>退出登录并清除所有数据？</AlertDialogTitle>
            <AlertDialogDescription>
              这将从此设备中彻底删除你的身份密钥、所有智能体设置及缓存数据，然后重启 Buzz 进入初始设置引导流程。此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <p className="text-sm font-medium">
              1. 确认你可以恢复身份
            </p>
            {isNsecLoading ? (
              <p className="text-sm text-muted-foreground">正在加载…</p>
            ) : nsecError ? (
              <p
                className="text-sm text-destructive"
                data-testid="signout-nsec-error"
              >
                {nsecError}
              </p>
            ) : nsec ? (
              <NsecMaskedDisplay nsec={nsec} />
            ) : null}
            <label
              className="flex cursor-pointer items-start gap-2.5 text-sm has-[button:disabled]:cursor-not-allowed has-[button:disabled]:opacity-60"
              data-testid="signout-backup-confirm-label"
              htmlFor="signout-backup-confirm"
            >
              <Checkbox
                checked={hasConfirmedBackup}
                className="mt-0.5"
                data-testid="signout-backup-confirm"
                disabled={isPending}
                id="signout-backup-confirm"
                onCheckedChange={(checked) =>
                  setHasConfirmedBackup(checked === true)
                }
              />
              <span>
                我已经测试过密钥备份，或已将此私钥妥善保存在安全的地方。
              </span>
            </label>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="signout-confirm-phrase"
            >
              2. 请输入{" "}
              <span className="font-semibold">"{SIGNOUT_CONFIRM_PHRASE}"</span>{" "}
              以确认
            </label>
            <Input
              autoComplete="off"
              data-testid="signout-confirm-phrase"
              disabled={isPending}
              id="signout-confirm-phrase"
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder={SIGNOUT_CONFIRM_PHRASE}
              spellCheck={false}
              value={confirmText}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>取消</AlertDialogCancel>
            {/* A plain Button, not AlertDialogAction: Radix's Action closes
                the dialog on click, which would drop the pending state while
                the wipe + restart is still in flight. */}
            <Button
              data-testid="signout-confirm"
              disabled={!canDelete}
              onClick={handleSignOut}
              type="button"
              variant="destructive"
            >
              {isPending ? (
                <Spinner
                  aria-label="正在退出登录"
                  className="h-4 w-4 border-2"
                />
              ) : null}
              {isPending ? "正在退出登录…" : "删除我的数据"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
