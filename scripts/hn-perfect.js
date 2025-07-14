// ==UserScript==
// @name         HN Perfect
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Opens Hacker News links in a new tab.
// @author       You
// @match        https://news.ycombinator.com/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ycombinator.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    document.querySelectorAll('.titleline > a:first-child').forEach((a) => {
        a.target = '_blank';
    });
})();
