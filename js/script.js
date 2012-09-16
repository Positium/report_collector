
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

            var openStreetMap = new OpenLayers.Layer.OSM("OpenCycleMap","",{
                attribution: '',
               
              maxResolution: mapextent
               
                
            });
            var options = {
                restrictedExtent: mapextent, 
                layers              : [openStreetMap],
                controls: [
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.Attribution(),
                new OpenLayers.Control.ArgParser(),
                new OpenLayers.Control.Zoom()
                ],
                units: 'm',
                maxExtent: mapextent  
               
            };
            map = new OpenLayers.Map("map", options);
            // resolutions: [76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508 ]
            map.zoomToExtent(mapextent); 
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

