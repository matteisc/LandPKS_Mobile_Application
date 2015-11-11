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

function isEmpty(value){
	if (value == null || value == "undefined" || value == "" || value == 'null' || value == 'NULL') {
    	return true;
    } 
	return false;
};

function getListComponents(string,char){
	var partsOfStr = string.split(char);
	return partsOfStr;
}