import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, localhost works
// For physical devices on the same network, use your computer's IP address
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://3.80.192.46/api';

console.log("USING API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper services
export const createFolder = async (name: string, parentId?: string | null) => {
  return api.post('/folders', { name, parentId });
};

export const getFolders = async (parentId?: string | null) => {
  const url = parentId ? `/folders?parentId=${parentId}` : '/folders';
  return api.get(url);
};

export const getFolderContents = async (folderId: string) => {
  return api.get(`/folders/${folderId}/contents`);
};

export const renameFolder = async (folderId: string, name: string) => {
  return api.patch(`/folders/${folderId}`, { name });
};

export const deleteFolder = async (folderId: string) => {
  return api.delete(`/folders/${folderId}`);
};

export const uploadFile = async (
  fileUri: string,
  fileName: string,
  mimeType: string,
  folderId?: string | null
) => {
  const formData = new FormData();
  
  formData.append('file', {
    uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
    type: mimeType,
    name: fileName,
  } as any);

  if (folderId) {
    formData.append('folderId', folderId);
  }

  return api.post('/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteFile = async (fileId: string) => {
  return api.delete(`/files/${fileId}`);
};

export const moveFile = async (fileId: string, folderId: string | null) => {
  return api.patch(`/files/${fileId}/move`, { folderId });
};

export const getDownloadUrl = async (fileId: string) => {
  return api.get(`/files/${fileId}/download`);
};

export const getUserStats = async () => {
  return api.get('/files/stats');
};

export default api;
