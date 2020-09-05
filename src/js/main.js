var firstRun;
var lastUpdateInterval;
var stopFetch = false;
var intervalIds = [];
var timeoutIds = [];
var supportsOpacity = CSS.supports("opacity", "1.0");
var fadeOnUpdates = true;
var lastUpdateSeconds = 0;
var jsonData = {};
var streamURLAttr = ".stream[stream-url]";
var menuActive = false;
var hideNeverStreamed = true;
var hiddenStreamersLast = hiddenStreamers.slice();
var lastViewURL;
var linkStream = function(setLinks) {
    if (setLinks == true) {
        $(streamURLAttr).each(function(index) {
            var _$this = $(this);
            var _streamURL = _$this.attr("stream-url");
            _$this.wrap("<a href='" + _streamURL + "' target='_blank'></a>");
        });
    } else if (setLinks == false) {
        $(streamURLAttr).each(function(index) {
            var _$this = $(this);
            var _streamURL = _$this.attr("stream-url");
            _$this.unwrap("<a href='" + _streamURL + "' target='_blank'></a>");
        });
    }
};
var linkItem = function(item) {
    $(item).each(function(index) {
        var _$this = $(this);
        var _itemURL = _$this.attr("url");
        _$this.wrap("<a href='" + _itemURL + "' target='_blank'></a>");
    });
};

function setContainerHTML() {
    var container = document.querySelector(".streams_container");
    var htmlstr = "";
    var online = jsonData.online;
    var offline = jsonData.offline;
    var numOnline = 0;
    var numOffline = 0;
    var is_hidden;
    for (i in online) {
        var _id = online[i]._id;
        is_hidden = hiddenStreamers.includes(_id);
        if (is_hidden || online[i].name === null) {
            continue;
        }
        numOnline += 1;
        if (numOnline == 1) {
            var livedotimg = "<img src='../static/css/rec.svg' class='live_dot'>";
            htmlstr += "<span class='section_title'>LIVE" + livedotimg + "</span>";
        }
        var _url = online[i].url;
        var _avatar = online[i].avatar;
        var _name = online[i].name;
        var _title = online[i].title;
        var _badge = online[i].badge;
        var _viewers = online[i].viewers.toLocaleString();
        htmlstr += "<div class='stream' streamer-id='" + _id + "' stream-url='" + _url + "'>" +
            "<div class='divTableBody'>" +
            "<div class='divTableRow'>" +
            "<div class='left'>" +
            "<img src='" + _avatar + "' class='displaypic'>" +
            "</div>" +
            "<div class='center notextwrap'>" +
            "<div class='name'>" + _name + "</div>" +
            "<div class='title'>" + _title + "</div>" +
            "</div>" +
            "<div class='right'>" +
            "<div class='badge " + _badge + "'>" +
            "<div class='badge_txt'>" + _viewers + "</div>" +
            "<div class='badge_img'></div>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>";
    }
    for (i in offline) {
        var _id = offline[i]._id;
        is_hidden = hiddenStreamers.includes(_id);
        if (hideNeverStreamed && offline[i].last_online == "TBA") {
            continue;
        }
        if (is_hidden || offline[i].name === null) {
            continue;
        }
        numOffline += 1;
        if (numOffline == 1) {
            htmlstr += "<p class='section_title'>OFFLINE</p>";
        }
        var _url = offline[i].url;
        var _avatar = offline[i].avatar;
        var _name = offline[i].name;
        var _title = offline[i].title;
        var _badge = offline[i].badge;
        var _lastOnline = offline[i].last_online;
        htmlstr += "<div class='stream offline' streamer-id='" + _id + "' stream-url='" + _url + "'>" +
            "<div class='divTableBody'>" +
            "<div class='divTableRow'>" +
            "<div class='left'>" +
            "<img src='" + _avatar + "' class='displaypic'>" +
            "</div>" +
            "<div class='center notextwrap'>" +
            "<div class='name'>" + _name + "</div>" +
            "<div class='title'>" + _title + "</div>" +
            "</div>" +
            "<div class='right'>" +
            "<div class='" + _badge + "'>" + _lastOnline + "</div>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>";
    }
    if (hideNeverStreamed) {
        htmlstr += "<button class='bttn-base bttn-show_all' onclick='showAll();'>" +
            "<span>Show All</span>" +
            "</button>";
    }
    container.innerHTML = htmlstr;
    window.setTimeout(linkStream(true), 100);
    if (previewEnabled) {
        activatePreviewListener();
    }
}

