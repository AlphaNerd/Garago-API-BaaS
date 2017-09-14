var ColorScheme = require('color-scheme');

var ActionPlan = Parse.Object.extend("ActionPlans");
var Project = Parse.Object.extend("Projects");
var Activities = Parse.Object.extend("Activities");
var Users = Parse.Object.extend("User");
var Files = Parse.Object.extend("Files");

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

Parse.Cloud.define("getUsersByIDs", function (request, response) {
    var members = request.params.ids
    console.log("GET MEMBERS")
    const query = new Parse.Query(Users);
    query.containedIn("objectId", members);
    query.find({
        success: function(res){
            console.log(res)
            response.success(res)
        },
        error: function(e,r){
            console.log(e,r)
            response.error(e,r)
        }
    })
});

Parse.Cloud.define("addUserFavFile", function (request, response) {
    if (request.user) {
        var query = new Parse.Query(Files)
        var fileID = request.params.fileID
        var user = request.user.id
        query.equalTo("objectId",fileID)
        ///// Find Object to set as user favorite
        query.find()
            .then(function (results) {
                console.log("RESULTS Finding File: ",results[0])
                if(results[0].id){
                    var obj = results[0]
                    var users = obj.attributes.users_favorite || []
                    users.push(user)
                    console.log("USERS: ",users)
                    obj.set("users_favorite", users)
                    obj.save({
                        success: function(res){
                            console.log("SAVED AS FAVORITE: ",res)
                            response.success(res);
                        },
                        error: function(e,r){
                            console.warn("ERROR SAVING FAV: ",e,r)
                            response.error(e);
                        }
                    })
                }else{
                    response.success("Can't find this file!");
                }
            })
            .catch(function (e) {
                response.error(e);
            });
    } else {
        response.error("User must be logged in to create plan.")
    }
});

Parse.Cloud.beforeSave("Files", function (request, response) {
    var title = request.object.get("file")._name.split("_")
    request.object.set("title",title[1])
    var type = request.object.get("file")._name.split(".")
    request.object.set("type",type[type.length-1])

    if(request.user){
        request.object.set("createdBy",request.user.id)
    }else{
        request.object.set("createdBy","ROGIfaTamg")
    }

    try{
        /// set icons
        if(type[type.length-1] == "png" || type[type.length-1] == "jpg" || type[type.length-1] == "jpeg" || type[type.length-1] == "gif"){
            request.object.set("icon","fa-file-image-o")
        }else if(type[type.length-1] == "pdf"){
            request.object.set("icon","fa-file-pdf-o")
        }else if(type[type.length-1] == "doc" || type[type.length-1] == "docx" || type[type.length-1] == "txt"){
            request.object.set("icon","fa-file-text-o")
        }
    }
    catch(e){
        console.log(e)
    }

    response.success()
});

Parse.Cloud.afterSave("ActionPlans", function (request, response) {
    if (request.object.get("published") == true) {
        response.success("Published: Turn off editing");
    } else {
        response.success("Unpublished: Turn on editing");
    }
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