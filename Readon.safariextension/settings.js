// Settings page

function startUp(event) {
    // if page is from the cache, reload it else we dont receive messages anymore
    if(event && event.persisted)
        window.location.reload(); 

    safari.self.addEventListener("message", messageHandler, false);
    safari.self.tab.dispatchMessage("sendWhitelists", null);

}


function messageHandler(event) {
    if(event.name === "whitelists") {
        var pages = document.getElementById('whitelisted_pages');
        pages.innerHTML = '';

        var wl = event.message.page;
        for(var i = 0; i < wl.length; i++) {
            pages.add(new Option(wl[i]));
        }

        wl = event.message.site;
        var sites = document.getElementById('whitelisted_sites');
        for(var i = 0; i < wl.length; i++) {
            pages.add(new Option(wl[i]));
        }

    }
}


function removeURLs(all) {
    var pages = document.getElementById('whitelisted_pages');

    for(var i = 0; i < pages.children.length; i++) {
        var child = pages.children[i];
        if (child.selected || all) {
            safari.self.tab.dispatchMessage("removeURL", child.value);
        }
    }

    return true;
}


function addPageURL() {
    var e = document.getElementById('new_url');
    safari.self.tab.dispatchMessage('addPageURL', e.value.trim());
    e.value = '';

    return true;
}


function addSiteURL() {
    var e = document.getElementById('new_url');
    safari.self.tab.dispatchMessage('addSiteURL', e.value.trim());
    e.value = '';

    return true;
}
