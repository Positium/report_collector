
$(document).ready(function () {
   
    var ListView = Backbone.View.extend({    
        el: $('#map'), // attaches `this.el` to an existing element.
    
        initialize: function(){
            _.bindAll(this, 'render'); // fixes loss of context for 'this' within methods
  
            this.render(); // not all views are self-rendering. This one is.
        },
        render: function(){
            //   $(this.el).append('<ul> <li>hello world</li> </ul>');  
            // map.addLayer(new OpenLayers.Layer.OSM());
            mapextent = new OpenLayers.Bounds(2948518.4067798, 8028114.5837566, 3003553.0671374, 8058116.1173544);
            mapextent2 = new OpenLayers.Bounds(2980050.535418, 8041609.8667399, 2980201.6926272, 8041658.8878627);

            var openStreetMap = new OpenLayers.Layer.OSM("OSM","",{
                attribution: '',
              isBaseLayer:true,
              zoomOffset:11,
              resolutions: [76.4370282714844,38.2185141357422,19.1092570678711,9.55462853393555,4.77731426696777,2.38865713348389,1.19432856674194]
            // minZoomLevel: 11, 
            // maxZoomLevel: 16              
            // maxResolution: 152.87405654907226   
            
            });
            var options = { 
                layers              : [openStreetMap],
                controls: [
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.Attribution(),
                new OpenLayers.Control.ScaleLine(),
               // new OpenLayers.Control.PanZoomBar(),
                new OpenLayers.Control.OverviewMap(),
                new OpenLayers.Control.Zoom()
                ],
                units: 'm',
                // maxExtent: mapextent,
                restrictedExtent: mapextent                 
                //zoom: 11  
            };
            
            map = new OpenLayers.Map("map", options);
            // resolutions: [76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508 ]
            map.zoomToExtent(mapextent); 
          /*  map.events.register('zoomend', this, function (event) {
                var x = map.getZoom();
                if( x < 11)
                {
                    map.zoomTo(11);
                }
            });*/
            $(this.el).append(map); 
            console.log(map.getExtent());
        }
    });
    var listView = new ListView();
    $("#nupp").bind('click', function(e) {
        e.preventDefault();
        console.log(map.getExtent());
        console.log(map.getResolution());
        
    });
});

