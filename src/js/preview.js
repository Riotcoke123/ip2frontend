var previewEnabled = false;
var previewBox;
var lastPreview = "";
var hideTimeout = null;

function cancelHideTimeout() {
    if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
    }
}

function jsonFindStreamer(id, key) {
    var streamerData = jsonData.online.find(function(f) {
        return f._id == id
    });
    if (key === undefined) {
        return streamerData;
    } else {
        return streamerData[key] || null;
    }
}

function previewOn(item) {
    var streamerID = item.getAttribute("streamer-id");
    var streamerJSON = jsonFindStreamer(streamerID);
    var src;
    if (!streamerJSON) {
        return false;
    }
    platformID = streamerJSON.platform_id;
    platform = streamerJSON.platform;
    switch (platform) {
        case "YOUTUBE":
            src = "https://www.youtube-nocookie.com/embed/live_stream?channel=" + platformID + "&rel=0&modestbranding=1&autohide=0&mute=0&showinfo=0&controls=0&autoplay=1&vq=medium&controls=0&disablekb=1&widget_referrer=ip2.network";
            break;
        case "TWITCH":
            src = "https://player.twitch.tv/?channel=" + platformID + "&autoplay=true&muted=false";
            break;
        case "MIXER":
            src = "https://mixer.com/embed/player/" + platformID + "?muted=false"
            break;
        case "DLIVE":
            src = false;
            break;
        default:
            src = false;
    }
    if (src) {
        embed = "<iframe type='text/html' src='" + src + "' width='100%' height='100%' allow='autoplay' scrolling='no' frameborder='0' ></iframe>";
    } else {
        embed = "<div class='preview-unsupported unsupported-bg-" + platform.toLowerCase() + "'><span>Platform does not support embedding!</span></div>"
    }
    initPreviewBox(embed, streamerID);
    item.addEventListener("mouseleave", function() {
        hidePreviewBox();
    });
}

function initPreviewBox(embed, id) {
    cancelHideTimeout();
    if (lastPreview != id) {
        previewBox.innerHTML = embed;
    }
    previewBox.classList.remove("preview");
    previewBox.classList.remove("preview-hide");
    previewBox.style.display = "block";
    previewBox.classList.add("preview-init");
    previewBox.classList.add("preview-mouseenter");
    lastPreview = id;
}

function hidePreviewBox() {
    cancelHideTimeout();
    previewBox.classList.remove("preview-mouseenter");
    previewBox.classList.add("preview-hide");
    hideTimeout = setTimeout(function() {
        previewBox.classList.remove("preview-init");
        previewBox.classList.remove("preview-hide");
        previewBox.innerHTML = "";
        previewBox.classList.add("preview");
    }, 2000)
}

function activatePreviewListener() {
    var stream = document.querySelectorAll(".stream");
    stream.forEach(function(i) {
        i.addEventListener("mouseenter", function(e) {
            previewOn(e.target);
        });
    });
    previewBox.addEventListener("mouseenter", function(e) {
        previewBox.classList.remove("preview-hide");
        previewBox.classList.add("preview-mouseenter");
        cancelHideTimeout();
    });
    previewBox.addEventListener("mouseleave", function(e) {
        hidePreviewBox();
    });
}
document.addEventListener('DOMContentLoaded', function(event) {
    var e = document.createElement('span');
    e.id = "preview-box";
    e.classList.add("preview");
    document.getElementById('footer').appendChild(e);
    previewBox = document.getElementById('preview-box');
});