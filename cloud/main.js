// Get access to Parse Server's cache
const { AppCache } = require('parse-server/lib/cache');
// Get a reference to the MailgunAdapter
// NOTE: It's best to do this inside the Parse.Cloud.define(...) method body and not at the top of your file with your other imports. This gives Parse Server time to boot, setup cloud code and the email adapter.
const MailgunAdapter = AppCache.get('garagoapi').userController.adapter;


/// ray's deps
const textract = require('textract')
const pdf_extract = require('pdf-text-extract')
const countWords = require("count-words")
const summarizer = require('nodejs-text-summarizer')
// const logger = require('logger')



var ColorScheme = require('color-scheme');
var ActionPlan = Parse.Object.extend("ActionPlans");
var Project = Parse.Object.extend("Projects");
var Activities = Parse.Object.extend("Activities");
var Users = Parse.Object.extend("User");
var Files = Parse.Object.extend("Files");
var Invites = Parse.Object.extend("Invites");
var Users = Parse.Object.extend("User");
var NocCodes = Parse.Object.extend("NocCodes");



// import entire SDK
var AWS = require('aws-sdk');
// import AWS object without services
var AWS = require('aws-sdk/global');
// import individual service
var S3 = require('aws-sdk/clients/s3');


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

///////////////////////////////////////////////////////
/////////// DELETE USER BY ID ///////////////////
///////////////////////////////////////////////////////
Parse.Cloud.define("toggleUploadPrivileges", function(request, response) {
    var query = new Parse.Query(Users)
    query.equalTo("objectId", request.params.userid)
    query.find({
        success: function(res) {
            console.log("Found User: ", res[0])
            res[0].set("canUpload", !request.params.mydata)
            res[0].save(null, { useMasterKey: true }).then(function(res) {
                response.success(res)
            })
        },
        error: function(e, r) {
            response.error(e, r)
        }
    })
})

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
        query.equalTo("objectId", fileId)
        query.find({
            success: function(res) {
                console.log("FOUND FILE:", res[0])
                res[0].set("rating", rating)
                res[0].save({
                    success: function(res) {
                        console.log("SAVED NEW RATING: ", res)
                    },
                    error: function(e, r) {
                        console.log("ERROR SAVING: ", e, r)
                    }
                }).then(function(res) {
                    response.success()
                })
            },
            error: function(e, r) {
                console.log(e, r)
            }
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



Parse.Cloud.afterSave("Files", function(request) {
    console.log("OBJECT AFTERSAVE: ", request.object)
    var hasKeywords = request.object.get('keywords');
    var isActive = request.object.get('active');
    if (hasKeywords || !isActive) {
        return;
    }




    //// ray's shiznit
    var url = request.object.get("file")._url

    textract.fromUrl( url, function( error, text_body ) {
        // Error handling
        if (error) return console.log("Got error processing url", url, error);

        // Get keyword density
        keywords = countWords( text_body );
        keywords = Object.keys(keywords);
        text_body = text_body.split(" ").slice(0, 100).join(' ')
        // // Summarize the text
        var summary = summarizer( text_body );
        var summary_keywords = countWords(summary);
        // // Limit text summary to 100 words
        summary = summary.split(" ").slice(0, 100).join(' ');

        var myToken = request.object;
        myToken.set("keywords", keywords);
        myToken.set("summary", summary);
        myToken.set("summary_keywords", summary_keywords);
        myToken.save(null, {
            useMasterKey: true,
            success: function () {
                console.log('success');
            },
            error: function (obj, err) {
                console.log(err);
            }
        });


    })

})



Parse.Cloud.beforeSave("Files", function(request, response) {
    ////check for duplicate names
    var query = new Parse.Query(Files)
    var title = request.object.get("title")
    request.object.set("title", title.toLowerCase())
    console.log("SEARCH FOR THIS FILENAME: ", title.toLowerCase())
    query.startsWith("title", title.toLowerCase())
    ///// Find Object to set as user favorite
    finishSave()
    // query.find()
    //     .then(function(results) {
    //         console.log("RESULTS Finding File: ", results)
    //         if (results[0]) {
    //             var myTitle = title.replace(/.([^.]*)$/, '(' + (results.length + 1) + ').' + '$1');
    //             request.object.set("title", myTitle.toLowerCase())
    //             finishSave()
    //         } else {
    //             finishSave()
    //         }
    //     })
    //     .catch(function(e) {
    //         response.error(e);
    //     });


    function finishSave() {
        var fileURL = request.object.get("file")._url
        var type = request.object.get("file")._name.split(".")
        request.object.set("type", type[type.length - 1])
        var isNewFile = request.object.get("createdBy").id ? true : false
        if (request.user && !isNewFile) {
            var userObj = {
                id: request.user.id,
                name: {
                    first: request.user.get("firstName"),
                    last: request.user.get("lastName"),
                    username: request.user.get("username")
                },
                email: request.user.attributes.email,
                image: request.user.attributes.image,
            }
            request.object.set("createdBy", userObj)
            // if(request.object.get("createdBy").id){
            //     console.log("cannot overright this property")
            // }else{
            //     request.object.set("createdBy", userObj)
            // }
            // var myRating = request.object.get("rating") || 0
            // request.object.set("rating", myrating)
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
            response.error(e)
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
                console.log("Invite deactived: ", res)
                response.success(res)
            }
            resp[0].set("active", false)
            resp[0].save().then(success)
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
    var invitedBy = {
        id: request.user.id,
        firstName: request.user.attributes.firstName,
        lastName: request.user.attributes.lastName,
        email: request.user.attributes.email
    }

    ///// Set User ACL Privelages
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setPublicWriteAccess(true);
    // acl.setWriteAccess(request.user.id, true);
    invite.setACL(acl);

    ///// Set object properties for new Action project
    invite.set("email", request.params.email.toLowerCase())
    invite.set("canUpload", request.params.canUpload || false)
    invite.set("isAdmin", request.params.isAdmin || false)
    invite.set("region", request.params.regionName || "")
    invite.set("regionId", request.params.regionId || "")
    invite.set("active", true)
    invite.set("invitedBy", invitedBy)
    invite.set("language", "en")

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
            // response.success(results)
        })
        .catch(function(e) {
            response.error(e);
        });
})


///////////////////////////////////////////////////////
/////////// REQUEST FILE APPROVAL ///////////////////
///////////////////////////////////////////////////////
Parse.Cloud.define("requestApproval", function(request, response) {
    var region = request.user.get("regionId")
    var invitedBy = request.user.get("invitedBy")

    MailgunAdapter.send({
        templateName: 'approveFile',
        // Optional override of your configuration's subject
        subject: 'A new file upload requires your approval.',
        // Optional override of the adapter's fromAddress
        fromAddress: 'admin@garagosoftware.com',
        recipient: invitedBy.email,
        variables: {
            firstName: request.user.get("firstName"),
            lastName: request.user.get("lastName"),
            link: 'http://documents.garago.net/#/app/library/approvals'
        }, // {{alert}} will be compiled to 'New posts'
        // Additional message fields can be included with the "extra" option
        // See https://nodemailer.com/extras/mailcomposer/#e-mail-message-fields for an overview of what can be included
        extra: {
            attachments: [],
            replyTo: 'noreply@garagosoftware.com'
        }
    }).then(function(res) {
        response.success(res);
    });
})


///////////////////////////////////////////////////////
/////////// FILE APPROVED            ///////////////////
///////////////////////////////////////////////////////
Parse.Cloud.define("fileapproved", function(request, response) {

    var filename = request.params.title
    var sendTo = request.params.sendTo

    MailgunAdapter.send({
        templateName: 'fileApproved',
        // Optional override of your configuration's subject
        subject: 'Your recent upload has been approved.',
        // Optional override of the adapter's fromAddress
        fromAddress: 'admin@garagosoftware.com',
        recipient: sendTo,
        variables: {
            firstName: request.user.get("firstName"),
            lastName: request.user.get("lastName"),
            file: filename
        }, // {{alert}} will be compiled to 'New posts'
        // Additional message fields can be included with the "extra" option
        // See https://nodemailer.com/extras/mailcomposer/#e-mail-message-fields for an overview of what can be included
        extra: {
            attachments: [],
            replyTo: 'noreply@garagosoftware.com'
        }
    }).then(function(res) {
        response.success(res);
    });
})




///////////////////////////////////////////////////////
/////////// NEW USER NOTIFICATION   ///////////////////
///////////////////////////////////////////////////////
Parse.Cloud.define("newUserAdminNotify", function(request, response) {
    var invitedBy = request.params.invitedBy
    /////// ***** Send Email to User Here ***** ///////
    MailgunAdapter.send({
        templateName: 'userRegistered',
        // Optional override of your configuration's subject
        subject: 'New Member at PETL Smart Library',
        // Optional override of the adapter's fromAddress
        fromAddress: 'admin@garagosoftware.com',
        recipient: invitedBy.email,
        variables: {
            firstName: request.user.get("firstName"),
            lastName: request.user.get("lastName"),
        }, // {{alert}} will be compiled to 'New posts'
        // Additional message fields can be included with the "extra" option
        // See https://nodemailer.com/extras/mailcomposer/#e-mail-message-fields for an overview of what can be included
        extra: {
            attachments: [],
            replyTo: 'noreply@garagosoftware.com'
        }
    }).then(function(res) {
        response.success(res);
    });

})



///////////////////////////////////////////////////////
/////////// MANAGE USERS IN APP ///////////////////
///////////////////////////////////////////////////////
Parse.Cloud.define("getAllUsers", function(request, response) {
    var query = new Parse.Query(Users)
    var a = request.user.get("isSuperAdmin")
    if (!a) {
        var region = request.user.get("regionId")
        query.equalTo("regionId", region)
    }
    query.exists("objectId")
    query.descending("firstName")
    query.find().then(function(res) {
        response.success(res)
    })
})

///////////////////////////////////////////////////////
/////////// INVITE USERS TO APP ///////////////////
///////////////////////////////////////////////////////
Parse.Cloud.define("getNocCodes", function(request, response) {
    var language = request.params.userlang
    var query1 = new Parse.Query(NocCodes)
    var searchTerm = request.params.searchTerm
    query1.contains("title", searchTerm)
    query1.equalTo("lang", language)

    var query2 = new Parse.Query(NocCodes)
    query2.contains("noc", searchTerm)
    query1.equalTo("lang", language)

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
    query.equalTo("objectId", request.params.userid)
    query.find({
        success: function(res) {
            console.log("Found User: ", res[0])
            res[0].destroy({
                useMasterKey: true,
                success: function(res) {
                    console.log("Deleted User")
                    response.success(true)
                },
                error: function(e, r) {
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