(function () {
    L.mapbox.accessToken = 'pk.eyJ1Ijoicmdkb25vaHVlIiwiYSI6Im5Ua3F4UzgifQ.PClcVzU5OUj17kuxqsY_Dg';

    var map = L.mapbox.map('map', 'mapbox.light', {
        center: [-.23, 37.8],
        zoom: 7,
        minZoom: 6,
        maxZoom: 9,
        maxBounds: L.latLngBounds([-6.22, 27.72],[5.76, 47.83])
    });

    var currentGrade = 1

    var countyCentroids = omnivore.csv('kenya_education_2014.csv')
        .on('ready',function(e) {
           drawMap(e.target.toGeoJSON())
        })
        .on('error', function(e) {
            console.log(e.error[0].message)
        });

    var girls,
        boys;

    function drawMap(schoolData){

        girls = L.geoJson(schoolData, {
            pointToLayer: function(feature, layer){
                return L.circleMarker(layer, {
                    color: '#8C029A',
                    opacity: .8,
                    weight: 2,
                    fillOpacity: 0,

                    radius: calcRadius(Number(feature.properties.G1))       
                });
            }
        }).addTo(map);    

        boys = L.geoJson(schoolData, {
            pointToLayer: function(feature, layer){
                return L.circleMarker(layer, {
                    color: '#8BA838',
                    opacity: .8,
                    fillColor: '#DEDEDE',
                    weight: 2,
                    fillOpacity: 0,
                    radius: calcRadius(Number(feature.properties.B1))
                });

            }

        }).addTo(map);

        updateSymbols(1)
        sequenceUI()                


    }


    function updateSymbols(currentGrade) {

        var allRadii = [],
            radius;


        girls.eachLayer(function(layer) {
            radius = (calcRadius(Number(layer.feature.properties['G'+currentGrade])))
            layer.setRadius(radius)
            allRadii.push(radius)
        });

        boys.eachLayer(function(layer) {
            radius = (calcRadius(Number(layer.feature.properties['B'+currentGrade])))
            layer.setRadius(radius)
            allRadii.push(radius)
        });

        drawLegend(allRadii);
        infoWindow(currentGrade);

    }

    function calcRadius(val) {

        var radius = Math.sqrt(val/Math.PI);
        return radius * .6;
    }

    function sequenceUI() {

        //var output = $('.grade span');

        $('.slider')
            .on('input change', function() {
                var currentGrade = $(this).val();
                updateSymbols(currentGrade);
                $('#grade span').html(currentGrade);
            });

    }

    function drawLegend(allRadii){
        var legend =$('.legend')
        var circles = {
            max: ss.max(allRadii),
            median: ss.median(allRadii),
            min: ss.min(allRadii),

        }

        console.log(circles)

        var svgCircle = '';

        var reverseCalc = function(radius) {

            return Math.round(Math.pow(radius/.6, 2) * Math.PI)

        }

        for (var circle in circles) {
            var radiusValue = circles[circle];

            var actualValue = reverseCalc(radiusValue);

            svgCircle += '<circle cx="50%" cy="' + (radiusValue -180) * -1 + '" r="' + radiusValue + '" stroke = "#DEDEDE" stroke-width="2" fill="rgba(140, 2, 154, 0.30)" />';

            svgCircle += '<text x="'+ 85 +'" y = "'+ (radiusValue -160) * -1 + '" fill="#222222">'+ actualValue +'</text>'
        }

        legend.html(svgCircle);
    }

    function infoWindow(currentGrade) {
        var info = $('#info');

        boys.on('mouseover', function(e){

            info.show()

            var props = e.layer.feature.properties;
            $('#info span').text(props.COUNTY);
            $('.girls span:first-child').text('(grade '+ currentGrade +')');
            $('.boys span:first-child').text('(grade ' + currentGrade +')');

            $(".girls span:last-child").text(props['G'+String(currentGrade)].toLocaleString());
            $(".boys span:last-child").text(props['B'+String(currentGrade)].toLocaleString());

            e.layer.setStyle({ fillOpacity: .6 });

        })

        boys.on('mouseout', function(e){

            info.hide()
            e.layer.setStyle({ fillOpacity: 0});

        });

        $(document).mousemove(function(e) {
            info.css({"left": e.pageX + 6, "top": e.pageY - info.height() - 15});

            if(info.offset().top < 4) {
                info.css({"top": e.pageY + 15} )
            }

            if(info.offset().left + info.width() >= $(window).width() - 40) {
               info.css({ "left": e.pageX - info.width() - 15 })
            };
        });
    }
})();