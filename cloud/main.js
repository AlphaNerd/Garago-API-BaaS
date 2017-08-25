var ColorScheme = require('color-scheme');
var scheme = new ColorScheme;
scheme.from_hue(21)         
      .scheme('triade')     
      .variation('soft');   
var colors = scheme.colors();

var ActionPlan = Parse.Object.extend("ActionPlans");

Parse.Cloud.define("createNewActionPlan", function(request, response) {
    if (request.user) {
        var plan = new ActionPlan();

        for(i=0;i<columns.length;i++){
            columns[i].style = {
                'background':colors[i],
                'color':'#333'
            }
        }

        ///// Set User ACL Privelages
        var acl = new Parse.ACL();
        acl.setPublicReadAccess(false);
        acl.setReadAccess(request.user.id, true);
        acl.setWriteAccess(request.user.id, true);
        plan.setACL(acl);

        ///// Set object properties for new Action Plan
        plan.set("title", request.params.title)
        plan.set("description", request.params.description)
        plan.set("columns", columns)
        plan.set("rows", rows)
        plan.set("createdBy", request.user)
        plan.set("locked", false)
        plan.set("settings", {'scheme':colors})
        plan.set("footer", "")
        plan.set("owners", [request.user.id])

        ///// Save to MongoDB
        plan.save()
            .then(function(results) {
                console.log(results)
                response.success(results);
            })
            .catch(function(e) {
                response.error(e);
            });
    } else {
        response.error("User must be logged in to create plan.")
    }
});

var columns = [{
    title: "Budget",
    style: {
        "background": "#f3f3f3",
        "color": "#333"
    }
}, {
    title: "Indicator",
    style: {
        "background": "#f3f3f3",
        "color": "#333"
    }
}, {
    title: "Deadline",
    style: {
        "background": "#f3f3f3",
        "color": "#333"
    }
}, {
    title: "Resources",
    style: {
        "background": "#f3f3f3",
        "color": "#333"
    }
}, {
    title: "Activities",
    style: {
        "background": "#f3f3f3",
        "color": "#333"
    }
}, {
    title: "Objectives",
    style: {
        "background": "#f3f3f3",
        "color": "#333"
    }
}]
var rows = [{
    title: "Axis",
    columns: [{
        text: "null",
        locked: false
    }, {
        text: "null",
        locked: false
    }, {
        text: "null",
        locked: false
    }, {
        text: "null",
        locked: false
    }, {
        text: "null",
        locked: false
    }, {
        text: "null",
        locked: false
    }]
}]