function sessionTimeout(hardRefresh) {
    stopFetch = true;
    var resp = window.confirm("Session has timed out, click OK to refresh");
    if (resp) {
        location.reload(hardRefresh);
    } else {
        return false;
    }
}

function fadeInContainer() {
    var container = $(".streams_container");
    var opacityIn = 0;
    container.css("opacity", "0.0");
    var myVar = setInterval(function() {
        opacityIn = opacityIn + 5;
        container.css("opacity", opacityIn * 0.01);
        if (opacityIn == 100) {
            clearInterval(myVar);
        }
    }, 10);
}

function fadeOutInContainer(data) {
    var container = $(".streams_container");
    container.css("opacity", "1.0");
    var opacityOut = 100;
    var opacityIn = 0;
    var fadeout = setInterval(function() {
        container.css("opacity", (opacityOut -= 5) * 0.01);
        if (opacityOut == 0 || document.hidden) {
            clearInterval(fadeout);
            setContainerHTML(data);
            var fadein = setInterval(function() {
                container.css("opacity", (opacityIn += 5) * 0.01);
                if (opacityIn == 100 || document.hidden) {
                    container.css("opacity", "1.0");
                    clearInterval(fadein);
                }
            }, 60);
        }
    }, 5);
}

function showContainer(visible) {
    var container = $(".streams_container");
    if (visible) {
        container.css("opacity", "1.0");
        fadeInContainer();
    } else {
        container.css("opacity", "0.0");
    }
}

function initalizeContainer(data, fade) {
    if (supportsOpacity && fade && (typeof firstRun === "undefined" || firstRun === null)) {
        showContainer(false);
        setContainerHTML(data);
        setTimeout(function() {
            showContainer(true);
        }, 500);
        firstRun = true;
    } else if (!document.hidden && supportsOpacity && fade) {
        fadeOutInContainer(data);
    } else {
        setContainerHTML(data);
    }
}

function fetch(fadeOnUpdates) {
    lastUpdateTicker();
    if (stopFetch == false) {
        var k = fetchkey.ABCDEFGHIJKLMNOPQRSTUVWXYZ;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var output = JSON.parse(xhttp.responseText);
                jsonData = output.data;
                initalizeContainer(jsonData, fadeOnUpdates);
                if (output.error == true) {
                    sessionTimeout(true);
                }
            }
            if (this.readyState == 4 && this.status == 0) {
                sessionTimeout(true);
            }
        };
        xhttp.open("POST", "../streams?key=" + k, true);
        xhttp.setRequestHeader("X-Key", k);
        xhttp.send();
    }
}

function lastUpdateTicker() {
    var updateStatus = $(".updatestatus");
    var lastUpdateText;
    lastUpdateSeconds = 0;
    updateStatus.text("Updating...");
    if (lastUpdateInterval) {
        clearInterval(lastUpdateInterval);
    }
    lastUpdateInterval = setInterval(function() {
        lastUpdateSeconds += 1;
        if (lastUpdateSeconds == 1) {
            lastUpdateText = "Updated " + lastUpdateSeconds + " second ago...";
        } else {
            lastUpdateText = "Updated " + lastUpdateSeconds + " seconds ago...";
        }
        updateStatus.text(lastUpdateText);
    }, 1000 * 1);
    intervalIds.push(lastUpdateInterval);
}

function startUpdates() {
    if (menuActive) {
        return false;
    }
    stopFetch = false;
    fetch();
    var updateT = setInterval(function() {
        fetch(fadeOnUpdates);
    }, 1000 * 60);
    intervalIds.push(updateT);
    var timeoutId = setTimeout(function() {
        clearInterval(updateT);
        setTimeout(a, 1000);
    }, 1800000);
    timeoutIds.push(timeoutId);
}

