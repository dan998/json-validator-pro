"use strict";


export function getOriginalFilename(file) {

    if (!file) {
        return "";
    }

    return file.name;
}


export function getCorrectedFilename(filename) {

    if (!filename) {
        return "corrected.json";
    }

    return filename.replace(
        /\.json$/i,
        "-corrected.json"
    );
}


export function getFilenameWithoutExtension(
    filename
) {

    return filename.replace(
        /\.json$/i,
        ""
    );
}


export function getExtension(filename) {

    const match =
        filename.match(
            /(\.[^./\\]+)$/
        );

    return match
        ? match[1]
        : "";
}


export function isJSONFilename(filename) {

    return /\.json$/i.test(filename);
}
