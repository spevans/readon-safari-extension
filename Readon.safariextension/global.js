"use strict";


(function() {
    safari.application.addEventListener("available", availableHandler, true);
    safari.application.addEventListener("command", commandHandler, false);
    safari.application.addEventListener("menu", menuHandler, true);
    safari.application.addEventListener("message", messageHandler, false);


    var settingsTab;

    // Triggered if reader mode is available
    function availableHandler(event) {
        if (safari.extension.settings.disabled) {
            return;
        }
        if (event.target instanceof SafariReader) {
            var myReader = event.target;
            var url = myReader.tab.url;

            if (isDisabledURL(url)) {
                return;
            }
            myReader.enter();
        }
    }


    // Invoked just before menu is shown
    function menuHandler(event) {
        var url = safari.application.activeBrowserWindow.activeTab.url;

        var site = getSiteURL(url);
        var page = getPageURL(url);
        if (page.length > 57) {
            page = page.substring(0, 57) + '...';
        }

        var disable = disableLists();
        if (disable.page.indexOf(page) > -1) {
            menuItem('disablePage').title = 'Enable for page ' + page;
        } else {
            menuItem('disablePage').title = 'Disable for page ' + page;
        }

        if (disable.site.indexOf(site) > -1) {
            menuItem('disableSite').title = 'Enable for site ' + site;
        } else {
            menuItem('disableSite').title = 'Disable for site ' + site;
        }

        menuItem('toggleDisable').title = safari.extension.settings.disabled ? 'Enable Readon' : 'Disable Readon';
    }


    // Messages from the menu
    function commandHandler(event) {
        var tab = safari.application.activeBrowserWindow.activeTab;
        switch (event.command) {

        case 'disablePage':
            addToPageDisableList(tab.url);
            tab.reader.exit();
            break;

        case 'disableSite':
            addToSiteDisableList(tab.url);
            tab.reader.exit();
            break;


        case 'toggleDisable':
            toggleDisble(tab);
            break;

        case 'settings':
            showSettings();
            break;
        }
    }


    // Messages from the settings page
    function messageHandler(event) {
        switch (event.name) {
        case 'sendDisableLists':
            event.target.page.dispatchMessage('disableLists', disableLists());
            break;

        case 'addPageURL':
            addToPageDisableList(event.message);
            break;

        case 'addSiteURL':
            addToSiteDisableList(event.message);
            break;

        case 'removeURL':
            removeURL(event.message);
            break;
        }
    }


    function isDisabledURL(url) {
        var page = getPageURL(url);

        var disable = disableLists();
        if (disable.page.indexOf(page) > -1) {
            return true;
        }

        var site = getSiteURL(url);
        if (disable.site.indexOf(site) > -1) {
            return true;
        }

        return false;
    }


    function addToPageDisableList(url) {
        url = getPageURL(url);
        if (url === undefined || url === '') {
            return;
        }

        var disable = disableLists();
        if (disable.page.indexOf(url) === -1) {
            disable.page.push(url);
            saveDisableLists(disable);
        }
    }


    function addToSiteDisableList(url) {
        url = getSiteURL(url);
        if (url === undefined || url === '') {
            return;
        }

        var disable = disableLists();
        if (disable.site.indexOf(url) === -1) {
            disable.site.push(url);
            saveDisableLists(disable);
        }
    }


    function removeURL(url) {
        var disable = disableLists();

        var idx = disable.site.indexOf(url);
        while (idx > -1) {
            disable.site.splice(idx, 1);
            idx = disable.site.indexOf(url);
        }

        idx = disable.page.indexOf(url);
        while (idx > -1) {
            disable.page.splice(idx, 1);
            idx = disable.page.indexOf(url);
        }
        saveDisableLists(disable);
    }


    // Global disable/enable of Readon
    function toggleDisable(tab) {
        var item = menuItem('disableReadon');
        var disabled = safari.extension.settings.disabled;
        disabled = !disabled;
        safari.extension.settings.disabled = disabled;
        if (tab.reader.available) {
            if (!disabled) {
                tab.reader.enter();
            } else {
                tab.reader.exit();
            }
        }
    }


    function showSettings() {
        if (settingsTab === undefined || settingsTab.browserWindow === undefined) {
            settingsTab = safari.application.activeBrowserWindow.openTab("foreground");
        } else {
            settingsTab.activate();
        }
        settingsTab.url = safari.extension.baseURI + 'settings.html';
    }


    function menuItem(id) {
        var items = safari.extension.menus[0].menuItems;
        for (var i = 0; i < items.length; i++) {
            if (items[i].identifier === id) {
                return items[i];
            }
        }
    }


    function saveDisableLists(disable) {
        safari.extension.settings.disableList = disable;
        if (settingsTab !== undefined && settingsTab.page !== undefined ) {
            // update the settings page
            settingsTab.page.dispatchMessage('disableLists', disableLists());
        }
    }


    function disableLists() {
        var disable = safari.extension.settings.disableList || {};
        if (disable.page === undefined) disable.page = [];
        if (disable.site === undefined) disable.site = [];

        return disable;
    }


    // example.com/foo => example.com
    function getSiteURL(url) {
        url = getPageURL(url);
        url = url.replace(/\/.*/, '');
        return url;
    }


    // http://example.com/foo?a=b => example.com/foo
    function getPageURL(url) {
        // remove params
        url = url.split('?')[0];
        url = url.split('#')[0];

        // remove protocol
        url = url.replace(/^[^/]*\/\//, '');
    return url;
}
})();
