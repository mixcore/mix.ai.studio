/**
 * @fileoverview File storage module for the Mixcore SDK
 *
 * This module handles file upload, download, and management operations
 * for the Mixcore platform. It provides methods for handling various
 * file types with proper error handling and validation.
 *
 * @author Mixcore Team
 * @version 0.0.1-dev.21+
 */
import { IBase64UploadConfiguration } from "types";
import type { MixcoreClient } from "./client";
/**
 * File storage operations module for the Mixcore SDK
 *
 * The MixcoreStorage class provides comprehensive file management functionality
 * including file uploads, downloads, deletion, and metadata retrieval. It supports
 * various file types and includes proper validation and error handling.
 *
 * @class MixcoreStorage
 * @example
 * ```typescript
 * // Access through client instance
 * const client = new MixcoreClient({ ... });
 * const storage = client.storage;
 *
 * // Upload a file
 * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
 * const file = fileInput.files?.[0];
 * if (file) {
 *   const formData = new FormData();
 *   formData.append('file', file);
 *   const result = await storage.uploadFile(formData);
 *   console.log('File uploaded:', result.url);
 * }
 *
 * // Delete a file
 * await storage.deleteFile('uploads/documents/file.pdf');
 * ```
 */
export declare class MixcoreStorage {
    /** Reference to the parent MixcoreClient instance */
    client: MixcoreClient;
    /**
     * Creates a new MixcoreStorage instance
     *
     * @param client - The parent MixcoreClient instance
     */
    constructor(client: MixcoreClient);
    /**
     * Uploads a file to the Mixcore storage system
     *
     * This method handles file uploads with support for various file types.
     * The file should be provided as FormData with proper multipart encoding.
     *
     * @param fileData - FormData object containing the file and optional metadata
     * @param folder - Optional folder path to organize uploaded files
     * @returns Promise that resolves to upload result with file URL and metadata
     * @throws {ValidationError} When file data is invalid or missing
     * @throws {NetworkError} When upload fails or server error occurs
     * @throws {AuthenticationError} When user lacks upload permission
     *
     * @example
     * ```typescript
     * // Basic file upload
     * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
     * const file = fileInput.files?.[0];
     *
     * if (file) {
     *   const formData = new FormData();
     *   formData.append('file', file);
     *   formData.append('description', 'User avatar image');
     *
     *   const uploadResult = await storage.uploadFile(formData);
     *   console.log('File URL:', uploadResult.url);
     *   console.log('File ID:', uploadResult.id);
     * }
     *
     * // Upload to specific folder
     * const documentUpload = await storage.uploadFile(formData, 'documents/invoices');
     *
     * // Upload with custom metadata
     * const customFormData = new FormData();
     * customFormData.append('file', file);
     * customFormData.append('title', 'Important Document');
     * customFormData.append('category', 'legal');
     * customFormData.append('tags', JSON.stringify(['contract', 'signed']));
     *
     * const result = await storage.uploadFile(customFormData);
     * ```
     */
    uploadFile: (file: File, folder?: string) => Promise<string>;
    uploadFileBase64: (request: IBase64UploadConfiguration) => Promise<string>;
    /**
     * Downloads a file from the storage system
     *
     * Retrieves a file by its path or ID and returns the file data.
     * This method can be used to download files for local storage or display.
     *
     * @param filePath - Path or ID of the file to download
     * @returns Promise that resolves to file blob data
     * @throws {ValidationError} When file path is invalid
     * @throws {NetworkError} When file not found or download fails
     * @throws {AuthenticationError} When user lacks download permission
     *
     * @example
     * ```typescript
     * // Download file and create download link
     * const fileBlob = await storage.downloadFile('uploads/documents/report.pdf');
     * const downloadUrl = URL.createObjectURL(fileBlob);
     *
     * const link = document.createElement('a');
     * link.href = downloadUrl;
     * link.download = 'report.pdf';
     * link.click();
     *
     * // Clean up the object URL
     * URL.revokeObjectURL(downloadUrl);
     *
     * // Download and display image
     * const imageBlob = await storage.downloadFile('uploads/images/avatar.jpg');
     * const imageUrl = URL.createObjectURL(imageBlob);
     * const img = document.getElementById('avatar') as HTMLImageElement;
     * img.src = imageUrl;
     * ```
     */
    downloadFile: (filePath: string) => Promise<Blob>;
    /**
     * Deletes a file from the storage system
     *
     * Permanently removes a file from storage. This operation cannot be undone,
     * so use with caution. The file will be immediately unavailable.
     *
     * @param filePath - Path or ID of the file to delete
     * @returns Promise that resolves to true if deletion was successful
     * @throws {ValidationError} When file path is invalid
     * @throws {NetworkError} When file not found or deletion fails
     * @throws {AuthenticationError} When user lacks delete permission
     *
     * @example
     * ```typescript
     * // Delete a file
     * const success = await storage.deleteFile('uploads/temp/old-file.pdf');
     * if (success) {
     *   console.log('File deleted successfully');
     * }
     *
     * // Delete with error handling
     * try {
     *   await storage.deleteFile('uploads/images/avatar.jpg');
     *   console.log('Avatar deleted');
     * } catch (error) {
     *   if (error instanceof NetworkError && error.statusCode === 404) {
     *     console.log('File not found');
     *   } else if (error instanceof AuthenticationError) {
     *     console.log('Permission denied');
     *   } else {
     *     console.error('Delete failed:', error);
     *   }
     * }
     *
     * // Conditional deletion
     * const fileExists = await storage.getFileInfo('uploads/temp/cache.json')
     *   .then(() => true)
     *   .catch(() => false);
     *
     * if (fileExists) {
     *   await storage.deleteFile('uploads/temp/cache.json');
     * }
     * ```
     */
    deleteFile: (filePath: string) => Promise<boolean>;
    /**
     * Retrieves metadata information about a file
     *
     * Gets detailed information about a file including size, type, upload date,
     * and other metadata without downloading the actual file content.
     *
     * @param filePath - Path or ID of the file to get information about
     * @returns Promise that resolves to file metadata
     * @throws {ValidationError} When file path is invalid
     * @throws {NetworkError} When file not found or request fails
     * @throws {AuthenticationError} When user lacks access permission
     *
     * @example
     * ```typescript
     * // Get file information
     * const fileInfo = await storage.getFileInfo('uploads/documents/contract.pdf');
     * console.log('File size:', fileInfo.size, 'bytes');
     * console.log('File type:', fileInfo.mimetype);
     * console.log('Uploaded:', new Date(fileInfo.uploadDate));
     *
     * // Check if file exists
     * try {
     *   const info = await storage.getFileInfo('uploads/images/logo.png');
     *   console.log('File exists:', info.filename);
     * } catch (error) {
     *   if (error instanceof NetworkError && error.statusCode === 404) {
     *     console.log('File does not exist');
     *   }
     * }
     *
     * // Display file details in UI
     * const fileInfo = await storage.getFileInfo(selectedFilePath);
     * document.getElementById('fileName').textContent = fileInfo.filename;
     * document.getElementById('fileSize').textContent = `${Math.round(fileInfo.size / 1024)} KB`;
     * document.getElementById('fileType').textContent = fileInfo.mimetype;
     * ```
     */
    getFileInfo: (filePath: string) => Promise<{
        id: string;
        filename: string;
        size: number;
        mimetype: string;
        uploadDate: string;
        url: string;
        folder?: string;
        metadata?: Record<string, any>;
    }>;
    /**
     * Lists files in a specific folder or directory
     *
     * Retrieves a list of files in the specified folder with pagination support.
     * This is useful for building file browsers or managing file collections.
     *
     * @param folder - Folder path to list files from (empty string for root)
     * @param page - Page number for pagination (1-based, default: 1)
     * @param pageSize - Number of files per page (default: 50)
     * @returns Promise that resolves to paginated file list
     * @throws {ValidationError} When parameters are invalid
     * @throws {NetworkError} When request fails
     * @throws {AuthenticationError} When user lacks access permission
     *
     * @example
     * ```typescript
     * // List all files in root directory
     * const rootFiles = await storage.listFiles('');
     * console.log(`Found ${rootFiles.total} files`);
     *
     * // List files in specific folder
     * const documentFiles = await storage.listFiles('documents');
     * documentFiles.items.forEach(file => {
     *   console.log(`${file.filename} (${file.size} bytes)`);
     * });
     *
     * // Paginated file listing
     * const page1 = await storage.listFiles('uploads/images', 1, 20);
     * const page2 = await storage.listFiles('uploads/images', 2, 20);
     *
     * // Build file browser
     * const fileList = await storage.listFiles('user-uploads/2024');
     * const fileListElement = document.getElementById('fileList');
     *
     * fileList.items.forEach(file => {
     *   const listItem = document.createElement('li');
     *   listItem.innerHTML = `
     *     <span>${file.filename}</span>
     *     <span>${Math.round(file.size / 1024)} KB</span>
     *     <button onclick="downloadFile('${file.id}')">Download</button>
     *   `;
     *   fileListElement.appendChild(listItem);
     * });
     * ```
     */
    listFiles: (folder?: string, page?: number, pageSize?: number) => Promise<{
        items: Array<{
            id: string;
            filename: string;
            size: number;
            mimetype: string;
            uploadDate: string;
            url: string;
            folder: string;
        }>;
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
}
