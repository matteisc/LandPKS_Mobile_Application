angular.module('ionicApp.controller',['chart.js'])

/****************************************/
/*
 * Activity Settings
 */
/****************************************/
.factory('Scopes', function ($rootScope) {
    var mem = {};
 
    return {
        store: function (key, value) {
            $rootScope.$emit('scope.stored', key);
            mem[key] = value;
        },
        get: function (key) {
            return mem[key];
        }
    };
})

.factory('Camera', ['$q', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    }
  }
}])

.config(function($compileProvider){
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})


/****************************************/
/*
 * Manage Controller
 */
/****************************************/
/****************************************/
/** List Account Controller **/
/****************************************/
.controller('ListAccountsCtrl', function($scope, $state, $http, Scopes, $ionicHistory) {
	var listAuthentication = window.localStorage.getItem("AUTHENTICATION_LIST");
	var jsonObjAuth = JSON.parse(listAuthentication);
	$scope.accounts = jsonObjAuth['authentication'];
	function clearCache() {
		$ionicHistory.clearCache();
		//$ionicHistory.clearHistory();
	}
	$scope.selectAccount = function(account){
		window.localStorage.setItem("current_json_auth_data", account.json_auth_data);
		window.localStorage.setItem("current_email",account.email);
		window.localStorage.setItem("current_password",account.password);
		//clearCache();   
		window.localStorage.setItem("PREVIOUS_PAGE","ACCOUNTS_PAGE");
		$state.go('landinfo.plots');
	};
}) // End ListAccountsCtrl

/****************************************/
/** Settings Controller **/
/****************************************/
.controller('SettingsCtrl', function($scope, $state, $http, Scopes,$ionicHistory) {
	console.log("Click Setting");
	$ionicHistory.clearCache();
}) // End Setting

/****************************************/
/** Results Section Controller **/
/****************************************/
.controller('Results_Section_Ctrl', function($scope, $state, Scopes) {
	$scope.goBack = function() {
		 window.localStorage.setItem("PREVIOUS_PAGE","RESULT_SECTION_PAGE");
         $state.go('landinfo.plots');
    };
    var view_plot = JSON.parse(window.localStorage.getItem("current_view_plot"));
    
    
    var str = view_plot.name.length;
	var email = window.localStorage.getItem('current_email');
	var emaillength = email.length + 1;
	var finalstr = view_plot.name.substring(emaillength,str);
	
    
	$scope.plot_name = finalstr;
	console.log("Result Section Ctrl");
	$scope.review_status_img_src = "img/check-mark-th.png";
	//$scope.review_status_img_src = "img/check-mark-white-th.png";	
	$scope.results_status_img_src = "img/check-mark-th.png";
}) // End Results Section Controller

/****************************************/
/** Clear Controller **/
/****************************************/
.controller('ClearCtrl', function($scope,$ionicHistory) {
  console.log("Clear Everything");
  window.localStorage.clear();
  $ionicHistory.clearCache();
  $ionicHistory.clearHistory();
}) // End ClearCtrl

/****************************************/
/** Plots Map Controller **/
/****************************************/
.controller('PlotsMapCtrl', function($scope, $state, $compile) {
	
	function fAvgLat(JSONArrayPlots){
		var sumLat = 0;
		//var sumLong = 0;
		for (var index = 0; index < JSONArrayPlots.length; index++) {
			var latitude =  parseFloat(JSONArrayPlots[index].latitude);
			//var longitude =  parseFloat(JSONArray[index].longitude);
			sumLat = sumLat + latitude;
			//sumLong = sumLong + longitude;
		}
		
		return parseFloat(sumLat / JSONArrayPlots.length);
	};
	
	function fAvgLong(JSONArrayPlots){
		//var sumLat = 0;
		var sumLong = 0;
		for (var index = 0; index < JSONArrayPlots.length; index++) {
			//var latitude =  parseFloat(JSONArrayPlots[index].latitude);
			var longitude =  parseFloat(JSONArrayPlots[index].longitude);
			//sumLat = sumLat + latitude;
			sumLong = sumLong + longitude;
		}
		
		return parseFloat(sumLong / JSONArrayPlots.length);
	};
	
	function isPlotInCloud(plot){
		if (plot.id === null || plot.id === '' || plot.id === 'null' || plot.id === 'undefined' || plot.isActived == true){
			return false;
		} else {
			return true;
		}
    };	
	
	$scope.init = function() {
		
		function bindInfoWindow(marker, map, infoWindow, html) {
			  
	  	      google.maps.event.addListener(marker, 'click', function() {
	  	        infoWindow.setContent(html);
	  	        infoWindow.open(map, marker);
	  	      });
	  	};
		
	  	
	  	function getLandCoverIcon(cover){
			switch(cover) {
						case "tree cover, >25% canopy": //land_use_cover_fragment_land_cover_1
							return "media/landcover_images/ic_tree_selected.png";
							
						case "shrub cover, >50% cover"://land_use_cover_fragment_land_cover_2
							return "media/landcover_images/ic_shrub_selected.png";
							
						case "grassland, >50% grass"://land_use_cover_fragment_land_cover_3
							return "media/landcover_images/ic_grass_land_selected.png";
							
						case "savanna, 10-20% tree cover"://land_use_cover_fragment_land_cover_4
							return "media/landcover_images/ic_savanna_selected.png";
							
						case "garden/mixed"://land_use_cover_fragment_land_cover_5
							return "media/landcover_images/ic_garden_mixed_selected.png";
							
						case "cropland"://land_use_cover_fragment_land_cover_6
							return "media/landcover_images/ic_cropland_selected.png";
							
						case "developed"://land_use_cover_fragment_land_cover_7
							return "media/landcover_images/ic_developed_selected.png";
							
						case "barren, <5% veg cover"://land_use_cover_fragment_land_cover_8
							return "media/landcover_images/ic_barren_selected.png";
							
						case "water"://land_use_cover_fragment_land_cover_9
							return "media/landcover_images/ic_water_selected.png";		
							
						default://unknown
							return "media/landcover_images/ic_unknown.png";
			}
		};
	  	
	  	
        var myLatlng = new google.maps.LatLng(-18.027830, 28.447186);
        var mapOptions = {
          center: myLatlng,
          zoom: 4,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);
     
        var infowindow = new google.maps.InfoWindow;

    	var email = window.localStorage.getItem('current_email');
    	console.log(email);
	    var LIST_PLOTS = JSON.parse(window.localStorage.getItem(email + "_" + "LIST_LANDINFO_PLOTS"));
	    for(var index = 0 ; index < LIST_PLOTS.length ; index++){
	    	var plot = LIST_PLOTS[index];
	    	if (isPlotInCloud(plot)){
		    	var name = plot.name;
	            var recorder_name = plot.recorder_name;
	            var lat = plot.latitude;
	            var lng = plot.longitude;
	            
				var slope =  plot.slope;
				var slope_shape =  plot.slope_shape;
				var land_cover =  plot.land_cover;
				var grazed =  plot.grazed;
				var flooding =  plot.flooding;
				var surface_cracking = plot.surface_cracking;
				var surface_salt =  plot.surface_salt;
				  
			    var texture_for_soil_horizon_1 = plot.texture.soil_horizon_1;
				var texture_for_soil_horizon_2 = plot.texture.soil_horizon_2;
				var texture_for_soil_horizon_3 = plot.texture.soil_horizon_3;
				var texture_for_soil_horizon_4 = plot.texture.soil_horizon_4;
				var texture_for_soil_horizon_5 = plot.texture.soil_horizon_5;
				var texture_for_soil_horizon_6 = plot.texture.soil_horizon_6;
				var texture_for_soil_horizon_7 = plot.texture.soil_horizon_7;
				  
				var rock_fragment_for_soil_horizon_1 = plot.rock_fragment.soil_horizon_1;
				var rock_fragment_for_soil_horizon_2 = plot.rock_fragment.soil_horizon_2;
				var rock_fragment_for_soil_horizon_3 = plot.rock_fragment.soil_horizon_3;
				var rock_fragment_for_soil_horizon_4 = plot.rock_fragment.soil_horizon_4;
				var rock_fragment_for_soil_horizon_5 = plot.rock_fragment.soil_horizon_5;
				var rock_fragment_for_soil_horizon_6 = plot.rock_fragment.soil_horizon_6;
				var rock_fragment_for_soil_horizon_7 = plot.rock_fragment.soil_horizon_7;
				  
	            var point = new google.maps.LatLng(
	                parseFloat(lat),
	                parseFloat(lng)
	            );
		    	
	            
	            var html = "<b>Plot Name : </b>" + name +
				  "<br/> <b>Lat : </b>" + parseFloat(lat).toFixed(3) + 
				  "<br/><b>Long : </b>" + parseFloat(lng).toFixed(3) +
				  "<br/><b>Land Cover : </b>" + land_cover+'<img src= "'+ getLandCoverIcon(land_cover) + '" alt="icon" width ="140" height="140" vertical-align ="middle" style="float:right;">'+
				   "<br/><b>Land Use : </b>" + 
				   '<ul style="display: table-cell; vertical-align: top;">'+
				   "<li><b>Livestock Grazing? </b>" + grazed + "</li>" +
				   "<li><b>Standing Water? </b>" + flooding+ "</li>" +
				   "</ul>"+
				  "<b>Slope : </b>" + slope + 
				  "<br/><b>Slope shape : </b>" + slope_shape+
				   "<br/><b>Soil Conditions : </b>" + 
				   '<ul style="display: table-cell; vertical-align: top;">'+
				   "<li><b>Vertical cracks in soil profile? </b>" + surface_cracking + "</li>" +
				   "<li><b>Salt on soil surface? </b>" + surface_salt+ "</li>" +
				   "</ul>"+
				   "<b>Soil Layers </b>" + 
				   '<ul style="display: table-cell; vertical-align: top;">'+
				   "<li><b>0-1 cm </b>"+ '<ul style="display: table-cell; vertical-align: top;">' +
					"<li><b>Texture: </b>" + texture_for_soil_horizon_1 +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Rock fragments: </b>"+ rock_fragment_for_soil_horizon_1+ "</li>" +
				   "</ul></li>"+				   
				   "<li><b>1-10 cm </b>"+ '<ul style="display: table-cell; vertical-align: top;">' +
					"<li><b>Texture: </b>" + texture_for_soil_horizon_2 +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Rock fragments: </b>"+ rock_fragment_for_soil_horizon_2+ "</li>" +
				   "</ul></li>"+
				   "<li><b>10-20 cm </b>"+ '<ul style="display: table-cell; vertical-align: top;">' +
					"<li><b>Texture: </b>" + texture_for_soil_horizon_3 +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Rock fragments: </b>"+ rock_fragment_for_soil_horizon_3+ "</li>" +
				   "</ul></li>"+
				   "<li><b>20-50 cm </b>"+ '<ul style="display: table-cell; vertical-align: top;">' +
					"<li><b>Texture: </b>" + texture_for_soil_horizon_4 +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Rock fragments: </b>"+ rock_fragment_for_soil_horizon_4+ "</li>" +
				   "</ul></li>"+
				   "<li><b>50-70 cm </b>"+ '<ul style="display: table-cell; vertical-align: top;">' +
					"<li><b>Texture: </b>" + texture_for_soil_horizon_5 +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Rock fragments: </b>"+ rock_fragment_for_soil_horizon_5+ "</li>" +
				   "</ul></li>"+
				   "<li><b>70-100 cm </b>"+ '<ul style="display: table-cell; vertical-align: top;">' +
				   "<li><b>Texture: </b>" + texture_for_soil_horizon_6 +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Rock fragments: </b>"+ rock_fragment_for_soil_horizon_6+ "</li>" +
				   "</ul></li>"+
				   "<li><b>100-120 cm </b>"+ '<ul style="display: table-cell; vertical-align: top;">' +
				   "<li><b>Texture: </b>" + texture_for_soil_horizon_7 +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Rock fragments: </b>"+ rock_fragment_for_soil_horizon_7+ "</li>" +
				   "</ul></li>"+
				   "</ul>";
		    	
		        var marker = new google.maps.Marker({
		          position: point,
		          map: map,
		          title: 'LandInfo Plots Map'
		        });
		        bindInfoWindow(marker, map, infowindow, html);
	    	}
	    }
        $scope.map = map;
	};
	
	$scope.getClimate = function(){
		$state.go('landinfo.quick_climate');
	};
})

/****************************************/
/** HomeTab Controller **/
/****************************************/
.controller('HomeTabCtrl', function($scope,$state) {
	console.log("HomeTab ");
	$scope.getClimate = function(){
		$state.go('landinfo.quick_climate');
	};
}) // End HomeTabCtrl


