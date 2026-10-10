import { isMacPlatform } from "@/shared/lib/platform";

export const HUDDLE_SHORTCUT_EVENT = "buzz:huddle-shortcut";

export type HuddleShortcutDetail = {
  channelId: string;
};

export type ShortcutCategory =
  | "Navigation"
  | "Messages"
  | "Formatting"
  | "Zoom";

export type KeyboardShortcut = {
  id: string;
  label: string;
  description: string;
  keys: string;
  keysWindows: string;
  category: ShortcutCategory;
};

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation
  {
    id: "quick-search",
    label: "快速搜索",
    description: "打开全局搜索对话框",
    keys: "⌘K",
    keysWindows: "Ctrl+K",
    category: "Navigation",
  },
  {
    id: "browse-channels",
    label: "浏览频道",
    description: "打开频道列表浏览器",
    keys: "⇧⌘O",
    keysWindows: "Shift+Ctrl+O",
    category: "Navigation",
  },
  {
    id: "browse-dms",
    label: "发起私信",
    description: "打开新消息撰写面板",
    keys: "⇧⌘K",
    keysWindows: "Shift+Ctrl+K",
    category: "Navigation",
  },
  {
    id: "new-channel",
    label: "新建频道",
    description: "打开创建频道对话框",
    keys: "⇧⌘N",
    keysWindows: "Shift+Ctrl+N",
    category: "Navigation",
  },
  {
    id: "open-settings",
    label: "偏好设置",
    description: "打开或关闭偏好设置",
    keys: "⌘,",
    keysWindows: "Ctrl+,",
    category: "Navigation",
  },
  {
    id: "go-back",
    label: "返回上一页",
    description: "后退至上一浏览页面",
    keys: "⌘[",
    keysWindows: "Alt+←",
    category: "Navigation",
  },
  {
    id: "go-forward",
    label: "前进下一页",
    description: "前进至下一浏览页面",
    keys: "⌘]",
    keysWindows: "Alt+→",
    category: "Navigation",
  },
  {
    id: "find-in-channel",
    label: "在频道中查找",
    description: "在当前频道中搜索消息内容",
    keys: "⌘F",
    keysWindows: "Ctrl+F",
    category: "Navigation",
  },
  {
    id: "go-home",
    label: "主页",
    description: "导航至主页消息流",
    keys: "⇧⌘A",
    keysWindows: "Shift+Ctrl+A",
    category: "Navigation",
  },
  {
    id: "toggle-sidebar",
    label: "展开/收起侧边栏",
    description: "显示或隐藏左侧边栏",
    keys: "⌘S",
    keysWindows: "Ctrl+S",
    category: "Navigation",
  },
  {
    id: "mark-current-read",
    label: "标为已读",
    description: "将当前会话标记为已读",
    keys: "Escape",
    keysWindows: "Escape",
    category: "Navigation",
  },
  {
    id: "mark-all-read",
    label: "全部标为已读",
    description: "将所有会话消息标记为已读",
    keys: "⇧Escape",
    keysWindows: "Shift+Escape",
    category: "Navigation",
  },

  // Zoom
  {
    id: "zoom-in",
    label: "放大",
    description: "增大界面缩放比例",
    keys: "⌘+",
    keysWindows: "Ctrl+=",
    category: "Zoom",
  },
  {
    id: "zoom-out",
    label: "缩小",
    description: "减小界面缩放比例",
    keys: "⌘-",
    keysWindows: "Ctrl+-",
    category: "Zoom",
  },
  {
    id: "zoom-reset",
    label: "重置缩放",
    description: "恢复界面为默认 100% 缩放",
    keys: "⌘0",
    keysWindows: "Ctrl+0",
    category: "Zoom",
  },

  // Messages
  {
    id: "send-message",
    label: "发送消息",
    description: "发送当前输入框中的消息",
    keys: "Enter",
    keysWindows: "Enter",
    category: "Messages",
  },
  {
    id: "new-line",
    label: "换行",
    description: "在输入框中插入换行符",
    keys: "Shift+Enter",
    keysWindows: "Shift+Enter",
    category: "Messages",
  },
  {
    id: "always-address-agent",
    label: "指派智能体",
    description: "指派默认智能体，或切换高亮智能体",
    keys: "⇧⌘M",
    keysWindows: "Ctrl+Shift+M",
    category: "Messages",
  },
  {
    id: "publish-note",
    label: "发布动态",
    description: "发布一条 Pulse 动态笔记",
    keys: "⌘Enter",
    keysWindows: "Ctrl+Enter",
    category: "Messages",
  },
  {
    id: "close-dialog",
    label: "关闭弹窗",
    description: "关闭当前打开的对话框或设置浮层",
    keys: "Escape",
    keysWindows: "Escape",
    category: "Messages",
  },
  {
    id: "toggle-huddle",
    label: "开始或离开通话",
    description: "在当前频道发起或加入通话；已连接时离开",
    keys: "Ctrl+Shift+Space",
    keysWindows: "Ctrl+Shift+Space",
    category: "Messages",
  },
  {
    id: "push-to-talk",
    label: "按住说话",
    description: "通话中长按临时解除静音",
    keys: "Ctrl+Space",
    keysWindows: "Ctrl+Space",
    category: "Messages",
  },

  // Formatting
  {
    id: "format-bold",
    label: "粗体",
    description: "切换文字加粗格式",
    keys: "⌘B",
    keysWindows: "Ctrl+B",
    category: "Formatting",
  },
  {
    id: "format-italic",
    label: "斜体",
    description: "切换文字斜体格式",
    keys: "⌘I",
    keysWindows: "Ctrl+I",
    category: "Formatting",
  },
  {
    id: "format-strikethrough",
    label: "删除线",
    description: "切换文字删除线格式",
    keys: "⌘⇧X",
    keysWindows: "Ctrl+Shift+X",
    category: "Formatting",
  },
  {
    id: "format-code",
    label: "行内代码",
    description: "切换行内代码样式",
    keys: "⌘E",
    keysWindows: "Ctrl+E",
    category: "Formatting",
  },
  {
    id: "format-link",
    label: "插入链接",
    description: "为选中文本添加超链接，或编辑光标处的链接",
    keys: "⌘K",
    keysWindows: "Ctrl+K",
    category: "Formatting",
  },
];

const CATEGORY_ORDER: ShortcutCategory[] = [
  "Navigation",
  "Messages",
  "Formatting",
  "Zoom",
];

export function getShortcutsByCategory(): Map<
  ShortcutCategory,
  KeyboardShortcut[]
> {
  const map = new Map<ShortcutCategory, KeyboardShortcut[]>();
  for (const cat of CATEGORY_ORDER) {
    map.set(
      cat,
      KEYBOARD_SHORTCUTS.filter((s) => s.category === cat),
    );
  }
  return map;
}

export function getPlatformKeys(shortcut: KeyboardShortcut): string {
  return isMacPlatform() ? shortcut.keys : shortcut.keysWindows;
}

/**
 * Platform-appropriate key hint for a shortcut in {@link KEYBOARD_SHORTCUTS},
 * or null when the id is unknown. Use this for inline hints (menus, tooltips)
 * so they stay in sync with the canonical shortcut registry.
 */
export function getPlatformKeysById(id: string): string | null {
  const shortcut = KEYBOARD_SHORTCUTS.find((s) => s.id === id);
  return shortcut ? getPlatformKeys(shortcut) : null;
}