function a() {
    var updateT = setInterval(function() {
        fetch(fadeOnUpdates);
    }, 1000 * 90);
    intervalIds.push(updateT);
    var timeoutId = setTimeout(function() {
        clearInterval(updateT);
        setTimeout(b, 1000);
    }, 3600000);
    timeoutIds.push(timeoutId);
}

function b() {
    var updateT = setInterval(function() {
        fetch(fadeOnUpdates);
    }, 1000 * 120);
    intervalIds.push(updateT);
    var timeoutId = setTimeout(function() {
        clearInterval(updateT);
        setTimeout(c, 1000);
    }, 3600000);
    timeoutIds.push(timeoutId);
}

function c() {
    var updateT = setInterval(function() {
        fetch(fadeOnUpdates);
    }, 1000 * 60 * 5);
    intervalIds.push(updateT);
    var timeoutId = setTimeout(function() {
        clearInterval(updateT);
        setTimeout(b, 1000);
    }, 3600000);
    timeoutIds.push(timeoutId);
}

function stopUpdates() {
    stopFetch = true;
    intervalIds.forEach(clearInterval);
    timeoutIds.forEach(clearTimeout);
    intervalIds.length = 0;
    timeoutIds.length = 0;
}
document.onvisibilitychange = function(e) {
    if (!document.hidden) {
        startUpdates();
    } else if (document.hidden) {
        stopUpdates();
    }
};
var gaProperty = "UA-153646431-1";
var disableStr = "ga-disable-" + gaProperty;
if (document.cookie.indexOf(disableStr + "=true") > -1) {
    window[disableStr] = true;
}

function gaOptout() {
    document.cookie = disableStr + "=true; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/";
    window[disableStr] = true;
}

function toggleMenu() {
    var menu = document.querySelector(".dropdown-content");
    var menuItems = document.querySelectorAll(".dropdown-content a");
    if (menu.style.display != "block") {
        menu.style.display = "block";
        menuItems.forEach(function(item) {
            item.addEventListener("click", settingsMenuClick);
        });
        menu.addEventListener("mouseleave", toggleMenu);
        setTimeout(function() {
            document.addEventListener("click", toggleMenu);
        }, 100);
    } else {
        menu.style.display = "none";
        menuItems.forEach(function(item) {
            item.removeEventListener("click", settingsMenuClick);
        });
        menu.removeEventListener("mouseleave", toggleMenu);
        document.removeEventListener("click", toggleMenu);
    }
}

function arrayRemoveValue(arr, value) {
    return arr.filter(function(ele) {
        return ele != value;
    });
}

function settingsMenuClick() {
    switch (this.id) {
        case "menu-custom-view":
            menuCustomView();
            updateHiddenCount();
            break;
        case "menu-preview":
            if (previewEnabled) {
                previewEnabled = false;
                this.innerHTML = "Enable Previews";
            } else {
                previewEnabled = true;
                this.innerHTML = "Disable Previews";
            }
            setContainerHTML();
            break;
        case "menu-a2hs":
            window.addEventListener("appinstalled", function() {
                console.log('Successfully added to homescreen')
            });
            break;
    }
}

function updateHiddenCount() {
    var streamersSelected = document.querySelector(".customlink_selected");
    streamersSelected.innerHTML = "Streamers removed: " + hiddenStreamers.length;
}

function addHiddenStreamer(id) {
    hiddenStreamers.push(id);
    updateHiddenCount();
}

function removeHiddenStreamer(id) {
    hiddenStreamers = arrayRemoveValue(hiddenStreamers, id);
    updateHiddenCount();
}

function setStreamerHideMode() {
    linkStream(false);
    stopUpdates();
    $(streamURLAttr).each(function(index) {
        var _$this = $(this);
        _$this[0].style.opacity = 0.9;
        _$this.click(function() {
            var streamerID = _$this.attr("streamer-id");
            if (_$this[0].style.opacity == 0.9) {
                _$this[0].style.transition = "opacity .5s";
                _$this[0].style.opacity = 0.2;
                addHiddenStreamer(streamerID);
            } else {
                _$this[0].style.transition = "opacity .5s";
                _$this[0].style.opacity = 0.9;
                removeHiddenStreamer(streamerID);
            }
        });
    });
}

