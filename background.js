ZOOM_THRESHOLD = 2000;
ZOOM_LEVEL = 2;

function activated(activeInfo) {
    zoom(activeInfo.tabId);
}

function updated(tabId, changeInfo, tab) {
    zoom(tabId);
}

function zoom(tabId) {

    var getZoom = function(widths) {

        var setZoom = function(curZoom) {
            /* Firefox reports width adjusted for zoom, so 3840 x 2160 zoomed
             * 200% will be reported as 1920 x 1080. */
            realWidth = widths[0] * curZoom;
            if (realWidth > ZOOM_THRESHOLD) {
                browser.tabs.setZoom(tabId, ZOOM_LEVEL);
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

    var zoomTabs = function(window) {
        for (let tab of window.tabs) {
            zoom(tab.id);
        }
    }

    var getting = browser.windows.getCurrent({populate: true});
    getting.then(zoomTabs);
}

browser.tabs.onActivated.addListener(activated);
browser.tabs.onUpdated.addListener(updated);
browser.runtime.onMessage.addListener(resized);
