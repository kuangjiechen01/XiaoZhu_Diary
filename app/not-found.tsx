import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-screen-sm items-center px-4">
      <Card className="space-y-4">
        <CardTitle>页面不存在</CardTitle>
        <CardDescription>
          你访问的页面可能已经被移动，或者这条记录已经删除。
        </CardDescription>
        <Link href="/dashboard">
          <Button>回到首页</Button>
        </Link>
      </Card>
    </main>
  );
}
