import { memoryPhotoBucket } from "@/lib/constants";
import type { UploadedPhoto } from "@/lib/repositories/types";
import { generateId } from "@/lib/utils";

export async function uploadFilesToSupabase(params: {
  supabaseUrl: string;
  anonKey: string;
  accessToken: string;
  userId: string;
  spaceId: string;
  files: File[];
  onProgress?: (fileName: string, progress: number) => void;
}) {
  const { accessToken, anonKey, files, onProgress, spaceId, supabaseUrl, userId } =
    params;

  return Promise.all(
    files.map(
      (file, index) =>
        new Promise<UploadedPhoto>((resolve, reject) => {
          const sanitizedFileName = file.name.replace(/\s+/g, "-").toLowerCase();
          const path = `${spaceId}/${userId}/${Date.now()}-${index}-${sanitizedFileName}`;
          const xhr = new XMLHttpRequest();
          xhr.open(
            "POST",
            `${supabaseUrl}/storage/v1/object/${memoryPhotoBucket}/${path}`
          );
          xhr.setRequestHeader("apikey", anonKey);
          xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
          xhr.setRequestHeader("x-upsert", "false");
          xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
          xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            onProgress?.(file.name, Math.round((event.loaded / event.total) * 100));
          };
          xhr.onerror = () => reject(new Error(`上传失败：${file.name}`));
          xhr.onload = () => {
            if (xhr.status < 200 || xhr.status >= 300) {
              reject(new Error(`上传失败：${file.name}`));
              return;
            }
            resolve({
              id: generateId("photo"),
              path,
              url: URL.createObjectURL(file),
              width: null,
              height: null,
              sortOrder: index,
              createdAt: new Date().toISOString()
            });
          };
          xhr.send(file);
        })
    )
  );
}
