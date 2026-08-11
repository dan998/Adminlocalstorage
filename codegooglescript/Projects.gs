// =====================================================
// PROJECTS.GS
// Project Management
// Registration System API
// =====================================================


// =====================================================
// PROJECT COLUMNS
// =====================================================

const PROJECT_COLUMNS = {

  ID: 1,

  NAME: 2,

  DESCRIPTION: 3,

  OWNER_ID: 4,

  STATUS: 5,

  CREATED_AT: 6,

  UPDATED_AT: 7

};


// =====================================================
// PROJECT STATUSES
// =====================================================

const PROJECT_STATUSES = [

  "Active",

  "Inactive",

  "Archived",

  "Pending",

  "Completed"

];


// =====================================================
// CREATE PROJECT
// =====================================================

function createProject(data) {

  data = sanitizeObject(data);

  const session =
    requireAuth(
      data.token
    );

  if (!data.name) {

    return errorResponse(
      "Project name is required"
    );

  }

  const name =
    sanitizeInput(
      data.name
    ).trim();

  const description =
    data.description
      ? sanitizeInput(
          data.description
        ).trim()
      : "";

  if (!name) {

    return errorResponse(
      "Project name is required"
    );

  }

  if (
    name.length > 100
  ) {

    return errorResponse(
      "Project name is too long"
    );

  }

  if (
    description.length > 1000
  ) {

    return errorResponse(
      "Project description is too long"
    );

  }

  const sheet =
    getSheet(
      SHEETS.PROJECTS
    );

  const values =
    sheet
      .getDataRange()
      .getValues();

  const cleanName =
    name.toLowerCase();

  // ---------------------------------
  // Prevent duplicate project names
  // for the same owner
  // ---------------------------------

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];

    const rowOwner =
      String(
        row[
          PROJECT_COLUMNS.OWNER_ID - 1
        ] || ""
      );

    const rowName =
      String(
        row[
          PROJECT_COLUMNS.NAME - 1
        ] || ""
      )
        .trim()
        .toLowerCase();

    if (
      rowOwner ===
        String(session.userId) &&
      rowName ===
        cleanName
    ) {

      return errorResponse(
        "A project with this name already exists"
      );

    }

  }

  const projectId =
    generateID(
      "PRJ"
    );

  const now =
    new Date();

  const status =
    data.status
      ? sanitizeInput(
          data.status
        )
      : "Active";

  if (
    PROJECT_STATUSES.indexOf(
      status
    ) === -1
  ) {

    return errorResponse(
      "Invalid project status"
    );

  }

  sheet.appendRow([

    projectId,

    name,

    description,

    session.userId,

    status,

    now,

    now

  ]);

  return successResponse(

    "Project created successfully",

    {

      project: {

        id:
          projectId,

        name:
          name,

        description:
          description,

        ownerId:
          session.userId,

        status:
          status,

        createdAt:
          now,

        updatedAt:
          now

      }

    }

  );

}


// =====================================================
// GET PROJECTS
// =====================================================

function getProjects(data) {

  data =
    data || {};

  const session =
    requireAuth(
      data.token
    );

  const sheet =
    getSheet(
      SHEETS.PROJECTS
    );

  const values =
    sheet
      .getDataRange()
      .getValues();

  const projects = [];

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];

    if (
      !row[
        PROJECT_COLUMNS.ID - 1
      ]
    ) {

      continue;

    }

    const ownerId =
      row[
        PROJECT_COLUMNS.OWNER_ID - 1
      ];

    // ---------------------------------
    // Users see their own projects.
    // Admins can see all projects.
    // ---------------------------------

    const isAdmin =
      String(
        session.role || ""
      )
        .toLowerCase() ===
      "admin";

    if (
      !isAdmin &&
      String(ownerId) !==
      String(session.userId)
    ) {

      continue;

    }

    projects.push({

      id:
        row[
          PROJECT_COLUMNS.ID - 1
        ],

      name:
        row[
          PROJECT_COLUMNS.NAME - 1
        ],

      description:
        row[
          PROJECT_COLUMNS.DESCRIPTION - 1
        ],

      ownerId:
        ownerId,

      status:
        row[
          PROJECT_COLUMNS.STATUS - 1
        ],

      createdAt:
        row[
          PROJECT_COLUMNS.CREATED_AT - 1
        ],

      updatedAt:
        row[
          PROJECT_COLUMNS.UPDATED_AT - 1
        ]

    });

  }

  return successResponse(

    "Projects retrieved",

    {

      projects:
        projects,

      count:
        projects.length

    }

  );

}


