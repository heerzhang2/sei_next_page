/**
 * Generic callback handler for file operations
 * Updates storageContext based on serialized callback parameters
 */
export async function executeGenericFileCallback(operation: any, result: any, storageContext: any): Promise<void> {
  const { callbackParams, type } = operation

  if (!callbackParams) {
    console.warn("[GenericCallback] No callback params, skipping")
    return
  }

  const { modType, redId, fieldPath } = callbackParams

  // Get the storage key for this sub-report
  const storageKey = `_${modType}_${redId}`

  // Update storageContext
  if (type === "upload") {
    // For upload, set the uploaded file data
    storageContext.setStorage((prevStorage: any) => {
      const oldStore = prevStorage?.[storageKey]
      return {
        ...prevStorage,
        [storageKey]: {
          ...oldStore,
          [fieldPath]: result, // result is the uploaded file info
        },
      }
    })
    console.log(`[GenericCallback] Updated ${storageKey}.${fieldPath} with upload result`)
  } else if (type === "delete") {
    // For delete, remove the file from the array
    storageContext.setStorage((prevStorage: any) => {
      const oldStore = prevStorage?.[storageKey]
      const currentFiles = oldStore?.[fieldPath] || []
      const updatedFiles = currentFiles.filter((file: any) => file.url !== operation.deleteUrl)
      return {
        ...prevStorage,
        [storageKey]: {
          ...oldStore,
          [fieldPath]: updatedFiles,
        },
      }
    })
    console.log(`[GenericCallback] Removed file from ${storageKey}.${fieldPath}`)
  }

  // Set modified flag
  storageContext.setModified(true)

  // Save to IndexedDB
  await storageContext.saveToIndexedDB?.()
}

/**
 * Extract callback parameters from component props
 * Call this in useOfflineUppyUpload to get the params to store in queue
 */
export function extractCallbackParams(modType: string, redId: string | number, fieldPath: string) {
  return {
    modType,
    redId: String(redId),
    fieldPath,
  }
}
