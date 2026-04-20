"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { useRepository } from "@/components/providers/repository-provider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { MemoryPhoto } from "@/lib/types";

export function PhotoUploadField({
  photos,
  onChange
}: {
  photos: MemoryPhoto[];
  onChange: (photos: MemoryPhoto[]) => void;
}) {
  const repository = useRepository();
  const { user, profile } = useAuth();
  const [uploadMap, setUploadMap] = useState<Record<string, number>>({});

  async function handleFiles(files: FileList | null) {
    if (!files?.length || !user || !profile?.primarySpaceId) return;
    try {
      const fileList = Array.from(files);
      const uploaded = await repository.uploadMemoryPhotos(
        user.id,
        profile.primarySpaceId,
        fileList,
        (fileName, progress) => {
          setUploadMap((current) => ({ ...current, [fileName]: progress }));
        }
      );
      onChange([
        ...photos,
        ...uploaded.map((item, index) => ({
          ...item,
          sortOrder: photos.length + index
        }))
      ]);
      setUploadMap({});
      toast.success("图片上传完成");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "图片上传失败");
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-3xl border border-dashed border-border bg-card px-4 py-6 text-sm text-muted-foreground">
        <ImagePlus className="h-4 w-4" />
        选择照片
        <input
          type="file"
          accept="image/*"
          className="hidden"
          multiple
          onChange={(event) => handleFiles(event.target.files)}
        />
      </label>

      {Object.entries(uploadMap).map(([fileName, progress]) => (
        <div key={fileName} className="rounded-2xl bg-muted/60 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{fileName}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      ))}

      {photos.length ? (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative overflow-hidden rounded-3xl">
              <img
                src={photo.url}
                alt="memory photo"
                className="h-28 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(photos.filter((item) => item.id !== photo.id))}
                className="absolute right-2 top-2 rounded-full bg-black/45 p-2 text-white"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
