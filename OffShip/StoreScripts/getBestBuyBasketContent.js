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
                var id = itemid;

                var itemImgSrc = "";
                innerImages = list[i].getElementsByTagName("img");

                if (typeof innerList !== 'undefined' && innerList.length > 0)
                    itemImgSrc = innerImages[0].getAttribute("src");
                else
                    sendError(window.location.href, null, "Could not find item image");

                var price = 0;

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

                itemArray.push(id);

                if (typeof storageCache[id] === 'undefined' || storageCache[id] === "") {
                    var product = { id: id, description: itemDesc, link: linkTag, imgSrc: itemImgSrc, price: price, inCart: "y" };
                    var rowStr = formatItemRow(product);

                    chrome.runtime.sendMessage({
                        action: "appendBasketContent",
                        source: rowStr
                    });

                    console.log(`${id} not found in local cache, find it somehow...`);
                }
                else {
                    //Mark item as in basket
                    markItemInCart(id);
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

chrome.storage.local.get(null, function (data) {
    storageCache = data;

    if (window.location.hostname.toLocaleLowerCase().includes("bestbuy.")) {
        ReadDOMForBestBuyBasket(document);
    }
});