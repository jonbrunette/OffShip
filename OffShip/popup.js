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
    var id = "blah";
    var newURL = `chrome-extension://${chrome.runtime.id}/buyoffset.html?productId=${id}`;
    window.open(newURL);
}

function removeItem() {
    var id = event.target.getAttribute("item-id");
    removeProductInLocalCache(id);
    var row = document.getElementById("tr" + id);

    console.log(`Request to remove: ${id}`);

    //TODO: Remove completely not just hide
    if (typeof row !== 'undefined' && row != null)
        row.style.display = "none";
}

function gotoItem() {
    var productUrl = event.target.getAttribute("href");
    //removeProductInLocalCache(id);
    //var row = document.getElementById("tr" + id);

    ////TODO: Remove completely not just hide
    //if (typeof row !== 'undefined')
    //    row.style.display = "none";

    window.open(productUrl);
}

function onWindowLoad() {

    var message = document.querySelector('#message');
    var basketClone = document.querySelector('#basketClone');

    document.getElementById('btnShowCreditOptions').addEventListener('click', openCreditPage);
    //document.getElementById('btnShowPageContent').addEventListener('click', printPageContent);
    //document.getElementById("actionDiv").style.display = "none";
    document.getElementById("btnShowPageContent").style.display = "none";

    chrome.tabs.executeScript(null, {
        file: "StoreScripts/CommonBasket.js"
    }, function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
        }
    });

    chrome.tabs.executeScript(null, {
        file: "getPagesSource.js"
    }, function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
        }
    });

    chrome.tabs.executeScript(null, {
        file: "StoreScripts/getAmazonBasketContent.js"
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
        file: "StoreScripts/getAppleBasketContent.js"
    }, function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
        }
    });

    chrome.tabs.executeScript(null, {
        file: "StoreScripts/getBestBuyBasketContent.js"
    }, function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
        }
    });

    loadSummaryFromCache();
}

function addRemoveItemClickHandlers() {

    var buttonList = document.getElementsByClassName("removeButton");

    if (buttonList === 'undefined' || buttonList.length == 0)
        return;

    for (var i = 0; i < buttonList.length; i++) {
        buttonList[i].addEventListener('click', removeItem);
    }
}

function addItemLinkClickHandlers() {

    var buttonList = document.getElementsByClassName("itemLink");

    if (buttonList === 'undefined' || buttonList.length == 0)
        return;

    for (var i = 0; i < buttonList.length; i++) {
        buttonList[i].addEventListener('click', gotoItem);
    }
}

function loadSummaryFromCache() {
    chrome.storage.local.get(null, function (data) {

        if (Object.keys(data).length === 0) {
            return;
        }

        var count = 0;
        var str = "";
        
        for (var k in data) {
            str += "<p>Found [" + k + "," + data[k] + "]</p>";
            try {

                if (!data[k].startsWith("{"))
                    continue;

                var product = JSON.parse(data[k]);

                if (typeof product === 'undefined') {
                    sendError(this, data[k], "Could not parse product");
                    continue;
                }

                if(product.inCart == "y") {
                    count++;

                    var rowStr = formatItemRow(product);
                    
                    var tbl = document.getElementById("tblBasketClone");
                    row = tbl.insertRow(tbl.rows.length);
                    row.id = "tr" + product.id;
                    row.innerHTML = rowStr;
                }
            }
            catch (err) {
                console.error("Error in loading products: " + err);
            }
        }

        addRemoveItemClickHandlers();
        addItemLinkClickHandlers();
    });
}

window.onload = onWindowLoad;