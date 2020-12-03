//import { title } from "process";

window.onload = function () {
    console.log("Page load: " + window.location.href);

    chrome.storage.onChanged.addListener(function (changes, namespace) {
        for (var key in changes) {
            var storageChange = changes[key];
            console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
        }
    });

    AddActionLinksToPage(document);
    getPostalCode();
    runScrapperForSelectSites();
}

function getPostalCode() {
    locDiv = document.getElementById('nav-global-location-slot');

    if (typeof itemContentList === 'undefined')
        return "<unknown>";

    var loc = locDiv.getElementsByClassName("nav-line-2")[0].innerText.trim();

    var storage = chrome.storage.local;
    var obj = {};
    obj["location"] = loc;
    storage.set(obj);

    return loc;
}

function openCarbonOffset(event) {
    var clickedElement = event.target;
    var asin = clickedElement.getAttribute("product-id");

    var postal = getPostalCode();

    var newURL = `chrome-extension://${chrome.runtime.id}/buyoffset.html?productId=${asin}`;
    //chrome.tabs.create({ url: newURL });
    //window.open(`chrome-extension://${chrome.runtime.id}/buyoffset.html?productId=${asin}`);
    //window.open(`buyoffset.html?productId=${asin}`);

    //chrome.tabs.create({ 'url': chrome.extension.getURL(newURL) }, function (tab) {
    //    // Tab opened.
    //});

    //chrome.tabs.create({ 'url': chrome.extension.getURL(newURL) });
    //chrome.tabs.create({ 'url': "chrome://newtab"});
    //chrome.runtime.sendMessage({ action: "openBuyOffset" }, function (response) {
        
    //});

    //chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //    chrome.tabs.sendMessage(tabs[0].id, { action: "openBuyOffset" }, function (response) { });
    //});

    //chrome.tabs.query({ active: true }, function (tabs) {
    //    chrome.tabs.sendMessage(tab.id, { action: "openBuyOffset" }, function (response) { });
    //});    
}

//window.onload = onWindowLoad;
function addActionLink(actionListDiv, asin) {

    //sc-list-item-content ->  sc-action-links
    itemActionList = actionListDiv.getElementsByClassName("sc-action-links");

    if (itemActionList[0].hasAttribute("carbon-link-added"))
        return;

    var iSeperator = document.createElement("i");
    iSeperator.setAttribute("class", "a-icon a-icon-text-separator sc-action-separator");
    iSeperator.setAttribute("role", "img");
    iSeperator.setAttribute("aria-label", "|");

    var span = document.createElement("span");
    span.setAttribute("class", "a-declarative a-size-small");
    //span.setAttribute("data-action", "sc-item-action");

    var inputBtn = document.createElement("input");    
    inputBtn.setAttribute("class", "a-declarative offsetButtonLink");
    inputBtn.setAttribute("type", "button");
    inputBtn.setAttribute("value", "Buy carbon offset for the planet");    
    inputBtn.setAttribute("product-id", asin);
    inputBtn.addEventListener('click', openCarbonOffset);

    span.appendChild(inputBtn);

    //<span class="a-declarative" data-action="sc-item-action" data-sc-item-action="{&quot;itemID&quot;:&quot;Ca18d74e1-3666-4942-a4af-25d51b43d83d&quot;,&quot;itemType&quot;:&quot;active&quot;,&quot;isWishListItem&quot;:0,&quot;action&quot;:&quot;save-for-later&quot;,&quot;isFresh&quot;:0}">
    //    <input aria-label="Save for later Baratza Sette 270Wi-Grind by Weight Conical Burr Grinder" data-action="save-for-later" name="submit.save-for-later.Ca18d74e1-3666-4942-a4af-25d51b43d83d" type="submit" value="Save for later">
    // </span>
    //var textnode = document.createTextNode("Buy Carbon Offset for the planet");         // Create a text node

    itemActionList[0].setAttribute("carbon-link-added", "true");
    itemActionList[0].appendChild(iSeperator);
    itemActionList[0].appendChild(span);

    return;
}

