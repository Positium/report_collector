
$(document).ready(function () {
   
    var ListView = Backbone.View.extend({
        request: null,
        pointsArray: [],
        vector_points: null,
        mapBounds: '',
        el: $('#map'), // attaches `this.el` to an existing element.
    
        initialize: function(){
            _.bindAll(this, 'render','loadPoints','selectControl','onFeatureSelect','onFeatureUnselect','popupClose'); // fixes loss of context for 'this' within method
            this.render(); // not all views are self-rendering. This one is.
        },
        render: function(){
            //   $(this.el).append('<ul> <li>hello world</li> </ul>');  
            mapextent = new OpenLayers.Bounds(2948518.4067798, 8028114.5837566, 3003553.0671374, 8058116.1173544);
            // mapextent2 = new OpenLayers.Bounds(2980050.535418, 8041609.8667399, 2980201.6926272, 8041658.8878627);
            var openStreetMap = new OpenLayers.Layer.OSM("OSM","",{
                attribution: '',
                isBaseLayer:true,
                zoomOffset:11,
                resolutions: [76.4370282714844,38.2185141357422,19.1092570678711,9.55462853393555,4.77731426696777,2.38865713348389,1.19432856674194]          
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
                restrictedExtent: mapextent,
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
            $(this.el).append(map); 
            this.loadPoints();
        // console.log(map.getExtent());
        },
        loadPoints: function() {
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
                    //console.log(value);
                    self.pointsArray.push(feats[index]);
                }); 
                //style
                var context = {
                    getSize: function(feature){
                        var myRadius;
                        myRadius = feature.attributes.RADIUS*(0.5*(map.getZoom()+1))
                        return myRadius;
                    }
                }
                var template = {
                    pointRadius: "${getSize}",
                    fillColor: "${COLOR}",
                    fillOpacity: 0.7,
                    strokeColor: "#595A59",
                    strokeOpacity: 0.7,
                    strokeWidth: 2,
                    graphicZIndex: 1
                }
                var myStyle = new OpenLayers.StyleMap({
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
                // vector layer
                self.vector_points = new OpenLayers.Layer.Vector('Points', {
                    styleMap: myStyle,
                    rendererOptions: {
                        yOrdering: true,
                        zIndexing: true
                    } 
                });
                self.vector_points.addFeatures(self.pointsArray);
                //console.log(self.vector_points);
                map.addLayer(self.vector_points); 
                self.selectControl(self.vector_points);
            });
        },
        selectControl: function(vector_points){
            // Create a select feature control and add it to the map
            selectControl = new OpenLayers.Control.SelectFeature(this.vector_points,
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
          //  $.get("transmit/getphotobyid?id="+ selectedFeature.attributes['ID'], 
           //     function(data){ 
                   // photo = data;
                    // HTML PopUp
                    var html = "ID: "+ selectedFeature.attributes['ID'] + "<br/>" +
                    "Aeg: " + selectedFeature.attributes['TIMESTAMP']+ "<br/>"+
                    //  <img style="width: 100%" src="data:image/jpeg;base64,' + data + '" />
                    "Pilt kohast: " + "<br/>"+
                    '<img style="width: 200px; height: 300px; " src="data:image/jpeg;base64,' + selectedFeature.attributes['PICTURE']+ '" />' +
                    "<br/>"+
                    "Kategooria: " + selectedFeature.attributes['CATEGORY'] + "<br/>"+ 
                    "Kommentaar: " + selectedFeature.attributes['COMMENTARY'];
                    //  console.log($.base64.decode(selectedFeature.attributes['PICTURE']));
                    popup = new OpenLayers.Popup.FramedCloud("data",
                        feature.geometry.getBounds().getCenterLonLat(),
                        null,
                        html,
                        null, 
                        true, 
                        this.popupClose);

                    feature.popup = popup;
                    map.addPopup(popup);                     
            //    });   
        },
        onFeatureUnselect: function(feature) {
            map.removePopup(feature.popup);
            feature.popup.destroy();
            feature.popup = null;
        },
        popupClose: function(evt) {
            selectControl.unselect(selectedFeature);
        }
        
    });
    var listView = new ListView();
    
    /* $("#nupp").bind('click', function(e) {
        e.preventDefault();
        console.log(map.getExtent());
        console.log(map.getResolution());
    }); */
    $.get("getcategories", 
        function(data){ 
            var lHtml = 'Vali kategooriad:<br/>'+data+'<br/>Vali ajavahemik';
            $("#legend").html(lHtml);
        //input välja listenerid vaja veel luua
        }
        ); 
    $.get("getuser", 
        function(data){ 
            var lHtml = data+'&nbsp;&nbsp;<a href="/home/logout">Logi v&auml;lja</a>';
            $("#userdata").html(lHtml);
        }
        );
    $.get("getmenu", 
        function(data){ 
            $("#topmenu").html(data);
        }
        );
});