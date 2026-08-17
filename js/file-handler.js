"use strict";

import { state } from "./state.js";
import { isJSONFilename } from "./filename.js";


/* =========================================================
   FILE SYSTEM ACCESS SUPPORT
========================================================= */

export function supportsFileSystemAccess() {

    return (
        typeof window !== "undefined" &&
        typeof window.showOpenFilePicker ===
            "function"
    );
}


/* =========================================================
   SELECT JSON FILE
========================================================= */

export async function selectJSONFile(
    fallbackInput
) {

    /*
     * Always clear any previous handle before
     * selecting another file.
     */

    state.fileHandle =
        null;

    state.selectedFile =
        null;


    /*
     * Prefer the File System Access API.
     *
     * This is important because it gives us the
     * actual FileSystemFileHandle needed to overwrite
     * the original file later.
     */

    if (supportsFileSystemAccess()) {

        try {

            const handles =
                await window.showOpenFilePicker({
                    multiple: false,

                    types: [
                        {
                            description:
                                "JSON files",

                            accept: {
                                "application/json":
                                    [".json"]
                            }
                        }
                    ]
                });


            const handle =
                handles &&
                handles[0];


            if (!handle) {

                return null;
            }


            /*
             * Make sure this really is a file handle.
             */

            if (
                typeof handle.getFile !==
                "function"
            ) {

                throw new Error(
                    "The selected item is not a valid file."
                );
            }


            if (
                typeof handle.createWritable !==
                "function"
            ) {

                throw new Error(
                    "This browser cannot write directly to the selected file."
                );
            }


            /*
             * Get the actual File object.
             */

            const file =
                await handle.getFile();


            if (!file) {

                throw new Error(
                    "Unable to read the selected file."
                );
            }


            /*
             * Validate the filename.
             */

            if (
                !isJSONFilename(
                    file.name
                )
            ) {

                throw new Error(
                    "Please select a .json file."
                );
            }


            /*
             * IMPORTANT:
             *
             * Store the exact handle returned by
             * showOpenFilePicker().
             */

            state.fileHandle =
                handle;


            state.selectedFile =
                file;


            return file;


        } catch (error) {

            /*
             * User cancelled the picker.
             */

            if (
                error &&
                error.name ===
                    "AbortError"
            ) {

                return null;
            }


            /*
             * Clear stale state after a failed
             * file selection.
             */

            state.fileHandle =
                null;

            state.selectedFile =
                null;


            throw normalizeFileError(
                error
            );
        }
    }


    /*
     * =====================================================
     * FALLBACK FILE INPUT
     * =====================================================
     *
     * Browsers without File System Access API can still
     * read, repair, validate and download JSON.
     *
     * They cannot directly overwrite the original file.
     */

    if (!fallbackInput) {

        throw new Error(
            "This browser does not support direct file access " +
            "and no fallback file input was provided."
        );
    }


    return new Promise(
        (resolve, reject) => {

            fallbackInput.value =
                "";


            fallbackInput.onchange =
                async event => {

                    try {

                        const files =
                            event &&
                            event.target &&
                            event.target.files;


                        const file =
                            files &&
                            files[0];


                        if (!file) {

                            resolve(null);

                            return;
                        }


                        if (
                            !isJSONFilename(
                                file.name
                            )
                        ) {

                            throw new Error(
                                "Please select a .json file."
                            );
                        }


                        /*
                         * Fallback input does NOT give us
                         * a writable FileSystemFileHandle.
                         */

                        state.fileHandle =
                            null;


                        state.selectedFile =
                            file;


                        resolve(file);


                    } catch (error) {

                        state.fileHandle =
                            null;

                        state.selectedFile =
                            null;

                        reject(
                            normalizeFileError(
                                error
                            )
                        );
                    }
                };


            fallbackInput.click();
        }
    );
}


/* =========================================================
   READ SELECTED FILE
========================================================= */

export async function readSelectedFile() {

    if (!state.selectedFile) {

        throw new Error(
            "Please select a JSON file first."
        );
    }


    /*
     * If we have the real FileSystemFileHandle,
     * always obtain a fresh File object from it.
     */

    if (state.fileHandle) {

        try {

            const file =
                await state.fileHandle.getFile();


            if (!file) {

                throw new Error(
                    "Unable to access the selected file."
                );
            }


            state.selectedFile =
                file;


            return await file.text();


        } catch (error) {

            throw normalizeFileError(
                error
            );
        }
    }


    /*
     * Normal File object fallback.
     */

    try {

        return await state.selectedFile.text();

    } catch (error) {

        throw normalizeFileError(
            error
        );
    }
}


/* =========================================================
   GET CURRENT FILE FROM HANDLE
========================================================= */

export async function getCurrentFile() {

    if (!state.fileHandle) {

        return state.selectedFile || null;
    }


    try {

        const file =
            await state.fileHandle.getFile();


        state.selectedFile =
            file;


        return file;


    } catch (error) {

        throw normalizeFileError(
            error
        );
    }
}


/* =========================================================
   GET FILE HANDLE
========================================================= */

export function getFileHandle() {

    return (
        state.fileHandle ||
        null
    );
}


/* =========================================================
   CHECK WHETHER DIRECT UPGRADE IS AVAILABLE
========================================================= */

export function canUpgradeOriginalFile() {

    return (
        !!state.fileHandle &&
        typeof state.fileHandle.createWritable ===
            "function"
    );
}


/* =========================================================
   CHECK HANDLE VALIDITY
========================================================= */

export async function verifyFileHandle() {

    const handle =
        state.fileHandle;


    if (!handle) {

        return false;
    }


    if (
        typeof handle.getFile !==
        "function"
    ) {

        return false;
    }


    try {

        await handle.getFile();

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
   REQUEST WRITE PERMISSION
========================================================= */

export async function requestFileWritePermission() {

    const handle =
        state.fileHandle;


    if (!handle) {

        return false;
    }


    if (
        typeof handle.requestPermission !==
        "function"
    ) {

        /*
         * Some implementations do not expose
         * permission methods. createWritable()
         * will perform the actual permission check.
         */

        return (
            typeof handle.createWritable ===
            "function"
        );
    }


    try {

        const permission =
            await handle.requestPermission({
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
   CLEAR SELECTED FILE
========================================================= */

export function clearSelectedFile() {

    state.selectedFile =
        null;

    state.fileHandle =
        null;

    state.originalText =
        "";

    state.correctedText =
        "";

    state.parsedData =
        null;

    state.isValid =
        false;

    state.isRepaired =
        false;

    state.isFormatted =
        false;

    state.isUpgraded =
        false;
}


/* =========================================================
   FILE ERROR NORMALIZATION
========================================================= */

function normalizeFileError(
    error
) {

    if (
        error &&
        typeof error.message ===
            "string" &&
        error.message.length > 0
    ) {

        return new Error(
            error.message
        );
    }


    if (
        error &&
        error.name
    ) {

        return new Error(
            `File operation failed: ${error.name}`
        );
    }


    return new Error(
        "Unable to access the selected file."
    );
}


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {

    supportsFileSystemAccess,

    selectJSONFile,

    readSelectedFile,

    getCurrentFile,

    getFileHandle,

    canUpgradeOriginalFile,

    verifyFileHandle,

    requestFileWritePermission,

    clearSelectedFile

};
