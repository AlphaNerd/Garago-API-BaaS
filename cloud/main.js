// Get access to Parse Server's cache
const { AppCache } = require('parse-server/lib/cache');
// Get a reference to the MailgunAdapter
// NOTE: It's best to do this inside the Parse.Cloud.define(...) method body and not at the top of your file with your other imports. This gives Parse Server time to boot, setup cloud code and the email adapter.
const MailgunAdapter = AppCache.get('garagoapi').userController.adapter;

var ColorScheme = require('color-scheme');
var ActionPlan = Parse.Object.extend("ActionPlans");
var Project = Parse.Object.extend("Projects");
var Activities = Parse.Object.extend("Activities");
var Users = Parse.Object.extend("User");
var Files = Parse.Object.extend("Files");
var Invites = Parse.Object.extend("Invites");
var Users = Parse.Object.extend("User");
var NocCodes = Parse.Object.extend("NocCodes");

Parse.Cloud.define("validateBetaUser", function(request, response) {
    var betaUsers = [
        "ashley.counsell@gnb.ca",
        "vivienne.sprague@gnb.ca",
        "kim.moyer@gnb.ca",
        "kylah.maher@gnb.ca",
        "linda.hache2@gnb.ca",
        "emilie.lebel@gnb.ca",
        "luc.ringuette@gnb.ca",
        "nicole.arsenaultleblanc@gnb.ca"
    ]

    function checkBetaEmail() {
        console.log("VERIFY BETA USER")
        if (betaUsers.indexOf(request.params.email) != -1) {
            return true
        } else {
            return false
        }
    }

    if (checkBetaEmail()) {
        response.success(true)
    } else {
        response.success(false)
    }

})

