import { ChevronDown, ClockFading, Hash } from "lucide-react";
import * as React from "react";

import type { ChannelLifecycle } from "@/features/channels/lib/channelLifecycle";
import { ProjectChannelIcon } from "@/features/projects/ui/ProjectChannelIcon";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

const LIFECYCLE_LABEL: Record<ChannelLifecycle, string> = {
  ongoing: "持续",
  project: "项目",
  temporary: "临时",
};

const LIFECYCLE_ICON = {
  ongoing: Hash,
  temporary: ClockFading,
} as const;

export function ChannelTypePicker({
  align = "start",
  allowProject = false,
  ariaLabel,
  className,
  disabled,
  lifecycle,
  onLifecycleChange,
  onOpenChange,
  open,
  temporaryOptionAriaLabel = "临时频道",
  testId,
}: {
  align?: React.ComponentProps<typeof DropdownMenuContent>["align"];
  allowProject?: boolean;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  lifecycle: ChannelLifecycle;
  onLifecycleChange: (lifecycle: Exclude<ChannelLifecycle, "project">) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  temporaryOptionAriaLabel?: string;
  testId?: string;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const pickerOpen = open ?? internalOpen;
  const setPickerOpen = onOpenChange ?? setInternalOpen;
  const label = LIFECYCLE_LABEL[lifecycle];
  const Icon = lifecycle === "project" ? null : LIFECYCLE_ICON[lifecycle];
  const projectLocked = lifecycle === "project";

  function selectType(nextType: string) {
    if (nextType === "project" || projectLocked) {
      setPickerOpen(false);
      return;
    }
    if (nextType === "temporary" || nextType === "ongoing") {
      onLifecycleChange(nextType);
    }
    setPickerOpen(false);
  }

  return (
    <DropdownMenu modal={false} onOpenChange={setPickerOpen} open={pickerOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={ariaLabel ?? `频道类型: ${label}`}
          className={cn(
            "h-9 w-fit px-2.5 text-sm font-medium text-foreground hover:bg-muted/50",
            className,
          )}
          data-testid={testId}
          disabled={disabled}
          type="button"
          variant="ghost"
        >
          {Icon ? (
            <Icon className="h-4 w-4" />
          ) : (
            <ProjectChannelIcon className="h-4 w-4" />
          )}
          {label}
          <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        onCloseAutoFocus={(event) => event.preventDefault()}
        style={{
          minWidth: "var(--radix-dropdown-menu-trigger-width)",
        }}
      >
        <DropdownMenuRadioGroup onValueChange={selectType} value={lifecycle}>
          {allowProject ? (
            <DropdownMenuRadioItem aria-label="项目频道" value="project">
              项目
            </DropdownMenuRadioItem>
          ) : null}
          <DropdownMenuRadioItem
            aria-label="持续频道"
            disabled={projectLocked}
            value="ongoing"
          >
            持续
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            aria-label={temporaryOptionAriaLabel}
            disabled={projectLocked}
            value="temporary"
          >
            临时
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
