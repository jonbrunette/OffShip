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

            //appendMessage(resp);

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
            var item = { store: "Amazon", asin: asin, description: description, link: link, imgSrc: imgSrc, price: price, weight: productData.weight, dimentions: productData.dimentions, inCart: "y" };
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

chrome.storage.local.get(null, function (data) {
    storageCache = data;

    if (window.location.hostname.toLocaleLowerCase().includes("amazon.")) {
        ReadDOMForBasket(document);
    }
});