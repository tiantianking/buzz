import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import type {
  DesktopNotificationPermissionState,
  NotificationSettings,
} from "@/features/notifications/hooks";
import {
  COMING_SOON_SLOTS,
  RECOMMENDED_SOUND_BY_SLOT,
  SLOT_DESCRIPTIONS,
  SLOT_LABELS,
  SOUND_SLOTS,
  type SoundName,
  type SoundSlot,
} from "@/features/notifications/lib/sound";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import {
  SettingsOptionGroup,
  SettingsOptionGroupList,
  SettingsOptionRow,
} from "./SettingsOptionGroup";
import { SettingsSectionHeader } from "./SettingsSectionHeader";
import { SoundPicker } from "./SoundPicker";

export function NotificationSettingsCard({
  isUpdatingDesktopNotifications,
  notificationErrorMessage,
  notificationPermission,
  notificationSettings,
  onSetDesktopNotificationsEnabled,
  onSetAllSlotAlertsEnabled,
  onSetHomeBadgeEnabled,
  onSetSlotAlertsEnabled,
  onSetNotifyWhileViewing,
  onSetSoundForSlot,
}: {
  isUpdatingDesktopNotifications: boolean;
  notificationErrorMessage: string | null;
  notificationPermission: DesktopNotificationPermissionState;
  notificationSettings: NotificationSettings;
  onSetDesktopNotificationsEnabled: (enabled: boolean) => Promise<boolean>;
  onSetAllSlotAlertsEnabled: (enabled: boolean) => void;
  onSetHomeBadgeEnabled: (enabled: boolean) => void;
  onSetSlotAlertsEnabled: (slot: SoundSlot, enabled: boolean) => void;
  onSetNotifyWhileViewing: (enabled: boolean) => void;
  onSetSoundForSlot: (slot: SoundSlot, name: SoundName) => void;
}) {
  const permissionBlocked =
    notificationPermission === "denied" ||
    notificationPermission === "unsupported";
  // The parent Sound switch derives from its children: on when any live
  // event row is on, and toggling it bulk-sets every live row.
  const anyAlertsOn = SOUND_SLOTS.some(
    (slot) =>
      !COMING_SOON_SLOTS.has(slot) &&
      notificationSettings.slotAlertsEnabled[slot],
  );
  const [showComingSoon, setShowComingSoon] = useState(false);
  const visibleSlots = SOUND_SLOTS.filter(
    (slot) => showComingSoon || !COMING_SOON_SLOTS.has(slot),
  );

  return (
    <section className="min-w-0" data-testid="settings-notifications">
      <SettingsSectionHeader
        title="通知"
        description="桌面通知默认开启。可在下方详细配置接收的通知类型。"
      />

      <span className="sr-only" data-testid="notifications-desktop-state">
        {notificationPermission === "unsupported"
          ? "Unavailable"
          : notificationPermission === "denied"
            ? "Blocked"
            : notificationSettings.desktopEnabled
              ? "On"
              : "Off"}
      </span>

      <SettingsOptionGroupList>
        <SettingsOptionGroup title="桌面通知">
          <SettingsOptionRow>
            <div className="min-w-0">
              <label
                className="text-sm font-medium"
                htmlFor="desktop-alerts-switch"
              >
                {isUpdatingDesktopNotifications
                  ? "正在请求权限..."
                  : "桌面通知"}
              </label>
              <p
                className="text-sm font-normal text-muted-foreground/70"
                data-settings-subcopy
              >
                {notificationSettings.desktopEnabled
                  ? "已对下方勾选的事件类型启用原生桌面通知。"
                  : "向系统请求通知权限，以便在应用外接收提及或待办提醒。"}
              </p>
            </div>
            <Switch
              checked={notificationSettings.desktopEnabled}
              data-testid="notifications-desktop-toggle"
              disabled={isUpdatingDesktopNotifications}
              id="desktop-alerts-switch"
              onCheckedChange={(checked) => {
                void onSetDesktopNotificationsEnabled(checked);
              }}
            />
          </SettingsOptionRow>

          <SettingsOptionRow>
            <div className="min-w-0">
              <label
                className="text-sm font-medium"
                htmlFor="notify-while-viewing-switch"
              >
                在查看时仍提醒
              </label>
              <p
                className="text-sm font-normal text-muted-foreground/70"
                data-settings-subcopy
              >
                在当前打开的会话中收到私信时同样弹出通知。
              </p>
            </div>
            <Switch
              checked={
                notificationSettings.desktopEnabled &&
                notificationSettings.notifyWhileViewing
              }
              data-testid="notifications-notify-while-viewing-toggle"
              disabled={!notificationSettings.desktopEnabled}
              id="notify-while-viewing-switch"
              onCheckedChange={(checked) => {
                onSetNotifyWhileViewing(checked);
              }}
            />
          </SettingsOptionRow>
        </SettingsOptionGroup>

        {notificationSettings.desktopEnabled ? (
          <>
            <SettingsOptionGroup title="声音提示">
              <SettingsOptionRow>
                <div className="min-w-0">
                  <label
                    className="text-sm font-medium"
                    htmlFor="notification-sound-switch"
                  >
                    提示音
                  </label>
                  <p
                    className="text-sm font-normal text-muted-foreground/70"
                    data-settings-subcopy
                  >
                    为下列事件播放提示声音。
                  </p>
                </div>
                <Switch
                  checked={anyAlertsOn}
                  data-testid="notifications-sound-toggle"
                  id="notification-sound-switch"
                  onCheckedChange={(checked) => {
                    onSetAllSlotAlertsEnabled(checked);
                  }}
                />
              </SettingsOptionRow>
            </SettingsOptionGroup>

            {anyAlertsOn ? (
              <div className="space-y-4">
                <SettingsOptionGroup title="事件提示音">
                  {visibleSlots.map((slot) => {
                    const comingSoon = COMING_SOON_SLOTS.has(slot);
                    const alertsOn =
                      notificationSettings.slotAlertsEnabled[slot];
                    return (
                      <SettingsOptionRow
                        aria-disabled={comingSoon || undefined}
                        className={cn(
                          comingSoon && "cursor-not-allowed opacity-40",
                        )}
                        key={slot}
                      >
                        <div className="min-w-0">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            {SLOT_LABELS[slot]}
                            {comingSoon ? (
                              <span className="rounded-full bg-muted/70 px-2 py-0.5 text-2xs font-normal uppercase tracking-wide text-muted-foreground">
                                即将推出
                              </span>
                            ) : null}
                          </span>
                          <p
                            className="text-sm font-normal text-muted-foreground/70"
                            data-settings-subcopy
                          >
                            {SLOT_DESCRIPTIONS[slot]}
                          </p>
                        </div>
                        <span className="flex items-center gap-3">
                          <span
                            className={cn(
                              "transition-opacity duration-200",
                              !alertsOn && "pointer-events-none opacity-40",
                            )}
                          >
                            <SoundPicker
                              disabled={comingSoon || !alertsOn}
                              onChange={(next) => onSetSoundForSlot(slot, next)}
                              recommended={RECOMMENDED_SOUND_BY_SLOT[slot]}
                              value={notificationSettings.sounds[slot]}
                            />
                          </span>
                          <Switch
                            checked={alertsOn && !comingSoon}
                            data-testid={`notifications-alerts-enabled-${slot}`}
                            disabled={comingSoon}
                            id={`alerts-enabled-${slot}-switch`}
                            onCheckedChange={(checked) => {
                              onSetSlotAlertsEnabled(slot, checked);
                            }}
                          />
                        </span>
                      </SettingsOptionRow>
                    );
                  })}
                </SettingsOptionGroup>

                <div className="flex justify-center">
                  <Button
                    data-testid="notifications-toggle-coming-soon"
                    onClick={() => setShowComingSoon((current) => !current)}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    {showComingSoon ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        收起
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        查看全部
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        <SettingsOptionGroup title="未读角标">
          <SettingsOptionRow>
            <div className="min-w-0">
              <label
                className="text-sm font-medium"
                htmlFor="home-badge-switch"
              >
                主页角标
              </label>
              <p
                className="text-sm font-normal text-muted-foreground/70"
                data-settings-subcopy
              >
                在侧边栏主页图标上显示提及与待处理事项的红点未读角标。
              </p>
            </div>
            <Switch
              checked={notificationSettings.homeBadgeEnabled}
              data-testid="notifications-home-badge-toggle"
              id="home-badge-switch"
              onCheckedChange={(checked) => {
                onSetHomeBadgeEnabled(checked);
              }}
            />
          </SettingsOptionRow>
        </SettingsOptionGroup>
      </SettingsOptionGroupList>

      {permissionBlocked && (
        <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {notificationPermission === "unsupported"
            ? "当前运行环境不支持桌面通知。"
            : "桌面通知已被系统禁止。请在系统偏好或设置中允许通知权限。"}
        </p>
      )}

      {notificationErrorMessage ? (
        <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {notificationErrorMessage}
        </p>
      ) : null}
    </section>
  );
}
