// clone defaults from globals.js
zoomThreshold = DEFAULT_ZOOM_THRESHOLD.valueOf();
zoomFactor = DEFAULT_ZOOM_FACTOR.valueOf();
ENABLED = true;

function activated(activeInfo) {
    if (ENABLED) {
        zoom(activeInfo.tabId);
    }
}

function updated(tabId, changeInfo, tab) {
    if (ENABLED) {
        zoom(tabId);
    }
}

function zoom(tabId) {

    var getZoom = function(widths) {

        var setZoom = function(curZoom) {
            /* Firefox reports width adjusted for zoom, so 3840 x 2160 zoomed
             * 200% will be reported as 1920 x 1080. */
            realWidth = widths[0] * curZoom;
            if (realWidth > zoomThreshold) {
                browser.tabs.setZoom(tabId, zoomFactor);
            } else {
                browser.tabs.setZoom(tabId, 1);
            }
        }

        getting = browser.tabs.getZoom(tabId);
        getting.then(setZoom);
    }

    executing = browser.tabs.executeScript(tabId, {
        /* Here we need to execute in the page itself, since only the Web API
         * window [1] (which is NOT the same as the WebExtension window [2])
         * knows about the screen resolution.
         *
         * [1] https://developer.mozilla.org/en-US/docs/Web/API/Window
         * [2] https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/windows
         */
        code: 'window.screen.width;',
    });
    executing.then(getZoom);
}

function resized() {

    if (ENABLED) {
        var zoomTabs = function(window) {
            for (let tab of window.tabs) {
                zoom(tab.id);
            }
        }

        var getting = browser.windows.getCurrent({populate: true});
        getting.then(zoomTabs);
    }
}

function disable() {
    browser.browserAction.setIcon({path: "icons/disabled.svg"})
    browser.browserAction.setTitle({title: "ffreszoom (off)"})
    ENABLED = false;
}

function enabled() {
    browser.browserAction.setIcon({path: "icons/enabled.svg"})
    browser.browserAction.setTitle({title: "ffreszoom (on)"})
    ENABLED = true;
}

function toggle() {
    if (ENABLED) {
        disable();
    } else {
        enabled();
    }
}

function updateConstsFromSync(item) {
    if (item) {
        if (item.zoomFactor) {
            zoomFactor = item.zoomFactor;
        }
        if (item.zoomThreshold) {
            zoomThreshold = item.zoomThreshold;
        }
    }
}

function setZoomFactor(newZoomFactor) {
    zoomFactor = newZoomFactor;
}

function setZoomThreshold(newZoomThreshold) {
    zoomThreshold = newZoomThreshold;
}

// init

var getting = browser.storage.sync.get(["zoomFactor", "zoomThreshold"]);
getting.then(updateConstsFromSync);

browser.browserAction.onClicked.addListener(toggle);
browser.tabs.onActivated.addListener(activated);
browser.tabs.onUpdated.addListener(updated);
browser.runtime.onMessage.addListener(resized);
