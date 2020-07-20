chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action == "getSource") {
        message.innerText = request.source;        
    }

    if (request.action == "getBasketContent") {
        basketClone.innerHTML = request.source;        
        //basketClone.appendChild(request.source);
        //basketClone.appendChild(JSON.parse(request.source));

        //var tbl = document.createElement("TABLE");
        //row = tbl.insertRow(0);
        //var cell0 = row.insertCell(0);
        //cell0.innerText = "So this worked";

        //basketClone.appendChild(tbl);
    }
});

function onWindowLoad() {

    var message = document.querySelector('#message');    
    var basketClone = document.querySelector('#basketClone');    

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