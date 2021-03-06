/**
 * Semat Essence Accelerator
 * Copyright (C) 2013 Daniel Graziotin. All Rights Reserved.
 * Licensed under the BSD 3-Clause. See the LICENSE File for details.
 */

/**
 * This file implement the server-side methods, which will be public for the client.
 */

/**
 * Create and save a new Project
 * @param  {string} name        Name of the Project
 * @param  {string} description Description of the Project
 * @param  {bool} is the proejct a demo project?
 * @return {int}             The Meteor/MongoDB id of the Project
 */
newProject = function(name, description, demo) {
    if (!typeof(name) === 'string' || !name){
        return 'Error. Wrong projectId supplied. Please contact the developer.';
    }
    if (!typeof(description) === 'string' || !description){
        return 'Error. Wrong description supplied. Please contact the developer.';
    }
    if (typeof(demo) === 'undefined'){
        demo = false;
    }
    var concernId = 0;
    var alphaId = 0;
    var stateId = 0;

    var alphaCounter = 0;

    var userId;
    if (demo === true)
        userId = null;
    else
        userId = Meteor.userId();

    projectId = Projects.insert({
        name: name,
        description: description,
        demo: demo,
        userId: userId
    });

    for (var c = 0; c < kernelSkeleton.concerns.length; c++) {
        var concern = kernelSkeleton.concerns[c];
        concernId = Concerns.insert({
            name: concern.name,
            description: concern.description,
            // index from 1 instead of 0
            order: c + 1,
            completion: 0,
            userId: userId,
            projectId: projectId
        });
        for (var a = 0; a < concern.alphas.length; a++) {
            var alpha = concern.alphas[a];
            alphaId = Alphas.insert({
                name: alpha.name,
                description: alphaDescriptions[alpha.name.toLowerCase()],
                order: alphaCounter + 1,
                currentStateId: null,
                completion: 0,
                concernId: concernId,
                projectId: projectId,
                userId: userId
            });
            alphaCounter++;
            for (var s = 0; s < alpha.states.length; s++) {
                var state = alpha.states[s];
                stateId = States.insert({
                    name: state,
                    description: stateDescriptions[alpha.name.toLowerCase()][state.toLowerCase()],
                    order: s + 1,
                    alphaId: alphaId,
                    projectId: projectId,
                    userId: userId
                });
            }
        }
    }
    return projectId;
};

/**
 * Calculate the percentage of completion of each Concern.
 * Should be called after an Alpha switches to a new State and its completion has been done.
 */
updateConcernCompletions = function(projectId) {
    if (typeof(projectId) !== 'string' || !projectId){
        throw new Meteor.Error(500,'Error. Wrong projectId (' + projectId + ') supplied. Please contact the developer.');
    }
    var concerns = Concerns.find({
        userId: Meteor.userId(),
        projectId: projectId
    });
    concerns.forEach(function(concern) {
        var alphas = Alphas.find({
            concernId: concern._id,
            userId: Meteor.userId()
        }).fetch();
        var completions = 0;
        alphas.forEach(function(alpha) {
            completions += alpha.completion;
        });
        Concerns.update({
            _id: concern._id,
            userId: Meteor.userId()
        }, {
            $set: {
                completion: completions / alphas.length
            }
        });
    });
};

/**
 * Calculate the percentage of completion of each Alpha.
 */
updateAlphasCompletions = function(projectId) {
    if (typeof(projectId) !== 'string' || !projectId){
        return 'Error. Wrong projectId supplied. Please contact the developer.';
    }
    var alphas = Alphas.find({
        userId: Meteor.userId(),
        projectId: projectId
    });
    alphas.forEach(function(alpha) {
        var alphaStatesCount = States.find({
            alphaId: alpha._id,
            userId: Meteor.userId()
        }).count();

        var currentStatePosition = 0;
        if (alpha.currentStateId) {
            currentStatePosition = States.findOne({
                _id: alpha.currentStateId,
                userId: Meteor.userId()
            }).order;
        }

        var ratio = currentStatePosition / alphaStatesCount * 100;
        Alphas.update({
            _id: alpha._id,
            userId: Meteor.userId()
        }, {
            $set: {
                completion: ratio
            }
        });
    });
};

/**
 * Log an event in the database
 * @param  {string} projectId Meteor/MongoDB id of the project
 * @param  {string} who       who is causing the event / where is the event happening
 * @param  {string} what      the event happening
 */
log = function(projectId, who, what) {
    if (typeof(projectId) === 'undefined' || !projectId){
        return 'Error. Wrong projectId supplied. Please contact the developer.';
    }
    if (typeof(who) === 'undefined' || !who){
        return 'Error. Wrong who supplied. Please contact the developer.';
    }
    if (typeof(what) === 'undefined' || !what){
        return 'Error. Wrong what supplied. Please contact the developer.';
    }

    var userId = Meteor.userId();
    var timestamp = new Date();
    eventobj = {
        when: timestamp,
        projectId: projectId,
        who: who,
        what: what,
        userId: Meteor.userId()
    };
    Events.insert(eventobj);
    return true;
};

/**
 * Return events as a CSV text string
 */
getLog = function(projectId) {
    if (typeof(projectId) === 'undefined' || !projectId){
        return 'Error. Wrong projectId supplied. Please contact the developer.';
    }
    var userId = Meteor.userId();
    var events = Events.find({
        projectId: projectId,
        userId: userId
    });
    var buffer = 'WHEN,WHO,WHAT\n';
    events.forEach(function(ev) {
        buffer = buffer + '"' + ev.when.toISOString() + '","' + ev.who + '","' + ev.what + '"\n';
    });
    return buffer;
};
