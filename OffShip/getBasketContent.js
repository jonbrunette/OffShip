function htmlToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.childNodes;
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}

function appendMessage(message) {
    chrome.runtime.sendMessage({
        action: "appendMessage",
        source: "<p>" + message + "</p>"
    });
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
                foundDimentions = true;
                dimentions = row.cells[j + 1].innerText.trim();
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

function storeProductInLocalCache(asin, itemDesc, itemImgSrc, price, productLink) {
    //TODO: Check if exists in cache first
    //chrome.storage.local.get(['key'], function (result) {
    //    console.log('Value currently is ' + result.key);
    //});

    var product = { id: asin, itemDesc: itemDesc, link: productLink, imgSrc: itemImgSrc, price: price, weight: "", dimentions: ""};

    var strProduct = JSON.stringify(product);

    var storage = chrome.storage.local;
    var obj = {};
    obj[asin] = strProduct;
    storage.set(obj);
    console.log('Stored product with id:' + asin);
}

function updateProductInLocalCache(asin, itemWeight, dimentions) {
    chrome.storage.local.get([asin], function (value) {
        var product = JSON.parse(value[asin]);
        var updateProduct = { id: asin, itemDesc: product.itemDesc, link: product.link, imgSrc: product.imgSrc, price: product.price, weight: itemWeight, dimentions: dimentions };
        var strProduct = JSON.stringify(updateProduct);

        var storage = chrome.storage.local;
        var obj = {};
        obj[asin] = strProduct;
        storage.set(obj);
        console.log('Updated product with id:' + asin);
    });
}


function removeProductInLocalCache(asin) {
    
    //Update in local-local cache as well
    storageCache[asin] = "";

    var storage = chrome.storage.local;
    var obj = {};
    obj[asin] = "";
    storage.set(obj);
    console.log('Cleared product with id:' + asin);
}

function adjustCache(itemArray) {
    //todo fix
    //store itemArray in cache and read on buyoffset page

    //for (var item in storageCache) {
    //    if (itemArray.includes(item)) {
    //        continue;
    //    }

    //    //remove it it is no longer in the basket
    //    removeProductInLocalCache(item);
    //}

}

function updateFullProductInLocalCache(asin, description, link, imgSrc, price, itemWeight, dimentions) {

    var updateProduct = { id: asin, itemDesc: description, link: link, imgSrc: imgSrc, price: price, weight: itemWeight, dimentions: dimentions };
    var strProduct = JSON.stringify(updateProduct);

    //Update in local-local cache as well
    storageCache[asin] = strProduct;

    var storage = chrome.storage.local;
    var obj = {};
    obj[asin] = strProduct;
    storage.set(obj);
    console.log('Updated product with id:' + asin);
}

function localCacheTest(asin, value) {

    var storage = chrome.storage.local;
    var obj = {};
    obj[asin] = value;
    storage.set(obj);

    appendMessage("TEST: Updated xache: " + value);

    chrome.storage.local.get(asin, function (product) {

        appendMessage("TEST: Looking for: " + asin);
        appendMessage("TEST: Found in cache (raw): " + product[asin]);

        for (var k in product) {
            appendMessage("TEST: Found [" + k + "," + product[k] + "]");
        }
    });
}

function localCacheReadTest(asin) {
    chrome.storage.local.get(asin, function (product) {

        appendMessage("TEST: Looking for: " + asin);
        appendMessage("TEST: Found in cache (raw): " + product[asin]);

        for (var k in product) {
            appendMessage("TEST: Found [" + k + "," + product[k] + "]");
        }
    });
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
            updateFullProductInLocalCache(asin, description, link, imgSrc, price, productData.weight, productData.dimentions);
        }
    }

    xhr.send();
    return;
}

function formatItemRow(itemid, asin, itemDesc, itemImgSrc, price) {
    try {
        var itemName = itemDesc.length > 30 ? itemDesc.substr(0, 27) + "..." : itemDesc;
        var itemLink = `<a href='https://${window.location.hostname}/gp/product/${asin}/' alt='${itemName}'/>${itemName}</a>`;

        const lang = navigator.language;

        //TODO: Fix
        //strPrice = (price).toLocaleString(lang, { style: 'currency', currency: 'EUR' }); //EUR

        strPrice = parseFloat(price).toFixed(2).toLocaleString();

        var strImg = "<img src='" + itemImgSrc + "' alt='" + itemDesc + "' width='64' item-id='" + itemid + "'>";
        //var strRow = `<td>${strImg}</td><td>${itemLink}</td><td>${strPrice}</td><td><a href='#' class="myOffsetButtonLink" product-id="${asin}">Purchase Offset</a></td>`;
        var strRow = `<td>${strImg}</td><td>${itemLink}</td><td>$${strPrice}</td>`;
    }
    catch (err) {
        console.log(err.message);
        return "formatItemRow: " + err.message;
    }

    return strRow;
}

function formatItemRowFromProduct(itemid, product) {
    
    var itemName = product.itemDesc;
    itemName = itemName.length > 30 ? itemName.substr(0, 27) + "..." : itemName;
    var itemLink = `<a href='https://${window.location.hostname}/gp/product/${product.id}/' alt='${itemName}'/>${itemName}</a>`;
    
    //TODO: Fix
    const lang = navigator.language;
    strPrice = (product.price).toLocaleString(lang, { style: 'currency', currency: 'EUR' }); //EUR

    var strImg = "<img src='" + product.imgSrc + "' alt='" + product.itemDesc + "' width='64' item-id='" + itemid + "'>";
    var strRow = `<td>${strImg}</td><td>${itemLink}</td><td>${strPrice}</td><td><a href=''>Purchase Offset</a></td>`;
    return strRow;
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
                            getProductDetailsAndStore(asin, itemDesc, link, itemImgSrc, price);
                            console.log(`${asin} not found in local cache, adding now`);
                        }

                        var rowStr = formatItemRow(itemid, asin, itemDesc, itemImgSrc, price);
                        //var basketC =  `<table><tr><td colspan='4'>Found ${count} items:</td></tr> ${strItems}<tr><td colspan='4'></td>${postalCode}</tr></table>`;

                        chrome.runtime.sendMessage({
                            action: "appendBasketContent",
                            source: rowStr
                        });

                        adjustCache(itemArray);
                    }
                    catch (innerErr) {
                        console.log(innerErr.message);
                        appendMessage("Error in getting product details: " + innerErr.message);
                        return "Error in getting product details: " + innerErr.message;
                    }
                }
            }
        }
    }
    catch (err) {
        console.log(err.message);
        appendMessage(err.message);
        return err.message;
    }   
    //return "Blank Cart";
    //return `<table><tr><td colspan='4'>Found ${count} items:</td></tr> ${strItems}<tr><td colspan='4'></td>${postalCode}</tr></table>`;    
}

var storageCache = {};

chrome.storage.local.get(null, function (data) {
    storageCache = data;
    ReadDOMForBasket(document);
});
