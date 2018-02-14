/* While WebExtention background scripts do have a window global [1], that
 * window does not seem to ever fire 'resize' events. Therefore, we add a
 * listener here, and send a message to our background script that we've been
 * resized. This is how we detect a Firefox window moving from one screen to
 * another.
 *
 * [1] https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Anatomy_of_a_WebExtension#Background_scripts
 */

function resized() {
    browser.runtime.sendMessage('resize');
}

window.addEventListener('resize', resized);
