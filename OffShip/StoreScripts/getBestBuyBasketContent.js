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

                if (typeof storageCache[asin] === 'undefined' || storageCache[asin] === "") {
                    var rowStr = formatItemRow(itemid, asin, itemDesc, itemImgSrc, price);

                    chrome.runtime.sendMessage({
                        action: "appendBasketContent",
                        source: rowStr
                    });
                    
                    console.log(`${asin} not found in local cache, find it somehow...`);
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

function extractBestBuyProductData(pageStr) {

    var weight = 0;
    var height = "";
    var width = "";
    var dimentions = "";
 
    //if (typeof table === 'undefined') {
    var techDetailsStart = pageStr.indexOf('<div class="productInfoContainer_2mCHp tabItemContainer_EeznO isActive_2cc9n" id="detailsAndSpecs">');
    var techDetailsEnd = pageStr.indexOf('<div><h3 class="groupName_2dvlp">Warranty</h3></div>', techDetailsStart);

    var detailsStr = pageStr.substr(techDetailsStart, techDetailsEnd - techDetailsStart + "</div></div>".length);
    var detailsDiv = createElementFromHTML(detailsStr);

    //Class->class->class
    //itemContainer_20kXj -> itemName_37zd4 -> itemValue_XPfaq
    var containers = detailsDiv.getElementsByClassName("itemContainer_20kXj");

    try {
        containers.forEach(row => {
            title = row.getElementsByClassName("itemName_37zd4")[0].innerHTML;
            value = row.getElementsByClassName("itemValue_XPfaq")[0].innerHTML;

            //TODO: Language 
            if(title == "Weight")
                weight = value;

            if (title == "Height")
                height = value;

            if (title == "Width")
                width = value;
        });

        dimentions = width + "x" + height;
    }
    catch (err) {
        console.log(err.message);
        appendMessage(err.message);
        sendError(window.location.href, err.message, "Error in extractBestBuyProductData");
        return err.message;
    }

    return { weight: weight, dimentions: dimentions };
}

chrome.storage.local.get(null, function (data) {
    storageCache = data;

    if (window.location.hostname.toLocaleLowerCase().includes("bestbuy.")) {
        ReadDOMForBestBuyBasket(document);
    }
});