/****************************************/
/** ReviewSelectedPlot Controller **/
/****************************************/
.controller('ReviewSelectedPlotCtrl', function($scope, $state, $http, Scopes) {

	$scope.goBack = function() {
         $state.go('landinfo.results-section');
    };
	var ListPlotsCtrl_Scope = Scopes.get('ListPlotsCtrl_Scope');
	
	$scope.name = ListPlotsCtrl_Scope.selectedPlot.name;
	
	var mix_name = $scope.name; 
	var str = mix_name.length;
	var email = window.localStorage.getItem('current_email');
	var emaillength = email.length + 1;
	var finalstr = mix_name.substring(emaillength,str);
	$scope.plot_name = finalstr;
	
	$scope.precip_bar_options = {
  	      animation: false
    };
  
	
	$scope.selectedPlot = ListPlotsCtrl_Scope.selectedPlot;
    $scope.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sep','Oct','Nov','Dec'];
    $scope.series = ['Series A'];
    $scope.captions = ['Climate'];

    /* Validate climate precipitation */
    if (isEmpty(ListPlotsCtrl_Scope.selectedPlot.climate) || isEmpty(ListPlotsCtrl_Scope.selectedPlot.climate.precipitation)){
    	//console.log("Dech co gi");
    	ListPlotsCtrl_Scope.selectedPlot.climate = {};
    	ListPlotsCtrl_Scope.selectedPlot.climate.precipitation = {};
    	ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.january = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.february = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.march = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.april = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.may = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.june = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.july = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.august = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.september = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.october = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.november = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.december = -999;
    }
    
    
    $scope.data = [
       [ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.january, 
        ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.february, 
        ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.march, 
        ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.april, 
        ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.may, 
        ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.june, 
        ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.july, 
        ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.august,
        ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.september,
        ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.october,
        ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.november,
        ListPlotsCtrl_Scope.selectedPlot.climate.precipitation.december
       ],
    ];

    $scope.temp_line_options = {
    	      animation: false
    };
    $scope.names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sep','Oct','Nov','Dec'];
    $scope.number = ['Max Temp', 'Avg Temp','Min Temp'];
    
    
    /* Validate climate precipitation */
    if (isEmpty(ListPlotsCtrl_Scope.selectedPlot.climate) || isEmpty(ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature)){
    	//console.log("Dech co gi");
    	ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature = {};
    	ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.january = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.february = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.march = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.april = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.may = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.june = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.july = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.august = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.september = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.october = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.november = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.december = -999;
    }
    
    /* Validate climate precipitation */
    if (isEmpty(ListPlotsCtrl_Scope.selectedPlot.climate) || isEmpty(ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature)){
    	//console.log("Dech co gi");
    	ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature = {};
    	ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.january = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.february = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.march = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.april = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.may = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.june = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.july = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.august = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.september = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.october = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.november = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.december = -999;
    }
    
    /* Validate climate precipitation */
    if (isEmpty(ListPlotsCtrl_Scope.selectedPlot.climate) || isEmpty(ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature)){
    	//console.log("Dech co gi");
    	ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature = {};
    	ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.january = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.february = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.march = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.april = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.may = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.june = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.july = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.august = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.september = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.october = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.november = -999;
    	ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.december = -999;
    }
    
    $scope.linedata = [
          [ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.january, ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.february, ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.march, ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.april, ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.may, ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.june, ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.july, ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.august,ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.september,ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.october,ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.november,ListPlotsCtrl_Scope.selectedPlot.climate.max_temperature.december]
         ,[ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.january, ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.february, ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.march, ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.april, ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.may, ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.june, ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.july, ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.august,ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.september,ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.october,ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.november,ListPlotsCtrl_Scope.selectedPlot.climate.average_temperature.december]
         ,[ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.january, ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.february, ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.march, ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.april, ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.may, ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.june, ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.july, ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.august,ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.september,ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.october,ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.november,ListPlotsCtrl_Scope.selectedPlot.climate.min_temperature.december]
    ];
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
  	
	//var str = ListPlotsCtrl_Scope.selectedPlot.name.length;
	//var email = window.localStorage.getItem('current_email');
	//var emaillength = email.length + 1;
	//var finalstr = name.substring(emaillength,str);
		
	$scope.names1 = [finalstr];
    $scope.awcseries = ['Series A'];
    $scope.awccaptions = ['AWC Soil Profile'];

    /* Validate climate precipitation */
    if (isEmpty(ListPlotsCtrl_Scope.selectedPlot.analytic_data_soil) || isEmpty(ListPlotsCtrl_Scope.selectedPlot.analytic_data_soil.awc_soil_profile_awc)){
    	//console.log("Dech co gi");
    	ListPlotsCtrl_Scope.selectedPlot.analytic_data_soil = {};
    	ListPlotsCtrl_Scope.selectedPlot.analytic_data_soil.awc_soil_profile_awc = 0;

    }
    
    
    $scope.awcdata = [
       [ListPlotsCtrl_Scope.selectedPlot.analytic_data_soil.awc_soil_profile_awc],
    ];

    $scope.awc_bar_options = {
  	      animation: false
    };
    
    $scope.plotname = function(name){
		var str = name.length;
		//var email = document.getElementById("email").value;
		var email = window.localStorage.getItem('current_email');
		var emaillength = email.length + 1;
		var finalstr = name.substring(emaillength,str);
		
		return finalstr;
	};
	
	$scope.review_status_img_src = "img/check-mark-th.png";
	$scope.results_status_img_src = "img/check-mark-th.png";

}) // End ReviewSelectedPlotCtrl

/****************************************/
/** Quick Climate Ctrl **/
/****************************************/
.controller('QuickClimateCtrl', function($scope,$state,$http,$ionicLoading) {
	
	$scope.goBack = function() {
		window.localStorage.setItem("PREVIOUS_PAGE","QUICK_CLIMATE_PAGE");
        $state.go('landinfo.plots');
    };
	
     geoLocation();
     function geoLocation()
	 {
    	$ionicLoading.show({
   		  template: 'Fetching climate data for current location...'
        }); 
		var onSuccess = function(position) {
	
           lat = position.coords.latitude;
           lon =  position.coords.longitude ;       
          
    	   $http.get('http://128.123.177.21:8080/query', {
				params : {
					action : "get",
					object : "climate",
					latitude : lat,
					longitude : lon,
					data_source : "world_clim",
					version : ""
				}
			}).success(function(data) {
		
		       $scope.plots = data;
		       var plots =  $scope.plots;
		       //console.log($scope.plots);
		       $scope.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sep','Oct','Nov','Dec'];
   			   $scope.series = ['Series A'];
    		   $scope.captions = ['Climate'];

			   $scope.data = [
			       [plots.climate.precipitation.january, plots.climate.precipitation.february, plots.climate.precipitation.march, plots.climate.precipitation.april, plots.climate.precipitation.may, plots.climate.precipitation.june, plots.climate.precipitation.july, plots.climate.precipitation.august,plots.climate.precipitation.september,plots.climate.precipitation.october,plots.climate.precipitation.november,plots.climate.precipitation.december],
			   ];

			   $scope.names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sep','Oct','Nov','Dec'];
			   $scope.number = ['Max Temp', 'Avg Temp','Min Temp'];
			   $scope.linedata = [
					    [plots.climate.max_temperature.january, plots.climate.max_temperature.february, plots.climate.max_temperature.march, plots.climate.max_temperature.april, plots.climate.max_temperature.may, plots.climate.max_temperature.june, plots.climate.max_temperature.july, plots.climate.max_temperature.august,plots.climate.max_temperature.september,plots.climate.max_temperature.october,plots.climate.max_temperature.november,plots.climate.max_temperature.december]
					   ,[plots.climate.average_temperature.january, plots.climate.average_temperature.february, plots.climate.average_temperature.march, plots.climate.average_temperature.april, plots.climate.average_temperature.may, plots.climate.average_temperature.june, plots.climate.average_temperature.july, plots.climate.average_temperature.august,plots.climate.average_temperature.september,plots.climate.average_temperature.october,plots.climate.average_temperature.november,plots.climate.average_temperature.december]
					   ,[plots.climate.min_temperature.january, plots.climate.min_temperature.february, plots.climate.min_temperature.march, plots.climate.min_temperature.april, plots.climate.min_temperature.may,plots.climate.min_temperature.june, plots.climate.min_temperature.july, plots.climate.min_temperature.august,plots.climate.min_temperature.september,plots.climate.min_temperature.october,plots.climate.min_temperature.november,plots.climate.min_temperature.december]

			   ];
			   
			   $scope.temp_line_options = {
			    	      animation: false
			   };
			   
			   $scope.precip_bar_options = {
			    	      animation: false
			   };
			 
			   $ionicLoading.hide();
			   $scope.onClick = function (points, evt) {
			    console.log(points, evt);
			   };
            }).error(function(err) {
            	$ionicLoading.hide();
            	alert("Unable to get climate data at this time");
            	$state.go('landinfo.home');
			});
			
     };
     function onError(error) {
        $ionicLoading.hide(); 
        //alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
        alert("Unable to get climate data at this time");
        $state.go('landinfo.home');
     }
     navigator.geolocation.getCurrentPosition(onSuccess, onError);
	}
})

/****************************************/
/** DummyCtrl **/
/****************************************/

.controller('DummyCtrl',function($scope){
	$scope.title = 'Landinfo';
})
/****************************************/
/** AddPlot_Edit_Ctrl **/
/****************************************/
.controller('AddPlot_Edit_Ctrl',function($scope,$state,$ionicHistory){
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	$scope.plot_name = newPlot.real_name;
	
	
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	if (newPlot.isPlotIDCompleted == true){
		$scope.plot_id_img_src = "img/check-mark-th.png";
	} else {
		$scope.plot_id_img_src = "img/check-mark-white-th.png";	
	}
	
	if (newPlot.isLandCoverCompleted == true){
		$scope.plot_landcover_img_src = "img/check-mark-th.png";
	} else {
		$scope.plot_landcover_img_src = "img/check-mark-white-th.png";	
	}
	
	if (newPlot.isLandUseCompleted == true){
		$scope.plot_landuse_img_src = "img/check-mark-th.png";
	} else {
		$scope.plot_landuse_img_src = "img/check-mark-white-th.png";	
	}
	
	if (newPlot.isSlopeCompleted == true){
		$scope.plot_slope_img_src = "img/check-mark-th.png";
	} else {
		$scope.plot_slope_img_src = "img/check-mark-white-th.png";	
	}
	
	if (newPlot.isSlopeShapeCompleted == true){
		$scope.plot_slopeshape_img_src = "img/check-mark-th.png";
	} else {
		$scope.plot_slopeshape_img_src = "img/check-mark-white-th.png";	
	}
	
	if (newPlot.isSoilConditionCompleted == true){
		$scope.plot_soilcondition_img_src = "img/check-mark-th.png";
	} else {
		$scope.plot_soilcondition_img_src = "img/check-mark-white-th.png";	
	}
	
	if (newPlot.isSoilLayersCompleted == true){
		$scope.plot_soillayers_img_src = "img/check-mark-th.png";
	} else {
		$scope.plot_soillayers_img_src = "img/check-mark-white-th.png";	
	}
	
	if (newPlot.isPhotosCompleted == true){
		$scope.plot_photos_img_src = "img/check-mark-th.png";
	} else {
		$scope.plot_photos_img_src = "img/check-mark-white-th.png";	
	}
	
	if (newPlot.isReviewCompleted == true){
		$scope.plot_review_img_src = "img/check-mark-th.png";
	} else {
		$scope.plot_review_img_src = "img/check-mark-white-th.png";	
	}
	
	$scope.gotoAddPlot_Edit_PlotID = function(){
		window.localStorage.setItem("PREVIOUS_PAGE","ADD_PLOT_EDIT");
		$state.go('landinfo.plotid');
	},
	
	$scope.myGoBack = function() {
		 window.localStorage.setItem("PREVIOUS_PAGE","ADD_PLOT_GO_BACK");
         $state.go('landinfo.plots');
    };
    
    $scope.deleteSelectedEditingPlot = function(){
    	 var deletedConfirm = confirm("Do you want to delete plot " + $scope.plot_name);
    	 if (deletedConfirm == true){
    		 var resultDeleted = deleteLandInfoPlotInArrayt(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS);
    		 if (resultDeleted == true){
    		    window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
    		    window.localStorage.setItem("PREVIOUS_PAGE","ADD_PLOT_DELETE_EDITION_PLOT_SUCCESS");
    		    $state.go('landinfo.plots');
    		 } else {
    			alert("Error in delete editing plot");
    		 }		
    	 } else {
    		 console.log("Cancel");
    	 }
    };
	
    $ionicHistory.nextViewOptions({
    	  disableAnimate: true,
    	  disableBack: true
    });
	
		
})
/****************************************/
/** AddPlot_AddNew_Ctrl **/
/****************************************/
.controller('AddPlot_AddNew_Ctrl',function($scope,$ionicHistory,$state){
	window.localStorage.setItem("PREVIOUS_PAGE","ADD_PLOT_ADD_NEW");

	$scope.goBack = function() {
		$state.go('landinfo.plots');
	};

})

