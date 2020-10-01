chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action == "getSource") {
        message.innerText = request.source;
    }

    if (request.action == "getProductDetails") {
        message.innerText = request.source;
    }

    if (request.action == "appendMessage") {
        message.innerHTML += request.source;
        //message.innerText += request.source;
        //console.log(request.source);
    }

    if (request.action == "appendBasketContent") {
        var tbl = document.getElementById("tblBasketClone");
        row = tbl.insertRow(tbl.rows.length);
        row.innerHTML = request.source;
    }

    if (request.action == "getBasketContent") {
        basketClone.innerHTML = request.source;
    }

    if (request.action == "openBuyOffset") {
        openCreditPage();
    }
});

function attachLinksForOffsets() {

    //document.getElementById("message").innerHTML += "What is this?";
    //var message = document.querySelector('#message');

    var list = document.getElementsByClassName("myOffsetButtonLink");

    //message.innerHTML += "Found myOffsetButtonLink:" + list.length;

    for (i = 0; i < list.length; i++) {
        list[i].addEventListener('click', openCreditPage);
    }
}

//chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {

//    if (msg.action == 'open_dialog_box') {
//        alert("Message recieved!");
//    }
//});

function printLocalStorage() {
    chrome.storage.local.get(null, function (data) {

        if (Object.keys(data).length === 0) {
            message.innerHTML += "Nothing in local storage";
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

    var message = document.querySelector('#message');
    var basketClone = document.querySelector('#basketClone');

    document.getElementById('btnShowCreditOptions').addEventListener('click', openCreditPage);
    document.getElementById('btnClearCache').addEventListener('click', clearLocalStorage);
    document.getElementById('btnShowCache').addEventListener('click', printLocalStorage);
    //document.getElementById('btnShowPageContent').addEventListener('click', printPageContent);
    document.getElementById("btnClearCache").style.display = "none";
    document.getElementById("btnShowCache").style.display = "none";
    //document.getElementById("actionDiv").style.display = "none";
    document.getElementById("btnShowPageContent").style.display = "none";

    chrome.tabs.executeScript(null, {
        file: "getPagesSource.js"
    }, function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
        }
    });

    chrome.tabs.executeScript(null, {
        file: "getBasketContent.js"
    }, function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
            if (chrome.runtime.lastError) {
                basketClone.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
            }
            else {
                attachLinksForOffsets();
            }
    });

    chrome.tabs.executeScript(null, {
        file: "getAppleBasketContent.js"
    }, function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
        }
    });
}

window.onload = onWindowLoad;