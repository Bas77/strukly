import { ref, uploadBytesResumable, getDownloadURL, deleteObject, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

// Compress an image File to a JPEG Blob using canvas to reduce upload size.
async function compressImage(file: File, maxWidth = 1280, quality = 0.8): Promise<Blob> {
  return await new Promise<Blob>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const ratio = img.width / img.height;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          width = maxWidth;
          height = Math.round(maxWidth / ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Image compression failed"));
          },
          "image/jpeg",
          quality
        );
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadReceiptImage(
  file: File,
  userId: string,
  onProgress?: (progressPercent: number) => void
): Promise<string> {
  const timestamp = Date.now();
  const ext = "jpg"; // we compress to JPEG
  const fileName = `${userId}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}.${ext}`;
  const storageRef = ref(storage, `receipts/${fileName}`);

  // Compress image before upload to reduce upload time.
  let uploadBlob: Blob | File = file;
  try {
    if (typeof window !== "undefined") {
      uploadBlob = await compressImage(file);
    }
  } catch (e) {
    // If compression fails, fall back to original file.
    // eslint-disable-next-line no-console
    console.warn("Image compression failed, uploading original file", e);
    uploadBlob = file;
  }

  const uploadTask = uploadBytesResumable(storageRef, uploadBlob as Blob);

  await new Promise<void>((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (onProgress && snapshot.totalBytes) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          try {
            onProgress(Math.round(progress));
          } catch (e) {
            // ignore callback errors
          }
        }
      },
      (error) => reject(error),
      () => resolve()
    );
  });

  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
  return downloadURL;
}

export async function deleteReceiptImage(imageUrl: string): Promise<void> {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

export async function uploadProfileImage(file: File, userId: string): Promise<string> {
  const fileName = `${userId}/profile.${file.name.split(".").pop()}`;
  const storageRef = ref(storage, `profiles/${fileName}`);

  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
}
