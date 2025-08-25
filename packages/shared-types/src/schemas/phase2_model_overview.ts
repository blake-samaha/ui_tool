import { z } from 'zod';

export const ModelOverviewRelationshipPropertyZ = z.object({
    name: z.string().min(1),
    type: z.string().optional(),
    description: z.string().optional()
});

const ModelOverviewExternalObjectRefZ = z.object({ module: z.string().min(1), object: z.string().min(1) });

export const ModelOverviewRelationshipZ = z.object({
    label: z.string().optional(),
    from: z.union([z.string().min(1), ModelOverviewExternalObjectRefZ]),
    to: z.union([z.string().min(1), ModelOverviewExternalObjectRefZ]),
    direction: z.enum(['A_TO_B', 'B_TO_A', 'BIDIRECTIONAL']).optional(),
    cardinality: z.enum(['ONE_TO_ONE', 'ONE_TO_MANY', 'MANY_TO_MANY']).optional(),
    description: z.string().optional(),
    propertyName: z.string().optional(),
    inversePropertyName: z.string().optional(),
    modulesInvolved: z.array(z.string()).optional(),
    properties: z.array(ModelOverviewRelationshipPropertyZ).optional()
});

export const ModelOverviewImplementsZ = z.object({
    space: z.string().min(1),
    externalId: z.string().min(1),
    version: z.string().optional()
});

export const ModelOverviewObjectZ = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    relatedModules: z.array(z.string()).optional(),
    implements: z.array(ModelOverviewImplementsZ).optional()
});

export const ModelOverviewPurposeZ = z.object({
    overview: z.string().min(1),
    outcomes: z.array(z.string()).optional(),
    successCriteria: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional()
});

export const ModelOverviewPersonaZ = z.object({
    name: z.string().min(1),
    role: z.string().optional(),
    painPoints: z.array(z.string()).optional()
});

export const ModelOverviewZ = z.object({
    specVersion: z.string(),
    module: z.string().min(1),
    modelVersion: z.string().optional(),
    purpose: ModelOverviewPurposeZ,
    personas: z.array(ModelOverviewPersonaZ).optional(),
    problems: z.array(z.string()).optional(),
    objects: z.array(ModelOverviewObjectZ).min(1),
    relationships: z.array(ModelOverviewRelationshipZ).optional()
});

export type ModelOverview = z.infer<typeof ModelOverviewZ>;


