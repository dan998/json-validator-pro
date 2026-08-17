"use strict";

import { state } from "./state.js";


/* =========================================================
   CHECK FILE SYSTEM ACCESS SUPPORT
========================================================= */

export function isUpgradeSupported() {

    return (
        !!state.fileHandle &&
        typeof state.fileHandle.createWritable ===
            "function"
    );
}


/* =========================================================
   GET SELECTED FILE NAME
========================================================= */

export function getSelectedFileName() {

    if (
        state.selectedFile &&
        state.selectedFile.name
    ) {
        return state.selectedFile.name;
    }

    if (
        state.fileHandle &&
        state.fileHandle.name
    ) {
        return state.fileHandle.name;
    }

    return "corrected.json";
}


/* =========================================================
   GET FILE HANDLE
========================================================= */

export function getFileHandle() {

    return state.fileHandle || null;
}


/* =========================================================
   REQUEST WRITE PERMISSION
========================================================= */

export async function requestWritePermission() {

    const fileHandle =
        state.fileHandle;

    if (!fileHandle) {
        return false;
    }

    if (
        typeof fileHandle.requestPermission !==
        "function"
    ) {
        return (
            typeof fileHandle.createWritable ===
            "function"
        );
    }

    try {

        const permission =
            await fileHandle.requestPermission({
                mode: "readwrite"
            });

        return (
            permission ===
            "granted"
        );

    } catch (error) {

        console.error(
            "Write permission request failed:",
            error
        );

        return false;
    }
}


/* =========================================================
   VERIFY FILE PERMISSION
========================================================= */

export async function verifyPermission(
    fileHandle,
    readWrite = false
) {

    if (!fileHandle) {
        return false;
    }

    const options =
        readWrite
            ? {
                mode: "readwrite"
            }
            : {};


    /*
     * Check existing permission first.
     */

    if (
        typeof fileHandle.queryPermission ===
        "function"
    ) {

        try {

            const permission =
                await fileHandle.queryPermission(
                    options
                );

            if (
                permission ===
                "granted"
            ) {
                return true;
            }

        } catch (error) {

            console.warn(
                "queryPermission failed:",
                error
            );
        }
    }


    /*
     * Request permission if necessary.
     */

    if (
        typeof fileHandle.requestPermission ===
        "function"
    ) {

        try {

            const permission =
                await fileHandle.requestPermission(
                    options
                );

            return (
                permission ===
                "granted"
            );

        } catch (error) {

            console.error(
                "requestPermission failed:",
                error
            );

            return false;
        }
    }


    /*
     * Some implementations may not expose
     * the permission methods but do expose
     * createWritable().
     */

    if (
        readWrite &&
        typeof fileHandle.createWritable ===
        "function"
    ) {
        return true;
    }

    return true;
}


/* =========================================================
   CONVERT FILE SYSTEM ERRORS
========================================================= */

function getFileSystemErrorMessage(
    error,
    filename
) {

    const name =
        error &&
        error.name
            ? error.name
            : "";

    const message =
        error &&
        error.message
            ? error.message
            : "";


    if (
        name === "NotAllowedError" ||
        name === "SecurityError"
    ) {

        return (
            `Permission was denied while trying to ` +
            `upgrade "${filename}". ` +
            `Please select the file again and grant ` +
            `write permission.`
        );
    }


    if (
        name === "InvalidStateError"
    ) {

        return (
            `The file handle for "${filename}" ` +
            `is no longer valid. ` +
            `Please select the file again.`
        );
    }


    if (
        name === "NotFoundError"
    ) {

        return (
            `The selected file "${filename}" ` +
            `could not be found.`
        );
    }


    if (
        name === "AbortError"
    ) {

        return (
            `The upgrade of "${filename}" ` +
            `was cancelled or aborted.`
        );
    }


    if (
        name === "QuotaExceededError"
    ) {

        return (
            `The browser could not save "${filename}" ` +
            `because of a storage limitation.`
        );
    }


    if (
        name === "NoModificationAllowedError"
    ) {

        return (
            `The browser is not allowed to modify ` +
            `"${filename}".`
        );
    }


    if (
        typeof DOMException !==
        "undefined" &&
        error instanceof DOMException
    ) {

        return (
            `The browser could not write to ` +
            `"${filename}". ` +
            `${message || "The file system operation failed."}`
        );
    }


    if (message) {
        return message;
    }


    return (
        `The browser could not upgrade "${filename}".`
    );
}


/* =========================================================
   UPGRADE ORIGINAL FILE
========================================================= */

