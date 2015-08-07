"use strict";


// Settings page

(function() {

    // if page is from the cache, reload it else we dont receive messages anymore
    if(event && event.persisted)
        window.location.reload();


    window.onload = function() {
        document.getElementById('addPage').addEventListener('click', addPageURL, false);
        document.getElementById('addSite').addEventListener('click', addSiteURL, false);
        document.getElementById('removeURL').addEventListener('click', removeURL, false);
        document.getElementById('removeAllURLs').addEventListener('click', removeAllURLs, false);
        safari.self.addEventListener("message", messageHandler, false);
        safari.self.tab.dispatchMessage("sendDisableLists", null);
    };


    function messageHandler(event) {
        if(event.name === "disableLists") {
            var element = document.getElementById('disabledURLs');
            element.innerHTML = '';

            var urls = event.message.page;
            for(var i = 0; i < urls.length; i++) {
                element.add(new Option(urls[i]));
            }

            urls = event.message.site;
            for(var i = 0; i < urls.length; i++) {
                element.add(new Option(urls[i]));
            }
        }
    }


    function removeURL() {
        removeURLs(false);
    }


    function removeAllURLs() {
        removeURLs(true);
    }


    function removeURLs(all) {
        var pages = document.getElementById('disabledURLs');

        for(var i = 0; i < pages.children.length; i++) {
            var child = pages.children[i];
            if (child.selected || all) {
                safari.self.tab.dispatchMessage("removeURL", child.value);
            }
        }
    }


    function addPageURL() {
        var e = document.getElementById('newURL');
        safari.self.tab.dispatchMessage('addPageURL', e.value.trim());
        e.value = '';
    }


    function addSiteURL() {
        var e = document.getElementById('newURL');
        safari.self.tab.dispatchMessage('addSiteURL', e.value.trim());
        e.value = '';
    }
})();
