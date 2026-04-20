"use client";

import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/app-shell/page-header";
import { MemoryForm } from "@/components/forms/memory-form";
import { useWishlist } from "@/lib/hooks/use-app-data";

export default function NewMemoryPage() {
  const searchParams = useSearchParams();
  const fromWish = searchParams.get("fromWish");
  const wishlistQuery = useWishlist();
  const presetWish = wishlistQuery.data?.find((item) => item.id === fromWish);

  return (
    <div className="space-y-5">
      <PageHeader
        backHref="/timeline"
        title="新建共同回忆"
        description="记录一次约会、一次旅行、一个重要决定，或今天很想记下来的小事。"
      />
      <MemoryForm
        preset={
          presetWish
            ? {
                title: presetWish.title,
                content: presetWish.note ?? "",
                category: "其他"
              }
            : undefined
        }
      />
    </div>
  );
}
