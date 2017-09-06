var ColorScheme = require('color-scheme');

var ActionPlan = Parse.Object.extend("ActionPlans");
var Project = Parse.Object.extend("Projects");
var Activities = Parse.Object.extend("Activities");

Parse.Cloud.define("createNewActionPlan", function (request, response) {
    if (request.user) {
        var plan = new ActionPlan();

        //// paint some color in it
        var scheme = new ColorScheme;

        scheme.from_hue(getRandomInt(0, 21))
            .scheme('triade')
            .variation('soft');
        var colors = scheme.colors();
        for (i = 0; i < columns.length; i++) {
            columns[i].style = {
                'background': '#' + colors[i],
                'color': '#333'
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
        plan.set("settings", { 'scheme': colors })
        plan.set("footer", "")
        plan.set("owners", [request.user.id])

        ///// Save to MongoDB
        plan.save()
            .then(function (results) {
                console.log(results)
                response.success(results);
            })
            .catch(function (e) {
                response.error(e);
            });
    } else {
        response.error("User must be logged in to create plan.")
    }
});

Parse.Cloud.afterSave("ActionPlans", function (request, response) {
    if (request.object.get("published") == true) {
        response.success("Published: Turn off editing");
    } else {
        response.success("Unpublished: Turn on editing");
    }
});

Parse.Cloud.define("createNewProject", function (request, response) {
    if (request.user) {
        var project = new Project();

        ///// Set User ACL Privelages
        var acl = new Parse.ACL();
        acl.setPublicReadAccess(false);
        acl.setPublicWriteAccess(false);
        acl.setReadAccess(request.user.id, true);
        acl.setWriteAccess(request.user.id, true);
        project.setACL(acl);

        ///// Set object properties for new Action project
        project.set("name", request.params.name)
        project.set("description", request.params.description)
        project.set("owners", [request.user.id])

        ///// Save to MongoDB
        project.save()
            .then(function (results) {
                console.log(results)
                response.success(results);
            })
            .catch(function (e) {
                response.error(e);
            });
    } else {
        response.error("User must be logged in to create plan.")
    }
});


Parse.Cloud.define("createNewActivity", function (request, response) {
    if (request.user) {
        var activity = new Activities();

        ///// Set User ACL Privelages
        var acl = new Parse.ACL();
        acl.setPublicReadAccess(false);
        acl.setPublicWriteAccess(false);
        acl.setReadAccess(request.user.id, true);
        acl.setWriteAccess(request.user.id, true);
        activity.setACL(acl);

        ///// Set object properties for new activity
        activity.set("title", request.params.title)
        activity.set("description", request.params.description)
        activity.set("owners", [request.user.id])

        ///// Save to MongoDB
        activity.save()
            .then(function (results) {
                console.log(results)
                response.success(results);
            })
            .catch(function (e) {
                response.error(e);
            });
    } else {
        response.error("User must be logged in to create plan.")
    }
});

Parse.Cloud.afterSave("Files", function (request, response) {
    console.log("AFTER SAVE: ",request.object)
    response.success(request.object)
    // if (request.object.get("published") == true) {
    //     response.success("Published: Turn off editing");
    // } else {
    //     response.success("Unpublished: Turn on editing");
    // }
});

Parse.Cloud.beforeSave("Files", function (request, response) {
    console.log("BEFORE SAVE: ",request.object.get("file")._name)
    // request.object.set("type",extension)
    response.success(request.object)
    // if (request.object.get("published") == true) {
    //     response.success("Published: Turn off editing");
    // } else {
    //     response.success("Unpublished: Turn on editing");
    // }
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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