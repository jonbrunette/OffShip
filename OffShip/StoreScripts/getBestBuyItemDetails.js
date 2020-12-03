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

function getBestBuyProductDetailsAndStore(asin, description, link, imgSrc, price) {

    var weight = 0;
    var dimentions = 0;
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", link, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var resp = xhr.responseText;
            var productData = extractBestBuyProductData(resp);

            var item = { store: "BestBuy", asin: asin, description: description, link: link, imgSrc: imgSrc, price: price, weight: productData.weight, dimentions: productData.dimentions };
            updateFullProductInLocalCache(item);
        }
    }

    xhr.send();
    return link;
}

chrome.storage.local.get(null, function (data) {
    storageCache = data;

    console.log("I will look up the details now: " + window.location.href);
});