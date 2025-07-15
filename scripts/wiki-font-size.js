// ==UserScript==
// @name         Wiki FontSize
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Change Wiki FontSize!
// @author       iamgqb
// @match        https://**.wikipedia.org/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wikipedia.org
// @updateURL    https://raw.githubusercontent.com/iamgqb/user-scripts/refs/heads/master/scripts/wiki-font-size.js
// @downloadURL  https://raw.githubusercontent.com/iamgqb/user-scripts/refs/heads/master/scripts/wiki-font-size.js
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const container = document.querySelector('.vector-user-links');
    if (!container) {
        return;
    }

    const FONT_SIZE_STORAGE_KEY = 'gm_font_size';
    const htmlEle = document.documentElement;
    let currentSize =
        Number(localStorage.getItem(FONT_SIZE_STORAGE_KEY)) || 100;

    function setSize(size) {
        htmlEle.style.fontSize = `${size}%`;
        localStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
    }

    const controls = document.createElement('div');
    controls.className = 'gm_font_size_change';
    controls.innerHTML = `
        <span class="gm_font_size_up" role="button" aria-label="Increase font size">A<sup>+</sup></span>
        <span class="gm_font_size_down" role="button" aria-label="Decrease font size">A<sup>-</sup></span>
    `;
    container.prepend(controls);

    GM_addStyle(`
        .gm_font_size_up, .gm_font_size_down {
            cursor: pointer;
            margin: 0 10px;
        }
    `);

    controls.addEventListener('click', (event) => {
        const target = event.target.closest('span');
        if (!target) return;

        if (target.classList.contains('gm_font_size_up')) {
            currentSize += 5;
        } else if (target.classList.contains('gm_font_size_down')) {
            currentSize -= 5;
        }
        setSize(currentSize);
    });

    setSize(currentSize);
})();