/***************************************/
/*** Accelerometer_Ctrl **/
/***************************************/
.controller('Accelerometer_Ctrl',function($scope,$state,$ionicHistory)
{	
	$scope.sight_line = "media/accelerometer_images/transparent.sight_line.9.png"; 
	$scope.btn_click_src = "media/accelerometer_images/big_red_button.png"; 
    var lock = false;
	var slope_percentage = 0;
	runAccelerometer();
    function runAccelerometer(){
		if (window.DeviceOrientationEvent) {
			console.log("DeviceOrientation is supported");
			  // Listen for the deviceorientation event and handle the raw data
			  window.addEventListener('deviceorientation', function(eventData) {
			    // gamma is the left-to-right tilt in degrees, where right is positive
			    var tiltLR = eventData.gamma;
			    // beta is the front-to-back tilt in degrees, where front is positive
			    var tiltFB = eventData.beta;
			    // alpha is the compass direction the device is facing in degrees
			    var dir = eventData.alpha

			    
			    var norm_of_g = Math.sqrt(tiltLR*tiltLR + tiltFB*tiltFB + dir*dir);
			    var g_0 = tiltLR/norm_of_g;
			    var g_1 = tiltFB/norm_of_g;
			    var g_2 = dir / norm_of_g;
			    //var inclination = Math.round((Math.acos(g_2))*180 / Math.PI);
			    var rotation = Math.atan2(g_0, g_1)*180 / Math.PI;
			    var final_degree = rotation + 90;
			    var final_slope_percent = 0;
			    document.getElementById("slope_degree").value = final_degree;
			    
			    if (final_degree >= 0 && final_degree <= 90){
			    	final_slope_percent = Math.round((final_degree / 90)*100);
			    	document.getElementById("slope_percentage").value = final_slope_percent;
			    }
			     
			      
			  }, false);
		} else {
			  console.log("Not supported accelerometer")
		}
    };

	$scope.click_lock_button = function(){
       if ($scope.btn_click_src === "media/accelerometer_images/big_red_button.png"){
    	   lock = true;
    	   $scope.btn_click_src = "media/accelerometer_images/big_green_button.png";
       } else {
    	   lock = false;
    	   $scope.btn_click_src = "media/accelerometer_images/big_red_button.png"; 
       }
       
       if (lock == false){
    	   runAccelerometer();
       } else if (lock == true){  
    	   slope_percentage = document.getElementById("slope_percentage").value;  
    	   var r = confirm("Do you want to use this value ? Slope = " + slope_percentage + "%");
    	   if (r == true) {
    		   var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
    		   newPlot.slope = slope_percentage + "%";
    		   newPlot.isSlopeDoing = true;
    		   window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));     		   
    		   //$state.transitionTo('landinfo.slope', null, {'reload':true});
    		   $state.go('landinfo.slope');
    	   } else {
    	       
    	   }
       } 
      
	};
	
})
/***************************************/
/*** AddPlot_Slope_Ctrl **/
/***************************************/
.controller('AddPlot_Slope_Ctrl',function($scope,$state)
{
	function updatePlotExist(name,recorder_name,JSONArray,newPlot){
		for (var index = 0; index < JSONArray.length; index++) {
		    var plot = JSONArray[index];
		    if(plot.recorder_name === recorder_name && plot.real_name === name){
		        JSONArray[index] = newPlot;
		    }
		}
	}
	
	function presentStatus(item1){
		item1 = item1.toUpperCase().trim();
	    switch(item1) {
			case "FLAT (0-2%)": 
				$scope.slope_flat = "media/slope_images/ic_slope_flat_selected.png"; 
				$scope.slope_gentle = "media/slope_images/ic_slope_gentle.png";
				$scope.slope_moderate = "media/slope_images/ic_slope_moderate.png"; 
				$scope.slope_rolling = "media/slope_images/ic_slope_rolling.png";
				$scope.slope_hilly = "media/slope_images/ic_slope_hilly.png";
				$scope.slope_steep= "media/slope_images/ic_slope_steep.png";
				$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep.png";
				document.getElementById("txtSlopeMeter").innerHTML  = "";
				break;
			case "GENTLE (3-5%)": 
				$scope.slope_flat = "media/slope_images/ic_slope_flat.png"; 
				$scope.slope_gentle = "media/slope_images/ic_slope_gentle_selected.png";
				$scope.slope_moderate = "media/slope_images/ic_slope_moderate.png"; 
				$scope.slope_rolling = "media/slope_images/ic_slope_rolling.png";
				$scope.slope_hilly = "media/slope_images/ic_slope_hilly.png";
				$scope.slope_steep= "media/slope_images/ic_slope_steep.png";
				$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep.png";
				document.getElementById("txtSlopeMeter").innerHTML  = "";
				break;
			case "MODERATE (6-10%)": 
				$scope.slope_flat = "media/slope_images/ic_slope_flat.png"; 
				$scope.slope_gentle = "media/slope_images/ic_slope_gentle.png";
				$scope.slope_moderate = "media/slope_images/ic_slope_moderate_selected.png"; 
				$scope.slope_rolling = "media/slope_images/ic_slope_rolling.png";
				$scope.slope_hilly = "media/slope_images/ic_slope_hilly.png";
				$scope.slope_steep= "media/slope_images/ic_slope_steep.png";
				$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep.png";
				document.getElementById("txtSlopeMeter").innerHTML  = "";
				break;
			case "ROLLING (11-15%)": 
				$scope.slope_flat = "media/slope_images/ic_slope_flat.png"; 
				$scope.slope_gentle = "media/slope_images/ic_slope_gentle.png";
				$scope.slope_moderate = "media/slope_images/ic_slope_moderate.png"; 
				$scope.slope_rolling = "media/slope_images/ic_slope_rolling_selected.png";
				$scope.slope_hilly = "media/slope_images/ic_slope_hilly.png";
				$scope.slope_steep= "media/slope_images/ic_slope_steep.png";
				$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep.png";
				document.getElementById("txtSlopeMeter").innerHTML  = "";
				break;
			case "HILLY (16-30%)": 
				$scope.slope_flat = "media/slope_images/ic_slope_flat.png"; 
				$scope.slope_gentle = "media/slope_images/ic_slope_gentle.png";
				$scope.slope_moderate = "media/slope_images/ic_slope_moderate.png"; 
				$scope.slope_rolling = "media/slope_images/ic_slope_rolling.png";
				$scope.slope_hilly = "media/slope_images/ic_slope_hilly_selected.png";
				$scope.slope_steep= "media/slope_images/ic_slope_steep.png";
				$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep.png";
				document.getElementById("txtSlopeMeter").innerHTML  = "";
				break;
			
			case "STEEP (31-60%)": 
				$scope.slope_flat = "media/slope_images/ic_slope_flat.png"; 
				$scope.slope_gentle = "media/slope_images/ic_slope_gentle.png";
				$scope.slope_moderate = "media/slope_images/ic_slope_moderate.png"; 
				$scope.slope_rolling = "media/slope_images/ic_slope_rolling.png";
				$scope.slope_hilly = "media/slope_images/ic_slope_hilly.png";
				$scope.slope_steep= "media/slope_images/ic_slope_steep_selected.png";
				$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep.png";
				document.getElementById("txtSlopeMeter").innerHTML  = "";
				break;
			case "VERYSTEEP (60-100%)": 
				$scope.slope_flat = "media/slope_images/ic_slope_flat.png"; 
				$scope.slope_gentle = "media/slope_images/ic_slope_gentle.png";
				$scope.slope_moderate = "media/slope_images/ic_slope_moderate.png"; 
				$scope.slope_rolling = "media/slope_images/ic_slope_rolling.png";
				$scope.slope_hilly = "media/slope_images/ic_slope_hilly.png";
				$scope.slope_steep= "media/slope_images/ic_slope_steep.png";
				$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep_selected.png";
				document.getElementById("txtSlopeMeter").innerHTML  = "";
				break;
			default:
				$scope.slope_flat = "media/slope_images/ic_slope_flat.png"; 
				$scope.slope_gentle = "media/slope_images/ic_slope_gentle.png";
				$scope.slope_moderate = "media/slope_images/ic_slope_moderate.png"; 
				$scope.slope_rolling = "media/slope_images/ic_slope_rolling.png";
				$scope.slope_hilly = "media/slope_images/ic_slope_hilly.png";
				$scope.slope_steep= "media/slope_images/ic_slope_steep.png";
				$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep.png";
				Slope_part1_data = item1;
				seeToast2(Slope_part1_data,2000);
				document.getElementById("txtSlopeMeter").innerHTML  = item1;
		}	

	};
	
	function isEmptry(value){
		if (value == null || value == "undefined" || value == "" || value == 'null' || value == 'NULL') {
	    	return true;
	    } 
		return false;
	};
	
	
	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	
	console.log(newPlot);
	var Slope_part1_data = "";

	
	$scope.plot_name = newPlot.real_name;
	
	$scope.slope_flat = "media/slope_images/ic_slope_flat.png"; 
	$scope.slope_gentle = "media/slope_images/ic_slope_gentle.png";
	
	$scope.slope_moderate = "media/slope_images/ic_slope_moderate.png"; 
	$scope.slope_rolling = "media/slope_images/ic_slope_rolling.png";
	$scope.slope_hilly = "media/slope_images/ic_slope_hilly.png";
	$scope.slope_steep= "media/slope_images/ic_slope_steep.png";
	$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep.png";
	
	/* Pre-processing LandCover data */
	if (newPlot.isSlopeDoing == null || newPlot.isSlopeDoing == 'null' || newPlot.isSlopeDoing == 'undefined' || newPlot.isSlopeDoing == '' ||  newPlot.isSlopeDoing == false){
		/* New One */
		
	} else if (newPlot.isSlopeDoing == true){
		/* Edit old one */
		Slope_current_plot_data = newPlot.slope;	
		presentStatus(Slope_current_plot_data);
		newPlot.isSlopeDoing = true;
	} 
	
	$scope.completeAddPlot_Slope = function(){
		if (Slope_part1_data == null || Slope_part1_data == 'null' || Slope_part1_data == 'undefined' || Slope_part1_data == ''){
			//newPlot.land_cover = "";
		} else {
			newPlot.slope = Slope_part1_data;		
			newPlot.isSlopeDoing = true;
		}
		
		if (!isEmptry(newPlot.slope)){
			newPlot.isSlopeCompleted = true;
		}
		updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
		window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
		window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
		$state.go('landinfo.newplot');
	};
	

	$scope.slope_Meter = function(){
		Slope_part1_data = "";
		$state.go('landinfo.accelerometer');
	};
	
	
	$scope.select_Slope_Filled = function(item){
		console.log(item);
		
		switch(item) {
			case "flat": 
				$scope.slope_flat = "media/slope_images/ic_slope_flat_selected.png"; 
				$scope.slope_gentle = "media/slope_images/ic_slope_gentle.png";
				$scope.slope_moderate = "media/slope_images/ic_slope_moderate.png"; 
				$scope.slope_rolling = "media/slope_images/ic_slope_rolling.png";
				$scope.slope_hilly = "media/slope_images/ic_slope_hilly.png";
				$scope.slope_steep= "media/slope_images/ic_slope_steep.png";
				$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep.png";
				Slope_part1_data = "flat (0-2%)";
				seeToast2(Slope_part1_data,2000);
				document.getElementById("txtSlopeMeter").innerHTML  = "";
				break;
			case "gentle": 
				$scope.slope_flat = "media/slope_images/ic_slope_flat.png"; 
				$scope.slope_gentle = "media/slope_images/ic_slope_gentle_selected.png";
				$scope.slope_moderate = "media/slope_images/ic_slope_moderate.png"; 
				$scope.slope_rolling = "media/slope_images/ic_slope_rolling.png";
				$scope.slope_hilly = "media/slope_images/ic_slope_hilly.png";
				$scope.slope_steep= "media/slope_images/ic_slope_steep.png";
				$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep.png";
				Slope_part1_data = "gentle (3-5%)";
				seeToast2(Slope_part1_data,2000);
				document.getElementById("txtSlopeMeter").innerHTML  = "";
				break;
			case "moderate": 
				$scope.slope_flat = "media/slope_images/ic_slope_flat.png"; 
				$scope.slope_gentle = "media/slope_images/ic_slope_gentle.png";
				$scope.slope_moderate = "media/slope_images/ic_slope_moderate_selected.png"; 
				$scope.slope_rolling = "media/slope_images/ic_slope_rolling.png";
				$scope.slope_hilly = "media/slope_images/ic_slope_hilly.png";
				$scope.slope_steep= "media/slope_images/ic_slope_steep.png";
				$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep.png";
				Slope_part1_data = "moderate (6-10%)";
				document.getElementById("txtSlopeMeter").innerHTML  = "";
				seeToast2(Slope_part1_data,2000);
				break;
			case "rolling": 
				$scope.slope_flat = "media/slope_images/ic_slope_flat.png"; 
				$scope.slope_gentle = "media/slope_images/ic_slope_gentle.png";
				$scope.slope_moderate = "media/slope_images/ic_slope_moderate.png"; 
				$scope.slope_rolling = "media/slope_images/ic_slope_rolling_selected.png";
				$scope.slope_hilly = "media/slope_images/ic_slope_hilly.png";
				$scope.slope_steep= "media/slope_images/ic_slope_steep.png";
				$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep.png";
				Slope_part1_data = "rolling (11-15%)";
				document.getElementById("txtSlopeMeter").innerHTML  = "";
				seeToast2(Slope_part1_data,2000);
				break;
			case "hilly": 
				$scope.slope_flat = "media/slope_images/ic_slope_flat.png"; 
				$scope.slope_gentle = "media/slope_images/ic_slope_gentle.png";
				$scope.slope_moderate = "media/slope_images/ic_slope_moderate.png"; 
				$scope.slope_rolling = "media/slope_images/ic_slope_rolling.png";
				$scope.slope_hilly = "media/slope_images/ic_slope_hilly_selected.png";
				$scope.slope_steep= "media/slope_images/ic_slope_steep.png";
				$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep.png";
				Slope_part1_data = "hilly (16-30%)";
				document.getElementById("txtSlopeMeter").innerHTML  = "";
				seeToast2(Slope_part1_data,2000);
				break;
			
			case "steep": 
				$scope.slope_flat = "media/slope_images/ic_slope_flat.png"; 
				$scope.slope_gentle = "media/slope_images/ic_slope_gentle.png";
				$scope.slope_moderate = "media/slope_images/ic_slope_moderate.png"; 
				$scope.slope_rolling = "media/slope_images/ic_slope_rolling.png";
				$scope.slope_hilly = "media/slope_images/ic_slope_hilly.png";
				$scope.slope_steep= "media/slope_images/ic_slope_steep_selected.png";
				$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep.png";
				Slope_part1_data = "steep (31-60%)";
				document.getElementById("txtSlopeMeter").innerHTML  = "";
				seeToast2(Slope_part1_data,2000);
				break;
			case "verysteep": 
				$scope.slope_flat = "media/slope_images/ic_slope_flat.png"; 
				$scope.slope_gentle = "media/slope_images/ic_slope_gentle.png";
				$scope.slope_moderate = "media/slope_images/ic_slope_moderate.png"; 
				$scope.slope_rolling = "media/slope_images/ic_slope_rolling.png";
				$scope.slope_hilly = "media/slope_images/ic_slope_hilly.png";
				$scope.slope_steep= "media/slope_images/ic_slope_steep.png";
				$scope.slope_verysteep= "media/slope_images/ic_slope_very_steep_selected.png";
				Slope_part1_data = "verysteep (60-100%)";
				document.getElementById("txtSlopeMeter").innerHTML  = "";
				seeToast2(Slope_part1_data,2000);
				break;
			
		}	
	};
})
/****************************************/
/** AddPlot_LandUse_Ctrl **/
/****************************************/
.controller('AddPlot_LandUse_Ctrl',function($scope,$state){
	function updatePlotExist(name,recorder_name,JSONArray,newPlot){
		for (var index = 0; index < JSONArray.length; index++) {
		    var plot = JSONArray[index];
		    if(plot.recorder_name === recorder_name && plot.real_name === name){
		        JSONArray[index] = newPlot;
		    }
		}
	};
	
	function addItem(array, item){
		var existed = false;
		for(var index = 0 ; index < array.length ; index++){
			if (array[index].toUpperCase().trim() == item.toUpperCase().trim()){
				existed = true;
			}
		}
		
		if (existed == false){
			array.push(item);
		}
		return array;
	};
	
	function removeItem(array, item){
		var index = array.indexOf(item);
		if (index > -1){
			array.splice(index,1);
		}
		return array;
	};
	
	function isEmpty(value){
		if (value == null || value == "undefined" || value == "" || value == 'null' || value == 'NULL') {
	    	return true;
	    } 
		return false;
	};
	
	function presentStatus(item1,item2){
		item1 = item1.toUpperCase().trim();
		if (item1=="TRUE"){
			$scope.landuse_current_grazed = "media/landuse_images/ic_grazed_selected.png";
			$scope.landuse_current_not_grazed = "media/landuse_images/ic_not_grazed.png";
			
			for(var index = 0 ; index < item2.length ; index ++){
				if (item2[index] == "CATTLE"){
					$scope.landuse_current_cattle = "media/landuse_images/ic_cattle_grazing_selected.png";
				} else if (item2[index] == "GOAT") {
					$scope.landuse_current_goat = "media/landuse_images/ic_goat_grazing_selected.png";
				} else if (item2[index] == "SHEEP") {
					$scope.landuse_current_sheep = "media/landuse_images/ic_sheep_grazing_selected.png";
				} else if (item2[index] == "WILDLIFE") {
					$scope.landuse_current_wildlife = "media/landuse_images/ic_wildlife_grazing_selected.png";
				}
			}
			
		} else {
			$scope.landuse_current_grazed = "media/landuse_images/ic_grazed.png";
			$scope.landuse_current_not_grazed = "media/landuse_images/ic_not_grazed_selected.png";
			
			$scope.landuse_current_cattle = "media/landuse_images/ic_cattle_grazing_disabled.png"; 
			$scope.landuse_current_goat = "media/landuse_images/ic_goat_grazing_disabled.png";
			$scope.landuse_current_sheep = "media/landuse_images/ic_sheep_grazing_disabled.png";
			$scope.landuse_current_wildlife= "media/landuse_images/ic_wildlife_grazing_disabled.png";
		}
	}
	
	
	
	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	
	console.log(newPlot);
	var landuse_grazed = "false";
	var landuse_grazing = [];
	$scope.plot_name = newPlot.real_name;
	
	$scope.landuse_current_grazed = "media/landuse_images/ic_grazed.png"; 
	$scope.landuse_current_not_grazed = "media/landuse_images/ic_not_grazed.png"; 
	
	$scope.landuse_current_cattle = "media/landuse_images/ic_cattle_grazing.png"; 
	$scope.landuse_current_goat = "media/landuse_images/ic_goat_grazing.png";
	$scope.landuse_current_sheep = "media/landuse_images/ic_sheep_grazing.png";
	$scope.landuse_current_wildlife= "media/landuse_images/ic_wildlife_grazing.png";
	
	/* Pre-processing LandUse data */
	if (newPlot.isLandUseDoing == null || newPlot.isLandUseDoing == 'null' || newPlot.isLandUseDoing == 'undefined' || newPlot.isLandUseDoing == '' ||  newPlot.isLandUseDoing == false){
		/* New One */
		
	} else if (newPlot.isLandUseDoing == true){
		/* Edit old one */
		landuse_grazed = newPlot.grazed;
		landuse_grazing_string = newPlot.grazing;
		landuse_grazing = landuse_grazing_string.split(",");
		presentStatus(landuse_grazed,landuse_grazing);
		newPlot.isLandUseDoing = true;
	}
	
	$scope.select_LandUse_Grazed = function(item){
		switch(item){
			case "grazed":
				$scope.landuse_current_grazed = "media/landuse_images/ic_grazed_selected.png"; 
				$scope.landuse_current_not_grazed = "media/landuse_images/ic_not_grazed.png"; 
				
				$scope.landuse_current_cattle = "media/landuse_images/ic_cattle_grazing.png"; 
				$scope.landuse_current_goat = "media/landuse_images/ic_goat_grazing.png";
				$scope.landuse_current_sheep = "media/landuse_images/ic_sheep_grazing.png";
				$scope.landuse_current_wildlife= "media/landuse_images/ic_wildlife_grazing.png";
				
				landuse_grazed = "true";
				seeToast2("Grazed",2000);
				break;
			case "not_grazed":
				$scope.landuse_current_grazed = "media/landuse_images/ic_grazed.png"; 
				$scope.landuse_current_not_grazed = "media/landuse_images/ic_not_grazed_selected.png"; 
				
				$scope.landuse_current_cattle = "media/landuse_images/ic_cattle_grazing_disabled.png"; 
				$scope.landuse_current_goat = "media/landuse_images/ic_goat_grazing_disabled.png";
				$scope.landuse_current_sheep = "media/landuse_images/ic_sheep_grazing_disabled.png";
				$scope.landuse_current_wildlife= "media/landuse_images/ic_wildlife_grazing_disabled.png";
				landuse_grazed = "false";
				seeToast2("No Grazed",2000);
				landuse_grazing = [];
				break;
				
		}
	};
	
	
	$scope.select_LandUse_Grazing = function(item){
		if (landuse_grazed.toUpperCase().trim() == "TRUE") {
			if (item.toUpperCase().trim() == "CATTLE"){
				if ($scope.landuse_current_cattle == "media/landuse_images/ic_cattle_grazing.png"){
					$scope.landuse_current_cattle = "media/landuse_images/ic_cattle_grazing_selected.png";
					landuse_grazing = addItem(landuse_grazing,"CATTLE");
					seeToast2("CATTLE",2000);
				} else {
					$scope.landuse_current_cattle = "media/landuse_images/ic_cattle_grazing.png";
					landuse_grazing = removeItem(landuse_grazing,"CATTLE");
				}
				console.log(landuse_grazing);
			} else if (item.toUpperCase().trim() == "GOAT") {
				if ($scope.landuse_current_goat == "media/landuse_images/ic_goat_grazing.png"){
					$scope.landuse_current_goat = "media/landuse_images/ic_goat_grazing_selected.png";
					landuse_grazing = addItem(landuse_grazing,"GOAT");
					seeToast2("GOAT",2000);
				} else {
					$scope.landuse_current_goat = "media/landuse_images/ic_goat_grazing.png";
					landuse_grazing = removeItem(landuse_grazing,"GOAT");
				}
				console.log(landuse_grazing);
			} else if (item.toUpperCase().trim() == "SHEEP") {
				if ($scope.landuse_current_sheep == "media/landuse_images/ic_sheep_grazing.png"){
					$scope.landuse_current_sheep = "media/landuse_images/ic_sheep_grazing_selected.png";
					landuse_grazing = addItem(landuse_grazing,"SHEEP");
					seeToast2("SHEEP",2000);
				} else {
					$scope.landuse_current_sheep = "media/landuse_images/ic_sheep_grazing.png";
					landuse_grazing = removeItem(landuse_grazing,"SHEEP");
				}
				console.log(landuse_grazing);
			} else if (item.toUpperCase().trim() == "WILDLIFE") {
				if ($scope.landuse_current_wildlife== "media/landuse_images/ic_wildlife_grazing.png"){
					$scope.landuse_current_wildlife = "media/landuse_images/ic_wildlife_grazing_selected.png";
					landuse_grazing = addItem(landuse_grazing,"WILDLIFE");
					seeToast2("WILDLIFE",2000);
				} else {
					$scope.landuse_current_wildlife = "media/landuse_images/ic_wildlife_grazing.png";
					landuse_grazing = removeItem(landuse_grazing,"WILDLIFE");
				}
				console.log(landuse_grazing);
			} else {
				//Do not change
			}
		} else {
			// Do nothing
		}
		
	};
	
	
	$scope.completeAddPlot_LandUse = function(){
		if (landuse_grazed == null || landuse_grazed == 'null' || landuse_grazed == 'undefined' || landuse_grazed == ''){
			//newPlot.land_cover = "";
		} else {
			newPlot.grazed = landuse_grazed;		
			newPlot.isLandUseDoing = true;
		}
		
		if (landuse_grazed.toUpperCase().trim() == 'TRUE'){
			newPlot.grazing = landuse_grazing.toString();
		} else {
			newPlot.grazing = "NONE";
		}
		
		if (!isEmpty(newPlot.grazed)){
			if (newPlot.grazed.toUpperCase().trim() == "TRUE" && !isEmpty(newPlot.grazing)){
				newPlot.isLandUseCompleted = true;
			} else if (newPlot.grazed.toUpperCase().trim() == "FALSE"){
				newPlot.isLandUseCompleted = true;
			} else {
				newPlot.isLandUseCompleted = false;
			}
		}
		updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
		window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
		window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
		$state.go('landinfo.newplot');
	};
})

