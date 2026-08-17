"use strict";

import {
    getCorrectedFilename
} from "./filename.js";


export function downloadJSON(
    text,
    originalFilename
) {

    if (!text) {

        throw new Error(
            "There is no corrected JSON to download."
        );
    }

    const blob =
        new Blob(
            [text],
            {
                type:
                    "application/json;charset=utf-8"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download =
        getCorrectedFilename(
            originalFilename
        );

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    setTimeout(
        () => URL.revokeObjectURL(url),
        1000
    );
}
