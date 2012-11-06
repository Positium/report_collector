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
        vector_points: null,
        mapBounds: '',
        el: $('#map'), // attaches `this.el` to an existing element.
    
        initialize: function(){
            _.bindAll(this, 'render','loadPoints','selectControl','onFeatureSelect','onFeatureUnselect','popupClose','getCategories', 'changePoint', 'deletePoint'); // fixes loss of context for 'this' within method
            this.render(); // not all views are self-rendering. This one is.
            this.getCategories();
       	    window.listView = this;
        },
        render: function(){
            //   $(this.el).append('<ul> <li>hello world</li> </ul>');  
            // Tartu
            mapextent = new OpenLayers.Bounds(2948518.4067798, 8028114.5837566, 3003553.0671374, 8058116.1173544);
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
		window.pointsArray = self.pointsArray; 
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
                    renderers: ['Canvas','SVG'],
                    strategies: [
                    new OpenLayers.Strategy.AnimatedCluster({
                        distance: 1,
                        animationMethod: OpenLayers.Easing.Expo.easeOut,
                        animationDuration: 20
                    })
                    ],
                    styleMap: myStyle
                /* rendererOptions: {
                        yOrdering: true,
                        zIndexing: true
                    }  */
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
                    '<img style="width: 300px; height: 350px; " src="data:image/jpeg;base64,' + photo+ '" />' +
                    "<br/>"+
                    "Kategooria: " + selectedFeature.attributes['CATEGORY'] + "<br/>"+ 
                    "Kommentaar: " + selectedFeature.attributes['COMMENTARY'] + "<br/>" 
                    //   "<a  id = 'onclick'>Muuda kategooriat</a>"  + "<br/>" + 
                    //   "<a id ='delete2'>&#32;Kustuta</a>" + "<br/>" ;
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
                    self.changePoint();
                    self.deletePoint();
                });   
        },
        changePoint: function (){
           
            $('#onclick').bind('click', function(e) {
              //  console.log("muuda");
            });
        },
        deletePoint: function (){
           
            $('#delete2').bind('click', function(e) {
              //  console.log("kustuta");
            });
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
                        '" ><input name = "'+value.id_sub+'" type="checkbox" id ="' + (loendur +index+1) +
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
                $(".catSelect").bind('click', function(e) {
                    // console.log(e.toElement.id);
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
                            if(value.attributes.ID_CATEGORY ==e.target.id) {
                                self.pointsArray[index].renderIntent = "invisible";   
                            }                
                        }); 
                        map.removeLayer(self.vector_points);
                        map.addLayer(self.vector_points); 
                    }
                    else if($('#'+e.target.id).is(':checked')==true) {  
                        // kui ülemkategooria selected, muudan ka alamkatekooriad selected
                        var subCatInput2 = ".subCat" + e.target.id + " input";
                        $(subCatInput2).attr('checked', true);
                        $.each(points, function(index, value) { 
                            ts = value.attributes.TIMESTAMP.split(" ")[0].split("-");
                            date = new Date(ts[1]+"/"+ts[2]+"/"+ts[0]).getTime();
                            //  if(value.attributes.ID_CATEGORY ==e.target.id) {
                            if(value.attributes.ID_CATEGORY == e.target.id && (date >= start && date <= end)) {
                                self.pointsArray[index].renderIntent = "default";   
                            }                
                        }); 
                        map.removeLayer(self.vector_points);
                        map.addLayer(self.vector_points); 
                    }
                                
                });
                        
                // alamkategooriate põhjal selekteerimine
                $(".subcat").bind('click', function(e) {
                    // console.log(e.toElement.name);
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
                            if(value.attributes.ID_SUBCATEGORY ==e.target.name) {
                                self.pointsArray[index].renderIntent = "invisible";   
                            }                
                        }); 
                        map.removeLayer(self.vector_points);
                        map.addLayer(self.vector_points); 
                    }
                    else if($('#'+e.target.id).is(':checked')==true) {   
                        $.each(points, function(index, value) { 
                            ts = value.attributes.TIMESTAMP.split(" ")[0].split("-");
                            date = new Date(ts[1]+"/"+ts[2]+"/"+ts[0]).getTime();
                            if(value.attributes.ID_SUBCATEGORY ==e.target.name && (date >= start && date <= end)) {
                                self.pointsArray[index].renderIntent = "default";   
                            }                
                        }); 
                        map.removeLayer(self.vector_points);
                        map.addLayer(self.vector_points); 
                    }
                });
                // ajavahemiku põhjal selekteerimine
                $("#time-interval").bind('change', function(e){
                    //if($("#time-start").val()){
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
                    $.each(points, function(index, value) {
                        // punkti aeg
                        ts = value.attributes.TIMESTAMP.split(" ")[0].split("-");
                        date = new Date(ts[1]+"/"+ts[2]+"/"+ts[0]).getTime();
                        // kui kuupäev ei jää selekteeritud vahemikku muudan punkti nähtamatuks
                        if(date < start || date > end) {
                            self.pointsArray[index].renderIntent = "invisible";   
                        } else {
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
                        }         
                    }); 
                    //}
                    map.removeLayer(self.vector_points);
                    map.addLayer(self.vector_points); 
                }); 
                
            });
            
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
            $("#categoriesEdit").hide();
            $("#catAdmin").bind('click', function(e){
                toggleCAdmin("hide");
            });
        }
        else {
            $("#categoriesEdit").show();
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
            $("#topmenu").html(data);
            $("#catView").bind('click', function(e){
                e.preventDefault();
                toggleLegend("hide");
            });
            $("#catAdmin").bind('click', function(e){
                e.preventDefault();
                toggleCAdmin("hide");
            });
            $.getJSON('getcategories/getsubcat', function(data) {
                var categories = ""; 
                var loendur = 100;
                var loendur2 = 1;
                $.each(data, function(index, value) { 
                    categories += '<li><div class="catcolor" style="background-color: '+
                    value.color + ';"></div> <label id = "e'+ loendur + '" >' + value.name +'</label><button class="categoryDelete" value="'+ loendur + '">Kustuta</button><ul class = "e' + loendur +
                    ' show" style="margin-left: 20px;">';
                    $.each(value.subcategories, function(index, value) {
                        categories += '<li class="subcat subCatEd' + loendur2 +
                        '" ><label for="e' +  (loendur + index +1) + '">' +
                        value.name + '</label><button class="categoryDelete" value="'+ (loendur + index +1) + '">Kustuta</button></li>'; 
                    }); 
                    loendur2=loendur2+1;
                    loendur= loendur+100;
                    categories +='</ul></li>'; 
                }); 
                var lHtml =  '<label>Kategooriate haldus</label>'+ '<ul>' + categories + '</ul><br/><div id="addCategory">Lisa kategooria</div>';
                $("#categoriesEdit").html(lHtml);
            });
        }
        ); 
    $("#nupp").bind('click', function(e) {
        e.preventDefault();
        console.log(map.getExtent());
        console.log(map.getResolution());
        
    });
});