export async function upgradeOriginalFile(
    text
) {

    /*
     * Make sure there is something to write.
     */

    if (
        typeof text !== "string" ||
        text.length === 0
    ) {

        throw new Error(
            "There is no corrected JSON to write."
        );
    }


    /*
     * The browser must provide the exact
     * FileSystemFileHandle belonging to
     * the selected file.
     */

    const fileHandle =
        state.fileHandle;

    if (!fileHandle) {

        throw new Error(
            "No writable file handle is available. " +
            "Please select the JSON file again."
        );
    }


    /*
     * Make absolutely sure this handle
     * supports writing.
     */

    if (
        typeof fileHandle.createWritable !==
        "function"
    ) {

        throw new Error(
            "This browser does not support direct " +
            "writing to the selected file. " +
            "Use Download Corrected Copy instead."
        );
    }


    const filename =
        getSelectedFileName();


    /*
     * FINAL JSON SAFETY CHECK.
     *
     * Never overwrite the original file
     * with invalid JSON.
     */

    try {

        JSON.parse(text);

    } catch (error) {

        throw new Error(
            "The corrected JSON is invalid. " +
            "The original file was NOT changed."
        );
    }


    /*
     * Verify write permission.
     */

    const permission =
        await verifyPermission(
            fileHandle,
            true
        );

    if (!permission) {

        throw new Error(
            `Write permission was not granted for "${filename}". ` +
            `Please select the file again.`
        );
    }


    let writable =
        null;


    try {

        /*
         * Create a writable stream for the
         * EXACT file selected by the user.
         */

        writable =
            await fileHandle.createWritable();


        /*
         * Write the corrected JSON.
         */

        await writable.write(
            text
        );


        /*
         * close() commits the write.
         */

        await writable.close();

        writable =
            null;


    } catch (error) {

        /*
         * Abort an unfinished write.
         */

        if (writable) {

            try {

                await writable.abort();

            } catch (_) {
                // Ignore secondary abort errors.
            }
        }


        /*
         * Convert DOMException into a
         * useful readable Error.
         */

        throw new Error(
            getFileSystemErrorMessage(
                error,
                filename
            )
        );
    }


    /*
     * Refresh the File object from the
     * SAME handle.
     */

    try {

        const updatedFile =
            await fileHandle.getFile();

        state.selectedFile =
            updatedFile;

    } catch (error) {

        /*
         * The actual write already succeeded.
         * Do not report the operation as failed.
         */

        console.warn(
            "File was written successfully, " +
            "but the File object could not be refreshed:",
            error
        );
    }


    state.isUpgraded =
        true;


    return true;
}


/* =========================================================
   GET SELECTED FILE
========================================================= */

export async function getSelectedFile() {

    if (
        !state.fileHandle
    ) {
        return null;
    }

    try {

        const file =
            await state.fileHandle.getFile();

        state.selectedFile =
            file;

        return file;

    } catch (error) {

        console.error(
            "Unable to read selected file:",
            error
        );

        return null;
    }
}


/* =========================================================
   GET CURRENT FILE TEXT
========================================================= */

export async function getCurrentFileText() {

    const file =
        await getSelectedFile();

    if (!file) {

        throw new Error(
            "No selected file is available."
        );
    }

    return await file.text();
}


/* =========================================================
   VERIFY CURRENT HANDLE
========================================================= */

export async function verifyCurrentFileHandle() {

    const fileHandle =
        state.fileHandle;

    if (!fileHandle) {
        return false;
    }

    if (
        typeof fileHandle.getFile !==
        "function"
    ) {
        return false;
    }

    try {

        await fileHandle.getFile();

        return true;

    } catch (error) {

        console.error(
            "File handle verification failed:",
            error
        );

        return false;
    }
}


/* =========================================================
   CHECK WHETHER CURRENT FILE CAN BE UPGRADED
========================================================= */

export function canUpgradeOriginalFile() {

    return (
        !!state.fileHandle &&
        typeof state.fileHandle.createWritable ===
            "function"
    );
}


/* =========================================================
   SAFE FILE WRITE TEST
========================================================= */

export async function testWriteAccess() {

    const fileHandle =
        state.fileHandle;

    if (!fileHandle) {
        return false;
    }

    if (
        typeof fileHandle.createWritable !==
        "function"
    ) {
        return false;
    }

    const permission =
        await verifyPermission(
            fileHandle,
            true
        );

    return permission === true;
}


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {

    isUpgradeSupported,

    getSelectedFileName,

    getFileHandle,

    requestWritePermission,

    verifyPermission,

    upgradeOriginalFile,

    getSelectedFile,

    getCurrentFileText,

    verifyCurrentFileHandle,

    canUpgradeOriginalFile,

    testWriteAccess

};
