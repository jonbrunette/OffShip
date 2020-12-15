var currentUrl = "";

window.onload = function () {
    console.log("Background Page load: " + window.location.href);

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
    
    runScrapperForSelectSites();

    currentUrl = window.location.href;
    setInterval(checkLocationChanged, 15000); //check every 15s
}

function checkLocationChanged() {
    if (currentUrl != window.location.href) {
        currentUrl = window.location.href;
        runScrapperForSelectSites();
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

    //Is this a product page?
    var sku = document.getElementById("sku");

    if (typeof sku === 'undefined' || sku == null) {
        console.log("Not a product page, exiting.");
        return;
    }

    var detailsDivs = doc.getElementsByClassName('productInfoContainer_2mCHp');

    if (typeof detailsDivs === 'undefined' || detailsDivs.length == 0) {
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

    sku = document.getElementById("sku").value;
    var imgSrc = getImage(document);
    var price = document.getElementsByClassName("screenReaderOnly_3anTj")[0].innerText;
    price = normalizePrice(price);

    var item = { store: "BestBuy", id: sku, description: document.title, link: window.location.href, imgSrc: imgSrc, price: price, weight: weight, dimentions: dimentions, inCart: "n"};
    updateFullProductInLocalCache(item);

    return { weight: weight, dimentions: dimentions };
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