/****************************************/
/** AddPlot_Slopeshape_Ctrl **/
/****************************************/
.controller('AddPlot_Slopeshape_Ctrl',function($scope,$state){
	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	
	console.log(newPlot);
	var slopeshape_cross_data = "";
	var slopeshape_down_data = "";
	
	$scope.plot_name = newPlot.real_name;
	
    $scope.slopeshape_downslopeconcave = "media/slopeshape_images/ic_downslopeconcave.png"; 
	$scope.slopeshape_downslopeconvex = "media/slopeshape_images/ic_downslopeconvex.png"; 
	$scope.slopeshape_downslopeflat = "media/slopeshape_images/ic_downslopeflat.png"; 
	$scope.slopeshape_crossslopeconcave = "media/slopeshape_images/ic_crossslopeconcave.png"; 
	$scope.slopeshape_crossslopeconvex = "media/slopeshape_images/ic_crossslopeconvex.png"; 
	$scope.slopeshape_crossslopeflat = "media/slopeshape_images/ic_crossslopeflat.png";
	
	/* Pre-processing LandUse data */
	if (isEmpty(newPlot.isSlopeShapeDoing)  ||  newPlot.isSlopeShapeDoing == false){
		/* New One */
		
	} else if (newPlot.isSlopeShapeDoing == true){
		/* Edit old one */
		if (!isEmpty(newPlot.slope_shape)){
			list_slope_shape = getListComponents(newPlot.slope_shape.trim(),",");
			if (!isEmpty(list_slope_shape[0].toUpperCase().trim())){
				slopeshape_down_data = list_slope_shape[0].toUpperCase().trim();
			}
			if (!isEmpty(list_slope_shape[1].toUpperCase().trim())){
				slopeshape_cross_data = list_slope_shape[1].toUpperCase().trim();
			}
			//console.log(slopeshape_down_data + ";;;" +slopeshape_cross_data);
			presentStatus(slopeshape_down_data,slopeshape_cross_data);
			newPlot.isSlopeShapeDoing = true;
		} else {
			slopeshape_cross_data = "";
			slopeshape_down_data = "";
		}
		
	}
	
	$scope.completeAddPlot_SlopeShape = function(){
		var slope_shape_data = slopeshape_down_data + "," + slopeshape_cross_data;
		
		if (slope_shape_data == null || slope_shape_data == 'null' || slope_shape_data == 'undefined' || slope_shape_data == ''){
			//newPlot.land_cover = "";
		} else {
			newPlot.slope_shape = slope_shape_data;		
			newPlot.isSlopeShapeDoing = true;
		}
		
		if (isEmpty(slopeshape_down_data) || isEmpty(slopeshape_cross_data)){
			newPlot.isSlopeShapeCompleted = false;
		} else {
			newPlot.isSlopeShapeCompleted = true;
		}
		
		updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
		window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
		window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
		$state.go('landinfo.newplot');
	};
	
	$scope.select_down_slope = function(item){
		switch(item){
			case "CONVEX":
				$scope.slopeshape_downslopeconcave = "media/slopeshape_images/ic_downslopeconcave.png"; 
			    $scope.slopeshape_downslopeconvex = "media/slopeshape_images/ic_downslopeconvex_selected.png"; 
			    $scope.slopeshape_downslopeflat = "media/slopeshape_images/ic_downslopeflat.png";	
			    slopeshape_down_data = "CONVEX";
				seeToast2("Down slope shape : CONVEX",2000);
				break;
			case "CONCAVE": 
				$scope.slopeshape_downslopeconcave = "media/slopeshape_images/ic_downslopeconcave_selected.png"; 
			    $scope.slopeshape_downslopeconvex = "media/slopeshape_images/ic_downslopeconvex.png"; 
				$scope.slopeshape_downslopeflat = "media/slopeshape_images/ic_downslopeflat.png"; 
				slopeshape_down_data = "CONCAVE";
				seeToast2("Down slope shape : CONCAVE",2000);
				break;
			case "FLAT": 
				$scope.slopeshape_downslopeconcave = "media/slopeshape_images/ic_downslopeconcave.png"; 
				$scope.slopeshape_downslopeconvex = "media/slopeshape_images/ic_downslopeconvex.png"; 
				$scope.slopeshape_downslopeflat = "media/slopeshape_images/ic_downslopeflat_selected.png"; 
				slopeshape_down_data = "FLAT";
				seeToast2("Down slope shape : FLAT",2000);
				break;
		}
	};
	
	$scope.select_cross_slope = function(item){
		switch(item){
			case "CONVEX":
				$scope.slopeshape_crossslopeconcave = "media/slopeshape_images/ic_crossslopeconcave.png"; 
				$scope.slopeshape_crossslopeconvex = "media/slopeshape_images/ic_crossslopeconvex_selected.png"; 
				$scope.slopeshape_crossslopeflat = "media/slopeshape_images/ic_crossslopeflat.png";	
			    slopeshape_cross_data = "CONVEX";
				seeToast2("Cross slope shape : CONVEX",2000);
				break;
			case "CONCAVE": 
				$scope.slopeshape_crossslopeconcave = "media/slopeshape_images/ic_crossslopeconcave_selected.png"; 
				$scope.slopeshape_crossslopeconvex = "media/slopeshape_images/ic_crossslopeconvex.png"; 
				$scope.slopeshape_crossslopeflat = "media/slopeshape_images/ic_crossslopeflat.png"; 
				slopeshape_cross_data = "CONCAVE";
				seeToast2("Cross slope shape : CONCAVE",2000);
				break;
			case "FLAT": 
				$scope.slopeshape_crossslopeconcave = "media/slopeshape_images/ic_crossslopeconcave.png"; 
				$scope.slopeshape_crossslopeconvex = "media/slopeshape_images/ic_crossslopeconvex.png"; 
				$scope.slopeshape_crossslopeflat = "media/slopeshape_images/ic_crossslopeflat_selected.png"; 
				slopeshape_cross_data = "FLAT";
				seeToast2("Cross slope shape : FLAT",2000);
				break;
		}
	};
	
	
	function presentStatus(slopeshape_down_data,slopeshape_cross_data){
		console.log(slopeshape_down_data + ":" + slopeshape_cross_data);
	    switch(slopeshape_down_data) {
			case "CONVEX": 
				$scope.slopeshape_downslopeconcave = "media/slopeshape_images/ic_downslopeconcave.png"; 
			    $scope.slopeshape_downslopeconvex = "media/slopeshape_images/ic_downslopeconvex_selected.png"; 
			    $scope.slopeshape_downslopeflat = "media/slopeshape_images/ic_downslopeflat.png";  
				break;
			case "CONCAVE": 
				$scope.slopeshape_downslopeconcave = "media/slopeshape_images/ic_downslopeconcave_selected.png"; 
			    $scope.slopeshape_downslopeconvex = "media/slopeshape_images/ic_downslopeconvex.png"; 
				$scope.slopeshape_downslopeflat = "media/slopeshape_images/ic_downslopeflat.png"; 
				break;
			case "FLAT": 
				$scope.slopeshape_downslopeconcave = "media/slopeshape_images/ic_downslopeconcave.png"; 
				$scope.slopeshape_downslopeconvex = "media/slopeshape_images/ic_downslopeconvex.png"; 
				$scope.slopeshape_downslopeflat = "media/slopeshape_images/ic_downslopeflat_selected.png"; 
				break;
		}	
	    
	    switch(slopeshape_cross_data) {
			case "CONVEX": 
				$scope.slopeshape_crossslopeconcave = "media/slopeshape_images/ic_crossslopeconcave.png"; 
				$scope.slopeshape_crossslopeconvex = "media/slopeshape_images/ic_crossslopeconvex_selected.png"; 
				$scope.slopeshape_crossslopeflat = "media/slopeshape_images/ic_crossslopeflat.png";
				break;
			case "CONCAVE": 
				$scope.slopeshape_crossslopeconcave = "media/slopeshape_images/ic_crossslopeconcave_selected.png"; 
				$scope.slopeshape_crossslopeconvex = "media/slopeshape_images/ic_crossslopeconvex.png"; 
				$scope.slopeshape_crossslopeflat = "media/slopeshape_images/ic_crossslopeflat.png"; 
				break;
			case "FLAT": 
				$scope.slopeshape_crossslopeconcave = "media/slopeshape_images/ic_crossslopeconcave.png"; 
				$scope.slopeshape_crossslopeconvex = "media/slopeshape_images/ic_crossslopeconvex.png"; 
				$scope.slopeshape_crossslopeflat = "media/slopeshape_images/ic_crossslopeflat_selected.png";
				break;
		}
	    
	    

	};

	$scope.goBack = function() {
         $state.go('landinfo.newplot');
    };
})
/****************************************/
/** AddPlot_Soilcondition_Ctrl **/
/****************************************/
.controller('AddPlot_Soilcondition_Ctrl',function($scope,$state){

	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	
	console.log(newPlot);
	var surface_cracking = "false";
	var surface_salt = "false";
	$scope.plot_name = newPlot.real_name;
	
	$scope.soilcondition_soilcracks = "media/soilcondition_images/ic_soil_cracks.png"; 
	$scope.soilcondition_surfacesalt = "media/soilcondition_images/ic_surface_salt.png"; 
	$scope.soilcondition_nosoilcracks = "media/soilcondition_images/ic_no_soil_cracks.png"; 
	$scope.soilcondition_nosurfacesalt = "media/soilcondition_images/ic_no_surface_salt.png"; 

	
	/* Pre-processing LandUse data */
	if (isEmpty(newPlot.isSoilConditionsDoing)  ||  newPlot.isSoilConditionsDoing == false){
		/* New One */
		
	} else if (newPlot.isSoilConditionsDoing == true){
		/* Edit old one */
		if (!isEmpty(newPlot.surface_cracking)){
			surface_cracking = newPlot.surface_cracking;
		} 
		if (!isEmpty(newPlot.surface_salt)){
			surface_salt = newPlot.surface_salt;
		}
		presentStatus(surface_cracking,surface_salt);
		newPlot.isSoilConditionsDoing = true;
	}
	
	function presentStatus(crack,salt){
		crack = crack.toUpperCase().trim();
		salt = salt.toUpperCase().trim();
	    switch(crack) {
			case "TRUE": 
				$scope.soilcondition_soilcracks = "media/soilcondition_images/ic_soil_cracks_selected.png";
				$scope.soilcondition_nosoilcracks = "media/soilcondition_images/ic_no_soil_cracks.png"; 
				break;
			case "FALSE": 
				$scope.soilcondition_soilcracks = "media/soilcondition_images/ic_soil_cracks.png";
				$scope.soilcondition_nosoilcracks = "media/soilcondition_images/ic_no_soil_cracks_selected.png"; 
				break;
		}	
	    
	    switch(salt) {
		    case "TRUE": 
		    	$scope.soilcondition_surfacesalt = "media/soilcondition_images/ic_surface_salt_selected.png"; 
		    	$scope.soilcondition_nosurfacesalt = "media/soilcondition_images/ic_no_surface_salt.png"; 
				break;
			case "FALSE": 
				$scope.soilcondition_surfacesalt = "media/soilcondition_images/ic_surface_salt.png"; 
		    	$scope.soilcondition_nosurfacesalt = "media/soilcondition_images/ic_no_surface_salt_selected.png"; 
				break;
		}
	    
	    

	};
	
	$scope.completeAddPlot_SoilConditions = function(){
		newPlot.surface_cracking = surface_cracking;
		newPlot.surface_salt = surface_salt;
		newPlot.isSoilConditionsDoing = true;
		newPlot.isSoilConditionCompleted = true;
		if (isEmpty(surface_cracking) || isEmpty(surface_salt)){
			newPlot.isSoilConditionsDoing = false;
		} else {
			newPlot.isSoilConditionsDoing = true;
		}
		updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
		window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
		window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
		$state.go('landinfo.newplot');
	};
	
	
	$scope.select_crack_or_not_crack = function(item){
		switch(item){
			case "CRACKED":
				$scope.soilcondition_soilcracks = "media/soilcondition_images/ic_soil_cracks_selected.png";
				$scope.soilcondition_nosoilcracks = "media/soilcondition_images/ic_no_soil_cracks.png"; 
				surface_cracking = "TRUE";
				seeToast2("Cracking",2000);
				break;
			case "NOT_CRACKED": 
				$scope.soilcondition_soilcracks = "media/soilcondition_images/ic_soil_cracks.png";
				$scope.soilcondition_nosoilcracks = "media/soilcondition_images/ic_no_soil_cracks_selected.png"; 
				surface_cracking = "FALSE";
				seeToast2("No Cracking",2000);
				break;
		}
	};
	
	$scope.select_salt_or_not_salt = function(item){
		switch(item){
			case "SALTED":
				$scope.soilcondition_surfacesalt = "media/soilcondition_images/ic_surface_salt_selected.png"; 
		    	$scope.soilcondition_nosurfacesalt = "media/soilcondition_images/ic_no_surface_salt.png"; 
		    	surface_salt = "TRUE";
				seeToast2("Salt",2000);
				break;
			case "NOT_SALTED": 
				$scope.soilcondition_surfacesalt = "media/soilcondition_images/ic_surface_salt.png"; 
		    	$scope.soilcondition_nosurfacesalt = "media/soilcondition_images/ic_no_surface_salt_selected.png"; 
		    	surface_salt = "FALSE";
				seeToast2("No Salt",2000);
				break;
		}
	};
	
	$scope.goBack = function() {
	
         $state.go('landinfo.newplot');
    };
	
	
	
})