function AddActionLinksToPage(document_root) {

    //Applies to amazon only
    var list = document_root.getElementsByClassName("sc-list-body");
    
    try {
        for (i = 0; i < list.length; i++) {
            if (list[i].hasAttribute("data-name") && list[i].getAttribute("data-name") == "Active Items") {

                innerList = list[i].getElementsByClassName("sc-list-item");

                if (typeof innerList === 'undefined' || innerList.length == 0)
                    continue;

                for (j = 0; j < innerList.length; j++) {
                    try {
                        itemContentList = innerList[j].getElementsByClassName("sc-list-item-content");

                        if (typeof itemContentList === 'undefined' || itemContentList.length == 0)
                            continue;

                        var asin = innerList[j].getAttribute("data-asin");
                        addActionLink(itemContentList[0], asin);
                    }
                    catch (innerErr) {
                        console.log("Error in adding ActionLink: " + innerErr.message);
                        return "Error in adding ActionLink: " + innerErr.message;
                    }
                }
            }
        }

        console.log("Finished adding action links");
    }
    catch (err) {
        console.log(err.message);
        return err.message;
    }
}

function runScrapperForSelectSites() {
    if (window.location.hostname.toLocaleLowerCase().includes("bestbuy.")) {
        extractBestBuyProductData(document);
    }
}

function extractBestBuyProductData(doc) {

    var weight = 0;
    var height = "";
    var width = "";
    var dimentions = "";

    var detailsDivs = doc.getElementsByClassName('productInfoContainer_2mCHp');

    if (typeof detailsDivs === 'undefined') {
        //TODO: Implement sendError not available in this scope
        //sendError(window.location.href, err.message, "Error in extractBestBuyProductData");
        console.log("Error in extractBestBuyProductData");
        return;
    }

    var detailsDiv;

    for (i = 0; i < detailsDivs.length; i++){
        if (detailsDivs[i].id == "detailsAndSpecs") {
            detailsDiv = detailsDivs[i];
            break;
        }
    }

    ////Class->class->class
    //// productInfoContainer_2mCHp -> itemContainer_20kXj -> itemName_37zd4 -> itemValue_XPfaq
    var containers = detailsDiv.getElementsByClassName("itemContainer_20kXj");

    try {
        for (i = 0; i < containers.length; i++) {
            title = containers[i].getElementsByClassName("itemName_37zd4")[0].innerHTML;
            value = containers[i].getElementsByClassName("itemValue_XPfaq")[0].innerHTML;

            //TODO: Language 
            if (title == "Weight" || title == "Weight (lbs)" || title == "Weight with Stand")
                weight = value;

            if (title == "Height" || title == "Height with Stand") {
                height = value;
                dimentions = width + "x" + height;
            }

            if (title == "Width" || title == "Width with Stand") {
                width = value;
                dimentions = width + "x" + height;
            }

            if (title == "Dimensions (cm)")
                dimentions = value;
        }
    }
    catch (err) {
        console.log(err.message);
        return err.message;
    }

    //var sku = getSku(document);
    var sku = document.getElementById("sku").value;
    var imgSrc = getImage(document);
    var price = document.getElementsByClassName("screenReaderOnly_3anTj")[0].innerText;

    if (price.startsWith("$"))
        price = parseFloat(price.substring(1, price.length)).toFixed(2);

    var item = { store: "BestBuy", asin: sku, description: document.title, link: window.location.href, imgSrc: imgSrc, price: price, weight: weight, dimentions: dimentions };
    updateFullProductInLocalCache(item);

    return { weight: weight, dimentions: dimentions };
}

function updateFullProductInLocalCache(item) {
    var strProduct = JSON.stringify(item);

    //Update in local-local cache as well
    //storageCache[item.asin] = strProduct;

    var storage = chrome.storage.local;
    var obj = {};
    obj[item.asin] = strProduct;
    storage.set(obj);
    console.log('Updated product with id:' + item.asin);
}

function getImage(doc) {
    var imgs = doc.getElementsByClassName("productImage_AMBPT");
    for (i = 0; i < imgs.length; i++) {
        try {
            var src = imgs[i].getAttribute("src");

            if (typeof src !== 'undefined' && src != null)
                return src;
        }
        catch (err) {
            console.log(err.message);
            return err.message;
        }
    }
}