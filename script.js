BX.namespace('BX.mapMarkersComponent');

(function () {
    'use strict';
    var iconCoeff = 0.8;
    BX.mapMarkersComponent = {
        options: {},
        gmap: false,
        geocoder: false,
        position: false,
        radius: false,
        curPointZoom: false,
        points: false,
        pointsDist: [],
        nearestPoints: false,
        pointsIcons: {},
        pointsBounds: false,
        positionIcon: false,
        pointActiveIcon: false,
        pointActiveArea: false,
        pointsListStatus: false,
        pointsList: false,
        pointsActiveClass: 'lm-map__dealer_active',
        positionBinding: false,
        positionField: false,
        positionFieldComp: false,
        circle: false,
        circleParams: {
            fillColor: "#0071c9",
            fillOpacity: 0.1,
            strokeColor: "#0071c9",
            strokeOpacity: 1,
            strokeWeight: 1,
            clickable: false
        },
        labelStyle: {
            color: 'black',
            fontFamily: "'Fira Sans Condensed', sans-serif",
            fontSize: '26px',
            fontWeight: '700'
        },
        icons: {
            'position': {
                url: 'images/my-position.png',
                urlIE: 'images/my-position.png',
                size: [36, 36],
                origin: [0, 0],
                anchor: [18, 18]
            },
            'point': {
                url: 'images/point_sm.png',
                urlIE: 'images/point_sm.png',
                size: [43 * iconCoeff, 75 * iconCoeff],
                origin: [0, 0],
                anchor: [21 * iconCoeff, 75 * iconCoeff]
            },
            'pointActive': {
                url: 'images/point-active_sm.png',
                urlIE: 'images/point-active_sm.png',
                size: [43 * iconCoeff, 75 * iconCoeff],
                origin: [0, 0],
                anchor: [21 * iconCoeff, 75 * iconCoeff]
            },
            'pointArea': {
                url: 'images/point-area_sm.png',
                urlIE: 'images/point-area_sm.png',
                size: [43 * iconCoeff, 75 * iconCoeff],
                origin: [0, 0],
                anchor: [21 * iconCoeff, 75 * iconCoeff]
            },
            'pointAreaActive': {
                url: 'images/point-area-active_sm.png',
                urlIE: 'images/point-area-active_sm.png',
                size: [43 * iconCoeff, 75 * iconCoeff],
                origin: [0, 0],
                anchor: [21 * iconCoeff, 75 * iconCoeff]
            }
        },
        blockListUpdate: false,
        getParamId: false,

        /**
         * Initialization of map_markers component js
         */
        init: function (parameters) {
            console.log('foo bar');
            var instance = this;
            instance.getParams();
            instance.params = parameters.params || {};
            instance.points = parameters.points || {};

            instance.btnLocationNode = BX(instance.params.mapId + '_get_location');
            instance.fieldInputAddressNode = BX(instance.params.mapId + '_select_address');
            instance.listPointsNode = BX(instance.params.mapId + '_list_points');

            instance.initMapOptions();

            return this;
        },
        /**
         * Get Options for map from Parameters
         */
        initMapOptions: function () {
            var instance = this;
            instance.options.zoomControl = false;
            instance.options.mapTypeControl = false;
            instance.options.scaleControl = false;
            instance.options.disableDoubleClickZoom = true;
            instance.options.draggable = false;
            instance.options.keyboardShortcuts = false;

            instance.options.scrollwheel = false;

            if (instance.params) {
                instance.options.map = this.params.mapId;
                instance.options.startLat = parseFloat(instance.params.defaultMapPosition.map_lat);
                instance.options.startLon = parseFloat(instance.params.defaultMapPosition.map_lon);
                instance.options.zoom = parseFloat(instance.params.defaultMapPosition.map_scale);
                instance.options.minzoom = 4;
                instance.options.mapType = instance.params.mapType;

                if (instance.params.mapControls) {
                    if (BX.util.in_array('SMALL_ZOOM_CONTROL', instance.params.mapControls)) {
                        instance.options.zoomControl = true;
                    }
                    if (BX.util.in_array('TYPECONTROL', instance.params.mapControls)) {
                        instance.options.mapTypeControl = true;
                    }
                    if (BX.util.in_array('SCALELINE', instance.params.mapControls)) {
                        instance.options.scaleControl = true;
                    }
                }

                if (instance.params.mapOptions) {
                    if (BX.util.in_array('ENABLE_SCROLL_ZOOM', instance.params.mapOptions)) {
                        instance.options.scrollwheel = false;
                    }
                    if (BX.util.in_array('ENABLE_DBLCLICK_ZOOM', instance.params.mapOptions)) {
                        instance.options.disableDoubleClickZoom = false;
                    }
                    if (BX.util.in_array('ENABLE_DRAGGING', instance.params.mapOptions)) {
                        instance.options.draggable = true;
                    }
                    if (BX.util.in_array('ENABLE_KEYBOARD', instance.params.mapOptions)) {
                        instance.options.keyboardShortcuts = true;
                    }
                }
            }

            if (parseFloat(BX.width(window)) < 1280) {
                instance.options.minzoom = 3;
            }
        },
        /**
         * Map initialization
         */
        gmapInit: function () {
            var instance = this;
            instance.geocoder = new google.maps.Geocoder();
            instance.gmap = new google.maps.Map(document.getElementById(this.options.map), {

                center: new google.maps.LatLng(this.options.startLat, this.options.startLon),
                zoom: instance.options.zoom,
                minZoom: instance.options.minzoom,
                mapTypeId: instance.options.mapType,

                disableDefaultUI: true,

                zoomControl: instance.options.zoomControl,
                mapTypeControl: instance.options.mapTypeControl,
                scaleControl: instance.options.scaleControl,

                scrollwheel: instance.options.scrollwheel,
                disableDoubleClickZoom: instance.options.disableDoubleClickZoom,
                draggable: instance.options.draggable,
                keyboardShortcuts: instance.options.keyboardShortcuts

            });
            instance.positionFieldInit(); //Выбор селектора на картах google с поля ввода
            instance.prepareIcons();

            instance.setPointsMarkers();

            instance.getLocationIP(false);
            BX.bindDelegate(instance.btnLocationNode, 'click', {}, function () {
                instance.getLocation();
            });

        },
        /**
         * Recursive call function before complete initialization Google maps object
         */
        waitForMap: function () {
            if (window.google) {
                this.gmapInit();
            }
            else
                setTimeout(this.waitForMap(), 100);
        },
        /**
         * Block button for click while select position
         */
        startLocation: function () {
            var instance = this;
            BX.addClass(instance.btnLocationNode, '_binding');
            instance.positionBinding = true;
        },
        /**
         * Unblock button for click after select position
         */
        endLocation: function () {
            var instance = this;
            BX.removeClass(instance.btnLocationNode, '_binding');
            instance.positionBinding = false;
        },
        /**
         * Get current location from browser or IP service
         */
        getLocation: function () {

            var instance = this;
            if (instance.positionBinding)
                return;
            instance.startLocation();
            /*if (!navigator.geolocation) {
                this.getLocationIP();
            }
            else {
                this.getLocationBrowser();
            }*/
            this.getLocationIP(true);
        },
        getCookie: function(name) {
        	var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
	  		return matches ? decodeURIComponent(matches[1]) : undefined;
        },
        /**
         * Get current location from IP service
         */
        getLocationIP: function (current_place) {
            var instance = this;
            if (((typeof(instance.getCookie('lat')) === "undefined") || (typeof(instance.getCookie('lon')) === "undefined")) || (current_place == true)) {
                BX.ajax({
                    timeout: 20,
                    method: 'POST',
                    dataType: 'json',
                    async: true,
                    //url: "http://ip-api.com/json/?lang=" + instance.params.lang,
                    url: "/include/ajax/geoIP/geo_ip.php",
                    data: {'lang': instance.params.lang},
                    onsuccess: BX.delegate(function (result) {
                        if (result && result.status == 'success') {
                            instance.position = [result.lat, result.lon];
                        }
                        instance.locationUpdated(false);
                        if (instance.blockListUpdate)
                            instance.showOnMap(BX('link_dealer__' + instance.getParamId), instance.getParamId);

                    }, this),
                    onfailure: BX.delegate(function () {
                    }, this)
                });
                return false;
            }
            else {
                instance.position = [parseFloat(instance.getCookie('lat')), parseFloat(instance.getCookie('lon'))];
                instance.locationUpdated(false);
                if (instance.blockListUpdate)
                    instance.showOnMap(BX('link_dealer__' + instance.getParamId), instance.getParamId);

            }
        },
        /**
         * Get current location from browser
         */
        /*getLocationBrowser: function () {
            var instance = this;

            navigator.geolocation.getCurrentPosition(
                function (position) {
                    instance.position = [position.coords.latitude, position.coords.longitude];
                    instance.locationUpdated(false);
                },
                function () {
                    instance.position = false;
                    instance.locationUpdated(true);
                },
                {timeout: 10000, maximumAge: 5 * 60 * 1000}
            )
        },*/
        /**
         * Check location from IP if it is null
         * @param tryByIP
         */
        locationUpdated: function (tryByIP) {
            var instance = this;
            if (tryByIP) {
                instance.getLocationIP(false);

            }
            else {
                instance.endLocation();
                instance.getLocationAddress(instance.position); //Получить адрес из координат в поле ввода
                instance.updateMap();
            }
        },
        /**
         * Set map center from location parameters
         * @param position
         */
        focusOnPoint: function (position) {
            var instance = this;
            if (!position)
                return;
            instance.gmap.setCenter({
                lat: position[0],
                lng: position[1]
            });
        },
        /**
         * Update map and points
         */
        updateMap: function () {
            var instance = this;
            if (instance.position) {

                instance.updateDistance();
                instance.getClosestObjects();
                if (!instance.blockListUpdate)
                    instance.updatePointsList(instance.nearestPoints, true);
                instance.pointsListStatus = true;
                instance.updatePointsArea(instance.radius, instance.position);
                instance.updatePointsMarkers();
                if (!instance.blockListUpdate) {
                    instance.focusOnArea();
                    instance.focusOnPoint(instance.position);
                }

            }
            else {
                if (!instance.blockListUpdate)
                    instance.updatePointsList(false, false);
                instance.pointsListStatus = false;
                if (!instance.blockListUpdate) {
                    instance.focusOnPoint(false);
                }
            }
        },
        /**
         * Update distance before current position and points
         * @returns {boolean}
         */
        updateDistance: function () {
            var instance = this;
            instance.pointsDist = [];
            if (!instance.position)
                return false;
            if (!instance.points)
                return false;
            for (var id in instance.points) {
                if (!instance.points.hasOwnProperty(id)) {
                    continue;
                }
                instance.pointsDist.push({
                    dist: instance.getDistance(instance.points[id].LOCATION, instance.position),
                    id: id,
                });
            }
            return true;
        },
        /**
         * Get radius of nearest points
         * @param coords
         * @param position
         * @returns {number}
         */
        getDistance: function (coords, position) {
            var EARTH_RADIUS = 6372795;

            // перевести координаты в радианы
            var lat1 = coords[0] * Math.PI / 180;
            var lat2 = position[0] * Math.PI / 180;
            var long1 = coords[1] * Math.PI / 180;
            var long2 = position[1] * Math.PI / 180;

            // косинусы и синусы широт и разницы долгот
            var cl1 = Math.cos(lat1);
            var cl2 = Math.cos(lat2);
            var sl1 = Math.sin(lat1);
            var sl2 = Math.sin(lat2);
            var delta = long2 - long1;
            var cdelta = Math.cos(delta);
            var sdelta = Math.sin(delta);

            // вычисления длины большого круга
            var y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2));
            var x = sl1 * sl2 + cl1 * cl2 * cdelta;

            return Math.atan2(y, x) * EARTH_RADIUS;
        },
        /**
         * Get nearest points and update radius
         * @returns {boolean}
         */
        getClosestObjects: function () {
            var instance = this;
            instance.nearestPoints = [];
            instance.radius = 0;
            if (!instance.position)
                return false;
            if (!instance.points)
                return false;
            instance.pointsDist.sort(instance.pointsDistanceSort);
            var count = 0;
            for (var key in instance.pointsDist) {
                if (!instance.pointsDist.hasOwnProperty(key)) {
                    continue;
                }
                count++;
                instance.nearestPoints.push(instance.pointsDist[key].id);
                if (instance.radius < instance.pointsDist[key].dist)
                    instance.radius = instance.pointsDist[key].dist;
                if (instance.params.countNearestPoints <= count)
                    break;
            }
            if (instance.radius != 0)
                instance.radius = instance.radius + 5000;
            return true;
        },
        /**
         * Function sort distance nearest points
         * @param point1
         * @param point2
         * @returns {number}
         */
        pointsDistanceSort: function (point1, point2) {
            return point1.dist - point2.dist;
        },
        /**
         * Set marker on map
         * @param iconType
         * @param position
         * @returns {google.maps.Marker}
         */
        setMarker: function (iconType, position) {
            var instance = this;
            return new google.maps.Marker({
                draggable: false,
                map: instance.gmap,
                icon: instance.icons[iconType],
                optimized: true,
                position: new google.maps.LatLng({lat: +position[0], lng: +position[1]}),
            });
        },
        /**
         * Selector set location on google maps from field input
         * @returns {boolean}
         */
        positionFieldInit: function () {
            var instance = this;
            instance.positionField = instance.fieldInputAddressNode;
            if (instance.positionField.length == 0)
                return false;

            instance.positionFieldComp = new google.maps.places.Autocomplete(instance.positionField, {types: ['geocode']});

            google.maps.event.addListener(instance.positionFieldComp, 'place_changed', function () {
                var place = instance.positionFieldComp.getPlace();
                if (!place.geometry) {
                    return;
                }
                instance.setLocation([
                    place.geometry.location.lat(),
                    place.geometry.location.lng()
                ]);
            });
        },
        /**
         * Set location from field input
         * @param coords
         */
        setLocation: function (coords) {
            var instance = this;
            instance.position = coords;
            instance.updateMap();
        },
        /**
         * Get Address from coordinates to Field Input
         * @param coords
         */
        getLocationAddress: function (coords) {
            var instance = this;
            if (!(coords && instance.positionField))
                return;

            instance.geocoder.geocode(
                {
                    'latLng': {
                        lat: coords[0],
                        lng: coords[1]
                    }
                },
                function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[1]) {
                            instance.positionField.value = results[0].formatted_address; // записывает адрес
                        }
                    }
                }
            );
        },

        updatePointsList: function (points, useNumber) {
            var instance = this, _height_,
                dealer = document.getElementsByClassName('dealer'),
                header = document.getElementsByClassName('header'),
                search = document.getElementsByClassName('search'),
                footer = document.getElementsByClassName('footer'),
                wrap = document.getElementsByClassName('wrap');
            // if (header && search && footer) {
                _height_ = header[0].offsetHeight + search[0].offsetHeight + footer[0].offsetHeight;
                _height_ = window.innerHeight - _height_;
                // wrap[0].setAttribute("style","height:"+_height_+"px");
                // dealer[0].setAttribute("style","height:"+_height_+"px");
                // wrap[0].style.height = _height_ + 'px';
            // }
            console.log(window.innerHeight, _height_, window.innerHeight, window.clientHeight );
            console.log(header[0].offsetHeight);
            console.log(header);
            console.log(search);
            console.log(footer);
            BX.cleanNode(instance.listPointsNode);
            if (!points)
                return;
            var k = 0;
            for (var id in points) {
                if (!points.hasOwnProperty(id)) {
                    continue;
                }
                var pointData = instance.points[points[id]];

                if (useNumber) {
                    k++;
                    pointData.NUMBER = k;
                }
                else
                    pointData.NUMBER = 0;

                var pointBlockNode, pointNumberNode, pointAddressNode, mapLinkNode, propsNodes = [];

                pointNumberNode = BX.create('a', {
                    props: {className: 'dealer__list-number'},
                });

                if (pointData.NUMBER > 0) {
                    BX.adjust(pointNumberNode, {
                        props: {href: 'javascript:void(0)'},
                        text: pointData.NUMBER
                    });
                    instance.activeOnMap(pointNumberNode, pointData.ID);
                }

                propsNodes.push(pointNumberNode);
                if (instance.params.lang == 'ru') {
                    if (typeof(pointData.NAME) != 'undefined') {
                        var nameNode = BX.create('DIV', {
                            props: {className: 'dealer__list-name'}
                        });
                        var namePoint = BX.create('a', {
                            props: {href: 'javascript:void(0)'},
                            html: pointData.NAME
                        });
                        BX.append(namePoint, nameNode);
                        instance.activeOnMap(namePoint, pointData.ID);

                        propsNodes.push(nameNode);
                    }
                    for (var key in instance.pointsDist) {
                        if (!instance.pointsDist.hasOwnProperty(key)) {
                            continue;
                        }
                        if (instance.pointsDist[key].id == points[id]) {
                            var pointDistance = parseFloat(instance.pointsDist[key].dist);
                            if (pointDistance > 0) {
                                var distKM = pointDistance / 1000;
                                propsNodes.push(BX.create('P', {
                                    props: {className: 'dealer__list-info _i-distance'},
                                    html: '<span class="dealer__list-distance-bg ">' + BX.util.number_format(distKM, 1, '.', ' ') + ' км</span>'
                                }));
                            }
                        }
                    }
                    if (typeof(pointData.ADDRESS) != 'undefined') {

                        pointAddressNode = BX.create('P', {
                            props: {className: 'dealer__list-info _i-place'},
                            html: pointData.ADDRESS + ' '
                        });
                    }
                    mapLinkNode = BX.create('a', {
                        //props: {href: 'javascript:void(0)'},
                        props: {href: 'javascript:void(0)', id: 'link_dealer__' + instance.points[points[id]].ID},
                        text: 'Показать на карте',
                    });
                }
                if (instance.params.lang == 'en') {
                    if (typeof(pointData.NAME_EN) != 'undefined') {
                        var nameNode = BX.create('DIV', {
                            props: {className: 'dealer__list-name'}
                        });
                        var namePoint = BX.create('a', {
                            props: {href: 'javascript:void(0)'},
                            html: pointData.NAME_EN
                        });
                        BX.append(namePoint, nameNode);
                        instance.activeOnMap(namePoint, pointData.ID);

                        propsNodes.push(nameNode);
                    }
                    for (var key in instance.pointsDist) {
                        if (!instance.pointsDist.hasOwnProperty(key)) {
                            continue;
                        }
                        if (instance.pointsDist[key].id == points[id]) {
                            var pointDistance = parseFloat(instance.pointsDist[key].dist);
                            if (pointDistance > 0) {
                                var distKM = pointDistance / 1000;
                                propsNodes.push(BX.create('P', {
                                    props: {className: 'dealer__list-info _i-distance'},
                                    html: '<span class="dealer__list-distance-bg ">' + BX.util.number_format(distKM, 1, '.', ' ') + ' km</span>'
                                }));
                            }
                        }
                    }
                    //if (typeof(pointData.ADDRESS_EN) != 'undefined') {

                    pointAddressNode = BX.create('P', {
                        props: {className: 'dealer__list-info _i-place'},
                        html: pointData.ADDRESS_EN + ' '
                    });
                    //}
                    mapLinkNode = BX.create('a', {
                        props: {href: 'javascript:void(0)', id: 'link_dealer__' + instance.points[points[id]].ID},
                        //props: {href: 'javascript:void(0)'},
                        text: 'Show on the map',
                    });
                }

                instance.seeOnMap(mapLinkNode, pointData.ID);

                if (typeof(pointData.LOCATION) != 'undefined'&& pointData.LOCATION!=="") {
                    pointAddressNode.appendChild(mapLinkNode);
                }
                if (pointAddressNode) {
                    propsNodes.push(pointAddressNode);
                }
                if (typeof(pointData.PHONE) != 'undefined'&& pointData.PHONE!=="") {
                    for (var key in pointData.PHONE) {
                        if (!pointData.PHONE.hasOwnProperty(key)) {
                            continue;
                        }

                        var item = pointData.PHONE[key];
						
                            propsNodes.push(
                                BX.create('P', {
                                    props: {className: 'dealer__list-info _i-phone'},
                                    html: '<a href="tel:' + item + '"><b>' + item + '</b></a>'
                                }));						
						/*22222222222222222222
                        if (item[1] != '') {
                            propsNodes.push(
                                BX.create('P', {
                                    props: {className: 'dealer__list-info _i-phone'},
                                    html: item[1] + ': <a href="tel:' + item[0] + '"><b>' + item[0] + '</b></a>'
                                }));
                        }
                        else {
                            propsNodes.push(
                                BX.create('P', {
                                    props: {className: 'dealer__list-info _i-phone'},
                                    html: '<a href="tel:' + item[0] + '"><b>' + item[0] + '</b></a>'
                                }));
                        }*/
                    }
                }
                if (typeof(pointData.EMAIL) != 'undefined'&& pointData.EMAIL!=="") {
                    for (var key in pointData.EMAIL) {
                        if (!pointData.EMAIL.hasOwnProperty(key)) {
                            continue;
                        }
                        var item = pointData.EMAIL[key];
						
                            propsNodes.push(
                                BX.create('P', {
                                    props: {className: 'dealer__list-info _i-mail'},
                                    html: '<a href="mailto:' + item + '">' + item + '</a>'
                                }));						
						
						/*2222222222222
                        if (item[1] != '') {
                            propsNodes.push(
                                BX.create('P', {
                                    props: {className: 'dealer__list-info _i-mail'},
                                    html: item[1] + ': <a href="mailto:' + item[0] + '">' + item[0] + '</a>'
                                }));
                        }
                        else {
                            propsNodes.push(
                                BX.create('P', {
                                    props: {className: 'dealer__list-info _i-mail'},
                                    html: '<a href="mailto:' + item[0] + '">' + item[0] + '</a>'
                                }));
                        }*/
                    }
                }
                if (typeof(pointData.SITE) != 'undefined' && pointData.SITE!=="")
                {


                    if(pointData.SITE.substring(0,7)!=="http://" && pointData.SITE.substring(0,8)!=="https://")
                    {
                        pointData.SITE = "http://"+pointData.SITE;
                    }
                    propsNodes.push(
                        BX.create('P', {
                            props: {className: 'dealer__list-info _i-site'},
                            html: '<a href="' + pointData.SITE + '" target="_blank" rel="nofollow">' + pointData.SITE + '</a>'
                        }));
                }

                pointBlockNode = BX.create('DIV', {
                    props: {className: 'dealer__list-item', id: 'dealer__' + instance.points[points[id]].ID},
                    children: propsNodes
                });

                instance.listPointsNode.appendChild(pointBlockNode);
            }
        },

        seeOnMap: function (node, id) {
            var instance = this;
            BX.adjust(node, {
                events:
                    {
                        click: BX.delegate(function (e) {
                            instance.focusOnMarker(id);
                            var mapNode = BX.findChild(BX('map_markers'), {'class': 'lm-map'}, true);
                            if (mapNode) {
                                BX.addClass(mapNode, 'lm-map_hidden');
                            }
                            var closeBtn = BX.findChild(BX('map_markers'), {'class': 'lm-map-open'}, true);
                            if (closeBtn) {
                                BX.addClass(closeBtn, 'lm-map-open_active');
                            }
                        })
                    }
            });
        },

        showOnMap: function (node, id) {
            var instance = this;
            instance.focusOnMarker(id);
            var mapNode = BX.findChild(BX('map_markers'), {'class': 'lm-map'}, true);
            if (mapNode) {
                BX.addClass(mapNode, 'lm-map_hidden');
            }
            var closeBtn = BX.findChild(BX('map_markers'), {'class': 'lm-map-open'}, true);
            if (closeBtn) {
                BX.addClass(closeBtn, 'lm-map-open_active');
            }
            instance.blockListUpdate = false;
        },

        activeOnMap: function (node, id) {
            var instance = this;
            BX.adjust(node, {
                events:
                    {
                        click: BX.delegate(function (e) {
                            instance.clickPoint(id, false);
                        })
                    }
            });
        },

        setPointsMarkers: function () {
            var instance = this;
            instance.pointsBounds = new google.maps.LatLngBounds();
            for (var id in instance.points) {
                if (!instance.points.hasOwnProperty(id)) {
                    continue;
                }
                var pointmarker = instance.setMarker('point', instance.points[id].LOCATION);
                instance.setClickPoints(pointmarker, id);
                instance.pointsIcons[id] = pointmarker;
                instance.pointsBounds.extend(instance.pointsIcons[id].getPosition());
            }
            if (!instance.blockListUpdate)
                instance.gmap.fitBounds(instance.pointsBounds);
        },

        setClickPoints: function (pointmarker, id) {
            var instance = this;
            pointmarker.addListener('click', function () {
                instance.clickPoint(id);
            });
        },

        updatePointsMarkers: function (points) {
            var instance = this;
            var id, key, current = 0;
            for (id in instance.points) {
                if (!instance.points.hasOwnProperty(id)) {
                    continue;
                }
                instance.pointsIcons[id].setIcon(instance.icons.point);
                instance.pointsIcons[id].setLabel('');
            }
            for (key in instance.nearestPoints) {
                if (!instance.nearestPoints.hasOwnProperty(key)) {
                    continue;
                }
                current++;
                id = instance.nearestPoints[key];
                instance.pointsIcons[id].setIcon(instance.icons.pointArea);
                instance.labelStyle.text = '' + current;
                instance.pointsIcons[id].setLabel(instance.labelStyle);
            }
            instance.resetMarkerActivity();
        },

        resetMarkerActivity: function () {
            var instance = this;
            instance.pointActiveArea = false;
            instance.pointActiveIcon = false;
        },

        clickPoint: function (id, jump) {
            var instance = this;
            var areaPoint = false;
            if (typeof(jump) == 'undefined') {
                jump = true;
            }
            for (var key in instance.nearestPoints) {
                if (!instance.nearestPoints.hasOwnProperty(key)) {
                    continue;
                }
                if (id == instance.nearestPoints[key]) {
                    areaPoint = true;
                    break;
                }
            }
            if (instance.pointActiveIcon) {
                if (instance.pointActiveArea)
                    instance.pointActiveIcon.setIcon(instance.icons.pointArea);
                else
                    instance.pointActiveIcon.setIcon(instance.icons.point);
            }
            if (areaPoint) {
                instance.pointsIcons[id].setIcon(instance.icons.pointAreaActive);
            }
            else {
                instance.pointsIcons[id].setIcon(instance.icons.pointActive);
            }

            var mapNode = BX.findChild(BX('map_markers'), {'class': 'lm-map'}, true);
            if (mapNode) {
                BX.removeClass(mapNode, 'lm-map_hidden');
                BX.addClass(mapNode, 'lm-map_show-dealers');
            }

            instance.showActivePoint(id, jump);
            instance.pointActiveArea = areaPoint;
            instance.pointActiveIcon = instance.pointsIcons[id];
        },

        prepareIcons: function () {
            var instance = this;
            for (var icon in instance.icons) {
                if (!instance.icons.hasOwnProperty(icon)) {
                    continue;
                }
                var iconObj = {};
                for (var key in instance.icons[icon]) {
                    if (!instance.icons[icon].hasOwnProperty(key)) {
                        continue;
                    }
                    var iconData = instance.icons[icon][key];
                    console.log(instance.params.templatePath + '/' + iconData);
                    if (key == 'url') {
                        iconObj[key] = instance.params.templatePath + '/' + iconData;
                    }
                    else if (key == 'urlIE') {
                        if (BX.browser.DetectIeVersion() > 0) {
                            iconObj['url'] = instance.params.templatePath + '/' + iconData;
                        }
                    }
                    else if (key == 'size' || key == 'scaledSize') {
                        iconObj[key] = new google.maps.Size(iconData[0], iconData[1]);
                    }
                    else if (key == 'anchor' || key == 'origin') {
                        iconObj[key] = new google.maps.Point(iconData[0], iconData[1]);
                    }
                    else {
                        iconObj[key] = iconData;
                    }
                }
                instance.icons[icon] = iconObj;
            }
        },

        showActivePoint: function (id, jump) {
            var instance = this;
            if (typeof(jump) == 'undefined') {
                jump = true;
            }
            if (id) {
                if (BX('dealer__' + id) == null) {
                    if (BX.util.in_array(id, instance.nearestPoints) && !instance.pointsListStatus) {
                        instance.updatePointsList(instance.nearestPoints, true);
                        instance.pointsListStatus = true;

                    }
                    else {
                        instance.updatePointsList([id], false);
                        instance.pointsListStatus = false;

                    }
                }
                else {
                    var listPoints = BX.findChild(instance.listPointsNode, {}, true, true);
                    listPoints.forEach(function (element) {
                        BX.removeClass(element, instance.pointsActiveClass);
                    });
                }
                BX.addClass(BX('dealer__' + id), instance.pointsActiveClass);
                if (jump) {
                    instance.scrollToElement('dealer__' + id);
                }
                var closeBtn = BX.findChild(BX('map_markers'), {'class': 'lm-map-open'}, true);
                if (closeBtn) {
                    BX.removeClass(closeBtn, 'lm-map-open_active');
                }
            }
            else {
                instance.updatePointsList(instance.nearestPoints, true);
                instance.pointsListStatus = true;

            }
        },

        focusOnMarker: function (id) {
            var instance = this;
            if (!id || typeof(instance.pointsIcons[id]) == 'undefined')
                return;
            instance.gmap.setZoom(12);
            instance.gmap.setCenter(instance.pointsIcons[id].getPosition());
            instance.clickPoint(id);
        },

        focusOnArea: function () {
            var instance = this;
            if (!instance.circle)
                return;
            instance.gmap.fitBounds(instance.circle.getBounds());
        },

        updatePointsArea: function (radius, position) {
            var instance = this;
            if (radius && position) {
                if (!instance.circle) {
                    instance.circleParams.radius = radius;
                    instance.circleParams.center = new google.maps.LatLng({lat: +position[0], lng: +position[1]});
                    instance.circle = new google.maps.Circle(instance.circleParams);
                    instance.circle.setMap(instance.gmap);
                }
                else {
                    instance.circle.setCenter(new google.maps.LatLng({lat: +position[0], lng: +position[1]}));
                    instance.circle.setRadius(radius);
                }
                if (!instance.positionIcon) {
                    instance.positionIcon = instance.setMarker('position', position);
                }
                else {
                    instance.positionIcon.setPosition(new google.maps.LatLng({lat: +position[0], lng: +position[1]}));
                }
            }
            else {
                if (instance.circle)
                    instance.circle.setMap(false);
                if (instance.positionIcon)
                    instance.positionIcon.setMap(false);
            }
        },

        scrollToElement: function (point) {
            document.getElementById(point).scrollIntoView();
        },

        getParams: function () {
            var instance = this;
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
                vars[key] = value;
            });
            if (typeof(vars['show_id']) !== "undefined" && vars['show_id'] !== "") {
                instance.blockListUpdate = true;
                instance.getParamId = vars['show_id'];
            }
        }

    };
})();