/****************************************/
/** AddPlot_Soillayer_Layer_1_Ctrl **/
/****************************************/
.controller('AddPlot_Soillayer_Layer_1_Ctrl',function($scope,$state,$ionicPopup, $timeout,$ionicPlatform){
	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	
	$scope.plot_name = newPlot.real_name;
	

	if (isEmpty(newPlot.rock_fragment) || isEmpty(newPlot.rock_fragment.soil_horizon_1)){
		$scope.rock_fragement_value = "<choose range>";
	} else {
		if (!isEmpty(newPlot.rock_fragment.soil_horizon_1)) {
			$scope.rock_fragement_value = newPlot.rock_fragment.soil_horizon_1;
		}
	}
	
	if (isEmpty(newPlot.texture) || isEmpty(newPlot.texture.soil_horizon_1)){
		$scope.texture_value = "<choose range>";
	} else {
		if (!isEmpty(newPlot.texture.soil_horizon_1)) {
			$scope.texture_value = newPlot.texture.soil_horizon_1;
		}
	}

	$scope.goBack = function() {	
         $state.go('landinfo.newplot');
    };
    
    $scope.selectRockFragment = function(rock_fragement_value) {	
    	$scope.rock_fragement_value = rock_fragement_value;
    	newPlot.rock_fragment.soil_horizon_1 = $scope.rock_fragement_value;
    	
    	if (!isEmpty(newPlot.rock_fragment.soil_horizon_1) && !isEmpty(newPlot.texture.soil_horizon_1)){
         	newPlot.isSoilLayer_1_Completed = true;
    	    newPlot.isSoilLayersCompleted = true;
    	} else {
    		newPlot.isSoilLayer_1_Completed = false;
    		newPlot.isSoilLayersCompleted = false;
    	}
    	
    	updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
 	    window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
 	    window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
    	
    	myPopup.close();
    };
    
    var myPopup ;
    $scope.openPopupSelectRock_fragment = function() {
    	myPopup = $ionicPopup.show({
    	    templateUrl: 'templates/rock_fragment_dropdown.html',
    	    scope: $scope,
    	    
    	});
    };
    
    $scope.exitPopup = function() {
    	myPopup.close();
    };
    
    $scope.selectTexture = function(value){
    	$scope.texture_value = value;
    	newPlot.texture.soil_horizon_1 = $scope.texture_value;
    	
    	if (!isEmpty(newPlot.rock_fragment.soil_horizon_1) && !isEmpty(newPlot.texture.soil_horizon_1)){
         	newPlot.isSoilLayer_1_Completed = true;
    	    newPlot.isSoilLayersCompleted = true;
    	} else {
    		newPlot.isSoilLayer_1_Completed = false;
    		newPlot.isSoilLayersCompleted = false;
    	}
    	
    	updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
 	    window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
 	    window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
 	    
    };
    
    $scope.completeAddPlot_Soilayer_1 = function(){	
 	    $state.go('landinfo.soillayers');
    };
    
    $ionicPlatform.registerBackButtonAction(function (event) {
    	  if (true) {
    	    alert("OK CLick");
    	  } else {
    	    alert("Click Back Button");
    	  }
    }, 400);
})

/****************************************/
/** AddPlot_Soillayer_Layer_2_Ctrl **/
/****************************************/
.controller('AddPlot_Soillayer_Layer_2_Ctrl',function($scope,$state,$ionicPopup){
	
	
	
	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	
	$scope.plot_name = newPlot.real_name;
	//console.log(newPlot);
	
		if (isEmpty(newPlot.rock_fragment) || isEmpty(newPlot.rock_fragment.soil_horizon_2)){
			$scope.rock_fragement_value = "<choose range>";
		} else {
			if (!isEmpty(newPlot.rock_fragment.soil_horizon_2)) {
				$scope.rock_fragement_value = newPlot.rock_fragment.soil_horizon_2;
			}
		}
		
		if (isEmpty(newPlot.texture) || isEmpty(newPlot.texture.soil_horizon_2)){
			$scope.texture_value = "<choose range>";
		} else {
			if (!isEmpty(newPlot.texture.soil_horizon_2)) {
				$scope.texture_value = newPlot.texture.soil_horizon_2;
			}
		}
	
		$scope.goBack = function() {	
	         $state.go('landinfo.newplot');
	    };
	    
	    $scope.selectRockFragment = function(rock_fragement_value) {	
	    	$scope.rock_fragement_value = rock_fragement_value;
	    	newPlot.rock_fragment.soil_horizon_2 = $scope.rock_fragement_value;
	    	
	    	if (!isEmpty(newPlot.rock_fragment.soil_horizon_2) && !isEmpty(newPlot.texture.soil_horizon_2)){
	         	newPlot.isSoilLayer_2_Completed = true;
	    	} else {
	    		newPlot.isSoilLayer_2_Completed = false;
	    	}
	    	
		    updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
		 	window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
		 	window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
	    	
	    	myPopup.close();
	    };
	    
	    var myPopup ;
	    $scope.openPopupSelectRock_fragment = function() {
	    	myPopup = $ionicPopup.show({
	    	    templateUrl: 'templates/rock_fragment_dropdown.html',
	    	    scope: $scope,
	    	});
	    };
	    
	    $scope.exitPopup = function() {
	    	myPopup.close();
	    };
	    
	    $scope.selectTexture = function(value){
	    	$scope.texture_value = value;
	    	newPlot.texture.soil_horizon_2 = $scope.texture_value;
	    	
	    	if (!isEmpty(newPlot.rock_fragment.soil_horizon_2) && !isEmpty(newPlot.texture.soil_horizon_2)){
	         	newPlot.isSoilLayer_2_Completed = true;
	    	} else {
	    		newPlot.isSoilLayer_2_Completed = false;
	    	}
	    	
	    	updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
	 	    window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
	 	    window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
	 	    
	    };
	    
	    $scope.completeAddPlot_Soilayer_2 = function(){
	 	    $state.go('landinfo.soillayers');
	    };

	
})

/****************************************/
/** AddPlot_Soillayer_Layer_3_Ctrl **/
/****************************************/
.controller('AddPlot_Soillayer_Layer_3_Ctrl',function($scope,$state,$ionicPopup){
	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	
	$scope.plot_name = newPlot.real_name;
	//console.log(newPlot);

	
		if (isEmpty(newPlot.rock_fragment) || isEmpty(newPlot.rock_fragment.soil_horizon_3)){
			$scope.rock_fragement_value = "<choose range>";
		} else {
			if (!isEmpty(newPlot.rock_fragment.soil_horizon_3)) {
				$scope.rock_fragement_value = newPlot.rock_fragment.soil_horizon_3;
			}
		}
		
		if (isEmpty(newPlot.texture) || isEmpty(newPlot.texture.soil_horizon_3)){
			$scope.texture_value = "<choose range>";
		} else {
			if (!isEmpty(newPlot.texture.soil_horizon_3)) {
				$scope.texture_value = newPlot.texture.soil_horizon_3;
			}
		}
	
	    
	    $scope.selectRockFragment = function(rock_fragement_value) {	
	    	$scope.rock_fragement_value = rock_fragement_value;
	    	newPlot.rock_fragment.soil_horizon_3 = $scope.rock_fragement_value;
	    	
	    	if (!isEmpty(newPlot.rock_fragment.soil_horizon_3) && !isEmpty(newPlot.texture.soil_horizon_3)){
	         	newPlot.isSoilLayer_3_Completed = true;
	    	} else {
	    		newPlot.isSoilLayer_3_Completed = false;
	    	}
	    	
	    	updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
	 	    window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
	 	    window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
	    	
	    	myPopup.close();
	    };
	    
	    var myPopup ;
	    $scope.openPopupSelectRock_fragment = function() {
	    	myPopup = $ionicPopup.show({
	    	    templateUrl: 'templates/rock_fragment_dropdown.html',
	    	    scope: $scope,
	    	});
	    };
	    
	    $scope.exitPopup = function() {
	    	myPopup.close();
	    };
	    
	    $scope.selectTexture = function(value){
	    	$scope.texture_value = value;
	    	newPlot.texture.soil_horizon_3 = $scope.texture_value;
	    	
	    	if (!isEmpty(newPlot.rock_fragment.soil_horizon_3) && !isEmpty(newPlot.texture.soil_horizon_3)){
	         	newPlot.isSoilLayer_3_Completed = true;
	    	} else {
	    		newPlot.isSoilLayer_3_Completed = false;
	    	}
	    	
	    	updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
	 	    window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
	 	    window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
	 	    
	    };
	    
	    $scope.completeAddPlot_Soilayer_3 = function(){
	 	    $state.go('landinfo.soillayers');
	    };
	
})

/****************************************/
/** AddPlot_Soillayer_Layer_4_Ctrl **/
/****************************************/
.controller('AddPlot_Soillayer_Layer_4_Ctrl',function($scope,$state,$ionicPopup){
	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	
	$scope.plot_name = newPlot.real_name;
	//console.log(newPlot);

		if (isEmpty(newPlot.rock_fragment) || isEmpty(newPlot.rock_fragment.soil_horizon_4)){
			$scope.rock_fragement_value = "<choose range>";
		} else {
			if (!isEmpty(newPlot.rock_fragment.soil_horizon_4)) {
				$scope.rock_fragement_value = newPlot.rock_fragment.soil_horizon_4;
			}
		}
		
		if (isEmpty(newPlot.texture) || isEmpty(newPlot.texture.soil_horizon_4)){
			$scope.texture_value = "<choose range>";
		} else {
			if (!isEmpty(newPlot.texture.soil_horizon_4)) {
				$scope.texture_value = newPlot.texture.soil_horizon_4;
			}
		}
	
	    
	    $scope.selectRockFragment = function(rock_fragement_value) {	
	    	$scope.rock_fragement_value = rock_fragement_value;
	    	newPlot.rock_fragment.soil_horizon_4 = $scope.rock_fragement_value;
	    	
	    	if (!isEmpty(newPlot.rock_fragment.soil_horizon_4) && !isEmpty(newPlot.texture.soil_horizon_4)){
	         	newPlot.isSoilLayer_4_Completed = true;
	    	} else {
	    		newPlot.isSoilLayer_4_Completed = false;
	    	}
	    	
	    	updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
	 	    window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
	 	    window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
	    	
	    	myPopup.close();
	    };
	    
	    var myPopup ;
	    $scope.openPopupSelectRock_fragment = function() {
	    	myPopup = $ionicPopup.show({
	    	    templateUrl: 'templates/rock_fragment_dropdown.html',
	    	    scope: $scope,
	    	});
	    };
	    
	    $scope.exitPopup = function() {
	    	myPopup.close();
	    };
	    
	    $scope.selectTexture = function(value){
	    	$scope.texture_value = value;
	    	newPlot.texture.soil_horizon_4 = $scope.texture_value;
	    	
	    	if (!isEmpty(newPlot.rock_fragment.soil_horizon_4) && !isEmpty(newPlot.texture.soil_horizon_4)){
	         	newPlot.isSoilLayer_4_Completed = true;
	    	} else {
	    		newPlot.isSoilLayer_4_Completed = false;
	    	}
	    	
	    	updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
	 	    window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
	 	    window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
	 	    
	    };
	    
	    $scope.completeAddPlot_Soilayer_4 = function(){
	 	    $state.go('landinfo.soillayers');
	    };
	
})

