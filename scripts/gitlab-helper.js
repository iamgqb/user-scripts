// ==UserScript==
// @name         gitlab helper
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  gitlab helper
// @author       iamgqb
// @match        https://gitlab.qunhequnhe.com/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gitlab.com
// @updateURL    https://raw.githubusercontent.com/iamgqb/user-scripts/refs/heads/master/scripts/gitlab-helper.js
// @downloadURL  https://raw.githubusercontent.com/iamgqb/user-scripts/refs/heads/master/scripts/gitlab-helper.js
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    /**
     * 1. 从 window.location.href 提取路径
     * 1.1 确保 href 符合 https://gitlab.qunhequnhe.com/{anypaht}/merge_requests/{number}/{otherpath} 的形式，否则停止
     * 1.2 从 href 中提取出 targetUrl, 如下 https://gitlab.qunhequnhe.com/{anypaht}/merge_requests/{number}
     *
     * 2 在页面第一个 div.detail-page-description 中寻找 a 标签的 title 符合 revert-{number} 或者 cherry-pick-{number} 的形式
     * 2.1 如果找不到则停止，不再执行下面的逻辑
     *
     * 3 请求 ${targetUrl}/commits.json
     * 3.1 这个请求会返回一个 {html: string} 这样的 json，html 属性中的值是一段 html 字符串片段
     * 3.2 我需要从中提取出第一个带有 data-merge-request 的 a 标签，定义为 targetAnchor
     * 3.3 取出 targetAnchor 的 href，定义为 targetMr
     *
     * 4 在页面第一个 div.detail-page-description 的最后添加一个 a 标签，内容为 (View Origin MR)，指向链接为 targetMr
     **/

    const href = window.location.href;
    const mrRegex =
        /(https:\/\/gitlab.qunhequnhe.com\/.*\/merge_requests\/\d+)/;
    const match = href.match(mrRegex);

    if (!match) {
        return;
    }

    const targetUrl = match[1];

    const descriptionDiv = document.querySelector(
        'div.detail-page-description'
    );
    if (!descriptionDiv) {
        return;
    }

    const commitLink = descriptionDiv.querySelector(
        'a[title*="revert-"], a[title*="cherry-pick-"]'
    );
    if (!commitLink) {
        return;
    }

    const commitsUrl = `${targetUrl}/commits.json`;

    fetch(commitsUrl)
        .then((response) => response.json())
        .then((data) => {
            if (data && data.html) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.html, 'text/html');
                const targetAnchor = doc.querySelector('a[data-merge-request]');

                if (targetAnchor) {
                    const targetMr = targetAnchor.href;
                    const newAnchor = document.createElement('a');
                    newAnchor.href = targetMr;
                    newAnchor.textContent = ' (View Origin MR)';
                    newAnchor.target = '_blank';
                    newAnchor.style.marginLeft = '4px';

                    descriptionDiv.appendChild(newAnchor);
                }
            }
        })
        .catch((error) => console.error('Error fetching commits:', error));
})();
