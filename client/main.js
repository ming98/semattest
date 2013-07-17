/**
 * Semat Essence Accelerator
 * Copyright (C) 2013 Daniel Graziotin. All Rights Reserved.
 * Licensed under the BSD 3-Clause. See the LICENSE File for details.
 */

Meteor.autorun(function() {
    Meteor.subscribe('Projects');
    Meteor.subscribe('Concerns', Session.get('selectedProjectId'));
    Meteor.subscribe('Alphas', Session.get('selectedProjectId'));
    Meteor.subscribe('States', Session.get('selectedProjectId'));
});


Meteor.autorun(function() {
    if (Session.get('selectedProjectId')) {
        var project = Projects.findOne({
            _id: Session.get('selectedProjectId')
        });
        if (project) {
            Session.set('selectedProjectName', project.name);
            drawGraphs();
        }
    }
});

Meteor.autorun(function() {
    if (Session.get('message')) {
        $('.message').css('background-color', '#680148');
        setTimeout(function() {
            $('.message').css('background-color', '#ffffff').text('');
        }, 10000);
    }
});

Meteor.autorun(function() {
    if (Session.get('demoMode')) {
        var project = Projects.findOne({
            demo: true,
            userId: null
        });
        if (project) {
            Session.set('selectedProjectId', project._id);
        }
    }
})

Meteor.autorun(function() {
    if (Meteor.userId() && Meteor.flush() && Projects.find({
        userId: Meteor.user()._id,
        demo: false
    }).count() === 0) {
        Meteor.call('newProject', 'Default Project', 'This is the default description of the project. Feel free to edit it.',
            function(error, result) {
                if (error) {
                    Session.set('message', 'Error when creating the default project: ' + error);
                }
            });
    }
});

$(window).resize(function() {
    if (Meteor.userId() && Session.get('selectedProjectId'))
        drawGraphs();
});
