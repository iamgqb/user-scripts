// ==UserScript==
// @name         gitlab helper
// @namespace    http://tampermonkey.net/
// @version      0.1
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
     * 2 从 document 中的 a 标签中提取 commit id
     * 2.1 从 document 中提取所有带有 title 的 a 标签
     * 2.2 获取 targetAnchor，为 a 标签的 title 符合 revert-{number} 或者 cherry-pick-{number} 的形式
     * 2.3 提取这个number 为 commitId
     *
     * 3 拼接 URL 并获取结果
     * 3.1 拼接 fetchUrl 为 `${url}/context_commits.json?search=${commitId}&per_page=40`
     * 3.2 通过 fetch 请求结果, 结果为 json 格式的数组
     * 3.3 获取数组的第一项，如果存在，获取它的 commit_url
     *
     * 4 在 targetAnchor 后添加一个 a 标签，href 为 commit_url
     **/

    const href = window.location.href;
    const mrRegex =
        /(https:\/\/gitlab.qunhequnhe.com\/.*\/merge_requests\/\d+)/;
    const match = href.match(mrRegex);

    if (!match) {
        return;
    }

    const targetUrl = match[1];

    const anchors = Array.from(document.querySelectorAll('a[title]'));
    const commitRegex = /(?:revert|cherry-pick)-(\w+)/;
    let targetAnchor = null;
    let commitId = null;

    for (const anchor of anchors) {
        const titleMatch = anchor.title.match(commitRegex);
        if (titleMatch) {
            targetAnchor = anchor;
            commitId = titleMatch[1];
            break;
        }
    }

    if (!commitId || !targetAnchor) {
        return;
    }

    const fetchUrl = `${targetUrl}/context_commits.json?search=${commitId}&per_page=40`;

    fetch(fetchUrl)
        .then((response) => response.json())
        .then((data) => {
            if (data && data.length > 0) {
                const commitUrl = data[0].commit_url;
                if (commitUrl) {
                    const newAnchor = document.createElement('a');
                    newAnchor.href = commitUrl;
                    newAnchor.textContent = ' (View Origin Commit)';
                    newAnchor.target = '_blank';
                    targetAnchor.parentNode.insertBefore(
                        newAnchor,
                        targetAnchor.nextSibling
                    );
                }
            }
        })
        .catch((error) => console.error('Error fetching commit URL:', error));
})();
