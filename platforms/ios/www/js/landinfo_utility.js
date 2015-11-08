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