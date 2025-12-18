import { useState } from 'react';
import { api } from '../services/api';

interface UploadResponse {
  upload_url: string;
  object_name: string;
  bucket_name: string;
}

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    setError(null);

    try {
      // 1. バックエンドから署名付きURLを取得
      const { data } = await api.post<UploadResponse>('/api/upload/signed-url', {
        filename: file.name,
        content_type: file.type,
      });

      // 2. GCSに直接アップロード
      const uploadResponse = await fetch(data.upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to GCS');
      }

      // 3. GCSの直接URLを生成して返す
      const fileURL = `https://storage.googleapis.com/${data.bucket_name}/${data.object_name}`;
      return fileURL;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    setUploading(true);
    setError(null);

    try {
      const urls: string[] = [];
      for (const file of files) {
        const url = await uploadImage(file);
        urls.push(url);
      }
      return urls;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload images';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploadImages, uploading, error };
};