function revertStreamerHideMode() {
    $(streamURLAttr).each(function(index) {
        var _$this = $(this);
        _$this.off("click");
        _$this[0].style.opacity = 1.0;
    });
    startUpdates();
}

function menuCustomView() {
    var menuDiv = document.querySelector(".customlink_div");
    if (menuDiv.style.display != "block") {
        menuActive = true;
        hideNeverStreamed = false;
        menuDiv.style.display = "block";
        refreshCustomView();
    } else {
        menuActive = false;
        hideNeverStreamed = true;
        menuDiv.style.display = "none";
        revertStreamerHideMode();
    }
}

function resetRemoved() {
    hiddenStreamers = [];
    refreshCustomView();
}

function refreshCustomView() {
    if (previewEnabled) {
        previewEnabled = false;
    }
    setContainerHTML();
    setStreamerHideMode();
}

function setInputCustomURL(resp) {
    if (resp.error == true) {
        document.getElementById("custom-url").value = "Failed, try again...";
        return false;
    }
    var id = resp.data.id;
    var host = window.location.href.split("/").slice(0, 3).join("/");
    var url = host + "/c/" + id;
    document.getElementById("custom-url").value = url;
    lastViewURL = url;
    hiddenStreamersLast = hiddenStreamers.slice();
    refreshCustomView();
}

function generateLink() {
    var k = fetchkey.ABCDEFGHIJKLMNOPQRSTUVWXYZ;
    var xhttp = new XMLHttpRequest();
    var data = {};
    var urlOutput = document.getElementById("custom-url");
    if (hiddenStreamers.length == 0) {
        urlOutput.value = "No streamers selected...";
        return false;
    }
    if (JSON.stringify(hiddenStreamersLast) === JSON.stringify(hiddenStreamers)) {
        if (lastViewURL) {
            urlOutput.value = lastViewURL;
            return false;
        }
        urlOutput.value = "No changes made...";
        return false;
    }
    data.hidden = hiddenStreamers;
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var output = JSON.parse(xhttp.responseText);
            if (output.error == false) {
                setInputCustomURL(output);
            } else {
                document.getElementById("custom-url").value = output.data;
            }
        }
        if (this.readyState == 4 && this.status == 0 && output.error == true) {
            document.getElementById("custom-url").value = "Failed, try again...";
            return false;
        }
    };
    xhttp.open("POST", "../generate/" + k + "/custom" + "?key=" + k, true);
    xhttp.setRequestHeader("X-Key", k);
    xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhttp.send(JSON.stringify(data));
}

function copyURL() {
    var copyText = document.getElementById("custom-url");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copied:<br>" + copyText.value;
}

function copyUrlOut() {
    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copy to clipboard";
}

function showAll() {
    var tempLastScrollY = window.scrollY;
    hideNeverStreamed = false;
    setContainerHTML();
    window.scrollTo(0, tempLastScrollY);
}

function initA2HS() {
    let deferredPrompt;
    const a2hsBtn = document.getElementById('menu-a2hs');
    a2hsBtn.style.display = 'none';
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(function(registration) {
            console.log('A2HS Service Worker Registered');
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                a2hsBtn.style.display = 'block';
                a2hsBtn.addEventListener('click', (e) => {
                    a2hsBtn.style.display = 'none';
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the A2HS prompt');
                        } else {
                            console.log('User dismissed the A2HS prompt');
                        }
                        deferredPrompt = null;
                    });
                });
            });
            setTimeout(function() {
                registration.unregister().then(function(boolean) {});
            }, 2000);
        }).catch(function(error) {
            console.log('Registration failed with ' + error);
        });
    }
}
$(document).ready(function() {
    window.setTimeout(linkItem(".bannertxt[url]"), 100);
    window.setTimeout(linkItem(".header[url]"), 100);
    startUpdates();
    initA2HS();
});