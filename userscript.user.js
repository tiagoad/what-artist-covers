// ==UserScript==
// @name        What.CD Artist Covers
// @namespace   https://ttsda.cc
// @include     /^https://what\.cd/artist\.php.*/
// @version     1
// @grant       none
// @downloadURL https://github.com/ttsda/what-artist-covers/raw/master/userscript.user.js
// ==/UserScript==
var releaseTypes = {
    1: "Albums",
    3: "Soundtracks",
    5: "EPs",
    6: "Anthologies",
    7: "Compilations",
    8: "DJ Mixes",
    9: "Singles",
    11: "Live Albums",
    13: "Remixes",
    14: "Bootlegs",
    15: "Interviews",
    16: "Mixtapes",
    21: "unknown",
    22: "Concert Recordings",
    1021: "Produced By",
    1022: "Composition",
    1023: "Remixed By",
    1024: "Guest Appearances"
};

function slug(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
}

function showCovers() {
    // get our own element
    var div = $('<div></div>');
    $('.main_column').prepend(div);

    // the link box
    var box = $('<div class="box center"></div>');
    div.append(box);

    // find the artist id
    var artistid = location.search.match(/id=(\d+)/)[1];

    // get the artist info from the api
    $.get(
        'https://what.cd/ajax.php?action=artist&id=' + artistid,
        function(data) {
            var groups = data.response.torrentgroup;
            var releases = {};

            // go over each group and categorize them by release type
            $.each(groups.reverse(), function(i, group) {
                releases[group.releaseType] = releases[group.releaseType] || [];
                releases[group.releaseType].push(group);
            });

            // go over each release type and display the covers :)
            $.each(releases, function(releaseType, releases) {
                var rtName = releaseTypes[releaseType];
                var rtSlug = slug(rtName);

                // add a title
                div.append('<div class="head" id="covers_' + rtSlug + '"><strong>' + rtName + '</strong></div>');

                // add a link to the link box
                box.append('<a href="#covers_' + rtSlug + '" class="brackets">' + rtName + '</a> ');

                // add the <ul>
                var ul = $('<ul class="collage_images" style="margin-bottom: 2em;"></ul>');
                div.append(ul);

                // add an <li> for each release
                $.each(releases, function(i, release) {
                    var artists = [];
                    $.each(release.artists, function(i, artist) {
                        artists.push(artist.name);
                    });

                    var img = '<img \
           						src="' + release.wikiImage + '" \
            					width="118">';

                    var li = '<li><a href="torrents.php?id=' + release.groupId + '">' + img + '</a></li>';
                    ul.append(li);
                });
            });
        });
}

// add the [Covers] link when the page has loaded
window.addEventListener('load', function() {
    // create covers link
    var link = $('<a href="#" class="brackets">Covers</a>');

    // add link event
    link.click(showCovers);

    // add link to the link box
    $('.linkbox').append(link);
}, false);