/****************************************/
/** AddPlot_Soillayer_Layer_5_Ctrl **/
/****************************************/
.controller('AddPlot_Soillayer_Layer_5_Ctrl',function($scope,$state,$ionicPopup){
	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	
	$scope.plot_name = newPlot.real_name;
	//console.log(newPlot);


		if (isEmpty(newPlot.rock_fragment) || isEmpty(newPlot.rock_fragment.soil_horizon_5)){
			$scope.rock_fragement_value = "<choose range>";
		} else {
			if (!isEmpty(newPlot.rock_fragment.soil_horizon_5)) {
				$scope.rock_fragement_value = newPlot.rock_fragment.soil_horizon_5;
			}
		}
		
		if (isEmpty(newPlot.texture) || isEmpty(newPlot.texture.soil_horizon_5)){
			$scope.texture_value = "<choose range>";
		} else {
			if (!isEmpty(newPlot.texture.soil_horizon_5)) {
				$scope.texture_value = newPlot.texture.soil_horizon_5;
			}
		}
	
	    
	    $scope.selectRockFragment = function(rock_fragement_value) {	
	    	$scope.rock_fragement_value = rock_fragement_value;
	    	newPlot.rock_fragment.soil_horizon_5 = $scope.rock_fragement_value;
	    	
	    	if (!isEmpty(newPlot.rock_fragment.soil_horizon_5) && !isEmpty(newPlot.texture.soil_horizon_5)){
	         	newPlot.isSoilLayer_5_Completed = true;
	    	} else {
	    		newPlot.isSoilLayer_5_Completed = false;
	    	}
	    	
	    	updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
	 	    window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
	 	    window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
	    	
	    	myPopup.close();
	    };
	    
	    var myPopup ;
	    $scope.openPopupSelectRock_fragment = function() {
	    	myPopup = $ionicPopup.show({
	    	    templateUrl: 'templates/rock_fragment_dropdown.html',
	    	    scope: $scope,
	    	});
	    };
	    
	    $scope.exitPopup = function() {
	    	myPopup.close();
	    };
	    
	    $scope.selectTexture = function(value){
	    	$scope.texture_value = value;
	    	newPlot.texture.soil_horizon_5 = $scope.texture_value;
	    	
	    	if (!isEmpty(newPlot.rock_fragment.soil_horizon_5) && !isEmpty(newPlot.texture.soil_horizon_5)){
	         	newPlot.isSoilLayer_5_Completed = true;
	    	} else {
	    		newPlot.isSoilLayer_5_Completed = false;
	    	}
	    	
	    	updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
	 	    window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
	 	    window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
	 	    
	    };
	    
	    $scope.completeAddPlot_Soilayer_5 = function(){
	 	    $state.go('landinfo.soillayers');
	    };
	
	
})

/****************************************/
/** AddPlot_Soillayer_Layer_6_Ctrl **/
/****************************************/
.controller('AddPlot_Soillayer_Layer_6_Ctrl',function($scope,$state,$ionicPopup){
	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	
	$scope.plot_name = newPlot.real_name;
	//console.log(newPlot);

		if (isEmpty(newPlot.rock_fragment) || isEmpty(newPlot.rock_fragment.soil_horizon_6)){
			$scope.rock_fragement_value = "<choose range>";
		} else {
			if (!isEmpty(newPlot.rock_fragment.soil_horizon_6)) {
				$scope.rock_fragement_value = newPlot.rock_fragment.soil_horizon_6;
			}
		}
		
		if (isEmpty(newPlot.texture) || isEmpty(newPlot.texture.soil_horizon_6)){
			$scope.texture_value = "<choose range>";
		} else {
			if (!isEmpty(newPlot.texture.soil_horizon_6)) {
				$scope.texture_value = newPlot.texture.soil_horizon_6;
			}
		}
	
	    
	    $scope.selectRockFragment = function(rock_fragement_value) {	
	    	$scope.rock_fragement_value = rock_fragement_value;
	    	newPlot.rock_fragment.soil_horizon_6 = $scope.rock_fragement_value;
	    	
	    	if (!isEmpty(newPlot.rock_fragment.soil_horizon_6) && !isEmpty(newPlot.texture.soil_horizon_6)){
	         	newPlot.isSoilLayer_6_Completed = true;
	    	} else {
	    		newPlot.isSoilLayer_6_Completed = false;
	    	}
	    	
	    	updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
	 	    window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
	 	    window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
	    	
	    	myPopup.close();
	    };
	    
	    var myPopup ;
	    $scope.openPopupSelectRock_fragment = function() {
	    	myPopup = $ionicPopup.show({
	    	    templateUrl: 'templates/rock_fragment_dropdown.html',
	    	    scope: $scope,
	    	});
	    };
	    
	    $scope.exitPopup = function() {
	    	myPopup.close();
	    };
	    
	    $scope.selectTexture = function(value){
	    	$scope.texture_value = value;
	    	newPlot.texture.soil_horizon_6 = $scope.texture_value;
	    	
	    	if (!isEmpty(newPlot.rock_fragment.soil_horizon_6) && !isEmpty(newPlot.texture.soil_horizon_6)){
	         	newPlot.isSoilLayer_6_Completed = true;
	    	} else {
	    		newPlot.isSoilLayer_6_Completed = false;
	    	}
	    	
	    	updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
	 	    window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
	 	    window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
	 	    
	    };
	    
	    $scope.completeAddPlot_Soilayer_6 = function(){
	 	    $state.go('landinfo.soillayers');
	    };
	
})

/****************************************/
/** AddPlot_Soillayer_Layer_7_Ctrl **/
/****************************************/
.controller('AddPlot_Soillayer_Layer_7_Ctrl',function($scope,$state,$ionicPopup,$ionicModal){
	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	
	
	/* Test Modal */
	
	
	/* End test */
	
	$scope.plot_name = newPlot.real_name;
	//console.log(newPlot);
		if (isEmpty(newPlot.rock_fragment) || isEmpty(newPlot.rock_fragment.soil_horizon_7)){
			$scope.rock_fragement_value = "<choose range>";
		} else {
			if (!isEmpty(newPlot.rock_fragment.soil_horizon_7)) {
				$scope.rock_fragement_value = newPlot.rock_fragment.soil_horizon_7;
			}
		}
		
		if (isEmpty(newPlot.texture) || isEmpty(newPlot.texture.soil_horizon_7)){
			$scope.texture_value = "<choose range>";
		} else {
			if (!isEmpty(newPlot.texture.soil_horizon_7)) {
				$scope.texture_value = newPlot.texture.soil_horizon_7;
			}
		}
	
	    
	    $scope.selectRockFragment = function(rock_fragement_value) {	
	    	$scope.rock_fragement_value = rock_fragement_value;
	    	newPlot.rock_fragment.soil_horizon_7 = $scope.rock_fragement_value;
	    	
	    	if (!isEmpty(newPlot.rock_fragment.soil_horizon_7) && !isEmpty(newPlot.texture.soil_horizon_7)){
	         	newPlot.isSoilLayer_7_Completed = true;
	    	} else {
	    		newPlot.isSoilLayer_7_Completed = false;
	    	}
	    	
	    	updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
	 	    window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
	 	    window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
	    	
	    	myPopup.close();
	    };
	    
	    var myPopup ;
	    $scope.openPopupSelectRock_fragment = function() {
	    	myPopup = $ionicPopup.show({
	    	    templateUrl: 'templates/rock_fragment_dropdown.html',
	    	    scope: $scope,
	    	});
	    };
	    
	    $scope.exitPopup = function() {
	    	myPopup.close();
	    };
	    
	    $scope.selectTexture = function(value){
	    	$scope.texture_value = value;
	    	newPlot.texture.soil_horizon_7 = $scope.texture_value;
	    	
	    	if (!isEmpty(newPlot.rock_fragment.soil_horizon_7) && !isEmpty(newPlot.texture.soil_horizon_7)){
	         	newPlot.isSoilLayer_7_Completed = true;
	    	} else {
	    		newPlot.isSoilLayer_7_Completed = false;
	    	}
	    	
	    	updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
	 	    window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
	 	    window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
	 	    
	    };
	    
	    $scope.completeAddPlot_Soilayer_7 = function(){
	 	    $state.go('landinfo.soillayers');
	    };

})

/****************************************/
/** AddPlot_Soillayers_Ctrl **/
/****************************************/
.controller('AddPlot_Soillayers_Ctrl',function($scope,$state){
	
	function initImages(plot){
		if (plot.isSoilLayer_1_Completed == true) {
			$scope.add_plot_soil_layer_1 = "img/check-mark-th.png";
		} else {
			$scope.add_plot_soil_layer_1 = "img/check-mark-white-th.png";
		}
		if (plot.isSoilLayer_2_Completed == true) {
			$scope.add_plot_soil_layer_2 = "img/check-mark-th.png";
		} else {
			$scope.add_plot_soil_layer_2 = "img/check-mark-white-th.png";
		}
		if (plot.isSoilLayer_3_Completed == true) {
			$scope.add_plot_soil_layer_3 = "img/check-mark-th.png";
		} else {
			$scope.add_plot_soil_layer_3 = "img/check-mark-white-th.png";
		}
		if (plot.isSoilLayer_4_Completed == true) {
			$scope.add_plot_soil_layer_4 = "img/check-mark-th.png";
		} else {
			$scope.add_plot_soil_layer_4 = "img/check-mark-white-th.png";
		}
		if (plot.isSoilLayer_5_Completed == true) {
			$scope.add_plot_soil_layer_5 = "img/check-mark-th.png";
		} else {
			$scope.add_plot_soil_layer_5 = "img/check-mark-white-th.png";
		}
		if (plot.isSoilLayer_6_Completed == true) {
			$scope.add_plot_soil_layer_6 = "img/check-mark-th.png";
		} else {
			$scope.add_plot_soil_layer_6 = "img/check-mark-white-th.png";
		}
		if (plot.isSoilLayer_7_Completed == true) {
			$scope.add_plot_soil_layer_7 = "img/check-mark-th.png";
		} else {
			$scope.add_plot_soil_layer_7 = "img/check-mark-white-th.png";
		}
	}
	
	
	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	
	$scope.plot_name = newPlot.real_name;
	
	console.log(newPlot);
	
	/* Full fill the images */
	initImages(newPlot);

	if (isEmpty(newPlot.rock_fragment) || isEmpty(newPlot.texture)){
	       var rock_fragment = {"soil_horizon_1":"","soil_horizon_2":"","soil_horizon_3":"","soil_horizon_4":"","soil_horizon_5":"","soil_horizon_6":"","soil_horizon_7":""}
	       var texture = {"soil_horizon_1":"","soil_horizon_2":"","soil_horizon_3":"","soil_horizon_4":"","soil_horizon_5":"","soil_horizon_6":"","soil_horizon_7":""}
	       newPlot.rock_fragment = rock_fragment; 
	       newPlot.texture = texture;
	       updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
		   window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
		   window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
	}
	
	
	$scope.goBack = function() {
         $state.go('landinfo.newplot');
    };
})

/****************************************/
/** AddPlot_Photos_Ctrl **/
/****************************************/
.controller('AddPlot_Photos_Ctrl',function($scope,$state, $cordovaCamera){
	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	

	$scope.plot_name = newPlot.real_name;
	
	$scope.takePicture = function() {
        var options = { 
            quality : 75, 
            destinationType : Camera.DestinationType.DATA_URL, 
            sourceType : Camera.PictureSourceType.CAMERA, 
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {
            $scope.imgURI = "data:image/jpeg;base64," + imageData;
        }, function(err) {
            // An error occured. Show a message to the user
        });
    };

	$scope.goBack = function() {
	
         $state.go('landinfo.newplot');
    };

})


