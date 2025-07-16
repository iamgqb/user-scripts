// ==UserScript==
// @name         Pub Helper
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Pub Helper
// @author       iamgqb
// @match        https://pub.qunhequnhe.com/app*
// @icon         https://qhstaticssl.kujiale.com/newt/6/image/png/1556507831007/F49F6485A292B0A052193D030DE8DA8C.png
// @updateURL    https://raw.githubusercontent.com/iamgqb/user-scripts/refs/heads/master/scripts/pub-helper.js
// @downloadURL  https://raw.githubusercontent.com/iamgqb/user-scripts/refs/heads/master/scripts/pub-helper.js
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    /**
     * 这是一个用来收藏当前节点的嵌入功能
     * 0. 首先设计存储的数据结构（dataBase），它的格式是 json，如下形式的数组，它最终会存储在 localStorage 中
     * [{ id: string, name: string }]
     *
     * 1. 整个页面是动态加载的，因此需要通过 MutationObserver 来监听网页的变化
     * 1.1 监听页面中 span[id=name] 的元素，记为 targetEle
     * 1.2 当出现 targetEle 时，获取它的 value 属性，记录为 targetName
     * 1.3 url 中可以获取 id，它会以 fc_{number} 的形式存在，记录为 targetId
     * 1.4 在 targetEle 追加一个按钮，当 targetId 存在于 dataBase 时显示 已收藏，不存在时显示 收藏
     * 1.5 点击这个按钮后会在 dataBase 中追加 或 删除一条内容，取决于当前 targetId 是否存在于 dataBase，点击后需更新文字
     * 1.6 dataBase 应实时更新存储到 localStorage
     *
     * 2. 在 [div.user-info button] 的前面添加一个下拉菜单
     * 2.1 这个菜单中显示的为 dataBase 中 name
     * 2.2 当点击 name 时，根据 id，会将当前 url 改写为 https://pub.qunhequnhe.com/app#/${id}/config. 你可以观察到只需修改 # 后面的 hash 内容即可
     * 2.3 下拉菜单 hover 即显示
     */

    const DB_KEY = 'pub-helper-favorites';
    let dataBase = [];

    // --- Database Functions ---
    function loadDB() {
        const storedData = localStorage.getItem(DB_KEY);
        dataBase = storedData ? JSON.parse(storedData) : [];
    }

    function saveDB() {
        localStorage.setItem(DB_KEY, JSON.stringify(dataBase));
    }

    function isFavorite(id) {
        return dataBase.some((item) => item.id === id);
    }

    function addFavorite(item) {
        if (!isFavorite(item.id)) {
            dataBase.push(item);
            dataBase.sort((a, b) => a.name.localeCompare(b.name));
            saveDB();
        }
    }

    function removeFavorite(id) {
        dataBase = dataBase.filter((item) => item.id !== id);
        dataBase.sort((a, b) => a.name.localeCompare(b.name));
        saveDB();
    }

    // --- URL Helper ---
    function getIdFromUrl() {
        const match = window.location.hash.match(/#\/(fc_\d+)/);
        return match ? match[1] : null;
    }

    // --- UI Elements ---
    let dropdownContent;

    function updateDropdown() {
        if (!dropdownContent) return;
        dropdownContent.innerHTML = ''; // Clear existing items
        if (dataBase.length === 0) {
            const noItem = document.createElement('a');
            noItem.textContent = '暂无收藏';
            noItem.style.cssText =
                'padding: 8px 12px; display: block; color: #888; cursor: default;';
            dropdownContent.appendChild(noItem);
        } else {
            dataBase.forEach((item) => {
                const link = document.createElement('a');
                link.textContent = item.name;
                link.href = '#';
                link.onclick = (e) => {
                    e.preventDefault();
                    location.hash = `/${item.id}/config`;
                };
                link.style.cssText =
                    'display: inline-block; padding: 3px 8px; margin: 2px; text-decoration: none; color: #333; border-radius: 3px; font-size: 12px; white-space: nowrap; line-height: 1.6';
                link.onmouseover = () =>
                    (link.style.backgroundColor = '#f1f1f1');
                link.onmouseout = () =>
                    (link.style.backgroundColor = 'transparent');
                dropdownContent.appendChild(link);
            });
        }
    }

    function createDropdownMenu() {
        const userInfo = document.querySelector('div.user-info');
        if (
            !userInfo ||
            document.getElementById('favorites-dropdown-container')
        )
            return;

        const dropdownContainer = document.createElement('div');
        dropdownContainer.id = 'favorites-dropdown-container';
        dropdownContainer.style.cssText =
            'position: relative; display: inline-block; margin-right: 10px;';

        const dropdownButton = document.createElement('button');
        dropdownButton.textContent = '我的收藏';
        dropdownButton.className = 'ant-btn'; // Use existing button class for styling
        dropdownContainer.appendChild(dropdownButton);

        dropdownContent = document.createElement('div');
        dropdownContent.style.cssText =
            'display: none; position: absolute; background-color: #f9f9f9; min-width: 160px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); z-index: 100; right: 0; border-radius: 4px; padding: 5px; line-height: 1';
        dropdownContainer.appendChild(dropdownContent);

        dropdownContainer.onmouseover = () =>
            (dropdownContent.style.display = 'block');
        dropdownContainer.onmouseout = () =>
            (dropdownContent.style.display = 'none');

        const firstButton = userInfo.querySelector('button');
        if (firstButton && firstButton.parentNode) {
            firstButton.parentNode.insertBefore(dropdownContainer, firstButton);
        }

        updateDropdown();
    }

    // --- Favorite Button Logic ---
    function addOrUpdateFavoriteButton() {
        const targetEle = document.querySelector('span[id=name]');
        const existingBtn = document.getElementById('favorite-btn');

        if (!targetEle) {
            if (existingBtn) existingBtn.remove();
            return;
        }

        if (existingBtn) {
            existingBtn.remove();
        }

        const targetId = getIdFromUrl();
        if (!targetId) return;

        const targetName = targetEle.textContent;

        const button = document.createElement('button');
        button.id = 'favorite-btn';
        button.style.marginLeft = '10px';
        button.className = 'ant-btn';

        function updateButtonState() {
            const isFav = isFavorite(targetId);
            button.textContent = isFav ? '已收藏' : '收藏';
            if (isFav) {
                button.classList.add('ant-btn-primary');
            } else {
                button.classList.remove('ant-btn-primary');
            }
        }

        updateButtonState();

        button.onclick = () => {
            if (isFavorite(targetId)) {
                removeFavorite(targetId);
            } else {
                addFavorite({ id: targetId, name: targetName });
            }
            updateButtonState();
            updateDropdown();
        };

        targetEle.parentNode.insertBefore(button, targetEle.nextSibling);
    }

    // --- Initialization and Observers ---
    function initialize() {
        loadDB();
        createDropdownMenu();

        const observer = new MutationObserver((mutations, obs) => {
            obs.disconnect();

            addOrUpdateFavoriteButton();
            createDropdownMenu();

            obs.observe(document.body, {
                childList: true,
                subtree: true,
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        window.addEventListener('hashchange', () => {
            setTimeout(addOrUpdateFavoriteButton, 500);
        });
    }

    const readyObserver = new MutationObserver((mutations, obs) => {
        if (document.querySelector('div.user-info button')) {
            initialize();
            obs.disconnect();
        }
    });

    readyObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();
