"use strict";


export function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


export function formatBytes(bytes) {

    if (!Number.isFinite(bytes) || bytes < 0) {
        return "0 B";
    }

    if (bytes === 0) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];

    const index =
        Math.min(
            Math.floor(
                Math.log(bytes) / Math.log(1024)
            ),
            units.length - 1
        );

    return (
        bytes /
        Math.pow(1024, index)
    ).toFixed(
        index === 0 ? 0 : 2
    ) + " " + units[index];
}


export function countLines(text) {

    if (!text) {
        return 0;
    }

    return text.split(/\r\n|\r|\n/).length;
}


export function isJSONFilename(filename) {

    return /\.json$/i.test(filename);
}


export function safeParseJSON(text) {

    try {
        return {
            success: true,
            data: JSON.parse(text),
            error: null
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            error
        };
    }
}


export function delay(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}


export function getJSONType(value) {

    if (Array.isArray(value)) {
        return "Array";
    }

    if (value === null) {
        return "Null";
    }

    return (
        typeof value
            .charAt === "function"
            ? typeof value
            : typeof value
    )
        .replace(/^./, char =>
            char.toUpperCase()
        );
}


export function getItemCount(value) {

    if (Array.isArray(value)) {
        return value.length;
    }

    if (
        value !== null &&
        typeof value === "object"
    ) {
        return Object.keys(value).length;
    }

    return 1;
}


export function getByteLength(text) {

    return new Blob([text]).size;
}


export function isObject(value) {

    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    );
}
