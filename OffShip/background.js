//function exampleFunction() {
//    chrome.tabs.executeScript(() => {
//        chrome.tabs.executeScript({ file: "content.js" })
//    })
//}

//document.addEventListener("DOMContentLoaded", () => {   

//    chrome.tabs.executeScript(() => {
//        chrome.tabs.executeScript({ file: "content.js" })
//    })
//})

//alert("background ran");


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.active) {

        //var span = document.createElement("span");
        //span.innerText = "This was added";
        //document.appendChild(span);

        //alert("The page has loaded");
    }
})

window.onload = function () {
    console.log("page load!");
    //alert("The page has loaded - onload");
}

//function onWindowLoad() {
//    chrome.tabs.executeScript(null, {
//        file: "content.js"
//    }, function () {
//        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
//        if (chrome.runtime.lastError) {
//            var span = document.createElement("span");           
//            span.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
//            document.appendChild(span);
//        }
//    });    
//}

//window.onload = onWindowLoad;