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
    }

    if (request.action == "appendBasketContent") {
        //basketClone.innerHTML += request.source;
        //message.innerText += request.source;
        var tbl = document.getElementById("tblBasketClone");
        row = tbl.insertRow(0);
        //var cell0 = row.insertCell(0);
        //cell0.innerHTML = request.source;
        row.innerHTML = request.source;
        //row.innerText = request.source;

        //`<table><tr><td colspan='4'>Found ${count} items:</td></tr> ${strItems}<tr><td colspan='4'></td>${postalCode}</tr></table>`;
    }

    if (request.action == "getBasketContent") {
        basketClone.innerHTML = request.source;
    }
});

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

function onWindowLoad() {

    var message = document.querySelector('#message');
    var basketClone = document.querySelector('#basketClone');

    document.getElementById('btnClearCache').addEventListener('click', clearLocalStorage);
    document.getElementById('btnShowCache').addEventListener('click', printLocalStorage);
    document.getElementById("actionDiv").style.display = "none";

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
    });
}

window.onload = onWindowLoad;