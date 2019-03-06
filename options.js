function saveOptions(e) {
    e.preventDefault();
    var newZoomFactor = parseFloat(document.querySelector("#zoomFactor").value);
    var newZoomThreshold = parseInt(document.querySelector("#zoomThreshold").value);
    browser.storage.sync.set({
        zoomFactor: newZoomFactor,
        zoomThreshold: newZoomThreshold
    });
    // update "constants" in background.js, bypassing sync storage
    var gettingBackground = browser.runtime.getBackgroundPage();
    gettingBackground.then(function (page) {
        page.setZoomFactor(newZoomFactor);
        page.setZoomThreshold(newZoomThreshold);
        page.resized();
    });
}

function restoreOptions() {
    function setFieldValues(result) {
        // defaults from globals.js
        document.querySelector("#zoomFactor").value = result.zoomFactor || DEFAULT_ZOOM_FACTOR;
        document.querySelector("#zoomThreshold").value = result.zoomThreshold || DEFAULT_ZOOM_THRESHOLD;
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    var getting = browser.storage.sync.get(["zoomFactor", "zoomThreshold"]);
    getting.then(setFieldValues, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);