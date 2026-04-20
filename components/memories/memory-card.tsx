import Link from "next/link";
import { CalendarDays, ImageIcon, MapPin, Star } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/date";
import type { Memory } from "@/lib/types";

export function MemoryCard({ memory }: { memory: Memory }) {
  return (
    <Link href={`/memories/${memory.id}`} className="block">
      <Card className="space-y-4 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">{memory.title}</h3>
              {memory.isStarred ? (
                <Badge variant="accent" className="gap-1">
                  <Star className="h-3 w-3" />
                  重要
                </Badge>
              ) : null}
              <Badge variant="subtle">{memory.category}</Badge>
              {memory.visibility === "private" ? (
                <Badge variant="outline">仅自己可见</Badge>
              ) : null}
            </div>
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {memory.content}
            </p>
          </div>
          {memory.photos[0] ? (
            <img
              src={memory.photos[0].url}
              alt={memory.title}
              className="h-20 w-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/70 text-secondary-foreground">
              <ImageIcon className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(memory.date)}
            {memory.time ? ` ${memory.time}` : ""}
          </span>
          {memory.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {memory.location}
            </span>
          ) : null}
          {memory.photos.length ? (
            <span className="inline-flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5" />
              {memory.photos.length} 张照片
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {memory.moodTags.map((tag) => (
              <Badge key={tag} variant="subtle">
                {tag}
              </Badge>
            ))}
          </div>
          {memory.createdByProfile ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar
                className="h-6 w-6"
                fallback={memory.createdByProfile.nickname}
                src={memory.createdByProfile.avatarUrl}
              />
              {memory.createdByProfile.nickname}
            </div>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
