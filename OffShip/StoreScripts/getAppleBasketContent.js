//rs-iteminfo-details
function ReadDOMForAppleBasket(document_root) {

    var count = 0;
    var list = document_root.getElementsByClassName("rs-iteminfo");

    var itemArray = [];
    var innerList = [];

    try {
        for (i = 0; i < list.length; i++) {

            try {
                innerList = list[i].getElementsByTagName("a");

                if (typeof innerList === 'undefined' || innerList.length == 0)
                    continue;

                var itemid = innerList[0].getAttribute("data-s-object-id");
                var linkTag = innerList[0].getAttribute("data-relatedlink");
                var asin = itemid;

                var price = 0;

                priceList = list[i].getElementsByClassName("rs-iteminfo-price");

                if (typeof priceList !== 'undefined' && priceList.length > 0) {
                    price = priceList[0].getElementsByTagName("div")[0].innerHTML;

                    if (price.startsWith("$"))
                        price = price.substring(1, price.length);
                }

                var itemDesc = innerList[0].innerHTML;
                
                var itemImgSrc = "";
                innerImages = list[i].getElementsByTagName("img");

                if (typeof innerList !== 'undefined' && innerList.length > 0)
                    itemImgSrc = innerImages[0].getAttribute("src");

                itemArray.push(asin);

                var link = `https://${window.location.hostname}${linkTag}/`;

                if (typeof storageCache[asin] === 'undefined' || storageCache[asin] === "") {
                    var product = { id: asin, description: itemDesc, link: link, imgSrc: itemImgSrc, price: price, inCart: "y" };
                    var rowStr = formatItemRow(product);

                    chrome.runtime.sendMessage({
                        action: "appendBasketContent",
                        source: rowStr
                    });

                    getAppleProductDetailsAndStore(asin, itemDesc, link, itemImgSrc, price);
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
        sendError(window.location.href, err.message, "Error in ReadDOMForAppleBasket");
        return err.message;
    }
}

function getAppleProductDetailsAndStore(asin, description, link, imgSrc, price) {

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
    else if (description.toLowerCase().includes("macbook air")) {
        weight = "1.29kg";
        dimentions = "30.41cmx1.61cmx21.24cm";
    }
    else if (description.toLowerCase().includes("13-inch macbook pro")) {
        weight = "1.4kg";
        dimentions = "30.41cmx1.56cmx21.24cm";
    }
    else if (description.toLowerCase().includes("16-inch macbook pro")) {
        weight = "2kg";
        dimentions = "35.79cmx1.62cmx24.59cm";
    }
    else if (description.toLowerCase().includes("imac pro")) {
        weight = "9.7kg";
        dimentions = "65.0cmx51.6cmx20.3cm";
    }
    else if (description.toLowerCase().includes("imac")) {
        weight = "5.44kg";
        dimentions = "52.8cmx45.0cmx17.5cm";
    }
    else if (description.toLowerCase().includes("mac pro")) {
        weight = "18.0kg";
        dimentions = "21.8cmx45.0cmx52.9cm";
    }
    else if (description.toLowerCase().includes("mac mini")) {
        weight = "1.2kg";
        dimentions = "3.6cmx19.7cmx19.7cm";
    }
    else if (description.toLowerCase().includes("iphone 12")) {
        weight = "200g";
        dimentions = "150mmx75mmx7.4mm";
    }
    else if (description.toLowerCase().includes("airpods pro")) {
        weight = "5.4g";
        dimentions = "30.9mmx21.8mmx24.0mm";
    }
    else if (description.toLowerCase().includes("airpods 2nd")) {
        weight = "4g";
        dimentions = "40.5mmx16.5mmx18.0mm";
    }
    else if (description.toLowerCase().includes("apple tv")) {
        weight = "425g";
        dimentions = "35mmx98mmx98mm";
    }
    else if (description.toLowerCase().includes("apple tv hd")) {
        weight = "425g";
        dimentions = "35mmx98mmx98mm";
    }

    var item = { store: "Apple", asin: asin, description: description, link: link, imgSrc: imgSrc, price: price, weight: weight, dimentions: dimentions, inCart: "y" };
    updateFullProductInLocalCache(item);
}

chrome.storage.local.get(null, function (data) {
    storageCache = data;

    if (window.location.hostname.toLocaleLowerCase().includes("apple.")) {
        ReadDOMForAppleBasket(document);
    }
});