// ==UserScript==
// @name         excalidraw Font
// @namespace    http://tampermonkey.net/
// @version      2025-02-13
// @description  Replaces the default Excalidraw font with JasonHandwriting.
// @author       You
// @match        https://excalidraw.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=excalidraw.com
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const url =
        'https://cdn.jsdelivr.net/gh/max32002/JasonHandWritingFonts@20240409/webfont/JasonHandwriting1-Medium.woff2';

    GM_addStyle(`
@font-face {
    font-family: "Virgil";
    src: url(${url}) format("woff2");
}
    `);
})();
