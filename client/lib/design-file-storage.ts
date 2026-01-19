/**
 * Design File Storage Utility
 * Stores design files in sessionStorage instead of localStorage to avoid quota issues
 * sessionStorage persists for the duration of the page session and has a larger quota
 */

const DESIGN_FILES_KEY = "design_files_session";

interface StoredDesignFile {
  id: string;
  dataUrl: string;
  filename?: string;
  timestamp: number;
}

/**
 * Generate a unique ID for a design file
 */
function generateFileId(): string {
  return `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Store a design file in sessionStorage
 * @param dataUrl - Base64 encoded data URL of the design file
 * @param filename - Optional filename
 * @returns Unique ID for the stored file
 */
export function storeDesignFile(dataUrl: string, filename?: string): string {
  try {
    const fileId = generateFileId();
    const files: Record<string, StoredDesignFile> = JSON.parse(
      sessionStorage.getItem(DESIGN_FILES_KEY) || "{}"
    );
    
    files[fileId] = {
      id: fileId,
      dataUrl,
      filename,
      timestamp: Date.now(),
    };
    
    sessionStorage.setItem(DESIGN_FILES_KEY, JSON.stringify(files));
    return fileId;
  } catch (error) {
    console.error("Error storing design file:", error);
    throw error;
  }
}

/**
 * Retrieve a design file from sessionStorage
 * @param fileId - Unique ID of the stored file
 * @returns Design file data or null if not found
 */
export function getDesignFile(fileId: string): string | null {
  try {
    const files: Record<string, StoredDesignFile> = JSON.parse(
      sessionStorage.getItem(DESIGN_FILES_KEY) || "{}"
    );
    return files[fileId]?.dataUrl || null;
  } catch (error) {
    console.error("Error retrieving design file:", error);
    return null;
  }
}

/**
 * Remove a design file from sessionStorage
 * @param fileId - Unique ID of the stored file
 */
export function removeDesignFile(fileId: string): void {
  try {
    const files: Record<string, StoredDesignFile> = JSON.parse(
      sessionStorage.getItem(DESIGN_FILES_KEY) || "{}"
    );
    delete files[fileId];
    sessionStorage.setItem(DESIGN_FILES_KEY, JSON.stringify(files));
  } catch (error) {
    console.error("Error removing design file:", error);
  }
}

/**
 * Clear all design files from sessionStorage
 */
export function clearAllDesignFiles(): void {
  try {
    sessionStorage.removeItem(DESIGN_FILES_KEY);
  } catch (error) {
    console.error("Error clearing design files:", error);
  }
}
