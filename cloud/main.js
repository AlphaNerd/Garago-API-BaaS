var ActionPlan = Parse.Object.extend("ActionPlans");

Parse.Cloud.define("createNewActionPlan", function(request, response) {
    var plan = new ActionPlan();
    plan.set("title",request.params.title)
    plan.set("description",request.params.description)
    plan.set("createdBy",request.user.id)
    plan.save()
        .then(function(results) {
            console.log(results)
            response.success(results);
        })
        .catch(function(e) {
            response.error(e);
        });
});