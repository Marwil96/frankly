import { put } from "@vercel/blob";

export async function uploadPhoto(
  file: File,
  reviewId: string,
  index: number,
) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `reviews/${reviewId}/${index}.${ext}`;
  const blob = await put(path, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return blob.url;
}