Parse.Cloud.define("createNewActionPlan", function(request, response) {
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

Parse.Cloud.define("createNewProject", function(request, response) {
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

Parse.Cloud.define("updateRating", function(request, response) {
    if (request.user) {
        var rating = request.params.rating
        var fileId = request.params.fileId
        var query = new Parse.Query(Files)
        query.equalTo("objectId",fileId)
        query.find({
            success:function(res){
                console.log("FOUND FILE:", res[0])
            },
            error: function(e,r){
                console.log(e,r)
            }
        }).then(function(resp){
            resp.set("rating",rating)
            resp.save({
                success: function(res){
                    console.log("SAVED NEW RATING: ",res)
                },
                error: function(e,r){
                    console.log("ERROR SAVING: ",e,r)
                }
            }).then(function(res){
                response.success()
            })
        })
    } else {
        response.error("User must be logged in to create plan.")
    }
});

Parse.Cloud.define("createNewActivity", function(request, response) {
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

Parse.Cloud.define("getUsersByIDs", function(request, response) {
    var members = request.params.ids
    console.log("GET MEMBERS")
    const query = new Parse.Query(Users);
    query.containedIn("objectId", members);
    query.find({
        success: function(res) {
            console.log(res)
            response.success(res)
        },
        error: function(e, r) {
            console.log(e, r)
            response.error(e, r)
        }
    })
});

Parse.Cloud.define("getUserFavFiles", function(request, response) {
    if (request.user) {
        var query = new Parse.Query(Files)
        var fileIDs = request.user.get("favorite_files")
        console.log("SEARCH FOR THESE FILES: ", fileIDs)
        query.containedIn("objectId", fileIDs)
        ///// Find Object to set as user favorite
        query.find()
            .then(function(results) {
                console.log("RESULTS Finding Favorite File: ", results)
                response.success(results)
            })
            .catch(function(e) {
                response.error(e);
            });
    } else {
        response.error("User must be logged in to create plan.")
    }
});

Parse.Cloud.define("addUserFavFile", function(request, response) {
    if (request.user) {
        var query = new Parse.Query(Files)
        var fileID = request.params.fileID
        var user = request.user.id
        query.equalTo("objectId", fileID)
        query.include("users_favorite")
        ///// Find Object to set as user favorite
        query.find()
            .then(function(results) {
                console.log("RESULTS Finding File: ", results[0])
                if (results[0].id) {
                    var obj = results[0]
                    var users = obj.get("users_favorite") || []
                    users.push(user)
                    results[0].set("users_favorite", users)
                    console.log("USERS: ", users)
                    results[0].save({
                        success: function(res) {
                            console.log("SAVED AS FAVORITE: ", res)
                            response.success(res);
                        },
                        error: function(e, r) {
                            console.warn("ERROR SAVING FAV: ", e, r)
                            response.error(e);
                        }
                    })
                } else {
                    response.success("Can't find this file!");
                }
            })
            .catch(function(e) {
                response.error(e);
            });
    } else {
        response.error("User must be logged in to create plan.")
    }
});

Parse.Cloud.beforeSave("Files", function(request, response) {
    ////check for duplicate names
    var query = new Parse.Query(Files)
    var title = request.object.get("file")._name
    title = title.replace("_", "#@#")
    var newTitle = title.split("#@#")
    request.object.set("title", newTitle[1].toLowerCase())
    console.log("SEARCH FOR THIS FILENAME: ", newTitle[1].toLowerCase())
    query.startsWith("title", newTitle[1].toLowerCase())
    ///// Find Object to set as user favorite
    query.find()
        .then(function(results) {
            console.log("RESULTS Finding File: ", results)
            if (results[0]) {
                var myTitle = newTitle[1].replace(/.([^.]*)$/, '(' + (results.length + 1) + ').' + '$1');
                request.object.set("title", myTitle.toLowerCase())
                finishSave()
            } else {
                finishSave()
            }
        })
        .catch(function(e) {
            response.error(e);
        });


    function finishSave() {
        var type = request.object.get("file")._name.split(".")
        request.object.set("type", type[type.length - 1])

        if (request.user) {
            var userObj = {
                id: request.user.id,
                name: {
                    first: request.user.attributes.firstname,
                    last: request.user.attributes.lastname,
                    username: request.user.attributes.user
                },
                email: request.user.attributes.email,
                image: request.user.attributes.image
            }
            request.object.set("createdByUser", request.user)
            request.object.set("createdBy", userObj)
        } else {
            // request.object.set("createdBy","ROGIfaTamg")
        }

        try {
            /// set icons
            if (type[type.length - 1] == "png" || type[type.length - 1] == "jpg" || type[type.length - 1] == "jpeg" || type[type.length - 1] == "gif") {
                request.object.set("icon", "fa-file-image-o")
            } else if (type[type.length - 1] == "pdf") {
                request.object.set("icon", "fa-file-pdf-o")
            } else if (type[type.length - 1] == "doc" || type[type.length - 1] == "docx" || type[type.length - 1] == "txt") {
                request.object.set("icon", "fa-file-text-o")
            } else if (type[type.length - 1] == "pptx" || type[type.length - 1] == "ppt") {
                request.object.set("icon", "fa-file-powerpoint-o")
            } else if (type[type.length - 1] == "xlsx" || type[type.length - 1] == "xls") {
                request.object.set("icon", "fa-file-excel-o")
            }

        } catch (e) {
            console.log(e)
        }

        response.success()
    }
});

Parse.Cloud.afterSave("ActionPlans", function(request, response) {
    if (request.object.get("published") == true) {
        response.success("Published: Turn off editing");
    } else {
        response.success("Unpublished: Turn on editing");
    }
});

///////////////////////////////////////////////////////
/////////// INVITE USERS TO APP ///////////////////
///////////////////////////////////////////////////////
Parse.Cloud.define("removeInvite", function(request, response) {
    var query = new Parse.Query(Invites)
    query.equalTo("email", request.params.email)
    query.find({
        success: function(resp) {
            function success(res) {
                console.log("FOUND INVITE: ", res)
                response.success(res)
            }
            res[0].set("active", false)
            res[0].save().then(success)
        },
        error: function(e, r) {
            console.log(e, r)
        }
    })
})

///////////////////////////////////////////////////////
/////////// DEACTIVATE USER INVITE ///////////////////
///////////////////////////////////////////////////////
Parse.Cloud.define("inviteUser", function(request, response) {
    var email = request.params.email
    var canUpload = request.params.canUpload || false
    var invite = new Invites();

    ///// Set User ACL Privelages
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setPublicWriteAccess(true);
    // acl.setWriteAccess(request.user.id, true);
    invite.setACL(acl);

    ///// Set object properties for new Action project
    invite.set("email", request.params.email.toLowerCase())
    invite.set("canUpload", request.params.canUpload || false)
    invite.set("active", true)

    ///// Save to MongoDB
    invite.save()
        .then(function(results) {
            console.log(results)

            /////// ***** Send Email to User Here ***** ///////
            MailgunAdapter.send({
                templateName: 'userInvite',
                // Optional override of your configuration's subject
                subject: 'You\'re Invited',
                // Optional override of the adapter's fromAddress
                fromAddress: 'admin@garagosoftware.com',
                recipient: email,
                variables: {
                    firstName: request.user.get("firstName"),
                    lastName: request.user.get("lastName"),
                    link: "https://garago-dev.herokuapp.com/#/intro",
                    invite: results
                }, // {{alert}} will be compiled to 'New posts'
                // Additional message fields can be included with the "extra" option
                // See https://nodemailer.com/extras/mailcomposer/#e-mail-message-fields for an overview of what can be included
                extra: {
                    attachments: [],
                    replyTo: 'noreply@garagosoftware.com'
                }
            }).then(function(res) {
                response.success(results);
            });
        })
        .catch(function(e) {
            response.error(e);
        });
})

///////////////////////////////////////////////////////
/////////// MANAGE USERS IN APP ///////////////////
///////////////////////////////////////////////////////
Parse.Cloud.define("getAllUsers", function(request, response) {
    var query = new Parse.Query(Users)
    query.exists("objectId")
    query.find().then(function(res) {
        response.success(res)
    })
})

///////////////////////////////////////////////////////
/////////// INVITE USERS TO APP ///////////////////
///////////////////////////////////////////////////////
Parse.Cloud.define("getNocCodes", function(request, response) {
    var query1 = new Parse.Query(NocCodes)
    var searchTerm = request.params.searchTerm
    query1.contains("title", searchTerm)

    var query2 = new Parse.Query(NocCodes)
    query2.contains("noc", searchTerm)

    var mainQuery = Parse.Query.or(query1, query2);
    mainQuery.descending("title")
    mainQuery.limit(25)
    mainQuery.find({
        success: function(res) {
            console.log("Found NOC Codes: ", res[0].attributes)

            response.success(res)
        },
        error: function(e, r) {
            response.error(e, r)
        }
    })
})


///////////////////////////////////////////////////////
/////////// DELETE USER BY ID ///////////////////
///////////////////////////////////////////////////////
Parse.Cloud.define("deleteUserById", function(request, response) {
    var query = new Parse.Query(Users)
    query.equalTo("objectId",request.params.userid)
    query.find({
        success: function(res) {
            console.log("Found User: ", res[0])
            res[0].destroy({useMasterKey: true,
                success: function(res){
                    console.log("Deleted User")
                    response.success(true)
                },
                error:function(e,r){
                    console.log("Error Deleteing User")
                    response.error(false)
                }
            })
        },
        error: function(e, r) {
            response.error(e, r)
        }
    })
})


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