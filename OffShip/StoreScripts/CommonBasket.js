var storageCache = {};

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

function sendError(page, error, hint) {
    //also send date, version of extension
    //throttle client side for repeat errors. Don't want to spam 
    console.log(`Error found on ${page} Error: ${error} Hint: ${hint}`);
    appendMessage(error);
}

function normalizePrice(price) {
    if (price.startsWith("$"))
        price = parseFloat(price.substring(1, price.length)).toFixed(2);

    return price;
}

function storeProductInLocalCache(asin, itemDesc, itemImgSrc, price, productLink) {
    //TODO: Check if exists in cache first
    //chrome.storage.local.get(['key'], function (result) {
    //    console.log('Value currently is ' + result.key);
    //});

    var product = { id: asin, itemDesc: itemDesc, link: productLink, imgSrc: itemImgSrc, price: price, weight: "", dimentions: "" };

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

function markItemInCart(asin) {
    chrome.storage.local.get([asin], function (value) {
        var product = JSON.parse(value[asin]);
        product.inCart = "y";
        var strProduct = JSON.stringify(product);

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

function updateFullProductInLocalCache(item) {
    var strProduct = JSON.stringify(item);

    //Update in local-local cache as well
    storageCache[item.asin] = strProduct;

    var storage = chrome.storage.local;
    var obj = {};
    obj[item.asin] = strProduct;
    storage.set(obj);
    console.log('Updated product with id:' + item.asin);
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

//function formatItemRow(itemid, asin, itemDesc, itemImgSrc, price) {
function formatItemRow(product) {
    try {
        var itemName = product.description.length > 40 ? product.description.substr(0, 37) + "..." : product.description;
        var itemLink = `<a href='${product.link}' alt='${itemName}'/>${itemName}</a>`;

        const lang = navigator.language;

        //TODO: Fix
        //strPrice = (price).toLocaleString(lang, { style: 'currency', currency: 'EUR' }); //EUR

        //TODO: Make (-) button stay in right column regardless of item description. 

        strPrice = product.price;
        //strPrice = parseFloat(price).toFixed(2).toLocaleString();

        var strImg = `<img src='${product.imgSrc}' alt='${product.description}' width='64' item-id='${product.id}'>`;
        var removeImg = "<img src='/images/minus.png' alt='Remove from offset calculations' width='16px' class='removeButton' item-id='" + product.id + "'>";
        var strRow = `<td>${strImg}</td><td class='w3-cell-top'>${itemLink}</td><td class='w3-cell-top'>$${strPrice}</td><td class='w3-cell-top'>${removeImg}</td>`;
    }
    catch (err) {
        console.log(err.message);
        return "formatItemRow: " + err.message;
    }

    return strRow;
}

function formatItemRowFromProduct(itemid, product) {

    var itemName = product.description;
    itemName = itemName.length > 30 ? itemName.substr(0, 27) + "..." : itemName;
    var itemLink = `<a href='https://${window.location.hostname}/gp/product/${product.id}/' alt='${itemName}'/>${itemName}</a>`;

    //TODO: Fix
    const lang = navigator.language;
    strPrice = (product.price).toLocaleString(lang, { style: 'currency', currency: 'EUR' }); //EUR

    var strImg = "<img src='" + product.imgSrc + "' alt='" + product.itemDesc + "' width='64' item-id='" + itemid + "'>";
    var strRow = `<td>${strImg}</td><td>${itemLink}</td><td>${strPrice}</td><td><a href=''>Purchase Offset</a></td>`;
    return strRow;
}