/****************************************/
/** AddPlot_Review_Ctrl **/
/****************************************/
.controller('AddPlot_Review_Ctrl',function($scope,$state,$ionicLoading,$http){
	/* Get Authentication data */
	var json_auth_data = JSON.parse(window.localStorage.getItem("current_json_auth_data"));
	if (isEmpty(json_auth_data.auth_key)){
		document.getElementById('btnSubmitPlot').setAttribute("disabled","disabled");
	}
	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	$scope.plot_name = newPlot.real_name;
	$scope.currentPlot = newPlot;
	$scope.submitPlot = function() {
		    //console.log("Submit ALready");
		    $ionicLoading.show({
	           template: 'Submitting Plot. Please wait...'
	        });
			
		    $http({
				    method: 'POST',
				    url: "http://128.123.177.21:8080/query",
				    headers: {'Content-type': 'application/x-www-form-urlencoded'},
				    transformRequest: function(obj) {
				        var str = [];
				        for(var p in obj)
				        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				        return str.join("&");
				    },
				    data: {
				    	 action:'put', object:'landinfo',version:'',source:'landinfo_mobile_app',
				    	 name: newPlot.name, recorder_name: newPlot.recorder_name, test_plot:newPlot.test_plot,
				    	 organization: newPlot.organization, latitude: newPlot.latitude, longitude:newPlot.longitude,
				    	 city: '', modified_date: '', land_cover:newPlot.land_cover, grazed:newPlot.grazed,
				    	 grazing:newPlot.grazing, flooding:newPlot.flooding, slope:newPlot.slope, slope_shape: newPlot.slope_shape,
				    	 bedrock_depth:'',stopped_digging_depth:'',rock_fragment_for_soil_horizon_1:newPlot.rock_fragment.soil_horizon_1,
				    	 rock_fragment_for_soil_horizon_2:newPlot.rock_fragment.soil_horizon_2,
				    	 rock_fragment_for_soil_horizon_3:newPlot.rock_fragment.soil_horizon_3,
				    	 rock_fragment_for_soil_horizon_4:newPlot.rock_fragment.soil_horizon_4,
				    	 rock_fragment_for_soil_horizon_5:newPlot.rock_fragment.soil_horizon_5,
				    	 rock_fragment_for_soil_horizon_6:newPlot.rock_fragment.soil_horizon_6,
				    	 rock_fragment_for_soil_horizon_7:newPlot.rock_fragment.soil_horizon_7,
				    	 texture_for_soil_horizon_1:newPlot.texture.soil_horizon_1,
				    	 texture_for_soil_horizon_2:newPlot.texture.soil_horizon_2,
				    	 texture_for_soil_horizon_3:newPlot.texture.soil_horizon_3,
				    	 texture_for_soil_horizon_4:newPlot.texture.soil_horizon_4,
				    	 texture_for_soil_horizon_5:newPlot.texture.soil_horizon_5,
				    	 texture_for_soil_horizon_6:newPlot.texture.soil_horizon_6,
				    	 texture_for_soil_horizon_7:newPlot.texture.soil_horizon_7,
				    	 surface_salt:newPlot.surface_salt, surface_cracking:newPlot.surface_cracking,
				    	 soil_pit_photo_url:'',soil_samples_photo_url:'',landscape_north_photo_url:'',
				    	 landscape_east_photo_url:'',landscape_south_photo_url:'',landscape_west_photo_url:'',notes:newPlot.notes
				    }
				    
			}).success(
					function(data, status, headers, config) {
						alert("Plot is submitted already");
						window.localStorage.setItem("PREVIOUS_PAGE","ADD_NEW_PLOT_SUCCESS");
						window.localStorage.setItem("delete_plot_name",newPlot.name);
						window.localStorage.setItem("delete_recorder_name",newPlot.recorder_name);
						$state.go('landinfo.plots');
					}).error(function(err) {
						$ionicLoading.hide();
				        alert(err.error,'Error in submit Plot');
			});
		
		   
		    
	};
	
	var slopeshape_down_data = "";
	var slopeshape_cross_data = "";
	
	if (!isEmpty(newPlot.slope_shape)){
		list_slope_shape = getListComponents(newPlot.slope_shape.trim(),",");
		if (!isEmpty(list_slope_shape[0].toUpperCase().trim())){
			slopeshape_down_data = list_slope_shape[0].toUpperCase().trim();
		}
		if (!isEmpty(list_slope_shape[1].toUpperCase().trim())){
			slopeshape_cross_data = list_slope_shape[1].toUpperCase().trim();
		}
	} else {
		slopeshape_down_data = "";
		slopeshape_cross_data = "";
	}
	
	$scope.currentPlot.slopeshape_down_data = slopeshape_down_data;
	$scope.currentPlot.slopeshape_cross_data = slopeshape_cross_data;

	$scope.goBack = function() {
        $state.go('landinfo.newplot');
    };
    
})
/****************************************/
/** AddPlot_LandCover_Ctrl **/
/****************************************/
.controller('AddPlot_LandCover_Ctrl',function($scope,$state){
	
	function seeToast2(message, duration) {
		toastr.clear();
		toastr.options = {
				  "closeButton": false,
				  "debug": false,
				  "newestOnTop": false,
				  "progressBar": false,
				  "positionClass": "toast-bottom-center",
				  "preventDuplicates": true,
				  "onclick": null,
				  "timeOut": "1500",
				  "extendedTimeOut": "0"
				
		};
		toastr.info(message);
	};
	
	
	
	function updatePlotExist(name,recorder_name,JSONArray,newPlot){
		for (var index = 0; index < JSONArray.length; index++) {
		    var plot = JSONArray[index];
		    if(plot.recorder_name === recorder_name && plot.real_name === name){
		        JSONArray[index] = newPlot;
		    }
		}
	}
	
	function presentStatus(item1,item2){
		item1 = item1.toUpperCase().trim();
		switch(item1) {
				case "TREE": 
					$scope.landcover_current_tree = "media/landcover_images/ic_tree_selected.png";
					$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
					$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
					$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
					$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
					$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
					$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
					$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
					$scope.landcover_current_water = "media/landcover_images/ic_water.png";
					
					break;
				case "SHRUBLAND": 
					$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
					$scope.landcover_current_shrub = "media/landcover_images/ic_shrub_selected.png"; 
					$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
					$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
					$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
					$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
					$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
					$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
					$scope.landcover_current_water = "media/landcover_images/ic_water.png";
					
					break;
				case "GRASSLAND": 
					$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
					$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
					$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land_selected.png"; 
					$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
					$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
					$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
					$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
					$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
					$scope.landcover_current_water = "media/landcover_images/ic_water.png";
					
					break;
				case "SAVANNA": 
					$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
					$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
					$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
					$scope.landcover_current_savana = "media/landcover_images/ic_savanna_selected.png"; 
					$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
					$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
					$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
					$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
					$scope.landcover_current_water = "media/landcover_images/ic_water.png";
					
					break;
				case "GARDEN/MIXED": 
					$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
					$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
					$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
					$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
					$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed_selected.png"; 
					$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
					$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
					$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
					$scope.landcover_current_water = "media/landcover_images/ic_water.png";
					
					break;
				case "CROPLAND": 
					$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
					$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
					$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
					$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
					$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
					$scope.landcover_current_cropland = "media/landcover_images/ic_cropland_selected.png";
					$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
					$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
					$scope.landcover_current_water = "media/landcover_images/ic_water.png";
					
					break;
				case "DEVELOPED": 
					$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
					$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
					$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
					$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
					$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
					$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
					$scope.landcover_current_developed = "media/landcover_images/ic_developed_selected.png"; 
					$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
					$scope.landcover_current_water = "media/landcover_images/ic_water.png";
					
					break;
				case "BARREN": 
					$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
					$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
					$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
					$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
					$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
					$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
					$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
					$scope.landcover_current_barren = "media/landcover_images/ic_barren_selected.png";
					$scope.landcover_current_water = "media/landcover_images/ic_water.png";
					
					break;
				case "WATER": 
					$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
					$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
					$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
					$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
					$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
					$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
					$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
					$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
					$scope.landcover_current_water = "media/landcover_images/ic_water_selected.png";
					
					break;
		}
		
		if (!isEmptry(item2)){
			if (item2 == "true" || item2 == "TRUE" || item2.toUpperCase().trim() == "TRUE"){
					$scope.landcover_current_flooded = "media/landcover_images/ic_flooded_selected.png"; 
					$scope.landcover_current_no_flooded = "media/landcover_images/ic_not_flooded.png"; 
			} else {
					$scope.landcover_current_flooded = "media/landcover_images/ic_flooded.png"; 
					$scope.landcover_current_no_flooded = "media/landcover_images/ic_not_flooded_selected.png"; 
			}	
		}
		
	};
	
	function isEmptry(value){
		if (value == null || value == "undefined" || value == "" || value == 'null' || value == 'NULL') {
	    	return true;
	    } 
		return false;
	};
	
	
	var recorder_name = window.localStorage.getItem('current_email');
	var email = recorder_name;
	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
	var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
	
	console.log(newPlot);
	var landcover_part1_data = "";
	var landcover_part2_data = "";
	var flooding_data = "";
	$scope.plot_name = newPlot.real_name;
	
	$scope.landcover_current_tree = "media/landcover_images/ic_tree.png"; 
	$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
	$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
	$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
	$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
	$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
	$scope.landcover_current_water = "media/landcover_images/ic_water.png";
	$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
	$scope.landcover_current_barren = "media/landcover_images/ic_barren.png"; 
	$scope.landcover_current_flooded = "media/landcover_images/ic_flooded.png"; 
	$scope.landcover_current_no_flooded = "media/landcover_images/ic_not_flooded.png"; 
	
	/* Pre-processing LandCover data */
	if (newPlot.isLandCoverDoing == null || newPlot.isLandCoverDoing == 'null' || newPlot.isLandCoverDoing == 'undefined' || newPlot.isLandCoverDoing == '' ||  newPlot.isLandCoverDoing == false){
		/* New One */
		
	} else if (newPlot.isLandCoverDoing == true){
		/* Edit old one */
		landcover_current_plot_data = newPlot.land_cover;
		flooding_current_plot_data = newPlot.flooding;
		presentStatus(landcover_current_plot_data,flooding_current_plot_data);
		newPlot.isLandCoverDoing = true;
	} 



	
	$scope.completeAddPlot_LandCover = function(){
		if (landcover_part1_data == null || landcover_part1_data == 'null' || landcover_part1_data == 'undefined' || landcover_part1_data == ''){
			//newPlot.land_cover = "";
		} else {
			newPlot.land_cover = landcover_part1_data;		
			newPlot.isLandCoverDoing = true;
		}
		
		
		if (!isEmptry(flooding_data)){
			newPlot.flooding = flooding_data;
			newPlot.isLandCoverDoing = true;
		}
		
		if (!isEmptry(newPlot.land_cover) && (!isEmptry(newPlot.flooding))){
			newPlot.isLandCoverCompleted = true;
		}

		updatePlotExist(newPlot.real_name,newPlot.recorder_name,LIST_PLOTS,newPlot);
		window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
		window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
		$state.go('landinfo.newplot');
	};
	
	$scope.selectFlood = function(item){
		switch(item){
			case "flooded":
				$scope.landcover_current_flooded = "media/landcover_images/ic_flooded_selected.png"; 
				$scope.landcover_current_no_flooded = "media/landcover_images/ic_not_flooded.png"; 
				flooding_data = "true";
				seeToast2("Flooding",2000);
				break;
			case "not_flooded":
				$scope.landcover_current_flooded = "media/landcover_images/ic_flooded.png"; 
				$scope.landcover_current_no_flooded = "media/landcover_images/ic_not_flooded_selected.png"; 
				flooding_data = "false";
				seeToast2("No Flooding",2000);
				break;
				
		}
	};
	
	$scope.selectPart1 = function(item){
		switch(item) {
			case "tree": 
				$scope.landcover_current_tree = "media/landcover_images/ic_tree_selected.png";
				$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
				$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
				$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
				$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
				$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
				$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
				$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
				$scope.landcover_current_water = "media/landcover_images/ic_water.png";
				landcover_part1_data = "tree";
				seeToast2("Tree Cover",2000);
				break;
			case "shrubland": 
				$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
				$scope.landcover_current_shrub = "media/landcover_images/ic_shrub_selected.png"; 
				$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
				$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
				$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
				$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
				$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
				$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
				$scope.landcover_current_water = "media/landcover_images/ic_water.png";
				landcover_part1_data = "shrubland";
				seeToast2("Shrubland",2000);
				break;
			case "grassland": 
				$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
				$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
				$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land_selected.png"; 
				$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
				$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
				$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
				$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
				$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
				$scope.landcover_current_water = "media/landcover_images/ic_water.png";
				landcover_part1_data = "grassland";
				seeToast2("Grassland",2000);
				break;
			case "savanna": 
				$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
				$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
				$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
				$scope.landcover_current_savana = "media/landcover_images/ic_savanna_selected.png"; 
				$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
				$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
				$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
				$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
				$scope.landcover_current_water = "media/landcover_images/ic_water.png";
				landcover_part1_data = "savanna";
				seeToast2("Savanna",2000);
				break;
			case "garden/mixed": 
				$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
				$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
				$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
				$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
				$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed_selected.png"; 
				$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
				$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
				$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
				$scope.landcover_current_water = "media/landcover_images/ic_water.png";
				landcover_part1_data = "garden/mixed";
				seeToast2("Garden/Mixed",2000);
				break;
			case "cropland": 
				$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
				$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
				$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
				$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
				$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
				$scope.landcover_current_cropland = "media/landcover_images/ic_cropland_selected.png";
				$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
				$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
				$scope.landcover_current_water = "media/landcover_images/ic_water.png";
				landcover_part1_data = "cropland";
				seeToast2("Cropland",2000);
				break;
			case "developed": 
				$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
				$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
				$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
				$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
				$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
				$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
				$scope.landcover_current_developed = "media/landcover_images/ic_developed_selected.png"; 
				$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
				$scope.landcover_current_water = "media/landcover_images/ic_water.png";
				landcover_part1_data = "developed";
				seeToast2("Developed",2000);
				break;
			case "barren": 
				$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
				$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
				$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
				$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
				$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
				$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
				$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
				$scope.landcover_current_barren = "media/landcover_images/ic_barren_selected.png";
				$scope.landcover_current_water = "media/landcover_images/ic_water.png";
				landcover_part1_data = "barren";
				seeToast2("Barren",2000);
				break;
			case "water": 
				$scope.landcover_current_tree = "media/landcover_images/ic_tree.png";
				$scope.landcover_current_shrub = "media/landcover_images/ic_shrub.png"; 
				$scope.landcover_current_grass_land = "media/landcover_images/ic_grass_land.png"; 
				$scope.landcover_current_savana = "media/landcover_images/ic_savanna.png"; 
				$scope.landcover_current_garden_mixed = "media/landcover_images/ic_garden_mixed.png"; 
				$scope.landcover_current_cropland = "media/landcover_images/ic_cropland.png";
				$scope.landcover_current_developed = "media/landcover_images/ic_developed.png"; 
				$scope.landcover_current_barren = "media/landcover_images/ic_barren.png";
				$scope.landcover_current_water = "media/landcover_images/ic_water_selected.png";
				landcover_part1_data = "water";
				seeToast2("Water",2000);
				break;
		}	
	};
	
	
})
/****************************************/
/** AddPlot_PlotID_Ctrl **/
/****************************************/
.controller('AddPlot_PlotID_Ctrl',function($scope,$state,$ionicHistory,$ionicPopup){
	$scope.data = {};
	function checkExistName(recorder_name,name, JSONArray){
		var hasMatch =false;
		for (var index = 0; index < JSONArray.length; index++) {
		    var plot = JSONArray[index];
		    var newName = recorder_name + "-" + name;
		    if(plot.name.trim() === newName.trim() || plot.name.trim() === name.trim()){
		      hasMatch = true;
		      break;
		    }
		}
		return hasMatch;
	};
	
	function isEmptry(value){
		if (value === null || value === "undefined" || value === "" || value === 'null' || value === 'NULL') {
	    	return true;
	    } 
		return false;
	};
	
	
	function updatePlotExist(name,recorder_name,JSONArray,newPlot){
		for (var index = 0; index < JSONArray.length; index++) {
		    var plot = JSONArray[index];
		    if(plot.recorder_name === recorder_name && plot.real_name === name){
		        JSONArray[index] = newPlot;
		    }
		}
	}
	
	$scope.validateLatitude = function(){
		var latitude = document.getElementById('latitude').value;
		if (typeof Number(latitude) === 'number' && latitude > 90 ){
			document.getElementById('latitude').value = 90;
		} else if (typeof Number(latitude) === 'number' && latitude < -90 ){
			document.getElementById('latitude').value = -90;
		} else {
			
		}
	};
	
	$scope.validateLongitude = function(){
		console.log("Deo hieu");
		var longitude = document.getElementById('longitude').value;
		console.log(longitude);
		if (typeof Number(longitude) === 'number' && longitude > 180 ){
			document.getElementById('longitude').value = 180;
		} else if (typeof Number(longitude) === 'number' && longitude < -180 ){
			document.getElementById('longitude').value = -180;
		} else {
			
		}
	};
	
	
	$scope.getLocation = function() {
		var button_content = document.getElementById('btnObtainGPS').innerHTML;
		if (button_content == "Obtain GPS fix"){
	    	document.getElementById('latitude').type = "text";
	    	document.getElementById('longitude').type = "text";
	    	document.getElementById('latitude').style.color = "red";
	    	document.getElementById('longitude').style.color = "red";
	    	document.getElementById('latitude').value = "obtaining...";
	    	document.getElementById('longitude').value = "obtaining...";
	    	document.getElementById('btnObtainGPS').innerHTML = "Cancel GPS fix";
	    	var onSuccess = function(position) {
	    		document.getElementById('latitude').type = "number";
	        	document.getElementById('longitude').type = "number";
	    		document.getElementById('latitude').style.color = "black";
	        	document.getElementById('longitude').style.color = "black";
	            document.getElementById('latitude').value = position.coords.latitude;
	        	document.getElementById('longitude').value = position.coords.longitude ;
	        	document.getElementById('btnObtainGPS').innerHTML = "Obtain GPS fix"; 
	    	};
	    	
	    	function onError(error) {
	    		document.getElementById('latitude').value = "";
	        	document.getElementById('longitude').value = "";
	        	document.getElementById('btnObtainGPS').innerHTML = "Obtain GPS fix";
	            console.log('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
	            alert('Cannot get current geo-location');
	        }
	        navigator.geolocation.getCurrentPosition(onSuccess, onError);
		} else {
			document.getElementById('latitude').type = "number";
        	document.getElementById('longitude').type = "number";
    		document.getElementById('latitude').style.color = "black";
        	document.getElementById('longitude').style.color = "black";
        	document.getElementById('btnObtainGPS').innerHTML = "Obtain GPS fix";
		}
		
    };
    // An elaborate, custom popup
    $scope.showNotesPopup = function() {
	    var myPopup = $ionicPopup.show({
		      template: '<input type="textarea" ng-model="data.notes">',
		      title: 'Enter your Notes',
		      scope: $scope,
		      buttons: [
				{
				    text: '<b>Save</b>',
				    type: 'button-positive',
				    onTap: function(e) {
				      if (!$scope.data.notes) {
				      } else {
				        return $scope.data.notes;
				      }
				    }
				},
		        { text: 'Cancel' },
		        
		      ]
		  });
	
	      myPopup.then(function(res) {
	         console.log('Tapped!', res);
	      });
    };
    
	
	if (window.localStorage.getItem("PREVIOUS_PAGE") === "ADD_PLOT_ADD_NEW") {
		$scope.recorder_name = window.localStorage.getItem('current_email');
		$scope.plot_name = "New Plot";
	    //Collect data PlotID
	    $scope.completeAddPlot_PlotID = function() {
	    	var savePlot = confirm("Do you want to save this editing plot in local cache to continue adding ?");
	    	if (savePlot == true){
		    	recorder_name = window.localStorage.getItem('current_email');
		    	email = recorder_name;
			    latitude = document.getElementById('latitude').value;
			    longitude = document.getElementById('longitude').value;
			    name = document.getElementById('name').value;
			    var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
			    if (checkExistName(recorder_name,name,LIST_PLOTS) == false){
				    organization = document.getElementById('organization').value;
				    if (document.getElementById('chkTestPlotYes').checked == true) {
				    	testPlot = true;
				    } else if (document.getElementById('chkTestPlotNo').checked == true) {
				    	testPlot = false;
				    } else {
				    	testPlot = true;
				    }
		
				    if (!isEmptry(name) && !isEmptry(recorder_name)){
				    	isActived = true;
				    } else {
				    	isActived = false;
				    }
				    
				    if (!isEmptry(name) && !isEmptry(recorder_name) && !isEmptry(latitude) && !isEmptry(longitude) && !isEmptry(testPlot)){
				    	isPlotIDCompleted = true;
				    } else {
				    	isPlotIDCompleted = false;
				    }
				    newPlot_PlotID = {isActived:isActived, isPlotIDCompleted : isPlotIDCompleted ,name:name, test_plot:testPlot, recorder_name:recorder_name, organization:organization,latitude : latitude, longitude : longitude};
				    
				    if (isActived == true){
					    $scope.newPlot_PlotID = newPlot_PlotID;
					    var newPlot = {isActived:isActived, isPlotIDCompleted : isPlotIDCompleted, id:"",name:recorder_name + "-" + name, real_name:name ,recorder_name:recorder_name, test_plot:testPlot, organization : organization, latitude:latitude, longitude:longitude, notes:""};
					    if (checkExistName(recorder_name,name,LIST_PLOTS) == false) {
					    	if (!isEmpty($scope.data.notes)){
					    		newPlot.notes = $scope.data.notes;
					    	}
					    	
					    	LIST_PLOTS.push(newPlot);
							window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
							window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
							$state.go('landinfo.newplot');
					    }
			        } else {
			        	alert("Answer to plot name is required");
			        }
			    } else {
			    	alert("Plot Name is already used. Please try other name");
			    }
	    	} else {
	    		window.localStorage.getItem("PREVIOUS_PAGE") === "ADD_NEW_PLOT_NOT_SUCCESS";
	    		$state.go('landinfo.plots');
	    	}
	    };
	    
		
	} else if (window.localStorage.getItem("PREVIOUS_PAGE") === "ADD_PLOT_EDIT"){
		var newPlot = JSON.parse(window.localStorage.getItem("current_edit_plot"));
		var recorder_name = window.localStorage.getItem('current_email');
		$scope.recorder_name = recorder_name;
		
		var email = recorder_name;
		document.getElementById('name').value = newPlot.real_name;
		document.getElementById('name').setAttribute("disabled","disabled");
		document.getElementById('organization').value = newPlot.organization;
		var organization = newPlot.organization;
		$scope.plot_name = newPlot.real_name;
		if (newPlot.test_plot == true){
			document.getElementById('chkTestPlotYes').checked = true;
			document.getElementById('chkTestPlotNo').checked = false;
		} else {
			document.getElementById('chkTestPlotYes').checked = false;
			document.getElementById('chkTestPlotNo').checked = true;
		}
		var testPlot = newPlot.test_plot;
		document.getElementById('latitude').value = newPlot.latitude;
		document.getElementById('longitude').value = newPlot.longitude;
		
		$scope.completeAddPlot_PlotID = function() {
			 var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
			 var name = document.getElementById('name').value;
			 var organization = document.getElementById('organization').value;
			 
			 if (document.getElementById('chkTestPlotYes').checked == true) {
			    	testPlot = true;
			 } else if (document.getElementById('chkTestPlotNo').checked == true) {
			    	testPlot = false;
			 } else {
			    	testPlot = true;
			 }
			 
			 var latitude = document.getElementById('latitude').value;
		     var longitude = document.getElementById('longitude').value;
			
			 if (!isEmptry(name) && !isEmptry(recorder_name) && !isEmptry(latitude) && !isEmptry(longitude) && !isEmptry(testPlot)){
			    	isPlotIDCompleted = true;
			 } else {
			    	isPlotIDCompleted = false;
			 }
			 
			 //var newPlot = {isActived:true, isPlotIDCompleted : isPlotIDCompleted, id:"",name:recorder_name + "-" + name, real_name:name ,recorder_name:recorder_name, test_plot:testPlot, organization : organization, latitude:latitude, longitude:longitude};
			 newPlot.isActived = true;
			 newPlot.isPlotIDCompleted = isPlotIDCompleted;
			 newPlot.name = recorder_name + "-" + name;
			 newPlot.recorder_name = recorder_name;
			 newPlot.id = "";
			 newPlot.real_name = name;
			 newPlot.test_plot = testPlot;
			 newPlot.organization= organization;
			 newPlot.latitude =latitude;
			 newPlot.longitude = longitude;
			 if (checkExistName(recorder_name,name,LIST_PLOTS) == true) {
				   
					    if (!isEmpty($scope.data.notes)){
				    		newPlot.notes = $scope.data.notes;
				    	}
				    updatePlotExist(name,recorder_name,LIST_PLOTS,newPlot);
					window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_PLOTS));
					window.localStorage.setItem("current_edit_plot",JSON.stringify(newPlot));
					$state.go('landinfo.newplot');
			 }
		};
	}    
})