// =====================================================
// GET PROJECT
// =====================================================

function getProject(data) {

  data =
    data || {};

  const session =
    requireAuth(
      data.token
    );

  if (!data.projectId) {

    return errorResponse(
      "Project ID is required"
    );

  }

  const project =
    findProjectById(
      data.projectId
    );

  if (!project) {

    return errorResponse(
      "Project not found"
    );

  }

  const isAdmin =
    String(
      session.role || ""
    )
      .toLowerCase() ===
    "admin";

  if (
    !isAdmin &&
    String(project.ownerId) !==
    String(session.userId)
  ) {

    return errorResponse(
      "You do not have access to this project"
    );

  }

  return successResponse(

    "Project retrieved",

    {

      project:
        project

    }

  );

}


// =====================================================
// UPDATE PROJECT
// =====================================================

function updateProject(data) {

  data =
    data || {};

  const session =
    requireAuth(
      data.token
    );

  if (!data.projectId) {

    return errorResponse(
      "Project ID is required"
    );

  }

  const project =
    findProjectById(
      data.projectId
    );

  if (!project) {

    return errorResponse(
      "Project not found"
    );

  }

  const isAdmin =
    String(
      session.role || ""
    )
      .toLowerCase() ===
    "admin";

  if (
    !isAdmin &&
    String(project.ownerId) !==
    String(session.userId)
  ) {

    return errorResponse(
      "You do not have permission to update this project"
    );

  }

  const sheet =
    getSheet(
      SHEETS.PROJECTS
    );

  const row =
    project.row;

  let updated =
    false;

  // ---------------------------------
  // Update name
  // ---------------------------------

  if (
    data.name !==
    undefined
  ) {

    const name =
      sanitizeInput(
        data.name
      ).trim();

    if (!name) {

      return errorResponse(
        "Project name cannot be empty"
      );

    }

    if (
      name.length > 100
    ) {

      return errorResponse(
        "Project name is too long"
      );

    }

    sheet
      .getRange(
        row,
        PROJECT_COLUMNS.NAME
      )
      .setValue(
        name
      );

    updated =
      true;

  }

  // ---------------------------------
  // Update description
  // ---------------------------------

  if (
    data.description !==
    undefined
  ) {

    const description =
      sanitizeInput(
        data.description
      ).trim();

    if (
      description.length > 1000
    ) {

      return errorResponse(
        "Project description is too long"
      );

    }

    sheet
      .getRange(
        row,
        PROJECT_COLUMNS.DESCRIPTION
      )
      .setValue(
        description
      );

    updated =
      true;

  }

  // ---------------------------------
  // Update status
  // ---------------------------------

  if (
    data.status !==
    undefined
  ) {

    const status =
      sanitizeInput(
        data.status
      );

    if (
      PROJECT_STATUSES.indexOf(
        status
      ) === -1
    ) {

      return errorResponse(
        "Invalid project status"
      );

    }

    sheet
      .getRange(
        row,
        PROJECT_COLUMNS.STATUS
      )
      .setValue(
        status
      );

    updated =
      true;

  }

  if (!updated) {

    return errorResponse(
      "No project changes supplied"
    );

  }

  const now =
    new Date();

  sheet
    .getRange(
      row,
      PROJECT_COLUMNS.UPDATED_AT
    )
    .setValue(
      now
    );

  return successResponse(

    "Project updated successfully",

    {

      project:
        findProjectById(
          data.projectId
        )

    }

  );

}


