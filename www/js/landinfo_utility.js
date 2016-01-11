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
};

function getRealPlotName(recorder_name,mix_name){
	var str = mix_name.length;
	var email = recorder_name;
	var emaillength = email.length + 1;
	var finalstr = mix_name.substring(emaillength,str);
	return finalstr;
};
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
};

function isPlotInCloud(plot){
	if (plot.id === null || plot.id === '' || plot.id === 'null' || plot.id === 'undefined' || plot.isActived == true){
		return false;
	} else {
		return true;
	}
};

function getListPlotInLocalCache(JSONArray){
	for (var index = 0; index < JSONArray.length; index++) {
	    var plot = JSONArray[index];
	    if (!isPlotInCloud(plot)){
	    	deleteLandInfoPlotInArrayt(plot.name,plot.recorder_name,JSONArray);
	    }
	}
	return JSONArray;
};

function deleteLandInfoPlotInArrayt(name,recorder_name,JSONArray){
	for (var index = 0; index < JSONArray.length; index++) {
	    var plot = JSONArray[index];
	    if(plot.recorder_name === recorder_name && plot.real_name === name){
	       if (index > - 1){
	    	   JSONArray.splice(index, 1);
	    	   return true;
	       } else{
	    	   return false;
	       }
	    } 
	}
	return false;
};

function isEmpty(value){
	if (value == null || value == "undefined" || value == "" || value == 'null' || value == 'NULL') {
    	return true;
    } 
	return false;
};

function getListComponents(string,char){
	var partsOfStr = string.split(char);
	return partsOfStr;
};