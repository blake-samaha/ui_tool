export function tier00Paths(_root: string) {
    const base = `project_templates`;
    return {
        yaml: `${base}/00_Solution_Design_Principles.yaml`,
        uiState: `${base}/ui-state/00_toolkit.json`
    };
}

// New project-scoped paths for Tier 01
export function tier01Paths(_root: string, projectId: string, moduleId: string) {
    const base = `project_templates/projects/${projectId}/modules/${moduleId}`;
    return {
        yaml: `${base}/01_Conceptual_Model.yaml`,
        uiState: `${base}/ui-state/01_conceptual_model.json`,
        base
    };
}

// New project-scoped paths for Tier XX
export function tierXXPaths(_root: string, projectId: string, moduleId: string, objectId: string) {
    const base = `project_templates/projects/${projectId}/modules/${moduleId}`;
    return {
        yaml: `${base}/XX_Object_Specs/${objectId}.yaml`,
        uiState: `${base}/ui-state/xx/${objectId}.json`,
        base
    };
}