// =====================================================
// UPDATE PROJECT STATUS
// =====================================================

function updateProjectStatus(data) {

  data =
    data || {};

  const session =
    requireAuth(
      data.token
    );

  if (!data.projectId) {

    return errorResponse(
      "Project ID is required"
    );

  }

  if (!data.status) {

    return errorResponse(
      "Project status is required"
    );

  }

  const status =
    sanitizeInput(
      data.status
    );

  if (
    PROJECT_STATUSES.indexOf(
      status
    ) === -1
  ) {

    return errorResponse(
      "Invalid project status"
    );

  }

  const project =
    findProjectById(
      data.projectId
    );

  if (!project) {

    return errorResponse(
      "Project not found"
    );

  }

  const isAdmin =
    String(
      session.role || ""
    )
      .toLowerCase() ===
    "admin";

  if (
    !isAdmin &&
    String(project.ownerId) !==
    String(session.userId)
  ) {

    return errorResponse(
      "You do not have permission to update this project"
    );

  }

  const sheet =
    getSheet(
      SHEETS.PROJECTS
    );

  const now =
    new Date();

  sheet
    .getRange(
      project.row,
      PROJECT_COLUMNS.STATUS
    )
    .setValue(
      status
    );

  sheet
    .getRange(
      project.row,
      PROJECT_COLUMNS.UPDATED_AT
    )
    .setValue(
      now
    );

  return successResponse(

    "Project status updated successfully",

    {

      project:
        findProjectById(
          data.projectId
        )

    }

  );

}


// =====================================================
// DELETE PROJECT
// =====================================================

function deleteProject(data) {

  data =
    data || {};

  const session =
    requireAuth(
      data.token
    );

  if (!data.projectId) {

    return errorResponse(
      "Project ID is required"
    );

  }

  const project =
    findProjectById(
      data.projectId
    );

  if (!project) {

    return errorResponse(
      "Project not found"
    );

  }

  const isAdmin =
    String(
      session.role || ""
    )
      .toLowerCase() ===
    "admin";

  if (
    !isAdmin &&
    String(project.ownerId) !==
    String(session.userId)
  ) {

    return errorResponse(
      "You do not have permission to delete this project"
    );

  }

  const sheet =
    getSheet(
      SHEETS.PROJECTS
    );

  sheet.deleteRow(
    project.row
  );

  // ---------------------------------
  // Remove project-user assignments
  // ---------------------------------

  try {

    removeProjectAssignments(
      data.projectId
    );

  } catch (error) {

    console.error(
      error
    );

  }

  return successResponse(
    "Project deleted successfully"
  );

}


// =====================================================
// FIND PROJECT BY ID
// =====================================================

function findProjectById(
  projectId
) {

  const sheet =
    getSheet(
      SHEETS.PROJECTS
    );

  const values =
    sheet
      .getDataRange()
      .getValues();

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];

    if (
      String(
        row[
          PROJECT_COLUMNS.ID - 1
        ]
      ) !==
      String(projectId)
    ) {

      continue;

    }

    return {

      row:
        i + 1,

      id:
        row[
          PROJECT_COLUMNS.ID - 1
        ],

      name:
        row[
          PROJECT_COLUMNS.NAME - 1
        ],

      description:
        row[
          PROJECT_COLUMNS.DESCRIPTION - 1
        ],

      ownerId:
        row[
          PROJECT_COLUMNS.OWNER_ID - 1
        ],

      status:
        row[
          PROJECT_COLUMNS.STATUS - 1
        ],

      createdAt:
        row[
          PROJECT_COLUMNS.CREATED_AT - 1
        ],

      updatedAt:
        row[
          PROJECT_COLUMNS.UPDATED_AT - 1
        ]

    };

  }

  return null;

}