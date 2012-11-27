var pointsArray;
var listView;
$(document).ready(function () {
    $("#loading").hide();
    $("#loading").html('Laadin andmeid...<br/><img src="../css/ajax-loader.gif" alt="Loading"/>');
    var listView = Backbone.View.extend({
        events: { // 'change #onclick' : 'changeCategory'
        },
        request: null,
        pointsArray: [],
        pointsArrayHold: [],
        vector_points: null,
        mapBounds: '',
        el: $('#map'), // attaches `this.el` to an existing element.
    
        initialize: function(){
            _.bindAll(this, 'render','loadPoints','selectControl','onFeatureSelect','onFeatureUnselect','popupClose','getCategories', 'changePoint', 'deletePoint','checkTime','getEditCategories','cluster','checkCluster','controlCluster'); // fixes loss of context for 'this' within method
            this.render(); // not all views are self-rendering. This one is.
            this.getCategories();
            this.getEditCategories();
            window.listView = this;
        },
        render: function(){
            var self=this;
            //   $(this.el).append('<ul> <li>hello world</li> </ul>');  
            var getExtent = $.getJSON('getuser/getbboxforwebclient', function(data) {  
                mapextent = new OpenLayers.Bounds(data.xmin,data.ymin, data.xmax, data.ymax);
                // Tartu
                // mapextent = new OpenLayers.Bounds(2948518.4067798, 8028114.5837566, 3003553.0671374, 8058116.1173544);
                // Pärnu
                // mapextent = new OpenLayers.Bounds(2618769.0597054, 7988157.1343098, 2838907.7010654, 8108163.2686622);
                // Eesti 
                mapextent2 = new OpenLayers.Bounds(2358118.7933957, 7845372.7653965, 3238673.3591237, 8325397.3029635);
          
                var openStreetMap = new OpenLayers.Layer.OSM("OSM","",{
                    attribution: '',
                    isBaseLayer:true,
                    zoomOffset: 8,
                    resolutions: [611.4962262 ,305.7481131 , 152.8740565, 76.4370282714844,38.2185141357422,19.1092570678711,9.55462853393555,4.77731426696777,2.38865713348389,1.19432856674194,0.597164283]          
                });
                var options = { 
                    layers              : [openStreetMap],
                    controls: [
                    new OpenLayers.Control.Navigation(),
                    new OpenLayers.Control.Attribution(),
                    new OpenLayers.Control.ScaleLine(),
                    // new OpenLayers.Control.PanZoomBar(),
                    new OpenLayers.Control.OverviewMap(),
                    new OpenLayers.Control.Zoom(),
                    new OpenLayers.Control.MousePosition()
                    ],
                    units: 'm',
                    maxExtent: mapextent,
                    restrictedExtent: mapextent2,
                    projection: new OpenLayers.Projection("EPSG:900913"),
                    panMethod: OpenLayers.Easing.Quad.easeInOut,
                    panDuration: 50
                };
            
                map = new OpenLayers.Map("map", options);
                map.zoomToExtent(mapextent); 
                /*  map.events.register('zoomend', this, function (event) {
                var x = map.getZoom();
                if( x < 11)
                {
                    map.zoomTo(11);
                }
            });*/
                $(self.el).append(map); 
                self.loadPoints(); 
            });
        // console.log(map.getExtent());
        },
        loadPoints: function() {
            $("#loading").show();
            var self = this;
            var zoom = map.getZoom();
            var params = '';
            this.mapBounds = map.getExtent();
            //console.log(zoom + " "+ this.mapBounds)
            //testandmed
            // var url = "data/testData.gjson";
            //request url serverisse peaks siia tulema vastavate parameetritega
            //tagasi pean saama gjson formaadi
            // http://gistudeng.gg.bg.ut.ee/Report_Collector/index.php/transmit
            //this.request = $.getJSON('data/api.php?func=1&zoom='+zoom+'&bbox='+this.mapBounds+'&params='+params, function(data) {
            this.request = $.getJSON('transmit', function(data) {
                $.each(data.features, function(index, value) { 
                    // radius
                    value.properties.RADIUS = 10;
                    if(value.properties.RADIUS<5){
                        value.properties.RADIUS = 5;
                    }else if(value.properties.RADIUS>30){
                        value.properties.RADIUS = 30;
                    }
                });
                var geoformat = new OpenLayers.Format.GeoJSON();
                var feats = geoformat.read(data);
                $.each(feats, function(index, value) { 
                    self.pointsArray.push(feats[index]);
                });
                window.pointsArray = self.pointsArray; 
                self.pointsArrayHold = self.pointsArray;
                //style
                var context = {
                    getSize: function(feature){
                        var myRadius;
                        // myRadius = feature.attributes.RADIUS*(0.5*(map.getZoom()+1))
                        myRadius = 12;
                        return myRadius;
                    },
                    label: function(feature) {
                        // clustered features count or blank if feature is not a cluster
                        return feature.cluster ? feature.cluster.length : "";  
                    },
                    getColor: function(feature) {
                        //var color = feature.attributes.COLOR;
                        var color;
                        if(feature.cluster) {    
                            // feature.cluster.fillColor = feature.cluster[0].attributes.COLOR;
                            // color = feature.cluster[0].attributes.COLOR;
                            color = '#000000' 
                        }
                        else {
                            color = feature.attributes.COLOR;  
                        }  
                        return color;
                    },
                    getFontColor: function (feature) {
                        var fontColor = "#FFFFFF";
                        return fontColor;
                    }               
                };
                
                var template = {
                    pointRadius: "${getSize}",
                    fillColor: "${getColor}",
                    // fillColor: "#FF0000",
                    fillOpacity: 0.7,
                    strokeColor: "#595A59",
                    strokeOpacity: 0.7,
                    // label: "${count}",
                    label: "${label}",
                    labelOutlineWidth: 1,
                    fontColor: "${getFontColor}",
                    //fontOpacity: 0.8,
                    //fontSize: "16px",
                    strokeWidth: 2,
                    graphicZIndex: 1
                }

                myStyle = new OpenLayers.StyleMap({
                    "default" : new OpenLayers.Style(template,{
                        context:context
                    }),
                    "select": new OpenLayers.Style({
                        fillColor: "#66ccff",
                        fillOpacity: 0.7,
                        strokeColor: "#3399ff",
                        strokeOpacity: 0.7,
                        graphicZIndex: 2
                    }),
                    "invisible": new OpenLayers.Style({             
                        display: "none"
                    })
                });
                
                /* Adding an Multipoint Vector Layer with cluster strategy */
                clusterStrategy = new OpenLayers.Strategy.Cluster({
                    distance: 45,
                    threshold: 2,
                    deactivate: function() {
                        var deactivated = OpenLayers.Strategy.prototype.deactivate.call(this);
                        if(deactivated) {
                            var features = [];
                            var clusters = this.layer.features;
                            for (var i=0; i<clusters.length; i++) {
                                var cluster = clusters[i];
                                if (cluster.cluster) {
                                    for (var j=0; j<cluster.cluster.length; j++) {
                                        features.push(cluster.cluster[j]);
                                    }
                                } else {
                                    features.push(cluster);
                                }
                            }
                            this.layer.removeAllFeatures();
                            this.layer.events.un({
                                "beforefeaturesadded": this.cacheFeatures,
                                "moveend": this.cluster,
                                scope: this
                            });
                            this.layer.addFeatures(features);
                            this.clearCache();
                        }
                        return deactivated;
                    },
                    activate: function() {
                        this.layer.removeFeatures(self.pointsArray);
                        this.layer.addFeatures(self.pointsArray);
                        var activated = OpenLayers.Strategy.prototype.activate.call(this);
                        if(activated) {
                            // console.log(activated);
                            var features = [];
                            var clusters = this.layer.features;
                            for (var i=0; i<clusters.length; i++) {
                                var cluster = clusters[i];
                                if (cluster.cluster) {
                                    for (var j=0; j<cluster.cluster.length; j++) {
                                        features.push(cluster.cluster[j]);
                                    }
                                } else {
                                    features.push(cluster);
                                }
                            }
                            this.layer.removeAllFeatures();
                            this.layer.events.on({
                                "beforefeaturesadded": this.cacheFeatures,
                                "moveend": this.cluster,
                                scope: this
                            });  
                            
                            this.layer.addFeatures(features);
                            this.clearCache();
                        }
                        return activated;
                    },
                    
                    /**
                     * Method: cluster
                     * Cluster features based on some threshold distance.
                     *
                     * Parameters:
                     * event - {Object} The event received when cluster is called as a
                     *     result of a moveend event.
                     */
                    cluster: function(event) {
                        if((!event || event.zoomChanged || (event && event.recluster)) && this.features) {
                            // var resolution = this.layer.map.getResolution();
                            var resolution = map.getResolution();
                            if(resolution != this.resolution || !this.clustersExist() || (event && event.recluster)) {
                                this.resolution = resolution;
                                var clusters = [];
                                var feature, clustered, cluster;
                                for(var i=0; i<this.features.length; ++i) {
                                    feature = this.features[i];
                                    if(feature.geometry) {
                                        clustered = false;
                                        for(var j=clusters.length-1; j>=0; --j) {
                                            cluster = clusters[j];
                                            if(this.shouldCluster(cluster, feature)) {
                                                this.addToCluster(cluster, feature);
                                                clustered = true;
                                                break;
                                            }
                                        }
                                        if(!clustered) {
                                            clusters.push(this.createCluster(this.features[i]));
                                        }
                                    }
                                }
                                this.layer.removeAllFeatures();
                                if(clusters.length > 0) {
                                    if(this.threshold > 1) {
                                        var clone = clusters.slice();
                                        clusters = [];
                                        var candidate;
                                        for(var i=0, len=clone.length; i<len; ++i) {
                                            candidate = clone[i];
                                            if(candidate.attributes.count < this.threshold) {
                                                Array.prototype.push.apply(clusters, candidate.cluster);
                                            } else {
                                                clusters.push(candidate);
                                            }
                                        }
                                    }
                                    this.clustering = true;
                                    // A legitimate feature addition could occur during this
                                    // addFeatures call.  For clustering to behave well, features
                                    // should be removed from a layer before requesting a new batch.
                                    this.layer.addFeatures(clusters);
                                    this.clustering = false;
                                }
                                this.clusters = clusters;
                            }
                        }
                    },

                    /**
                     * Method: recluster
                     * User-callable function to recluster features
                     * Useful for instances where a clustering attribute (distance, threshold, ...)
                     *     has changed
                     */
                    recluster: function(){
                        var event={
                            "recluster":true
                        };
                        this.cluster(event);
                    }
                });
                // vector layer
                self.vector_points = new OpenLayers.Layer.Vector('Points', {
                    /* protocol: new OpenLayers.Protocol.HTTP({
                        url: "transmit",
                        format: new OpenLayers.Format.GeoJSON()
                    }),  */
                    // eventListeners: {
                    //"featuresadded": dataLoaded
                    //  },
                    // features: self.pointsArray,
                    //  renderers: ['Canvas','SVG'],
                    //  strategies: [
                    //  new OpenLayers.Strategy.Cluster(),
                    //  new OpenLayers.Strategy.Fixed(),
                    /* new OpenLayers.Strategy.AnimatedCluster({
                        distance: 45,
                        animationMethod: OpenLayers.Easing.Expo.easeOut,
                        animationDuration: 10
                    }) */
                    //  new OpenLayers.Strategy.AttributeCluster({
                    //  attribute: ['COLOR']
                    //       })
                    //   ],
                    // styleMap: lstyle,
                    //  styleMap: new OpenLayers.StyleMap(style)
                    strategies: [clusterStrategy],
                    /* styleMap: new OpenLayers.StyleMap({
                         "default": style
                    }), */
                    styleMap: myStyle,
                    rendererOptions: {
                        yOrdering: true,
                        zIndexing: true
                    }    
                });
                // cluster threshold
                var clusterMaxZoom = 9;  // Zoom level start at  0.
                map.events.register("zoomend", null, function() {  // respond to map extent change (move)
                    var zoom = map.getZoom();
                    // console.log('zoom is ' + zoom);
                    // disable cluster when zoom greater than threshold
                    if (zoom > clusterMaxZoom) {  // read current zoom
                        if($('#check-cluster').is(':checked')==true) {
                            clusterStrategy.activate();      // disable cluster strategy 
                        }
                        else {
                            clusterStrategy.deactivate();  
                        }
                    //clusterStrategy.clearCache();    // clear cluster cache
                    //console.log('deactivate cluster');
                    } else {
                        if($('#check-cluster').is(':checked')==false) {
                            clusterStrategy.deactivate(); 
                        }
                        else {
                            clusterStrategy.activate();
                        } 

                    // console.log('activate cluster');
                    }
                });
                // self.vector_points.removeAllFeatures();
                //  self.vector_points.addFeatures(self.pointsArray);
                self.vector_points.addFeatures(self.pointsArray);
                //  self.vector_points2.addFeatures(self.pointsArray2);
                //self.vector_points.drawFeature(self.pointsArray);
                map.addLayer(self.vector_points);
                // map.removeLayer(self.vector_points);
                // self.vector_points.addFeatures(self.pointsArray);
                self.selectControl(self.vector_points);
                //  self.selectControl(self.vector_points2);
                self.checkTime();
                $("#loading").hide();
                self.controlCluster();
                self.checkCluster();
            });
        },
        selectControl: function(vector_points){
            // Create a select feature control and add it to the map
            selectControl = new OpenLayers.Control.SelectFeature(vector_points,
            {
                clickout: true, 
                toggle: true,
                multiple: false, 
                hover: false,
                autoActivate: true,
                onSelect: this.onFeatureSelect,
                onUnselect: this.onFeatureUnselect
            });
            map.addControl(selectControl);
            selectControl.activate(); 
        },
        onFeatureSelect: function(feature){
            //  geocode= feature.attributes['ID'];             
            selectedFeature = feature;
            var photo;
            var self=this;
            if(feature.cluster) {
                // kui klastri suurus 1 naitan infot
                if(feature.cluster.length==1) {
                    $.get("transmit/getphotobyid?id="+ selectedFeature.cluster[0].attributes['ID'], 
                        function(data){ 
                            photo = data;
                            // HTML PopUp
                            var html = "ID: "+ selectedFeature.cluster[0].attributes['ID'] + "<br/>" +
                            "Aeg: " + selectedFeature.cluster[0].attributes['TIMESTAMP']+ "<br/>"+
                            //  <img style="width: 100%" src="data:image/jpeg;base64,' + data + '" />
                            "GPS täpsus: " +selectedFeature.cluster[0].attributes['GPS_ACCURACY'] + "<br/>"+
                            "Pilt kohast: " + "<br/>"+
                            '<img style="width: 300px; height: 350px; " src="data:image/jpeg;base64,' + photo+ '" />' +
                            "<br/>"+
                            "Kategooria: " + selectedFeature.cluster[0].attributes['CATEGORY'] + "<br/>"+ 
                            "Kommentaar: " + selectedFeature.cluster[0].attributes['COMMENTARY'] + "<br/>" 
                            //   "<a  id = 'onclick'>Muuda kategooriat</a>"  + "<br/>" + 
                            //   "<a id ='delete2'>&#32;Kustuta</a>" + "<br/>" ;
                            //  console.log($.base64.decode(selectedFeature.attributes['PICTURE']));
                            popup = new OpenLayers.Popup.FramedCloud("data",
                                feature.geometry.getBounds().getCenterLonLat(),
                                null,
                                html,
                                null, 
                                true, 
                                self.popupClose);

                            feature.popup = popup;
                            map.addPopup(popup);

                        });
                }
                else { // muidu suumin lahemale
                    var x = map.getZoom();
                    var count = 0;
                    var html = "";
                    if(x==10) { // kui suum 10 naitan klastri koikide punktide infot                       
                        $.each(feature.cluster, function(index, value) {
                            $.get("transmit/getphotobyid?id="+ selectedFeature.cluster[index].attributes['ID'], 
                                function(data){ 
                                    photo = data;
                                    count++;
                                    // HTML
                                    html += "ID: "+ selectedFeature.cluster[index].attributes['ID'] + "<br/>" +
                                    "Aeg: " + selectedFeature.cluster[index].attributes['TIMESTAMP']+ "<br/>"+
                                    //  <img style="width: 100%" src="data:image/jpeg;base64,' + data + '" />
                                    "GPS täpsus: " +selectedFeature.cluster[index].attributes['GPS_ACCURACY'] + "<br/>"+
                                    "Pilt kohast: " + "<br/>"+
                                    '<img style="width: 300px; height: 350px; " src="data:image/jpeg;base64,' + photo+ '" />' +
                                    "<br/>"+
                                    "Kategooria: <span id='changeCategory" + selectedFeature.cluster[index].attributes['ID'] +  "'>" + 
                                    selectedFeature.cluster[index].attributes['CATEGORY']  + "</span>"+
                                    " <a  id='change"+ selectedFeature.cluster[index].attributes['ID'] +"' class = 'catChange' >Muuda</a> <br/>"+ 
                                    "Kommentaar: " + selectedFeature.cluster[index].attributes['COMMENTARY'] + "<br/>" +
                                    "<a class ='deleteClusterPoint' id='cluster"+ selectedFeature.cluster[index].attributes['ID'] + 
                                    "'>Kustuta</a>" + "<br/>" ;
                                    if(count == feature.cluster.length) {
                                        $("#clusters").html(html);
                                        $("#close").bind('click', function(e) {
                                            e.preventDefault();
                                            $("#info").hide();
                                        //if(selectedFeature != null)
                                        //selectControl.unselect(selectedFeature);
                                        });
                                        $("#info").show();
                                        self.deletePoint();
                                        self.changePoint();
                                    }
                                // self.deletePoint();
                                // self.changePoint();
                                });
                        });
                    }
                    else {
                        map.zoomTo(x+1);
                        if($('#cluster').is(':checked')==true){
                            selectControl2.unselect(selectedFeature);
                        }
                        
                    }

                }
            }
            else {
                $.get("transmit/getphotobyid?id="+ selectedFeature.attributes['ID'], 
                    function(data){ 
                        photo = data;
                        // HTML PopUp
                        var html = "ID: "+ selectedFeature.attributes['ID'] + "<br/>" +
                        "Aeg: " + selectedFeature.attributes['TIMESTAMP']+ "<br/>"+
                        //  <img style="width: 100%" src="data:image/jpeg;base64,' + data + '" />
                        "GPS täpsus: " +selectedFeature.attributes['GPS_ACCURACY'] + "<br/>"+
                        "Pilt kohast: " + "<br/>"+
                        '<img style="width: 300px; height: 350px; " src="data:image/jpeg;base64,' + photo+ '" />' +
                        "<br/>"+
                        "Kategooria: <span id='changeCategory"+ selectedFeature.attributes['ID']+ "'>" + 
                        selectedFeature.attributes['CATEGORY'] + "</span>"+
                        " <a  id ='change" + selectedFeature.attributes['ID'] + "' class = 'catChange' >Muuda</a> <br/>"+ 
                        "Kommentaar: " + selectedFeature.attributes['COMMENTARY'] + "<br/>"  +
                        "<a id ='delete2'>Kustuta</a>" + "<br/>" ;
                        //  console.log($.base64.decode(selectedFeature.attributes['PICTURE']));
                        popup = new OpenLayers.Popup.FramedCloud("data",
                            feature.geometry.getBounds().getCenterLonLat(),
                            null,
                            html,
                            null, 
                            true, 
                            self.popupClose);

                        feature.popup = popup;
                        map.addPopup(popup);
                        self.changePoint();
                        self.deletePoint();
                    });  
            }
        },
        checkCluster: function() {
            $('#check-cluster').bind('click', function(e) {
               
                if($('#check-cluster').is(':checked')==true) {
                    clusterStrategy.activate(); 
                }
                else {
                    clusterStrategy.deactivate(); 
                } 
               
            });
        },
        controlCluster: function(){
            var self=this;
            $('#cluster').bind('click', function(e) {
                self.cluster();
            });
        },
        cluster: function() {
            var self = this;
            var points = self.pointsArray;
            var pointsHold = self.pointsArrayHold;
            var pointsCluster = new Array();
            if($('#cluster').is(':checked')==true) {
				$('#catecory').find('input').attr('disabled', true);
                $('#check-cluster').attr('disabled', true);
                $('.datepicker').attr('disabled', true);
                vectorArray = new Array();
                $.getJSON('aggregate?range=30&time=24&select=3', function(data) {
                    $.each(data.clusters, function(index, value) {
                        // saan punktide array
                        var oneClusterPointsArray = "clusterArray"+index;
                        // klasterdavate punktide array
                        oneClusterPointsArray = new Array(); 
                        // n on üks array punktidest, mis tuleb klasterdada omavahel
                        var n=value.split(",");
                        // saan kätte iga punkti arrayst
                        $.each(n, function(index2, value2) {
                            //console.log(value2)
                            // otsin vastavad punktid arrayHold'st
                            $.each(pointsHold, function(index3, value3) {
                                // console.log(value3)
                                if(value2 == value3.attributes['ID']) {
                                    // vaja teha iga klastri jaoks eraldi array
                                    oneClusterPointsArray.push(value3);
                                // console.log(value3)
                                }  
                            }); 
                        });
                        // array punktidest, mis tuleb klastedada kõik eraldi
                        pointsCluster.push(oneClusterPointsArray);
                    });
                    //   console.log(self.pointsArray);
                    selectControl.deactivate(); 
                    //   // eemaldab punktid
                    // self.vector_points.removeAllFeatures();
                    // self.vector_points.destroyFeatures(points);
                    //   self.vector_points.addFeatures(points);
                    //  clusterStrategy.recluster();
                    // kustutab vektorkihi
                    //self.vector_points.destroy();
                    map.removeLayer(self.vector_points);
                    $.each(pointsCluster, function(index4, value4) {                          
                        //console.log(value4)
                        var vectorLayers = "Layer"+index4;
                        //console.log(vectorLayers)
                        //style
                        var context = {
                            getSize: function(feature){
                                var myRadius;
                                // myRadius = feature.attributes.RADIUS*(0.5*(map.getZoom()+1))
                                myRadius = 12;
                                return myRadius;
                            },
                            label: function(feature) {
                                // clustered features count or blank if feature is not a cluster
                                return feature.cluster ? feature.cluster.length : "";  
                            },
                            getColor: function(feature) {
                                //var color = feature.attributes.COLOR;
                                var color;
                                if(feature.cluster) {    
                                    // feature.cluster.fillColor = feature.cluster[0].attributes.COLOR;
                                    color = feature.cluster[0].attributes.COLOR;
                                //color = '#000000' 
                                }
                                else {
                                    color = feature.attributes.COLOR;  
                                }  
                                return color;
                            },
                            getFontColor: function (feature) {
                                var fontColor = "#000000";
                                return fontColor;
                            }               
                        };
                
                        var template = {
                            pointRadius: "${getSize}",
                            fillColor: "${getColor}",
                            // fillColor: "#FF0000",
                            fillOpacity: 0.7,
                            strokeColor: "#595A59",
                            strokeOpacity: 0.7,
                            // label: "${count}",
                            label: "${label}",
                            labelOutlineWidth: 1,
                            fontColor: "${getFontColor}",
                            //fontOpacity: 0.8,
                            //fontSize: "16px",
                            strokeWidth: 2,
                            graphicZIndex: 1
                        }

                        var myStyle2 = new OpenLayers.StyleMap({
                            "default" : new OpenLayers.Style(template,{
                                context:context
                            }),
                            "select": new OpenLayers.Style({
                                fillColor: "#66ccff",
                                fillOpacity: 0.7,
                                strokeColor: "#3399ff",
                                strokeOpacity: 0.7,
                                graphicZIndex: 2
                            }),
                            "invisible": new OpenLayers.Style({             
                                display: "none"
                            })
                        });
                
                        clusterStrategy2 = new OpenLayers.Strategy.Cluster({
                            distance: 45,
                            threshold: 2,
                            deactivate: function() {
                                var deactivated = OpenLayers.Strategy.prototype.deactivate.call(this);
                                if(deactivated) {
                                    var features = [];
                                    var clusters = this.layer.features;
                                    for (var i=0; i<clusters.length; i++) {
                                        var cluster = clusters[i];
                                        if (cluster.cluster) {
                                            for (var j=0; j<cluster.cluster.length; j++) {
                                                features.push(cluster.cluster[j]);
                                            }
                                        } else {
                                            features.push(cluster);
                                        }
                                    }
                                    this.layer.removeAllFeatures();
                                    this.layer.events.un({
                                        "beforefeaturesadded": this.cacheFeatures,
                                        "moveend": this.cluster,
                                        scope: this
                                    });
                                    this.layer.addFeatures(features);
                                    this.clearCache();
                                }
                                return deactivated;
                            },
                            activate: function() {
                                // this.layer.removeFeatures(self.pointsArray);
                                // this.layer.addFeatures(self.pointsArray);
                                var activated = OpenLayers.Strategy.prototype.activate.call(this);
                                if(activated) {
                                    // console.log(activated);
                                    var features = [];
                                    var clusters = this.layer.features;
                                    for (var i=0; i<clusters.length; i++) {
                                        var cluster = clusters[i];
                                        if (cluster.cluster) {
                                            for (var j=0; j<cluster.cluster.length; j++) {
                                                features.push(cluster.cluster[j]);
                                            }
                                        } else {
                                            features.push(cluster);
                                        }
                                    }
                                    this.layer.removeAllFeatures();
                                    this.layer.events.on({
                                        "beforefeaturesadded": this.cacheFeatures,
                                        "moveend": this.cluster,
                                        scope: this
                                    });  
                            
                                    this.layer.addFeatures(features);
                                    this.clearCache();
                                }
                                return activated;
                            },
                            cluster: function(event) {
                                if((!event || event.zoomChanged || (event && event.recluster)) && this.features) {
                                    var resolution = this.layer.map.getResolution();
                                    if(resolution != this.resolution || !this.clustersExist() || (event && event.recluster)) {
                                        this.resolution = resolution;
                                        var clusters = [];
                                        var feature, clustered, cluster;
                                        for(var i=0; i<this.features.length; ++i) {
                                            feature = this.features[i];
                                            if(feature.geometry) {
                                                clustered = false;
                                                for(var j=clusters.length-1; j>=0; --j) {
                                                    cluster = clusters[j];
                                                    if(this.shouldCluster(cluster, feature)) {
                                                        this.addToCluster(cluster, feature);
                                                        clustered = true;
                                                        break;
                                                    }
                                                }
                                                if(!clustered) {
                                                    clusters.push(this.createCluster(this.features[i]));
                                                }
                                            }
                                        }
                                        this.layer.removeAllFeatures();
                                        if(clusters.length > 0) {
                                            if(this.threshold > 1) {
                                                var clone = clusters.slice();
                                                clusters = [];
                                                var candidate;
                                                for(var i=0, len=clone.length; i<len; ++i) {
                                                    candidate = clone[i];
                                                    if(candidate.attributes.count < this.threshold) {
                                                        Array.prototype.push.apply(clusters, candidate.cluster);
                                                    } else {
                                                        clusters.push(candidate);
                                                    }
                                                }
                                            }
                                            this.clustering = true;
                                            // A legitimate feature addition could occur during this
                                            // addFeatures call.  For clustering to behave well, features
                                            // should be removed from a layer before requesting a new batch.
                                            this.layer.addFeatures(clusters);
                                            this.clustering = false;
                                        }
                                        this.clusters = clusters;
                                    }
                                }
                            },

                            /**
                             * Method: recluster
                             * User-callable function to recluster features
                             * Useful for instances where a clustering attribute (distance, threshold, ...)
                             *     has changed
                             */
                            recluster: function(){
                                var event={
                                    "recluster":true
                                };
                                this.cluster(event);
                            }
                        });
                        vectorLayers = new OpenLayers.Layer.Vector('Points'+vectorLayers, {
                            strategies: [clusterStrategy2],
                            styleMap: myStyle2,
                            rendererOptions: {
                                yOrdering: true,
                                zIndexing: true
                            }
                        });
                        vectorLayers.addFeatures(value4);
                        vectorArray.push(vectorLayers);
                        // console.log(value4)
                        //console.log(vectorLayers)
                        map.addLayer(vectorLayers);
                    }); 
                    //   console.log(vectorArray)
                    selectControl2 = new OpenLayers.Control.SelectFeature(vectorArray,
                    {
                        clickout: true, 
                        toggle: true,
                        multiple: false, 
                        hover: false,
                        autoActivate: true,
                        onSelect: self.onFeatureSelect,
                        onUnselect: self.onFeatureUnselect
                    }); 
                    map.addControl(selectControl2);
                    selectControl2.activate();
                });
            }
            else {
                $.each(vectorArray, function(index, value) {
                    // map.removeLayer(value);
                    value.removeAllFeatures();
                        
                });
				$('#catecory').find('input').attr('disabled', false);
                $('#check-cluster').attr('disabled', false);
                $('.datepicker').attr('disabled', false);
                map.addLayer(self.vector_points);
                clusterStrategy.recluster();
                map.addControl(selectControl);
            }
                
        /*

 if($('#cluster').is(':checked')==true) {
                    clusterStrategy.activate(); 
                // clusterStrategy.recluster();
     
                // vectorlayer.addFeatures(points);
                //   map.addLayer(vectorlayer);
                //ADD_LOTS_OF_FEATURES_TO_VECTOR_LAYER
                       
                //  clustering.distance=value;
                //    self.vector_points.recluster();
                //  self.vector_points.removeFeatures(points);
                // self.pointsArray = points2;
                // self.vector_points.addFeatures(points2);
                }
                else {
                    clusterStrategy.deactivate(); 
                //self.vector_points.removeFeatures(points);
                //self.vector_points.addFeatures(points);
                } */
        },
        changePoint: function (){
            var self = this;
            var points = self.pointsArray;
            var pointsHold = self.pointsArrayHold;
            $('.catChange').bind('click', function(e) {
                // Kategooria id
                var change_id = e.target.id.substring(6); 
                var categories = "<select id ='selectCategory' >"; 
                // var vector_layer = self.vector_points;  
                var category = $.getJSON('getcategories/getsubcat', function(data) {
                    $.each(data, function(index, value) { 
                        //  console.log(value.subcategories)
                        if(value.subcategories.length == 0){
                            categories +=   '<option value="main'+ value.id + '" name="'+ value.name +
                            '">' + value.name + '</option>';
                        }
                        $.each(value.subcategories, function(index, value) {
                            categories +=   '<option value="'+ value.id_sub + '" name="'+ value.name +
                            '">' + value.name + '</option>';
                        }); 
                    }); 
                    categories += '</select>';
                    $("#dialog-confirm").attr('title',"Vali kategooria");
                    $("#dialog-confirm").html(categories);
                    $("#dialog-confirm" ).dialog({
                        resizable: false,
                        modal: true,
                        buttons: {
                            "OK": function() {                                
                                function getSelectedText(elementId) {
                                    var elt = document.getElementById(elementId);

                                    if (elt.selectedIndex == -1)
                                        return null;

                                    return elt.options[elt.selectedIndex].text;
                                }
                                // alamkategooria id // muu korral vaja nulliks muuta alamkategooria id 
                                var idCategory = $('#selectCategory').val();
                                // console.log(idCategory);
                                var text = getSelectedText('selectCategory');
                                var catColor;
                                var mainCatId;
                                $("#changeCategory" + change_id).html(text);
                                var categoryId = $.getJSON('getcategories/getsubcat', function(data) {
                                    $.each(data, function(index, value) { 
                                        //if(value.subcategories.length == 0 && idCategory.substring(0,4) =='main'){
                                        if(value.subcategories.length == 0 && idCategory.substring(4) == value.id ){
                                            // console.log("main")
                                            catColor = value.color;
                                            mainCatId = value.id;
                                            idCategory = 0;
                                        }
                                        $.each(value.subcategories, function(index2, value2) {
                                            if(value2.id_sub == idCategory){
                                                catColor = value.color;
                                                mainCatId = value.id;
                                            }
                                        }); 
                                    });
                                    $.get('editReport/editcat?id='+ change_id +'&idcat=' + mainCatId + '&idsubcat=' + idCategory, function(data) { 
                                        $.each(pointsHold, function(index, value) {    
                                            if(value.attributes.ID == change_id) {
                                                //  console.log(value.attributes.COLOR);
                                                value.attributes.COLOR = catColor;
                                                value.attributes.CATEGORY = text;
                                                value.attributes.ID_CATEGORY = mainCatId;
                                                value.attributes.ID_SUBCATEGORY = idCategory;
                                            }                
                                        });     
                                        $.each(points, function(index, value) { 
                                            if(value.attributes.ID == change_id) {
                                                value.attributes.COLOR = catColor;
                                                value.attributes.CATEGORY = text;
                                                value.attributes.ID_CATEGORY = mainCatId;
                                                value.attributes.ID_SUBCATEGORY = idCategory;
                                            }                
                                        });
                                        if($('#cluster').is(':checked')==true) {
                                            //self.cluster();
                                            
                                        }
                                    });
                                });
                                /*   $.get('editReport/hide?id='+del_id, function(data) { */
                                /* self.vector_points.removeFeatures(points);
                                self.pointsArrayHold = points2;
                                self.pointsArray = points3;
                                self.vector_points.addFeatures(points3); 
                                /* });   */
                                $( this ).dialog( "close" );
                            },
                            Cancel: function() {
                                $( this ).dialog( "close" );
                            }
                        }
                    }); 
                });
                
            });
        },
        deletePoint: function (){
            var self = this;
            var points = self.pointsArray;
            var pointsHold = self.pointsArrayHold;
            var points2 = new Array();
            var points3 = new Array();
            $('#delete2').bind('click', function(e) {
                // console.log(selectedFeature.attributes['ID']);
                var del_id = selectedFeature.attributes['ID'];           
                $("#dialog-confirm").attr('title',"Kinnitus");
                $("#dialog-confirm").html('<span>Oled kindel, et soovid kustutada raporti: '+ selectedFeature.attributes['ID']+ '?</span>');
                $("#dialog-confirm" ).dialog({
                    resizable: false,
                    modal: true,
                    buttons: {
                        "OK": function() {
                            //    console.log("kustutatud");
                            $.get('editReport/hide?id='+del_id, function(data) {
                                $.each(pointsHold, function(index, value) {    
                                    if(value.attributes.ID != del_id) {
                                        points2.push(value);
                                    }                
                                }); 
                                $.each(points, function(index, value) { 
                                    if(value.attributes.ID != del_id) {
                                        points3.push(value);
                                    }                
                                });
                                selectControl.unselect(selectedFeature);
                                self.vector_points.removeFeatures(points);
                                self.pointsArrayHold = points2;
                                self.pointsArray = points3;
                                self.vector_points.addFeatures(points3);
                                clusterStrategy.recluster();  
                            });  
                            $( this ).dialog( "close" );
                        },
                        Cancel: function() {
                            $( this ).dialog( "close" );
                        }
                    }
                }); 
                
            });
            $(".deleteClusterPoint").bind('click', function(e) {
                var del_id = e.target.id.substring(7);
                var count = 0;
                var html = "";
                var delFeature;
                var photo;
                var points = self.pointsArray;
                var pointsHold = self.pointsArrayHold;
                var points2 = new Array();
                var points3 = new Array();
                // kui on klaster
                if(selectedFeature.cluster) {
                    $("#dialog-confirm").attr('title',"Kinnitus");
                    $("#dialog-confirm").html('<span>Oled kindel, et soovid kustutada raporti: '+ del_id + '?</span>');
                    $("#dialog-confirm" ).dialog({
                        resizable: false,
                        modal: true,
                        buttons: {
                            "OK": function() {
                                $.each(selectedFeature.cluster, function(index, value) {
                                    // teised punktid jäävad alles
                                    if(selectedFeature.cluster[index].attributes['ID'] != del_id ) {
                                        $.get("transmit/getphotobyid?id="+ selectedFeature.cluster[index].attributes['ID'], 
                                            function(data){ 
                                                photo = data;
                                                count++;
                                                // HTML 
                                                html += "ID: "+ selectedFeature.cluster[index].attributes['ID'] + "<br/>" +
                                                "Aeg: " + selectedFeature.cluster[index].attributes['TIMESTAMP']+ "<br/>"+
                                                //  <img style="width: 100%" src="data:image/jpeg;base64,' + data + '" />
                                                "GPS täpsus: " +selectedFeature.cluster[index].attributes['GPS_ACCURACY'] + "<br/>"+
                                                "Pilt kohast: " + "<br/>"+
                                                '<img style="width: 300px; height: 350px; " src="data:image/jpeg;base64,' + photo+ '" />' +
                                                "<br/>"+
                                                "Kategooria: <span id='changeCategory" + selectedFeature.cluster[index].attributes['ID'] +  "'>" + 
                                                selectedFeature.cluster[index].attributes['CATEGORY']  + "</span>"+
                                                " <a  id='change"+ selectedFeature.cluster[index].attributes['ID'] +"' class = 'catChange' >Muuda</a> <br/>"+ 
                                                "Kommentaar: " + selectedFeature.cluster[index].attributes['COMMENTARY'] + "<br/>" +
                                                //   "<a  id = 'onclick'>Muuda kategooriat</a>"  + "<br/>" + 
                                                "<a class ='deleteClusterPoint' id='cluster"+ selectedFeature.cluster[index].attributes['ID'] + 
                                                "'>Kustuta</a>" + "<br/>" ;
                                                if(count == selectedFeature.cluster.length) {
                                                    //  console.log(count +"if")
                                                    $("#clusters").html(html);
                                                    selectedFeature.cluster.remove(delFeature);
                                                    self.deletePoint();
                                                    if($('#cluster').is(':checked')==true) {
                                                        clusterStrategy2.recluster(); 
                                                    }
                                                    
                                                }
                                            }); 
                                    }
                                    else {
                                        count++;
                                        delFeature = index;
                                        if(count == selectedFeature.cluster.length) {
                                            //  console.log(count + "else")
                                            if(count==1) {
                                                $("#info").hide();
                                            }
                                            else {
                                                $("#clusters").html(html);
                                                selectedFeature.cluster.remove(delFeature);
                                                self.deletePoint();
                                                if($('#cluster').is(':checked')==true) {
                                                    clusterStrategy2.recluster(); 
                                                }
                                            }
                                        }
                                    }     
                                });
                                // Array Remove - By John Resig (MIT Licensed)
                                Array.prototype.remove = function(from, to) {
                                    var rest = this.slice((to || from) + 1 || this.length);
                                    this.length = from < 0 ? this.length + from : from;
                                    return this.push.apply(this, rest);
                                };
                                $.get('editReport/hide?id='+del_id, function(data) {
                                    $.each(pointsHold, function(index, value) {    
                                        if(value.attributes.ID != del_id) {
                                            points2.push(value);
                                        }                
                                    }); 
                                    $.each(points, function(index, value) { 
                                        if(value.attributes.ID != del_id) {
                                            points3.push(value);
                                        }                
                                    });                                
                                    self.vector_points.removeFeatures(points);
                                    self.pointsArrayHold = points2;
                                    self.pointsArray = points3;
                                    self.vector_points.addFeatures(points3);
                                // selectedFeature.renderIntent = "select"; 
                                });   
                                $( this ).dialog( "close" );
                            },
                            Cancel: function() {
                                $( this ).dialog( "close" );
                            }
                        }
                    }); 
                }            
            });
        },
        
        onFeatureUnselect: function(feature) {
            if(feature.cluster) {
                // console.log("cluster");
                /*  var x = map.getZoom();
                {
                    map.zoomTo(x+1);
                } */
                // map.removePopup(feature.popup);
                // feature.popup.destroy();
                feature.popup = null;
            }
            else {
                
                map.removePopup(feature.popup);
                feature.popup.destroy();
                feature.popup = null;
            }
        },
        popupClose: function(evt) {
            selectControl.unselect(selectedFeature);
        },
        getCategories: function() {
            var self=this;
            // var vector_layer = self.vector_points;  
            var category = $.getJSON('getcategories/getsubcat', function(data) {
                var categories = ""; 
                var loendur = 100;
                var loendur2 = 1;
                $.each(data, function(index, value) { 
                    categories += '<li><div class="catcolor" style="background-color: '+
                    value.color + ';"></div> <input type="checkbox" class="catSelect" id = "' + value.id + 
                    '" checked="checked"/><label id = "'+ (value.id*100) + '" >' + value.name +'</label><ul class = "' + (value.id*100) +
                    ' show">';
                    $.each(value.subcategories, function(index2, value2) {
                        categories += '<li class="subcat subCat' + value.id +
                        '" ><input name = "'+value2.id_sub+'" type="checkbox" id ="' + (loendur +index2+1) +
                        '" checked="checked"/><label for="' +  (loendur + index2 +1) + '">' +
                        value2.name + '</label></li>'; 
                    }); 
                    loendur2=loendur2+1;
                    loendur= loendur+100;
                    categories +='</ul></li>'; 
                }); 
                var lHtml =  '<label>Vali kategooriad:</label>'+ '<ul>' + categories + '</ul>';
                $("#catecory").html(lHtml);  
                // algul peidan kõik alamkategooriad
                for(i=1; i<=loendur2; i++) {
                    $(".subCat"+i).hide();  
                }
                var x = 1;
                for(j=100;j<=loendur; j=j+100) {    
                    // lisan igale peakategooriale click event'i kas näidata alamkategooriat või ei
                    $('#'+j).bind('click', function(e) {
                        var clickid = e.target.id/100;
                        //  e.preventDefault();
                        var span = $("#catecory").find('.'+e.target.id);
                        if(span.hasClass('show')){
                            $('.subCat'+clickid).show();
                            span.removeClass('show').addClass('hide'); 
                            
                        } 
                        else  {
                            $('.subCat'+clickid).hide();
                            span.removeClass('hide').addClass('show');                      
                        }
                    }); 
                }
                /*  $(".catSelect").each(function(){
                    var self = this;
                    $(this).bind('click', function(e) {
                        //tegevus, mida teha kui muudatakse valikut
                        console.log(e);
                        if($(self).is(':checked')==true) {
                            $(".subCat"+i).show();
                        }
                        else {
                            $(".subCat"+i).hide(); 
                        }
                    });
                }); */
                // peakategooriate põhjal punktide selekteerimine
                //   $("#time-interval").bind('change', function(e){
                $(".catSelect").bind('click', function(e) {
                    // console.log(e.toElement.id);
                    var points = self.pointsArray;
                    var pointsHold = self.pointsArrayHold;
                    var points2 = new Array();
                    var startDate = $("#time-start").val();
                    startDate=startDate.split(".");
                    var start=new Date(startDate[1]+"/"+startDate[0]+"/"+startDate[2]).getTime();
                    var endDate = $("#time-end").val();
                    endDate=endDate.split(".");
                    var end=new Date(endDate[1]+"/"+endDate[0]+"/"+endDate[2]).getTime();
                    var date;
                    var ts;
                    if($('#'+e.target.id).is(':checked')==false) {
                        // console.log($('.subCat  +e.toElement.id +  input'));
                        var subCatInput = ".subCat" + e.target.id + " input";
                        // kui ülemkategooria unselected, muudan ka alamkatekooriad unselected
                        $(subCatInput).attr('checked', false);
                        // muudan punkti stiili
                        $.each(points, function(index, value) { 
                            // kain punktid labi ja muudan stiili, kui on unselect vastav kategooria
                            if(value.attributes.ID_CATEGORY != e.target.id) {
                                // points[index].renderIntent = "invisible";   
                                points2.push(value);
                            }
                        }); 
                        //  map.removeLayer(self.vector_points);
                        // map.addLayer(self.vector_points); 
                        // self.vector_points.drawFeature(self.pointsArray);
                        self.vector_points.removeFeatures(points);
                        self.pointsArray = points2;
                        self.vector_points.addFeatures(points2);
                        clusterStrategy.recluster();
                        
                    }
                    else if($('#'+e.target.id).is(':checked')==true) {  
                        // kui ülemkategooria selected, muudan ka alamkatekooriad selected
                        var subCatInput2 = ".subCat" + e.target.id + " input";
                        $(subCatInput2).attr('checked', true);
                        $.each(pointsHold, function(index, value) { 
                            ts = value.attributes.TIMESTAMP.split(" ")[0].split("-");
                            date = new Date(ts[1]+"/"+ts[2]+"/"+ts[0]).getTime();
                            if(value.attributes.ID_CATEGORY == e.target.id && (date >= start && date <= end)) {
                                // points[index].renderIntent = "default"; 
                                points.push(value);
                            }                
                        }); 
                        self.vector_points.removeFeatures(points);
                        self.vector_points.addFeatures(points);
                        clusterStrategy.recluster();
                    }
                                
                });
                        
                // alamkategooriate põhjal selekteerimine
                $(".subcat").bind('click', function(e) {
                    // console.log(e.toElement.name);
                    var points = self.pointsArray;
                    var pointsHold = self.pointsArrayHold;
                    var points2 = new Array();
                    var startDate = $("#time-start").val();
                    startDate=startDate.split(".");
                    var start=new Date(startDate[1]+"/"+startDate[0]+"/"+startDate[2]).getTime();
                    var endDate = $("#time-end").val();
                    endDate=endDate.split(".");
                    var end=new Date(endDate[1]+"/"+endDate[0]+"/"+endDate[2]).getTime();
                    var date;
                    var ts;
                    if($('#'+e.target.id).is(':checked')==false) {
                        $.each(points, function(index, value) { 
                            if(value.attributes.ID_SUBCATEGORY !=e.target.name) {
                                //self.pointsArray[index].renderIntent = "invisible";   
                                points2.push(value);
                            }                
                        }); 
                        self.vector_points.removeFeatures(points);
                        self.pointsArray = points2;
                        self.vector_points.addFeatures(points2);
                        clusterStrategy.recluster();
                    }
                    else if($('#'+e.target.id).is(':checked')==true) {   
                        $.each(pointsHold, function(index, value) { 
                            ts = value.attributes.TIMESTAMP.split(" ")[0].split("-");
                            date = new Date(ts[1]+"/"+ts[2]+"/"+ts[0]).getTime();
                            if(value.attributes.ID_SUBCATEGORY ==e.target.name && (date >= start && date <= end)) {
                                // self.pointsArray[index].renderIntent = "default";  
                                points.push(value);
                            }                
                        }); 
                        self.vector_points.removeFeatures(points);
                        self.vector_points.addFeatures(points);
                        clusterStrategy.recluster();
                    }
                });
                // ajavahemiku põhjal selekteerimine
                $("#time-interval").bind('change', function(e){
                    //if($("#time-start").val()){
                    var points = self.pointsArray;
                    var pointsHold = self.pointsArrayHold;
                    var points2 = new Array();
                    var startDate = $("#time-start").val();
                    // array
                    startDate=startDate.split(".");
                    var start=new Date(startDate[1]+"/"+startDate[0]+"/"+startDate[2]).getTime();
                    var endDate = $("#time-end").val();
                    // array
                    endDate=endDate.split(".");
                    var end=new Date(endDate[1]+"/"+endDate[0]+"/"+endDate[2]).getTime();
                    var date;
                    var ts;
                    var check;
                    // kui lõppkuupäev väiksem kui algus
                    if(end <= start) {
                        $("#time-end").val("");
                        alert("Lõppkuupäev ei saa olla varasem kui algus");
                        return;
                    }
                    $.each(pointsHold, function(index, value) {
                        // punkti aeg
                        ts = value.attributes.TIMESTAMP.split(" ")[0].split("-");
                        date = new Date(ts[1]+"/"+ts[2]+"/"+ts[0]).getTime();
                        // kui kuupäev ei jää selekteeritud vahemikku muudan punkti nähtamatuks
                        if(date >= start && date <= end) {
                            // points[index].renderIntent = "invisible"; 
                            // peakategooria id
                            var div = '#' + value.attributes.ID_CATEGORY;
                            // alamkategooria name
                            var div2 = '[name=' + value.attributes.ID_SUBCATEGORY + ']';
                            // kas peakategooria on selected
                            if ($(div).is(':checked')==true) {
                                // kas alamkatekooria on selected
                                if(value.attributes.ID_SUBCATEGORY!=0) {
                                    if ($(div2).is(':checked')==true) {
                                        //points[index].renderIntent = "default"; 
                                        points2.push(value);
                                    }
                                }
                                else {
                                    points2.push(value);  
                                }
                            }
                        }     
                    }); 
                    self.vector_points.removeFeatures(points);
                    self.pointsArray = points2;
                    self.vector_points.addFeatures(points2);
                    clusterStrategy.recluster();

                }); 
                
            });

        },
        getEditCategories: function() {
            var self=this;
            $.getJSON('getcategories/getsubcat', function(data) {
                var categories = ""; 
                var loendur = 100;
                var loendur2 = 1;
                $.each(data, function(index, value) { 
                    categories += '<li><button class="categoryEditTop" value="'+ value.name + '" name = "'+value.id+'">Muuda</button>'+
                        '<button class="categoryDeleteTop" value="'+ value.name + '" name = "'+value.id+'">Kustuta</button>'+
                        '<div class="catcolor" style="background-color: '+
                    value.color + ';"></div> <label id = "e'+ (value.id*100) + '" >' + value.name +'</label><ul class = "e' + (value.id*100) +
                    ' show" style="margin-left: 20px;">';
                    $.each(value.subcategories, function(index2, value2) {
                        categories += '<li class="subcat subCatEd' + value.id + '" >'+
                        '<button class="categoryEdit" value="'+ value2.name + '" name = "'+value2.id_sub+'">Muuda</button>'+
                        '<button class="categoryDelete" value="'+ value2.name + '" name = "'+value2.id_sub+'">Kustuta</button>'+
                        '<label for="e' +  (loendur + index2 +1) + '">' +
                        value2.name + '</label></li>'; 
                    }); 
                    loendur2=loendur2+1;
                    loendur= loendur+100;
                    categories +='</ul></li>'; 
                }); 
                var lHtml =  '<label><h2>Kategooriate haldus</h2></label>'+ '<ul>' + categories + '</ul><br/><button id="addCategory">Lisa kategooria</button>'+
                    '<script>'+
                    '$(".categoryEditTop").button({icons: { primary: "ui-icon-note" }, text: false}); '+
                    '$(".categoryDeleteTop").button({icons: { primary: "ui-icon-circle-close" }, text: false}); '+
                    '$(".categoryEdit").button({icons: { primary: "ui-icon-note" }, text: false}); '+
                    '$(".categoryDelete").button({icons: { primary: "ui-icon-circle-close" }, text: false});'+
                    '</script>';
                $("#categoriesEdit").html(lHtml);
                $(".categoryDelete").each(function(){
                    $(this).bind('click', function(e) {
                        //console.log(e);
                        var del_id = $(this).attr('name');
                        $("#dialog-confirm").attr('title',"Kinnitus");
                        $("#dialog-confirm").html('<span>Oled kindel, et soovid kustutada kategooria: '+$(this).val()+'?</span>');
                        $( "#dialog-confirm" ).dialog({
                            resizable: false,
                            modal: true,
                            buttons: {
                                "OK": function() {
                                    $.get('editCategories/delete/'+del_id, function(data) {
                                        self.getCategories();
                                        self.getEditCategories();
                                        if(data != 'OK')  {
                                            //alert(data);
                                            $("#dialog").attr('title', 'Info');
                                            $("#dialog").html(data);
                                            $( "#dialog" ).dialog({
                                                modal: true,
                                                buttons: {
                                                    Ok: function() {
                                                        $( this ).dialog( "close" );
                                                    }
                                                }
                                            });
                                        }
                                    });
                                    $( this ).dialog( "close" );
                                },
                                Cancel: function() {
                                    $( this ).dialog( "close" );
                                }
                            }
                        });
                    //var r = confirm('Oled kindel, et soovid kustutada kategooria: '+$(this).val()+'?');
                    //if(r == true){
                    /*$.get('editCategories/delete/'+$(this).attr('name'), function(data) {
                            self.getCategories();
                            self.getEditCategories();
                            if(data != 'OK') alert(data);
                        });*/
                    //}
                    });
                });
                $(".categoryDeleteTop").each(function(){
                    $(this).bind('click', function(e) {
                        //console.log(e);
                        var del_id = $(this).attr('name');
                        $("#dialog-confirm").attr('title',"Kinnitus");
                        $("#dialog-confirm").html('<span>Oled kindel, et soovid kustutada kategooria: '+$(this).val()+'?</span>');
                        $( "#dialog-confirm" ).dialog({
                            resizable: false,
                            modal: true,
                            buttons: {
                                "OK": function() {
                                    $.get('editCategories/deleteTop/'+del_id, function(data) {
                                        self.getCategories();
                                        self.getEditCategories();
                                        if(data != 'OK')  {
                                            //alert(data);
                                            $("#dialog").attr('title', 'Info');
                                            $("#dialog").html(data);
                                            $( "#dialog" ).dialog({
                                                modal: true,
                                                buttons: {
                                                    Ok: function() {
                                                        $( this ).dialog( "close" );
                                                    }
                                                }
                                            });
                                        }
                                    });
                                    $( this ).dialog( "close" );
                                },
                                Cancel: function() {
                                    $( this ).dialog( "close" );
                                }
                            }
                        });
                    //var r = confirm('Oled kindel, et soovid kustutada kategooria: '+$(this).val()+'?');
                    //if(r == true){
                    /*$.get('editCategories/delete/'+$(this).attr('name'), function(data) {
                            self.getCategories();
                            self.getEditCategories();
                            if(data != 'OK') alert(data);
                        });*/
                    //}
                    });
                });
                $(".categoryEdit").each(function(){
                    $(this).bind('click', function(e) {
                        $.get('editCategories/editForm/'+$(this).attr('name')+'/1', function(data) {
                            $("#categoriesEdit").html(data);
                            $("#submitEditCategory").bind('click', function(e) {
                                $.post('editCategories/edit', {
                                    id: $("#catId").val(), 
                                    name_et: $("#catName_et").val(), 
                                    name_en: $("#catName_en").val(), 
                                    name_ru: $("#catName_ru").val(), 
                                    parent: $("#catParent").val(),
                                    sub: 1
                                }, function(data){
                                    self.getCategories();
                                    self.getEditCategories();
                                //alert(data);
                                });
                            });
                            $("#cancelBtn").bind('click', function(e) {
                                self.getEditCategories();
                            });

                        });
                    });
                });
                $(".categoryEditTop").each(function(){
                    $(this).bind('click', function(e) {
                        $.get('editCategories/editForm/'+$(this).attr('name')+'/0', function(data) {
                            $("#categoriesEdit").html(data);
                            $("#submitEditCategory").bind('click', function(e) {
                                $.post('editCategories/edit', {
                                    id: $("#catId").val(), 
                                    name_et: $("#catName_et").val(), 
                                    name_en: $("#catName_en").val(), 
                                    name_ru: $("#catName_ru").val(), 
                                    color: $("#catColor").val(),
                                    sub: 0
                                }, function(data){
                                    self.getCategories();
                                    self.getEditCategories();
                                //alert(data);
                                });
                            });
                            $("#cancelBtn").bind('click', function(e) {
                                self.getEditCategories();
                            });

                        });
                    });
                });
                $("#addCategory").bind('click', function(e) {
                    $.get('editCategories/addForm', function(data) {
                        $("#categoriesEdit").html(data);
                        $("#submitCategory").bind('click', function(e) {
                            if($("#catName_et").val() == '')  {
                                $("#dialog").attr('title', 'Viga');
                                $("#dialog").html('<span style="color: red;">Kategooria nimi on puudu!</span>');
                                $( "#dialog" ).dialog({
                                    modal: true,
                                    buttons: {
                                        Ok: function() {
                                            $( this ).dialog( "close" );
                                        }
                                    }
                                });
                            } else {
                            $.post('editCategories/add', {
                                name_et: $("#catName_et").val(), 
                                name_en: $("#catName_en").val(), 
                                name_ru: $("#catName_ru").val(), 
                                color: $("#catColor").val(), 
                                parent: $("#catParent").val()
                            }, function(data){
                                self.getCategories();
                                self.getEditCategories();
                            //alert(data);
                            });
                            }
                        });
                        $("#cancelAdd").bind('click', function(e) {
                            self.getEditCategories();
                        });
                    });
                });
                
                $("#close2").bind('click', function(e) {
                    e.preventDefault();
                    toggleCAdmin("show");
                    $("#categoriesEditContainer").hide();
                });
                
            });
        },
        checkTime: function() {
            var self=this;
            var points = self.pointsArray;
            var pointsHold = self.pointsArrayHold;
            var points2 = new Array();
            $.datepicker.setDefaults($.datepicker.regional["et"]);
            var defaultDateStart = "-30";
            $('#time-start').datepicker({ 
                changeMonth: true,
                changeYear: true,
                yearRange: '2010:2020'
            }).datepicker('setDate', defaultDateStart);
            var defaultDateEnd = "0";
            $('#time-end').datepicker({ 
                changeMonth: true,
                changeYear: true,
                yearRange: '2010:2020'
            }).datepicker('setDate', defaultDateEnd);
            var startDate = $("#time-start").val();
            // array
            startDate=startDate.split(".");
            var start=new Date(startDate[1]+"/"+startDate[0]+"/"+startDate[2]).getTime();
            var endDate = $("#time-end").val();
            // array
            endDate=endDate.split(".");
            var end=new Date(endDate[1]+"/"+endDate[0]+"/"+endDate[2]).getTime();
            var date;
            var ts;
            var subCat;
            // kui lõppkuupäev väiksem kui algus
            if(end <= start) {
                $("#time-end").val("");
                alert("Lõppkuupäev ei saa olla varasem kui algus");
                return;
            }
            $.each(pointsHold, function(index, value) {
                // punkti aeg
                ts = value.attributes.TIMESTAMP.split(" ")[0].split("-");
                date = new Date(ts[1]+"/"+ts[2]+"/"+ts[0]).getTime();
                // kui kuupäev ei jää selekteeritud vahemikku muudan punkti nähtamatuks
                // if(date < start || date > end) {
                if(date >= start && date <= end) {
                    //self.pointsArray[index].renderIntent = "invisible";  
                    points2.push(value);
                } /*else {
                    // peakategooria id
                    var div = '#' + value.attributes.ID_CATEGORY;
                    // alamkategooria name
                    var div2 = '[name=' + value.attributes.ID_SUBCATEGORY + ']';
                    // kas peakategooria on selected
                    if ($(div).is(':checked')==true) {
                        // kas alamkatekooria on selected
                        if ($(div2).is(':checked')==true) {
                            self.pointsArray[index].renderIntent = "default"; 
                        }
                    }                                    
                }    */      
            }); 

            self.vector_points.removeFeatures(points);
            self.pointsArray = points2;
            self.vector_points.addFeatures(points2);
            clusterStrategy.recluster();
                
        }
    });
    var listView = new listView();
    
    function toggleLegend(s){
        if(s == "show"){
            $("#legend").hide();
            $("#catView").bind('click', function(e){
                toggleLegend("hide");
            });
        }
        else {
            $("#legend").show();
            $("#catView").bind('click', function(e){
                toggleLegend("show");
            });

        }
    }
    function toggleCAdmin(s){
        if(s == "show"){
            $("#categoriesEditContainer").hide();
            $("#catAdmin").bind('click', function(e){
                toggleCAdmin("hide");
            });
        }
        else {
            $("#categoriesEditContainer").show();
            $("#catAdmin").bind('click', function(e){
                toggleCAdmin("show");
            });

        }
    }

    $.get("getuser", 
        function(data){ 
            var lHtml = data+'&nbsp;&nbsp;<a href="home/logout">Logi v&auml;lja</a>';
            $("#userdata").html(lHtml);
        }
        );
    $.get("getmenu", 
        function(data){ 
            $("#container").append('<div id="dialog-confirm"></div>');
            $("#container").append('<div id="dialog"></div>');
            $("#topmenu").html(data);
            $("#catView").bind('click', function(e){
                e.preventDefault();
                toggleLegend("hide");
            });
            $("#catAdmin").bind('click', function(e){
                e.preventDefault();
                toggleCAdmin("hide");
            });
        }); 
});
