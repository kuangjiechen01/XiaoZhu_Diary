import { LoadingPanel } from "@/components/ui/loading-panel";

export default function GlobalLoading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-screen-sm items-center px-4">
      <LoadingPanel label="正在加载页面..." />
    </main>
  );
}
