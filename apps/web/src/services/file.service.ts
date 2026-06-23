import { api } from './api';

export const fileService = {
  async upload(file: File, onProgress?: (p: number) => void) {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post('/files/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return data.data as { url: string; name: string; size: number; mimeType: string };
  },
  async signedUrl(fileKey: string) {
    const { data } = await api.post('/files/signed-url', { fileKey });
    return data.data as { url: string };
  },
};