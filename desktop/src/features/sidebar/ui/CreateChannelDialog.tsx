import type { ReactNode } from "react";

import type { ChannelVisibility } from "@/shared/api/types";
import { ChooserDialogContent } from "@/shared/ui/chooser-dialog-content";
import { Dialog } from "@/shared/ui/dialog";

import {
  type CreateChannelInput,
  useCreateChannelForm,
} from "@/features/sidebar/lib/useCreateChannelForm";
import {
  CREATE_CHANNEL_FORM_ID,
  CreateChannelFormFields,
  CreateChannelFormFooter,
} from "@/features/sidebar/ui/CreateChannelFormFields";

type ChannelKind = "stream" | "forum";

type CreateChannelDialogProps = {
  /** Which kind of channel to create, or null when closed. */
  channelKind: ChannelKind | null;
  children?: ReactNode;
  description?: string;
  isCreating: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: {
    name: string;
    description?: string;
    visibility: ChannelVisibility;
    ttlSeconds?: number;
    templateId?: string;
  }) => Promise<void>;
  testId?: string;
  title?: string;
};

export function CreateChannelDialog({
  channelKind,
  children,
  description,
  isCreating,
  onOpenChange,
  onCreate,
  testId = "create-channel-dialog",
  title,
}: CreateChannelDialogProps) {
  const open = channelKind !== null;

  const form = useCreateChannelForm({
    channelKind: channelKind ?? "stream",
    active: open,
    isCreating,
    onCreate: onCreate as (input: CreateChannelInput) => Promise<void>,
    onCreated: () => onOpenChange(false),
  });

  const kindLabel = channelKind === "forum" ? "论坛" : "频道";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isCreating) return;
        onOpenChange(nextOpen);
      }}
    >
      <ChooserDialogContent
        className="max-w-lg"
        contentClassName="pt-3"
        data-testid={testId}
        footerClassName="border-t-0 pt-0"
        headerClassName="pb-2"
        title={title ?? `创建新${kindLabel}`}
        description={
          description ??
          (channelKind === "forum"
            ? "论坛用于围绕特定主题组织话题式讨论。"
            : "频道是用于团队实时交流的沟通空间。")
        }
        footer={<CreateChannelFormFooter form={form} />}
      >
        <form
          className="space-y-5"
          id={CREATE_CHANNEL_FORM_ID}
          onSubmit={form.handleSubmit}
        >
          {children}
          <CreateChannelFormFields form={form} />
        </form>
      </ChooserDialogContent>
    </Dialog>
  );
}
