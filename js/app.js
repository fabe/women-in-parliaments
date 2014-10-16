    // INITIALIZE GOOGLE JSAPI
    google.load('visualization', '1', {
        'packages': ['corechart', 'geochart']
    });

   	$(function() {

        // TOGGLE DROPDOWN
        $(".dropdown-toggle, .search-field").on("click", function() {
            if ($(this).attr("data-type") === "1") {
                $(".dropdown[data-type='1']").toggle();
                $(".dropdown-toggle[data-type='1']").toggleClass("flipped");
            } else {
                $(".dropdown[data-type='2']").toggle();
                $(".dropdown-toggle[data-type='2']").toggleClass("flipped");
            }
        });

        function getQueryVariable(variable) {
               var query = window.location.search.substring(1);
               var vars = query.split("&");
               for (var i=0;i<vars.length;i++) {
                       var pair = vars[i].split("=");
                       if(pair[0] == variable){return pair[1];}
               }
               return(false);
        }

        // "SHOW MAP" BUTTON
        $("#map").on("click", function() {
        	$("#shutter").fadeOut();
        	$("#content").fadeOut();
        	$("footer").fadeOut();
        	$("#map-title").fadeIn();
        	$("#hide-map").fadeIn();
        });

        // "GO BACK" BUTTON
        $("#hide-map").on("click", function() {
        	$("#shutter").fadeIn();
        	$("#content").fadeIn();
        	$("footer").fadeIn();
        	$("#map-title").fadeOut();
        	$("#hide-map").fadeOut();
        });

        // GET DATA
        $.ajax({
            "url": "js/json.json",
                "crossDomain": false,
                "dataType": "json",
            jsonpCallback: 'kimonoCallback',
            contentType: "application/json"
        }).done(function (data) {

            // JSON TO ARRAY
            var statesArray = [
                ["Country", "Percent"]
            ];

            $.each(data.results.seats, function () {
                if (this.percent == "") {
                	void(0);
                } else if (this.country == "Korea, Democratic People's Republic of") { // -> GOOGLE DOES NOT RECOGNIZE THIS, BACKUP
                	var percentage = Number(this.percent);
                    var stateitem = ["North Korea", percentage];
                    statesArray.push(stateitem);
                } else if (this.country == "Korea, Republic of") { // -> GOOGLE DOES NOT RECOGNIZE THIS, BACKUP
                	var percentage = Number(this.percent);
                    var stateitem = ["South Korea", percentage];
                    statesArray.push(stateitem);
                } else {
                    var percentage = Number(this.percent);
                    var stateitem = [this.country, percentage];
                    statesArray.push(stateitem);
                }
            });

            // INSERT REGIONS (STATIC)

            var sum = 0;
            for(var i = 1; i < statesArray.length; i++){
                sum += parseFloat(statesArray[i][1]); //don't forget to add the base
            }

            var avg = sum/statesArray.length;
            var world = ["World", avg];

            var africa = ["Africa", 22.5];
            var europe = ["Europe", 25.3];
            var arab = ["Arab States", 17.8];
            var nordic = ["Nordic countries", 41.6];
            var asia = ["Asia", 18.8];
            var americas = ["Americas", 25.6];
            var pacific = ["Pacific", 12.6];

            statesArray.splice(1, 0, pacific);
            statesArray.splice(1, 0, arab);
            statesArray.splice(1, 0, asia);
            statesArray.splice(1, 0, africa);
            statesArray.splice(1, 0, europe);
            statesArray.splice(1, 0, americas);
            statesArray.splice(1, 0, nordic);
            statesArray.splice(1, 0, world);

            // INSERT COUNTRIES IN DROPDOWN
            for (var i = 1; i <= statesArray.length - 1; i++) {
                $(".dropdown").append(function() {
                    var country = '<div class="' + statesArray[i][0] + '"><a href="#" class="country-name" data-type="' + i + '">' + statesArray[i][0] + '</a></div>';
                    if ($(this).attr("data-type") == "1") {
                        $(".country-name", this).addClass("c-1");
                    } else {
                        $(".country-name", this).addClass("c-2");
                    }
                    return country;
                });
            };        

            // STUPID HACKS BECAUSE
            $(".dropdown[data-type='1'] .Zimbabwe a").addClass("c-1"); 
            $(".dropdown[data-type='2'] .Zimbabwe a").addClass("c-2");   
            $(".Pacific").append("<div class='divider'></div>");    

            // SELECT COUNTRY
            $(".country-name").on("click", function(e) {
                e.preventDefault();
                var value = $(this).html();
                var n = $(this).attr("data-type");
                $(".dropdown-toggle[data-type='" + n + "']").toggleClass("flipped");
                if ($(this).attr("class") === "country-name c-1") {
                    $("#country-1").val(value);
                    drawChart(n, 1);
                    $(".dropdown-toggle[data-type='1]").removeClass("flipped");
                    $(".dropdown[data-type='1']").hide();
                } else {
                    $("#country-2").val(value);
                    drawChart(n, 2);
                    $(".dropdown-toggle[data-type='2']").removeClass("flipped");
                    $(".dropdown[data-type='2']").hide();
                }
            });

            // SEARCH FEATURE
            $(".search-field").on("keyup", function() {
                var l = $(this).attr("data-type");
                var search = $(".search-field[data-type='" + l + "']").val().toLowerCase();
                $.each($(".dropdown[data-type='" + l + "'] div"), function() {
                    if ($(this).attr("class").toLowerCase().indexOf(search) == 0) {
                        $(this).css("display", "block");
                    } else {
                        $(this).css("display", "none");
                    }
                });
                if ($(".dropdown[data-type='" + l + "'] div:visible").length <= 0) {
                    $(".dropdown[data-type='" + l + "'] .no-results").show();
                } else {
                    $(".dropdown[data-type='" + l + "'] .no-results").hide();
                }
                if ($(".search-field").is(":focus")) {
                    var l = $(this).attr("data-type");
                    $(".dropdown[data-type='" + l + "']").show();
                }
            });

    		// "RANDOMIZE" BUTTON
    		$("#randomize").on("click", function() {
    			var r = Math.round(Math.random() * (statesArray.length - 0));
    			var s = Math.round(Math.random() * (statesArray.length - 0));
    			$(".search-field[data-type='1']").val(statesArray[r][0]);
    			$(".search-field[data-type='2']").val(statesArray[s][0]);
    			drawChart(r, 1);
    			drawChart(s, 2);
    		});

            $("#share").on("click", function() {
                var l = $("#pie-1").attr("data-type");
                var r = $("#pie-2").attr("data-type");
                $("#sharer").fadeIn();
                $("#sharer input").val("http://fabianschultz.com/women-in-parliaments?l=" + l + "&r=" + r);
                $("#sharer input").select();
            });

            $("#sharer a").on("click", function() {
                $("#sharer").fadeOut();
            });

            // FUNCTION TO DRAW A CHART (COUNTRY;ID)
			function drawChart(c, p) {
				var men = 100 - statesArray[c][1];
	    		var women = statesArray[c][1];
	    		var percentArray = [
	                ["Male", "Female"]
	            ];
	            percentArray.push(["Male", men]);
	            percentArray.push(["Female", women]);
				var data = google.visualization.arrayToDataTable(percentArray);

				var options = {
					pieHole: 0.4,
					chartArea: {backgroundColor: "#333", width: "270px"},
					backgroundColor: {fill:'transparent'},
					legend: {position: 'none', textStyle: "{color:#262626}"},
					fontName: "aktiv-grotesk-std, 'Aktiv Grotesk Medium'",
					colors: ["#63BBDF", "#ED7E7F"],
                    pieSliceBorderColor: "#F2F3EE",
                    tooltip: {text: "percentage"},
                    height: 250
				};

				var chart = new google.visualization.PieChart(document.getElementById('pie-' + p));
                $("#pie-" + p).attr("data-type", c);
				chart.draw(data, options);
			}

            // FUNCTION TO DRAW MAP
			function drawRegionsMap() {
				var data = google.visualization.arrayToDataTable(statesArray);
				var options = {
					backgroundColor: {
		                fill: '#F3F4EF',
		                stroke: "#F3F4EF"
		            },
		            colorAxis: {
		                colors: ['#EEEFEA', '#A2A39E']
		            },
		            keepAspectRatio: true,
		            legend: 'none',
		            width: "100%"
				};
				var chart = new google.visualization.GeoChart(document.getElementById('world'));

				chart.draw(data, options);
			}

            // DRAW WHEN DATA IS LOADED

            var k = Math.round(Math.random() * (statesArray.length - 0));
            var l = Math.round(Math.random() * (statesArray.length - 0));

            var country1 = parseInt(getQueryVariable("l"));
            var country2 = parseInt(getQueryVariable("r"));

            if (isNaN(country1) || isNaN(country2)) {
                google.setOnLoadCallback(drawChart(k, 1));
                google.setOnLoadCallback(drawChart(l, 2));
                $(".search-field[data-type='1']").val(statesArray[k][0]);
                $(".search-field[data-type='2']").val(statesArray[l][0]);
            } else {
                google.setOnLoadCallback(drawChart(country1, 1));
                google.setOnLoadCallback(drawChart(country2, 2));
                $(".search-field[data-type='1']").val(statesArray[country1][0]);
                $(".search-field[data-type='2']").val(statesArray[country2][0]);
            }

			
			drawRegionsMap();
            $("#loader").fadeOut();
        });
    });