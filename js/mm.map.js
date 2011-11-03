var mm = com.modestmaps;

var map = window.map || {};
var DEFAULT_MAP = 'charter-schools';

var baseurl = "http://api.tiles.mapbox.com/v2/";
var base_layers = ['npr.USA-blank-trans-z11',
        'npr.world-blank-bright-0-10'];
var layers = {
    'charter-schools': {
        slug: "npr.florida-charter-schools",
        title: "Charter School Students"
    },
    
    'student-population': {
        slug: "npr.florida-student-population",
        title: "Total Students"
    }
};
var top_layer = ['mapbox.world-borders-dark'];

function getTiles(slug) {
    var data = layers[slug];
    if (!data) return;
    
    var tiles = _.union(base_layers, [data.slug], top_layer);
    return tiles.join(',');
}

function buildMapList() {
    var list = $('<ul/>').addClass('maps');
    for (slug in layers) {
        var a = $('<a/>').attr({
            id: slug,
            href: '#' + slug
        });
        a.text(layers[slug].title);
        var li = $('<li/>')
            .append(a)
            .appendTo(list);
    }
    return list;
}


var FLORIDA = new mm.Location(27.936, -82.463);

function refreshMap(slug) {    
    var tiles = getTiles(slug);
    var url = baseurl + tiles + '.jsonp';

    wax.tilejson(url, function(tilejson) {
        window.tilejson = tilejson;
        if (map.setProvider) {
            map.setProvider(new wax.mm.connector(tilejson));
        } else {
            map = new mm.Map('map', new wax.mm.connector(tilejson));
            map.setCenterZoom(FLORIDA, 6);
            wax.mm.zoomer(map).appendTo(map.parent);
            wax.mm.hash(map);
        }
        
        if (window.legend) {
            $(window.legend.element()).remove();
        }
        window.legend = wax.mm.legend(map, tilejson).appendTo(map.parent);
        //window.fullscreen = wax.mm.fullscreen(map, tilejson).appendTo(map.parent);
        wax.mm.attribution(map, tilejson).appendTo(map.parent);

        if (window.interaction) {
            window.interaction.remove();
        }
        window.interaction = wax.mm.interaction(map, tilejson);
    });
    return map;
}

$(function() {
    refreshMap(DEFAULT_MAP);
    var list = buildMapList();
    list.appendTo($('#map-container'));
    
    // set the initial map as active
    $('#' + DEFAULT_MAP).addClass('active');
    
    // layer switching
    list.find('a').click(function(e) {
        e.preventDefault();
        if ($(this).hasClass('active')) return;
        
        var slug = $(this).attr('id');
        if (slug in layers) {
            // clear active class from all list items
            // the right item will get a class added
            // in refreshMap
            $('ul.maps li a').removeClass('active');
            refreshMap(slug);
            $(this).addClass('active');
        }
    });
});

$(window).resize(function() {
    var p = new mm.Point($(window).width(), $(window).height())
    if (map.setSize) {
        map.setSize(p);
    }
});

$(function($) {
    $(document).mousemove(function(e) {
        $('.wax-tooltip').css({ 'display' : 'block' });
        if ( e.pageX + 150 > $(document).width()){
            $('.wax-tooltip').css({
                'right' : $(document).width() - e.pageX,
                'left' : 'auto'
            });
        } else {
            $('.wax-tooltip').css({
                'left' : e.pageX,
                'right' : 'auto'
            });
        }
        if ( e.pageY - $('#map').scrollTop() + $('.wax-tooltip').height() > $('#map').height()){
            $('.wax-tooltip').css({
                'bottom' : $('#map').height() - e.pageY + 60,
                'top' : 'auto' 
            });
        } else {
            $('.wax-tooltip').css({
                'top' : e.pageY - 20,
                'bottom' : 'auto'
            });
        }   
    });
    $('a,header,.wax-legends').mouseover(function(){
        $('.wax-tooltip').css('opacity','0 !important');
    }).mouseleave(function(){
        $('.wax-tooltip').css('opacity','1');
    })
});

