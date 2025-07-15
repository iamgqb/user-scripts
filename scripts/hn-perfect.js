// ==UserScript==
// @name         HN Perfect
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Opens Hacker News links in a new tab.
// @author       iamgqb
// @match        https://news.ycombinator.com/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ycombinator.com
// @updateURL    https://raw.githubusercontent.com/iamgqb/user-scripts/refs/heads/master/scripts/hn-perfect.js
// @downloadURL  https://raw.githubusercontent.com/iamgqb/user-scripts/refs/heads/master/scripts/hn-perfect.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    document.querySelectorAll('.titleline > a:first-child').forEach((a) => {
        a.target = '_blank';
    });
})();
