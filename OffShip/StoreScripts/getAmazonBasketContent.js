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

function getProductDataFormat1(pageStr) {
    var tableStartIndex = pageStr.indexOf("productDetails_techSpec_section_1");
    var tableEndIndex = pageStr.indexOf("</table>", tableStartIndex);

    var tableStr = "<table id=\"" + pageStr.substr(tableStartIndex, tableEndIndex - tableStartIndex + "</table>".length);
    var table = createElementFromHTML(tableStr);

    if (tableStartIndex == -1 || tableEndIndex == -1 || typeof table === 'undefined')
        return undefined;

    return table;
}

function getProductDataFormat2(pageStr, spanText) {
    var techDetailsStart = pageStr.indexOf(spanText);
    var tableStartIndex = pageStr.indexOf("<table", techDetailsStart);
    var tableEndIndex = pageStr.indexOf("</table>", tableStartIndex);

    var tableStr = pageStr.substr(tableStartIndex, tableEndIndex - tableStartIndex + "</table>".length);
    var table = createElementFromHTML(tableStr);

    //var debugInfo = `tableStartIndex: ${tableStartIndex} tableEndIndex: ${tableEndIndex}`;
    //appendMessage(debugInfo);
    //appendMessage(tableStr);

    if (tableStartIndex == -1 || tableEndIndex == -1 || typeof table === 'undefined')
        return undefined;

    return table;
}

function extractProductData(pageStr) {

    var weight = 0;
    var dimentions = "";

    var table = getProductDataFormat1(pageStr);

    if (typeof table === 'undefined') {
        console.log("getProductDataFormat1 failed! Trying v2");

        //<span>Additional Information</span>
        //<span>Technical Details</span>

        table = getProductDataFormat2(pageStr, "<span>Technical Details</span>");
        var table2 = getProductDataFormat2(pageStr, "<span>Additional Information</span>");

        var details1 = extractProductDataFromTable(table);
        var details2 = extractProductDataFromTable(table2);

        if (details1 === undefined) {
            console.warn("Could not load Technical Details table");
        }
        else {

            weight = details1.weight;
            dimentions = details1.dimentions;

            if (details1.shippingWeight !== 0) {
                weight = details1.shippingWeight;
            }
        }

        if (details2 === undefined) {
            console.warn("Could not load Additional Information table");
        }
        else {
            if (details2.shippingWeight !== 0) {
                weight = details2.shippingWeight;
            }

            if (details2.dimentions !== "") {
                dimentions = details2.dimentions;
            }
        }
    }
    else {
        var details1 = extractProductDataFromTable(table);
        weight = details1.weight;
        dimentions = details1.dimentions;

        if (details1.shippingWeight !== 0) {
            weight = details1.shippingWeight;
        }
    }    

    return { weight: weight, dimentions: dimentions };
}

function extractProductDataFromTable(table) {

    if (typeof table === 'undefined' || typeof table.rows === 'undefined') {
        return undefined;
    }
        
    var foundWeight = false;
    var foundDimentions = false;
    var weight = 0;
    var shippingWeight = 0;
    var dimentions = "";

    for (var i = 0, row; row = table.rows[i]; i++) {
        for (var j = 0, col; col = row.cells[j]; j++) {
            if (col.innerText.trim() == "Item Weight") {
                foundWeight = true;
                weight = row.cells[j + 1].innerText.trim();
            }

            if (col.innerText.trim() == "Shipping Weight") {
                foundWeight = true;
                shippingWeight = row.cells[j + 1].innerText.trim();
            }

            if (col.innerText.trim() == "Product Dimensions") {

                var dim = row.cells[j + 1].innerText.trim();

                if (dim.includes(";")) {
                    dimentions = dim.split(";")[0];
                    weight = dim.split(";")[1]
                    foundWeight = true;
                }
                else {
                    dimentions = dim;
                }

                foundDimentions = true;
            }

            //todo: amazon.co.uk not same format

            if (foundDimentions && foundWeight)
                break;
        }

        if (foundDimentions && foundWeight)
            break;
    }    

    return { weight: weight, shippingWeight: shippingWeight, dimentions: dimentions };
}

function getProductDetails(asin) {

    var link = `https://${window.location.hostname}/gp/product/${asin}/`;
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", link, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            // JSON.parse does not evaluate the attacker's scripts.
            //var resp = JSON.parse(xhr.responseText);
            var resp = xhr.responseText;
            var productData = extractProductData(resp);

            updateProductInLocalCache(asin, productData.weight, productData.dimentions);
        }
    }

    xhr.send();
    return link;
}

function getProductDetailsAndStore(asin, description, link, imgSrc, price) {
    var url = `https://${window.location.hostname}/gp/product/${asin}/`;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            // JSON.parse does not evaluate the attacker's scripts.
            //var resp = JSON.parse(xhr.responseText);
            var resp = xhr.responseText;
            var productData = extractProductData(resp);

            //appendMessage("Inner ASIN: " + asin + ", " + price + ", " + productData.dimentions);
            //appendMessage(resp);
            var item = { store: "Amazon", id: asin, description: description, link: link, imgSrc: imgSrc, price: price, weight: productData.weight, dimentions: productData.dimentions, inCart: "y" };
            updateFullProductInLocalCache(item);
        }
    }

    xhr.send();
    return;
}

