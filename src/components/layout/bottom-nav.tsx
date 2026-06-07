import { Home, ClipboardList, Bike, User } from "lucide-react";
import { TabBar, type TabItem } from "@/components/layout/tab-bar";

const items: readonly TabItem[] = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/tasks", label: "Task Saya", icon: ClipboardList },
  { to: "/runner", label: "Runner", icon: Bike },
  { to: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  return <TabBar items={items} />;
}
