"use strict";

import {
    getByteLength,
    countLines,
    getJSONType,
    getItemCount
} from "./utils.js";


export function calculateStatistics(
    file,
    text,
    data
) {

    return {

        filename:
            file?.name || "",

        size:
            file?.size ||
            getByteLength(text),

        characters:
            text.length,

        lines:
            countLines(text),

        jsonType:
            getJSONType(data),

        items:
            getItemCount(data)
    };
}
