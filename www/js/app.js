angular.module('ionicApp', ['ionic','ionicApp.controller','ngCordova'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('landinfo', {
      url: "/landinfo",
      abstrsct : true,
      templateUrl: "templates/tabs.html"
    })
    .state('landinfo.home', {
      url: "/home",
      views: {
        'home-tab': {
          templateUrl: "templates/home.html",
          controller: 'HomeTabCtrl'
        }
      }
    })
    .state('landinfo.clear', {
      url: "/clear",
      views: {
        'home-tab': {
          templateUrl: "templates/clear.html",
          controller: 'ClearCtrl'
        }
      }
    })
    .state('landinfo.plots', {
      url: "/plots",
      cache: false,
      views: {
        'home-tab': {
          templateUrl: "templates/plots.html",
          //controller: 'SignInCtrl'
          controller: 'ListPlotsCtrl'
        }
      }
    })
    .state('landinfo.accounts', {
      url: "/accounts",
      views: {
        'home-tab': {
          templateUrl: "templates/accounts.html",
          controller: 'ListAccountsCtrl'
        }
      }
    })
    .state('landinfo.newplot', {
      url: "/newplot",
      cache: false,
      views: {
        'home-tab': {
          templateUrl: "templates/newplot.html",
          controller: 'AddPlot_Edit_Ctrl'
        }
      }
    })
    .state('landinfo.newplot_temp', {
      url: "/newplot",
      views: {
        'home-tab': {
          templateUrl: "templates/newplot_temp.html",
          controller: 'AddPlot_AddNew_Ctrl'
        }
      }
    })
    .state('landinfo.results-section', {
      url: "/results-section",
      views: {
        'home-tab': {
          templateUrl: "templates/results-section.html",
          controller: 'Results_Section_Ctrl'
        }
      }
    })
    .state('landinfo.login', {
      url: "/login",
      views: {
        'home-tab': {
          templateUrl: "templates/login.html",
          controller: 'SignInCtrl'
        }
      }
    })
    .state('landinfo.plotid', {
      url: "/plotid",
      views: {
        'home-tab': {
          templateUrl: "templates/plotid.html",
          controller: 'AddPlot_PlotID_Ctrl'
        }
      }
    })
    .state('landinfo.landcover', {
      url: "/landcover",
      views: {
        'home-tab': {
          templateUrl: "templates/landcover.html",
          controller: 'AddPlot_LandCover_Ctrl'	  
        }
      }
    })
    .state('landinfo.landuse', {
      url: "/landuse",
      views: {
        'home-tab': {
          templateUrl: "templates/landuse.html",
          controller: 'AddPlot_LandUse_Ctrl'
        }
      }
    })

    .state('landinfo.slope', {
      url: "/slope",
      cache: false,
      views: {
        'home-tab': {
          templateUrl: "templates/slope.html",
          controller: 'AddPlot_Slope_Ctrl'
        }
      }
    })
    .state('landinfo.accelerometer', {
      url: "/accelerometer",
      views: {
        'home-tab': {
          templateUrl: "templates/accelerometer.html",
          controller: 'Accelerometer_Ctrl'
          
        }
      }
    })
    .state('landinfo.slopeshape', {
      url: "/slopeshape",
      views: {
        'home-tab': {
          templateUrl: "templates/slopeshape.html",
          controller: 'AddPlot_Slopeshape_Ctrl'
         
        }
      }
    })
    .state('landinfo.soilcondition', {
      url: "/soilcondition",
      views: {
        'home-tab': {
          templateUrl: "templates/soilcondition.html",
          controller: 'AddPlot_Soilcondition_Ctrl'
         
        }
      }
    })
    .state('landinfo.soillayers', {
      url: "/soillayers",
      cache: false,
      views: {
        'home-tab': {
          templateUrl: "templates/soillayers.html",
          controller: 'AddPlot_Soillayers_Ctrl'
        }
      }
    })
    .state('landinfo.photos', {
      url: "/photos",
      views: {
        'home-tab': {
          templateUrl: "templates/photos.html",
          controller: 'AddPlot_Photos_Ctrl'
        }
      }
    })
    .state('landinfo.review', {
      url: "/review",
      views: {
        'home-tab': {
          templateUrl: "templates/review.html",
          controller:  'AddPlot_Review_Ctrl'
        }
      }
    })
    .state('landinfo.results', {
      url: "/results",
      views: {
        'home-tab': {
          templateUrl: "templates/results.html",
          controller: 'ReviewSelectedPlotCtrl' 
        }
      }
    })
     .state('landinfo.review-results', {
      url: "/review-results",
      views: {
        'home-tab': {
          templateUrl: "templates/review-results.html",
          controller: 'ReviewSelectedPlotCtrl'
        }
      }
    })
    .state('landinfo.soillayers1', {
      url: "/soillayers1",
      cache: false,
      views: {
        'home-tab': {
          templateUrl: "templates/soillayers1.html",
          controller: 'AddPlot_Soillayer_Layer_1_Ctrl'
        }
      }
    })
    .state('landinfo.soillayers2', {
      url: "/soillayers2",
      views: {
        'home-tab': {
          templateUrl: "templates/soillayers2.html",
          controller: 'AddPlot_Soillayer_Layer_2_Ctrl'
        }
      }
    })
    .state('landinfo.soillayers3', {
      url: "/soillayers3",
      views: {
        'home-tab': {
          templateUrl: "templates/soillayers3.html",
          controller: 'AddPlot_Soillayer_Layer_3_Ctrl'
        }
      }
    })
    .state('landinfo.soillayers4', {
      url: "/soillayers4",
      views: {
        'home-tab': {
          templateUrl: "templates/soillayers4.html",
          controller: 'AddPlot_Soillayer_Layer_4_Ctrl'
        }
      }
    })
    .state('landinfo.soillayers5', {
      url: "/soillayers5",
      views: {
        'home-tab': {
          templateUrl: "templates/soillayers5.html",
          controller: 'AddPlot_Soillayer_Layer_5_Ctrl'
        }
      }
    })
    .state('landinfo.soillayers6', {
      url: "/soillayers6",
      views: {
        'home-tab': {
          templateUrl: "templates/soillayers6.html",
          controller: 'AddPlot_Soillayer_Layer_6_Ctrl'
        }
      }
    })
    .state('landinfo.soillayers7', {
      url: "/soillayers7",
      views: {
        'home-tab': {
          templateUrl: "templates/soillayers7.html",
          controller: 'AddPlot_Soillayer_Layer_7_Ctrl'
        }
      }
    })
    .state('landinfo.about', {
      url: "/about",
      views: {
        'about-tab': {
          templateUrl: "templates/about.html"
        }
      }
    })
  .state('landinfo.quick_climate', {
      url: "/quick_climate",
      views: {
        'home-tab': {
          templateUrl: "templates/quick_climate.html",
          controller: 'QuickClimateCtrl'
        }
      }
    }) 
  .state('landinfo.dummy', {
      url: "/dummy",
      views: {
        'home-tab': {
          templateUrl: "templates/dummy.html",
          controller: 'DummyCtrl'
        }
      }
    })
  .state('landinfo.plots_map', {
      url: "/plots_map",
      views: {
        'home-tab': {
          templateUrl: "templates/plots_map.html",
          controller: 'PlotsMapCtrl'
        }
      }
    })
  .state('landinfo.copytosd', {
      url: "/copytosd",
      views: {
        'copytosd-tab': {
          templateUrl: "templates/copytosd.html"
        }
      }
    })
    .state('landinfo.settings', {
      url: "/settings",
      views: {
        'settings-tab': {
          templateUrl: "templates/settings.html",
          controller: 'SettingsCtrl'  
        }
      }
    });
   
   var listAuthentication = window.localStorage.getItem("AUTHENTICATION_LIST");
   console.log("Test " + listAuthentication);
   if (listAuthentication === null || listAuthentication === 'null'){
	   $urlRouterProvider.otherwise("/landinfo/login");
   } else {
	   var jsonObjAuth = JSON.parse(listAuthentication);
	   if (jsonObjAuth['authentication'].length == 1){	   
		   window.localStorage.setItem("current_json_auth_data", jsonObjAuth['authentication'][0].json_auth_data);
		   window.localStorage.setItem("current_email",jsonObjAuth['authentication'][0].email);
		   window.localStorage.setItem("current_password",jsonObjAuth['authentication'][0].password);
		   window.localStorage.setItem("PREVIOUS_PAGE","LOGIN_PAGE");
		   $urlRouterProvider.otherwise("/landinfo/plots");
	   } else {
		   $urlRouterProvider.otherwise("/landinfo/accounts");
	   }
	   
   }
});







