function ReadDOMForBestBuyBasket(document_root) {

    var count = 0;
    var list = document_root.getElementsByClassName("container_2xSNh");

    var itemArray = [];
    var innerList = [];

    try {
        for (i = 0; i < list.length; i++) {

            try {
                innerList = list[i].getElementsByTagName("a");

                if (typeof innerList === 'undefined' || innerList.length == 0) {
                    sendError(window.location.href, null, "Could not find item link");
                    continue;
                }

                var linkTag = innerList[0].href;
                var lastIndex = linkTag.lastIndexOf("/");
                var itemid = linkTag.substring(lastIndex+1);
                var asin = itemid;

                var itemImgSrc = "";
                innerImages = list[i].getElementsByTagName("img");

                if (typeof innerList !== 'undefined' && innerList.length > 0)
                    itemImgSrc = innerImages[0].getAttribute("src");
                else
                    sendError(window.location.href, null, "Could not find item image");

                var price = 0;

                //price_FHDfG
                //priceList = list[i].getElementsByClassName("loadedContent_e3Dc0");
                priceList = list[i].getElementsByClassName("price_FHDfG");

                if (typeof priceList !== 'undefined' && priceList.length > 0) {
                    price = priceList[0].innerText;

                    if (price.startsWith("$"))
                        price = price.substring(1, price.length);
                }
                else
                    sendError(window.location.href, null, "Could not find item price");


                var itemDesc = innerList[1].innerHTML;

                itemArray.push(asin);

                var link = `https://${window.location.hostname}${linkTag}/`;

                if (typeof storageCache[asin] === 'undefined' || storageCache[asin] === "") {
                    var rowStr = formatItemRow(itemid, asin, itemDesc, itemImgSrc, price);

                    chrome.runtime.sendMessage({
                        action: "appendBasketContent",
                        source: rowStr
                    });

                    getBestBuyProductDetailsAndStore(asin, itemDesc, link, itemImgSrc, price);
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
    catch (err) {
        console.log(err.message);
        appendMessage(err.message);
        sendError(window.location.href, err.message, "Error in ReadDOMForBestBuyBasket");
        return err.message;
    }
}

function getBestBuyProductDetailsAndStore(asin, description, link, imgSrc, price) {

    var weight = 0;
    var dimentions = 0;

    if (description.toLowerCase().includes("ipad")) {
        weight = "531g";
        dimentions = "280.6mmx247.6 mm";
    }
    else if (description.toLowerCase().includes("watch")) {
        weight = "33g";
        dimentions = "42mmx36mm";
    }

    var item = { store: "BestBuy", asin: asin, description: description, link: link, imgSrc: imgSrc, price: price, weight: weight, dimentions: dimentions };
    updateFullProductInLocalCache(item);
}

chrome.storage.local.get(null, function (data) {
    storageCache = data;

    if (window.location.hostname.toLocaleLowerCase().includes("bestbuy.")) {
        ReadDOMForBestBuyBasket(document);
    }
});