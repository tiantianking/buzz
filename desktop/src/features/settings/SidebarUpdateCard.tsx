import * as React from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { CircleArrowUp, ExternalLink } from "lucide-react";

import { useUpdaterContext } from "./hooks/UpdaterProvider";
import { shouldShowSidebarUpdateCard } from "./sidebarUpdateCardVisibility";
import { SidebarCompactActionCard } from "@/shared/ui/sidebar-action-card";
import { Spinner } from "@/shared/ui/spinner";

type SidebarUpdateCardProps = {
  onDismiss: () => void;
};

type SidebarUpdateCompactCardProps = SidebarUpdateCardProps & {
  actionTestId?: string;
  testId?: string;
};

export function SidebarUpdateCompactCard({
  actionTestId,
  onDismiss,
  testId = "sidebar-update-card-compact",
}: SidebarUpdateCompactCardProps) {
  const { installAndRelaunch, status } = useUpdaterContext();
  const [isUpdatePending, setIsUpdatePending] = React.useState(false);
  const updatePendingRef = React.useRef(false);
  const updateFrameRef = React.useRef<number | null>(null);
  const updateTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (updateFrameRef.current !== null) {
        window.cancelAnimationFrame(updateFrameRef.current);
      }
      if (updateTimeoutRef.current !== null) {
        window.clearTimeout(updateTimeoutRef.current);
      }
      updatePendingRef.current = false;
    };
  }, []);

  const handleUpdate = React.useCallback(() => {
    if (updatePendingRef.current) {
      return;
    }

    updatePendingRef.current = true;
    setIsUpdatePending(true);
    updateFrameRef.current = window.requestAnimationFrame(() => {
      updateFrameRef.current = null;
      updateTimeoutRef.current = window.setTimeout(() => {
        updateTimeoutRef.current = null;
        void installAndRelaunch()
          .catch((error) => {
            console.error("[SidebarUpdateCard] update failed:", error);
          })
          .finally(() => {
            updatePendingRef.current = false;
            setIsUpdatePending(false);
          });
      }, 0);
    });
  }, [installAndRelaunch]);

  const pending = isUpdatePending || status.state === "installing";

  return (
    <SidebarCompactActionCard
      actionAriaLabel="立即更新"
      actionDisabled={pending}
      actionTestId={actionTestId}
      description={pending ? "正在更新" : "点击立即更新"}
      dismissLabel="忽略更新提醒"
      icon={
        pending ? (
          <Spinner aria-hidden="true" className="h-5 w-5 border-2" />
        ) : (
          <CircleArrowUp aria-hidden="true" className="h-5 w-5" />
        )
      }
      iconKey={pending ? "pending" : "idle"}
      onAction={handleUpdate}
      onDismiss={onDismiss}
      testId={testId}
      title="更新已就绪！"
    />
  );
}

export function SidebarUpdateCard({ onDismiss }: SidebarUpdateCardProps) {
  const { status } = useUpdaterContext();

  if (!shouldShowSidebarUpdateCard(status)) {
    return null;
  }

  if (status.state === "manual-required") {
    return (
      <SidebarCompactActionCard
        actionAriaLabel="从 GitHub 下载更新"
        actionTestId="sidebar-update-download-github"
        description={`发现 v${status.version} 新版本 — 请从 GitHub 下载更新。`}
        dismissLabel="忽略更新提醒"
        icon={<ExternalLink aria-hidden="true" className="h-5 w-5" />}
        iconKey="manual"
        onAction={() => void openUrl(status.releaseUrl)}
        onDismiss={onDismiss}
        testId="sidebar-update-card-manual"
        title="发现新版本"
      />
    );
  }

  return (
    <SidebarUpdateCompactCard
      actionTestId="sidebar-update-now"
      onDismiss={onDismiss}
      testId="sidebar-update-card"
    />
  );
}