function ReadDOMForBasket(document_root) {
   
    var count = 0;
    var list = document_root.getElementsByClassName("sc-list-body");
    
    var itemArray = [];
    var innerList = [];

    try {
        for (i = 0; i < list.length; i++) {
            if (list[i].hasAttribute("data-name") && list[i].getAttribute("data-name") == "Active Items") {

                innerList = list[i].getElementsByClassName("sc-list-item");

                if (typeof innerList === 'undefined' || innerList.length == 0)
                    continue;

                for (j = 0; j < innerList.length; j++) {
                    try {

                        var itemid = innerList[j].getAttribute("data-itemid");
                        var price = innerList[j].getAttribute("data-price");
                        var asin = innerList[j].getAttribute("data-asin");

                        itemArray.push(asin);

                        itemContentList = innerList[j].getElementsByClassName("sc-list-item-content");

                        if (typeof itemContentList === 'undefined' || itemContentList.length == 0)
                            continue;
                       
                        var img = itemContentList[0].getElementsByTagName("img")[0];
                        var itemDesc = img.getAttribute("alt");
                        var itemImgSrc = img.getAttribute("src");
                        var link = `https://${window.location.hostname}/gp/product/${asin}/`;

                        if (typeof storageCache[asin] === 'undefined' || storageCache[asin] === "") {
                            var product = { id: asin, description: itemDesc, link: link, imgSrc: itemImgSrc, price: price, inCart: "y"};
                            var rowStr = formatItemRow(product);

                            chrome.runtime.sendMessage({
                                action: "appendBasketContent",
                                source: rowStr
                            });

                            getProductDetailsAndStore(asin, itemDesc, link, itemImgSrc, price);
                            console.log(`${asin} not found in local cache, adding now`);
                        }

                        adjustCache(itemArray);
                    }
                    catch (innerErr) {
                        console.log(innerErr.message);
                        appendMessage("Error in getting product details: " + innerErr.message);
                        sendError(window.location.href, innerErr.message, "Error in getting product details");
                        return "Error in getting product details: " + innerErr.message;
                    }
                }
            }
        }
    }
    catch (err) {
        console.log(err.message);
        appendMessage(err.message);
        sendError(window.location.href, err.message, "Error in ReadDOMForAmazonBasket");
        return err.message;
    }   
    //return "Blank Cart";
    //return `<table><tr><td colspan='4'>Found ${count} items:</td></tr> ${strItems}<tr><td colspan='4'></td>${postalCode}</tr></table>`;    
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

function openCarbonOffset(event) {
    var clickedElement = event.target;
    var asin = clickedElement.getAttribute("product-id");

    var newURL = `chrome-extension://${chrome.runtime.id}/buyoffset.html?productId=${asin}`;
    window.open(newURL);
}

function addAmazonWatchers(doc) {
    var count = 0;
    var addToCartButton = doc.getElementById("add-to-cart-button");

    if (addToCartButton != null) {
        addToCartButton.addEventListener('click', amazonAddToCart);
        count++;
    }

    //var addButtons = doc.getElementsByClassName("add-to-cart-btn"); 

    //for (i = 0; i < addButtons.length; i++) {
    //    addButtons[i].addEventListener('click', amazonAddToCart);
    //}

    console.log(`Finished adding ${count} listeners`);
}

function amazonAddToCart(event) {
    var source = event.target;

    var linkSplit = window.location.href.split("/");
    var id = "";

    for (i = 0; i < linkSplit.length; i++) {
        if (linkSplit[i].toLowerCase() == "product") {
            id = linkSplit[i + 1]
            break;
        }
    }

    var desc = document.getElementById("productTitle").innerText;
    var price = document.getElementById("priceblock_ourprice").innerText;
    price = price.split("$")[1].trim();

    var detailTable = document.getElementById("productDetails_techSpec_section_1");
    var details = extractProductDataFromTable(detailTable);
    var image = document.getElementById("landingImage");

    var item = { store: "Amazon", id: id, description: desc, link: window.location.href, imgSrc: image.src, price: price, weight: details.weight, dimentions: details.dimentions, inCart: "y" };
    updateFullProductInLocalCache(item);
}


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
    
    itemActionList[0].setAttribute("carbon-link-added", "true");
    itemActionList[0].appendChild(iSeperator);
    itemActionList[0].appendChild(span);

    return;
}

chrome.storage.local.get(null, function (data) {
    storageCache = data;
});

window.onload = function () {
    if (window.location.hostname.toLocaleLowerCase().includes("amazon.")) {
        addAmazonWatchers(document);
        ReadDOMForBasket(document);
        getPostalCode();
        AddActionLinksToPage(document);
    }
}