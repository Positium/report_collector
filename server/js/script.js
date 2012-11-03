
$(document).ready(function () {
    $("#loading").hide();
    $("#loading").html('Laadin andmeid...<br/><img src="../css/ajax-loader.gif" alt="Loading"/>');
    var listView = Backbone.View.extend({
        request: null,
        pointsArray: [],
        vector_points: null,
        mapBounds: '',
        el: $('#map'), // attaches `this.el` to an existing element.
    
        initialize: function(){
            _.bindAll(this, 'render','loadPoints','selectControl','onFeatureSelect','onFeatureUnselect','popupClose','getCategories', 'changeCategory'); // fixes loss of context for 'this' within method
            this.render(); // not all views are self-rendering. This one is.
            this.getCategories();
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
                    //console.log(value);
                    self.pointsArray.push(feats[index]);
                }); 
                //style
                var context = {
                    getSize: function(feature){
                        var myRadius;
                        // myRadius = feature.attributes.RADIUS*(0.5*(map.getZoom()+1))
                        myRadius = 10;
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
                $("#loading").hide();
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
            var self=this;
            $.get("transmit/getphotobyid?id="+ selectedFeature.attributes['ID'], 
                function(data){ 
                    photo = data;
                    // HTML PopUp
                    var html = "<div id = 'delete' ></div> ID: "+ selectedFeature.attributes['ID'] + "<br/>" +
                    "Aeg: " + selectedFeature.attributes['TIMESTAMP']+ "<br/>"+
                    //  <img style="width: 100%" src="data:image/jpeg;base64,' + data + '" />
                    "GPS täpsus: " +selectedFeature.attributes['GPS_ACCURACY'] + "<br/>"+
                    "Pilt kohast: " + "<br/>"+
                    '<img style="width: 200px; height: 300px; " src="data:image/jpeg;base64,' + photo+ '" />' +
                    "<br/>"+
                    "Kategooria: " + selectedFeature.attributes['CATEGORY'] + "<br/>"+ 
                    "Kommentaar: " + selectedFeature.attributes['COMMENTARY'] + "<br/>"
                    //  "<a onClick = 'self.changeCategory()'>Muuda kategooriat</a>" + "<br/>"+ 
                    //  "<a onClick = 'hideReport()'>Kustuta</a>";
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
                });   
        },
        changeCategory: function (){
            console.log("test");
        },
        onFeatureUnselect: function(feature) {
            map.removePopup(feature.popup);
            feature.popup.destroy();
            feature.popup = null;
        },
        popupClose: function(evt) {
            selectControl.unselect(selectedFeature);
        },
        getCategories: function() {
            var self=this;
            var points = self.pointsArray;
            // var vector_layer = self.vector_points;  
            var category = $.getJSON('getcategories/getsubcat', function(data) {
                var categories = ""; 
                var loendur = 100;
                var loendur2 = 1;
                $.each(data, function(index, value) { 
                    categories += '<li><div class="catcolor" style="background-color: '+
                    value.color + ';"></div> <input type="checkbox" class="catSelect" id = "' + (index+1) + 
                    '" checked="checked"/><label id = "'+ loendur + '" >' + value.name +'</label><ul class = "' + loendur +
                    ' show">';
                    $.each(value.subcategories, function(index, value) {
                        categories += '<li class="subcat subCat' + loendur2 +
                        '" ><input name = "'+value.id+'" type="checkbox" id ="' + (loendur +index+1) +
                        '" checked="checked"/><label for="' +  (loendur + index +1) + '">' +
                        value.name + '</label></li>'; 
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
                        var clickid = e.toElement.id/100;
                        //  e.preventDefault();
                        var span = $("#catecory").find('.'+e.toElement.id);
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
                $.get("transmit/getCategoryList?list=3",
                    function(data){
                        var array_id=data.split(","); 
                        for(i=0;i<array_id.length-1;i++) { 
                            var div = '#' + array_id[i];
                            // ülemkategooriate põhjal punktide selekteerimine
                            $(div).bind('click', function(e) {
                                if($('#'+e.toElement.id).is(':checked')==false) {
                                    // console.log($('.subCat  +e.toElement.id +  input'));
                                    var subCatInput = ".subCat" + e.toElement.id + " input";
                                   // kui ülemkategooria unselected, muudan ka alamkatekooriad unselected
                                   $(subCatInput).attr('checked', false);
                                   // muudan punkti stiili
                                    $.each(points, function(index, value) { 
                                        // kain punktid labi ja muudan stiili, kui on unselect vastav kategooria
                                        if(value.attributes.ID_CATEGORY ==e.toElement.id) {
                                            self.pointsArray[index].renderIntent = "invisible";   
                                        }                
                                    }); 
                                    map.removeLayer(self.vector_points);
                                    map.addLayer(self.vector_points); 
                                }
                                else if($('#'+e.toElement.id).is(':checked')==true) {  
                                    // kui ülemkategooria selected, muudan ka alamkatekooriad selected
                                    var subCatInput2 = ".subCat" + e.toElement.id + " input";
                                    $(subCatInput2).attr('checked', true);  
                                    $.each(points, function(index, value) { 
                                        if(value.attributes.ID_CATEGORY ==e.toElement.id) {
                                            self.pointsArray[index].renderIntent = "default";   
                                        }                
                                    }); 
                                    map.removeLayer(self.vector_points);
                                    map.addLayer(self.vector_points); 
                                }
                                
                            });
                        }
                        // alamkategooriate põhjal selekteerimine
                        $(".subcat").bind('click', function(e) {
                            // console.log(e.toElement.name);
                            if($('#'+e.toElement.id).is(':checked')==false) {
                                //  console.log("false");
                                $.each(points, function(index, value) { 
                                    if(value.attributes.ID_SUBCATEGORY ==e.toElement.name) {
                                        self.pointsArray[index].renderIntent = "invisible";   
                                    }                
                                }); 
                                map.removeLayer(self.vector_points);
                                map.addLayer(self.vector_points); 
                            }
                            else if($('#'+e.toElement.id).is(':checked')==true) {   
                                //  console.log("true");
                                $.each(points, function(index, value) { 
                                    if(value.attributes.ID_SUBCATEGORY ==e.toElement.name) {
                                        self.pointsArray[index].renderIntent = "default";   
                                    }                
                                }); 
                                map.removeLayer(self.vector_points);
                                map.addLayer(self.vector_points); 
                            }
                        });
                    }); 
            });
            $.datepicker.setDefaults($.datepicker.regional[""]);
            $(".datepicker").datepicker($.datepicker.regional["et"]);
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
    $.get("getuser", 
        function(data){ 
            var lHtml = data+'&nbsp;&nbsp;<a href="home/logout">Logi v&auml;lja</a>';
            $("#userdata").html(lHtml);
        }
        );
    $.get("getmenu", 
        function(data){ 
            $("#topmenu").html(data);
            $("#catView").bind('click', function(e){
                e.preventDefault();
                toggleLegend("hide");
            });
        }
        ); 
});