/****************************************/
/** ListPlotsCtrl Controller **/
/****************************************/
.controller('ListPlotsCtrl', function($scope,$state, $http, Scopes, $ionicHistory,$ionicLoading) {
    $scope.title = 'Landinfo';

    function isPlotInCloud(plot){
			if (plot.id === null || plot.id === '' || plot.id === 'null' || plot.id === 'undefined' || plot.isActived == true){
				return false;
			} else {
				return true;
			}
    }		
		
	var email = window.localStorage.getItem('current_email');
	var recorder_name = email;
	console.log("LIST of " + email);
	var previous_page = window.localStorage.getItem("PREVIOUS_PAGE");
	
	/* Should be Processed Caching Data in HERE */
	
	$ionicLoading.show({
	      template: 'Loading plots data...'
	});
	
	console.log(previous_page);
	if (previous_page === "LOGIN_PAGE") {
	   console.log("1st Time After Login : get data from API - Refresh data - all data from Cloud");
	   $http.get('http://128.123.177.21:8080/query', {
			params : {
				action : "get",
				object : "landinfo",
				recorder_name : email,
				display : "",
				delimiter : ",",
				version : ""
			}
		}).success(function(data) {
	
	       $scope.plots = data;
	       console.log($scope.plots.length);
	       
	       for(var index = 0 ; index < $scope.plots.length; index ++){
				var plot = $scope.plots[index];
				if (isPlotInCloud(plot) == true){
					$scope.plots[index].img_src = "img/check-mark-th.png";
				} else {
					$scope.plots[index].img_src = "img/check-mark-white-th.png";
				}
			}
	       
	       $ionicLoading.hide();
	       if($scope.plots.length === 0) {
	    	   window.localStorage.setItem("PREVIOUS_PAGE","LIST_PLOT_PAGE");
			   $state.go('landinfo.home');
		   } else  {
			   var localPlots = JSON.stringify(data);	
			   window.localStorage.setItem(email + "_" + "LIST_LANDINFO_PLOTS", localPlots);
		   }
		}).error(function(err) {
			$ionicLoading.hide();
			alert(err.error);
		});
	    window.localStorage.setItem("PREVIOUS_PAGE","LIST_PLOT_PAGE");
	} else if (previous_page === "ADD_NEW_PLOT_SUCCESS") {
		var delete_plot_name = window.localStorage.getItem("delete_plot_name");
		var delete_recorder_name = window.localStorage.getItem("delete_recorder_name");
		var recorder_name = window.localStorage.getItem('current_email');
        if (delete_recorder_name === recorder_name){
        	/* Extract list of local caching plots */
        	var LIST_PLOTS = JSON.parse(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
        	for(var index = 0 ; index < LIST_PLOTS.length ; index ++){
        		var plot = LIST_PLOTS[index];
        		if (plot.name === delete_plot_name && plot.recorder_name === delete_recorder_name){
        			if (index > 0){
        				LIST_PLOTS.splice(index,1);
        			}
        		}
        	}
        	var LIST_LOCAL_CACHE_PLOTS = [];
        	for(var index = 0 ; index < LIST_PLOTS.length; index ++){
        		var plot = LIST_PLOTS[index];
        		if (!isPlotInCloud(plot)){
        			LIST_LOCAL_CACHE_PLOTS.push(plot);
        		}
        	}
        	
        	/* Get list of plots from Cloud */
        	$http.get('http://128.123.177.21:8080/query', {
    			params : {
    				action : "get",
    				object : "landinfo",
    				recorder_name : email,
    				display : "",
    				delimiter : ",",
    				version : ""
    			}
    		}).success(function(data) {
    	       for(var index = 0 ; index < data.length; index ++){
	   				var plot = data[index];
	   				if (isPlotInCloud(plot) == true){
	   					data[index].img_src = "img/check-mark-th.png";
	   				} else {
	   					data[index].img_src = "img/check-mark-white-th.png";
	   				}
   		       }
    	       
    	       for(var index = 0 ; index < data.length; index ++){
   				   var plot = data[index];
   				   LIST_LOCAL_CACHE_PLOTS.push(plot);
   		       }
    	       
    	       window.localStorage.setItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS", JSON.stringify(LIST_LOCAL_CACHE_PLOTS));
           	   
           	   $scope.plots = {};
   		       $scope.plots = LIST_LOCAL_CACHE_PLOTS;
    	       
   		       $ionicLoading.hide();
    	     
    		}).error(function(err) {
    			$ionicLoading.hide();
    			$scope.plots = {};
     		    $scope.plots = LIST_LOCAL_CACHE_PLOTS;
    			alert(err.error);
    		});	
        	
        }
	} else {
		clearAllCache();
		/**********************/
		/* Syncing with Cloud */
		/**********************/
		console.log("Caching & Syncing : Queyry API to check Are there any newplots in Cloud of this account ?");
		var areThereAnyNewPlots = false;
		
		if (areThereAnyNewPlots == false) {
		     console.log("Caching & Syncing :  Get Data From Local Cache - NO NEWS");
		     $scope.plots = {};
		     //console.log(window.localStorage.getItem(recorder_name + "_" + "LIST_LANDINFO_PLOTS"));
		     $scope.plots = JSON.parse(window.localStorage.getItem(email + "_" + "LIST_LANDINFO_PLOTS"));
		} else {
			/* Caching & Syncing : Query plots from Cloud that are not stored in Local Caching */
			 console.log("Caching & Syncing :  Query new plots in Cloud and update with Local Cache");
		}
		
		for(var index = 0 ; index < $scope.plots.length; index ++){
			var plot = $scope.plots[index];
			if (isPlotInCloud(plot) == true){
				$scope.plots[index].img_src = "img/check-mark-th.png";
			} else {
				$scope.plots[index].img_src = "img/check-mark-white-th.png";
			}
		}
		
		//console.log($scope.plots);
		$ionicLoading.hide();
	}

    $scope.plotname = function(name){
		var str = name.length;
		var email = window.localStorage.getItem('current_email');
		var emaillength = email.length + 1;
		var finalstr = name.substring(emaillength,str);
		return finalstr;
	},


	$scope.selectPlot = function(plot){
		$scope.selectedPlot = plot;
		if (isPlotInCloud(plot) == true){
			Scopes.store('ListPlotsCtrl_Scope', $scope);
			window.localStorage.setItem("PREVIOUS_PAGE","LIST_PLOT_PAGE");
			window.localStorage.setItem("current_view_plot",JSON.stringify(plot));
			$state.go('landinfo.results-section');
		} else {
			window.localStorage.setItem("current_edit_plot",JSON.stringify(plot));
			window.localStorage.setItem("PREVIOUS_PAGE","LIST_PLOT_PAGE");
			$state.go('landinfo.newplot');
		}
	},


	$scope.getClimate = function(){
		$state.go('landinfo.quick_climate');
	};		

	function clearAllCache() {
		console.log("Clear Cache");
		$ionicHistory.clearCache();
	}

}) // End ListPlotsCtrl
/****************************************/
/** SignIn Controller **/
/****************************************/
.controller('SignInCtrl', function($scope, $state, $http, Scopes, $ionicHistory,$ionicLoading) {
	function checkExist(value, JSONArray){
		var hasMatch =false;
		for (var index = 0; index < JSONArray.length; index++) {
		    var auth = JSONArray[index];
		    if(auth.email == value){
		      hasMatch = true;
		      break;
		    }
		}
		return hasMatch;
	}
	
	function updateAuthExist(email,auth_key,JSONArray){
		for (var index = 0; index < JSONArray.length; index++) {
		    var auth = JSONArray[index];
		    if(auth.email == email){
		        JSONArray[index].json_auth_data = auth_key;
		    }
		}
	}

	function clearAllCache() {
		console.log("Clear Cache");
		$ionicHistory.clearCache();
		//$ionicHistory.clearHistory();
	}
	
	/* Test before click login */
	$scope.signIn = function(email, password) {
		        $ionicLoading.show({
		           template: 'Logging in...'
		        });
				var email = document.getElementById("email").value;
				var password = document.getElementById("password").value;				
				clearAllCache();
				$http({
					    method: 'POST',
					    url: "http://128.123.177.21:8080/auth/api_login",
					    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					    transformRequest: function(obj) {
					        var str = [];
					        for(var p in obj)
					        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					        return str.join("&");
					    },
					    data: {email: email, password: password}
				}).success(
						function(data, status, headers, config) {
							var localData = JSON.stringify(data);
							
							var objAuth = window.localStorage.getItem("AUTHENTICATION_LIST");
							if (objAuth === null || objAuth === 'null'){
								var listAuthentication = { authentication : []};
								listAuthentication.authentication.push({
									"email" : email,
									"password" : password,
									"json_auth_data" : localData
								});
							} else {
								var listAuthentication = JSON.parse(objAuth);
								if (checkExist(email, listAuthentication['authentication']) == false){
									listAuthentication['authentication'].push({
										"email" : email,
										"password" : password,
										"json_auth_data" : localData
									});
								} else {
									console.log("Update");
									updateAuthExist(email,localData,listAuthentication['authentication']);
								}	
							}
							window.localStorage.setItem("current_json_auth_data", localData);
							window.localStorage.setItem("current_email",email);
							window.localStorage.setItem("current_password",password);

							window.localStorage.setItem("AUTHENTICATION_LIST",JSON.stringify(listAuthentication));
							window.localStorage.setItem("PREVIOUS_PAGE","LOGIN_PAGE");
							$ionicLoading.hide();
							$state.go('landinfo.plots');
						
						}).error(function(err) {
							$ionicLoading.hide();
					        alert(err.error,'Authentication Error');
				});  // End HTTP POST LOGIN
	}; // End SignIn
}); // End Controller SignInCtrl
