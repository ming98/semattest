Template.kernel.userProjects = function() {
  return Projects.find({
    userId: Meteor.userId()
  });
};

Template.kernel.concerns = function() {
  var projectId = Session.get('selectedProjectId');
  return Concerns.find({
    projectId: projectId,
    userId: Meteor.userId()
  });
};

Template.kernel.alphas = function(concernId) {
  var projectId = Session.get('selectedProjectId');
  return Alphas.find({
    concernId: concernId,
    userId: Meteor.userId()
  });
};

Template.kernel.currentState = function(stateId) {
  var state = States.findOne({
    _id: stateId,
    userId: Meteor.userId()
  });
  if(state) return ': ' + state.name;
  else return '';
};

Template.kernel.states = function(alphaId) {
  if(alphaId) return States.find({
    alphaId: alphaId,
    userId: Meteor.userId()
  });
  else return States.find({
    userId: Meteor.userId()
  });
};

Template.kernel.sameId = function(firstId, secondId) {
  return firstId == secondId;
};