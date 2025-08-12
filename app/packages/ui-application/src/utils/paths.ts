export function tier00Paths(_root: string) {
    const base = `project_templates`;
    return {
        yaml: `${base}/00_Solution_Design_Principles.yaml`,
        uiState: `${base}/ui-state/00_solution_design.json`
    };
}

export function tier01Paths(_root: string, moduleId: string) {
    const base = `project_templates/modules/${moduleId}`;
    return {
        yaml: `${base}/01_Conceptual_Model.yaml`,
        uiState: `${base}/ui-state/01_conceptual_model.json`,
        base
    };
}

export function tierXXPaths(_root: string, moduleId: string, objectId: string) {
    const base = `project_templates/modules/${moduleId}`;
    return {
        yaml: `${base}/XX_Object_Specs/${objectId}.yaml`,
        uiState: `${base}/ui-state/xx/${objectId}.json`,
        base
    };
}

