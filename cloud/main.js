var ActionPlan = Parse.Object.extend("ActionPlans");

Parse.Cloud.define("createNewActionPlan", function(request, response) {
	if(request.user){
		var plan = new ActionPlan();
	    plan.set("title",request.params.title)
	    plan.set("description",request.params.description)
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