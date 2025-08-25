import { z } from 'zod';

// Phase 2 portions
const RelationshipPropertyZ = z.object({
    name: z.string().min(1),
    type: z.string().optional(),
    description: z.string().optional()
});

const ExternalObjectRefZ = z.object({ module: z.string().min(1), object: z.string().min(1) });

const RelationshipZ = z.object({
    label: z.string().optional(),
    from: z.union([z.string().min(1), ExternalObjectRefZ]),
    to: z.union([z.string().min(1), ExternalObjectRefZ]),
    direction: z.enum(['A_TO_B', 'B_TO_A', 'BIDIRECTIONAL']).optional(),
    cardinality: z.enum(['ONE_TO_ONE', 'ONE_TO_MANY', 'MANY_TO_MANY']).optional(),
    description: z.string().optional(),
    propertyName: z.string().optional(),
    inversePropertyName: z.string().optional(),
    modulesInvolved: z.array(z.string()).optional(),
    properties: z.array(RelationshipPropertyZ).optional()
});

const ImplementsRefZ = z.object({
    space: z.string().min(1),
    externalId: z.string().min(1),
    version: z.string().optional()
});

const ModelObjectZ = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    relatedModules: z.array(z.string()).optional(),
    implements: z.array(ImplementsRefZ).optional()
});

const PurposeZ = z.object({
    overview: z.string().min(1),
    outcomes: z.array(z.string()).optional(),
    successCriteria: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional()
});

const PersonaZ = z.object({
    name: z.string().min(1),
    role: z.string().optional(),
    painPoints: z.array(z.string()).optional()
});

// Phase 3 entity portions
const EntitySourceZ = z.object({
    system: z.string(),
    resource: z.string(),
    description: z.string().optional(),
    keys: z.array(z.string()).optional()
});

const EntityAttributeZ = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    nullable: z.boolean().optional(),
    default: z.any().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional()
});

const EntityConstraintZ = z.object({
    kind: z.enum(['primary', 'unique', 'foreign', 'check']),
    fields: z.array(z.string()),
    expression: z.string().optional()
});

const EntityValidationZ = z.object({
    name: z.string().min(1),
    intent: z.string().min(1),
    severity: z.enum(['warning', 'error']).optional()
});

const EntityTransformationZ = z.object({
    name: z.string().min(1),
    intent: z.string().min(1),
    sourceHints: z.array(z.object({ system: z.string().optional(), resource: z.string().optional(), fields: z.array(z.string()).optional() })).optional(),
    notes: z.string().optional()
});

const EntityRelationshipZ = z.object({
    type: z.string().min(1),
    to: z.union([
        z.object({ space: z.string(), externalId: z.string(), version: z.string().optional() }),
        z.object({ module: z.string(), object: z.string() })
    ]),
    description: z.string().optional()
});

const EntityZ = z.object({
    name: z.string().min(1),
    space: z.string().min(1).optional(),
    externalId: z.string().min(1).optional(),
    implements: z.array(ImplementsRefZ).optional(),
    sources: z.array(EntitySourceZ).optional(),
    attributes: z.array(EntityAttributeZ).optional(),
    constraints: z.array(EntityConstraintZ).optional(),
    validations: z.array(EntityValidationZ).optional(),
    transformations: z.array(EntityTransformationZ).optional(),
    security: z.object({ groups: z.array(z.string()).optional(), categories: z.array(z.string()).optional() }).optional(),
    relationships: z.array(EntityRelationshipZ).optional()
});

export const ModelDesignZ = z.object({
    specVersion: z.string(),
    module: z.string().min(1),
    modelVersion: z.string().optional(),
    purpose: PurposeZ,
    personas: z.array(PersonaZ).optional(),
    problems: z.array(z.string()).optional(),
    objects: z.array(ModelObjectZ),
    relationships: z.array(RelationshipZ).optional(),
    entities: z.array(EntityZ).optional()
});

export type ModelDesign = z.infer<typeof ModelDesignZ>;


