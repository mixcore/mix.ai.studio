import { validateRequired } from './helpers';
import type { ApiClient } from './api';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
  path: string;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  mimetype: string;
  createdDate: string;
  modifiedDate: string;
}

export class StorageModule {
  constructor(private api: ApiClient) {}

  async uploadFile(formData: FormData): Promise<UploadResult> {
    validateRequired(formData, 'Form data');

    if (!(formData instanceof FormData)) {
      throw new Error('Data must be FormData instance');
    }

    const response = await this.api.upload<UploadResult>('/storage/upload', formData);
    return response.data;
  }

  async uploadFiles(files: FileList | File[]): Promise<UploadResult[]> {
    validateRequired(files, 'Files');

    const fileArray = Array.from(files);
    if (fileArray.length === 0) {
      throw new Error('No files provided');
    }

    const formData = new FormData();
    fileArray.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    const response = await this.api.upload<UploadResult[]>('/storage/upload/multiple', formData);
    return response.data;
  }

  async deleteFile(filePath: string): Promise<boolean> {
    validateRequired(filePath, 'File path');

    try {
      await this.api.delete(`/storage/delete`, {
        path: filePath
      });
      return true;
    } catch (error) {
      console.error('File deletion failed:', error);
      return false;
    }
  }

  async deleteFiles(filePaths: string[]): Promise<{ success: string[]; failed: string[] }> {
    validateRequired(filePaths, 'File paths');

    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      throw new Error('File paths must be a non-empty array');
    }

    const response = await this.api.delete<{ success: string[]; failed: string[] }>('/storage/delete/multiple', {
      paths: filePaths
    });

    return response.data;
  }

  async getFileInfo(filePath: string): Promise<FileInfo> {
    validateRequired(filePath, 'File path');

    const response = await this.api.get<FileInfo>(`/storage/info`, {
      path: filePath
    });

    return response.data;
  }

  async listFiles(directory: string = ''): Promise<FileInfo[]> {
    const response = await this.api.get<FileInfo[]>('/storage/list', {
      directory
    });

    return response.data;
  }

  async createDirectory(directoryPath: string): Promise<boolean> {
    validateRequired(directoryPath, 'Directory path');

    try {
      await this.api.post('/storage/directory', {
        path: directoryPath
      });
      return true;
    } catch (error) {
      console.error('Directory creation failed:', error);
      return false;
    }
  }

  async deleteDirectory(directoryPath: string, recursive: boolean = false): Promise<boolean> {
    validateRequired(directoryPath, 'Directory path');

    try {
      await this.api.delete('/storage/directory', {
        path: directoryPath,
        recursive
      });
      return true;
    } catch (error) {
      console.error('Directory deletion failed:', error);
      return false;
    }
  }

  async moveFile(fromPath: string, toPath: string): Promise<boolean> {
    validateRequired(fromPath, 'Source path');
    validateRequired(toPath, 'Destination path');

    try {
      await this.api.post('/storage/move', {
        from: fromPath,
        to: toPath
      });
      return true;
    } catch (error) {
      console.error('File move failed:', error);
      return false;
    }
  }

  async copyFile(fromPath: string, toPath: string): Promise<boolean> {
    validateRequired(fromPath, 'Source path');
    validateRequired(toPath, 'Destination path');

    try {
      await this.api.post('/storage/copy', {
        from: fromPath,
        to: toPath
      });
      return true;
    } catch (error) {
      console.error('File copy failed:', error);
      return false;
    }
  }

  async getFileUrl(filePath: string, expiration?: number): Promise<string> {
    validateRequired(filePath, 'File path');

    const params: any = { path: filePath };
    if (expiration) {
      params.expiration = expiration;
    }

    const response = await this.api.get<{ url: string }>('/storage/url', params);
    return response.data.url;
  }

  async getDownloadUrl(filePath: string): Promise<string> {
    validateRequired(filePath, 'File path');

    const response = await this.api.get<{ url: string }>('/storage/download', {
      path: filePath
    });

    return response.data.url;
  }

  // Utility methods for file handling
  createFileInput(accept?: string, multiple: boolean = false): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'file';
    if (accept) input.accept = accept;
    if (multiple) input.multiple = true;
    return input;
  }

  async selectAndUploadFiles(accept?: string, multiple: boolean = false): Promise<UploadResult[]> {
    return new Promise((resolve, reject) => {
      const input = this.createFileInput(accept, multiple);
      
      input.onchange = async () => {
        try {
          if (input.files && input.files.length > 0) {
            const results = await this.uploadFiles(input.files);
            resolve(results);
          } else {
            resolve([]);
          }
        } catch (error) {
          reject(error);
        }
      };

      input.oncancel = () => resolve([]);
      input.click();
    });
  }

  // File validation helpers
  validateFileSize(file: File, maxSizeInMB: number): boolean {
    return file.size <= maxSizeInMB * 1024 * 1024;
  }

  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}