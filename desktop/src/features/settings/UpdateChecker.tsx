import { openUrl } from "@tauri-apps/plugin-opener";
import { useUpdaterContext } from "./hooks/UpdaterProvider";
import { Button } from "@/shared/ui/button";
import {
  SettingsOptionGroup,
  SettingsOptionRow,
} from "./ui/SettingsOptionGroup";
import { SettingsSectionHeader } from "./ui/SettingsSectionHeader";
export function UpdateChecker() {
  const { status, checkForUpdate, installAndRelaunch } = useUpdaterContext();

  return (
    <section className="min-w-0" data-testid="settings-updates">
      <SettingsSectionHeader
        title="软件更新"
        description="保持 Buzz 为最新版本以体验最新功能与修复。"
      />

      <SettingsOptionGroup title="更新状态">
        {status.state === "idle" && (
          <SettingsOptionRow>
            <div className="min-w-0">
              <p
                className="text-sm font-normal text-muted-foreground/70"
                data-settings-subcopy
              >
                检查是否有新版本可用。
              </p>
            </div>
            <Button size="sm" onClick={checkForUpdate}>
              检查更新
            </Button>
          </SettingsOptionRow>
        )}

        {status.state === "checking" && (
          <SettingsOptionRow>
            <div className="min-w-0">
              <p
                className="text-sm font-normal text-muted-foreground/70"
                data-settings-subcopy
              >
                正在检查更新...
              </p>
            </div>
          </SettingsOptionRow>
        )}

        {status.state === "up-to-date" && (
          <SettingsOptionRow>
            <div className="min-w-0">
              <p
                className="text-sm font-normal text-muted-foreground/70"
                data-settings-subcopy
              >
                当前已是最新版本。
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={checkForUpdate}>
              重新检查
            </Button>
          </SettingsOptionRow>
        )}

        {status.state === "unavailable" && (
          <SettingsOptionRow>
            <div className="min-w-0">
              <p
                className="text-sm font-normal text-muted-foreground/70"
                data-settings-subcopy
              >
                当前构建版本不支持自动更新，请手动下载最新版本。
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={checkForUpdate}>
              重新检查
            </Button>
          </SettingsOptionRow>
        )}

        {status.state === "manual-required" && (
          <SettingsOptionRow>
            <div className="min-w-0">
              <p className="text-sm font-medium">
                发现新版本 — v{status.version}
              </p>
              <p
                className="text-sm font-normal text-muted-foreground/70"
                data-settings-subcopy
              >
                当前 Linux 安装包不支持应用内自动更新，请从 GitHub 下载新版本。{" "}
                <span>推荐使用 AppImage 版本以获得自动更新支持。</span>
              </p>
            </div>
            <Button size="sm" onClick={() => void openUrl(status.releaseUrl)}>
              下载更新
            </Button>
          </SettingsOptionRow>
        )}

        {status.state === "available" && (
          <SettingsOptionRow>
            <div className="min-w-0">
              <p
                className="text-sm font-normal text-muted-foreground/70"
                data-settings-subcopy
              >
                正在准备更新...
              </p>
            </div>
          </SettingsOptionRow>
        )}

        {status.state === "downloading" && (
          <SettingsOptionRow>
            <div className="min-w-0">
              <p
                className="text-sm font-normal text-muted-foreground/70"
                data-settings-subcopy
              >
                正在下载更新...
              </p>
            </div>
          </SettingsOptionRow>
        )}

        {status.state === "installing" && (
          <SettingsOptionRow>
            <div className="min-w-0">
              <p
                className="text-sm font-normal text-muted-foreground/70"
                data-settings-subcopy
              >
                正在安装更新...
              </p>
            </div>
          </SettingsOptionRow>
        )}

        {status.state === "ready" && (
          <SettingsOptionRow>
            <div className="min-w-0">
              <p
                className="text-sm font-normal text-muted-foreground/70"
                data-settings-subcopy
              >
                新版本已下载完毕。点击即可立即安装并重启应用。
              </p>
            </div>
            <Button size="sm" onClick={installAndRelaunch}>
              立即更新
            </Button>
          </SettingsOptionRow>
        )}

        {status.state === "error" && (
          <SettingsOptionRow>
            <div className="min-w-0">
              <p className="text-sm font-normal text-destructive">
                更新失败: {status.message}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={checkForUpdate}>
              重试
            </Button>
          </SettingsOptionRow>
        )}
      </SettingsOptionGroup>
    </section>
  );
}
