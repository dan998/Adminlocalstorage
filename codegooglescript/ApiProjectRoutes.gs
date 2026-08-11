// =====================================================
// API PROJECT ROUTES
// =====================================================


// =====================================================
// PROJECTS
// =====================================================

function apiCreateProject(data) {

  return createProject(data);

}


function apiGetProjects(data) {

  return getProjects(data);

}


function apiGetProject(data) {

  return getProject(data);

}


function apiUpdateProject(data) {

  return updateProject(data);

}


function apiUpdateProjectStatus(data) {

  return updateProjectStatus(data);

}


function apiDeleteProject(data) {

  return deleteProject(data);

}


// =====================================================
// PROJECT USERS
// =====================================================

function apiAddProjectUser(data) {

  return addProjectUser(data);

}


function apiRemoveProjectUser(data) {

  return removeProjectUser(data);

}


function apiGetProjectUsers(data) {

  return getProjectUsers(data);

}


function apiCheckProjectAccess(data) {

  return checkProjectAccess(data);

}