var ActionPlan = Parse.Object.extend("ActionPlans");

Parse.Cloud.define("createNewActionPlan", function(request, response) {
	if(request.user){
		var plan = new ActionPlan();
		var columns = [{
			title: "Budget",
		},{
			title: "Indicator",
		},{
			title: "Deadline",
		},{
			title: "Resources",
		},{
			title: "Activities",
		},{
			title: "Objectives",
		}]
		var rows = [{
			title: "Axis",
			columns: [{
				text: "null"
			},{
				text: "null"
			},{
				text: "null"
			},{
				text: "null"
			},{
				text: "null"
			},{
				text: "null"
			}]
		}]
	    plan.set("title",request.params.title)
	    plan.set("description",request.params.description)
	    plan.set("columns",columns)
	    plan.set("rows",rows)
	    plan.set("createdBy",request.user)
	    plan.save()
	        .then(function(results) {
	            console.log(results)
	            response.success(results);
	        })
	        .catch(function(e) {
	            response.error(e);
	        });
	}else{
		response.error("User must be logged in.")
	}
});