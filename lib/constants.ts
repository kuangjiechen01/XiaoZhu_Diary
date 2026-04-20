import {
  BookHeart,
  CalendarRange,
  HeartHandshake,
  MessageCircleHeart,
  Search,
  Settings2,
  Sparkles
} from "lucide-react";

export const APP_NAME = "小猪 APP";
export const APP_DESCRIPTION =
  "一个适合长期记录、双人协作、云同步的共同生活记录工具。";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "首页", icon: HeartHandshake },
  { href: "/timeline", label: "时间线", icon: BookHeart },
  { href: "/search", label: "搜索", icon: Search },
  { href: "/anniversaries", label: "纪念日", icon: CalendarRange },
  { href: "/notes", label: "留言", icon: MessageCircleHeart },
  { href: "/wishlist", label: "愿望", icon: Sparkles },
  { href: "/settings", label: "设置", icon: Settings2 }
] as const;

export const visibilityOptions = [
  { value: "space", label: "双方可见" },
  { value: "private", label: "仅自己可见" }
] as const;

export const invitationExpiryHours = 72;
export const memoryPhotoBucket = "memory-photos";
