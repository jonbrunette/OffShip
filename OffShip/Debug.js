chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action == "getSource") {
        message.innerText = request.source;
    }

    if (request.action == "getProductDetails") {
        message.innerText += request.source;
    }

    if (request.action == "appendMessage") {
        message.innerHTML += request.source;
        //message.innerText += request.source;
        //console.log(request.source);
    }

    if (request.action == "getBasketContent") {
        message.innerHTML = request.source;
    }
});

function printLocalStorage() {
    chrome.storage.local.get(null, function (data) {

        message.innerText = "";

        if (Object.keys(data).length === 0) {
            if (message.innerText === "")
                message.innerText += "Nothing in local storage";
            else
                message.innerText += " Nothing in local storage";
        }

        for (var k in data) {
            message.innerHTML += "<p>Found [" + k + "," + data[k] + "]</p>";
        }
    });
}

function clearLocalStorage() {
    chrome.storage.local.clear(function () {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
        else {
            console.log("Cleared local cache");
            message.innerHTML = "";
        }
    });
}

function openCreditPage() {
    var asin = "blah";
    var newURL = `chrome-extension://${chrome.runtime.id}/buyoffset.html?productId=${asin}`;
    //chrome.tabs.create({ url: newURL });
    //window.open(`chrome-extension://${chrome.runtime.id}/buyoffset.html?productId=${asin}`);
    //window.open(`buyoffset.html?productId=${asin}`);
    window.open(newURL);

    //chrome.tabs.create({ 'url': chrome.extension.getURL(newURL) }, function (tab) {
    //    // Tab opened.
    //});
}

function onWindowLoad() {

    document.getElementById('btnShowCreditOptions').addEventListener('click', openCreditPage);
    document.getElementById('btnClearCache').addEventListener('click', clearLocalStorage);
    document.getElementById('btnShowCache').addEventListener('click', printLocalStorage);
    //document.getElementById('btnShowPageContent').addEventListener('click', printPageContent); //TODO: import printPageContent
}

window.onload = onWindowLoad;