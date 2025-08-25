import { z } from 'zod';

export const EntityImplementsRefZ = z.object({
    space: z.string().min(1),
    externalId: z.string().min(1),
    version: z.string().optional()
});

export const EntitySourceHintZ = z.object({
    system: z.string().optional(),
    resource: z.string().optional(),
    fields: z.array(z.string()).optional()
});

export const EntityAttributeZ = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    nullable: z.boolean().optional(),
    default: z.any().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional()
});

export const EntityConstraintZ = z.object({
    kind: z.enum(['primary', 'unique', 'foreign', 'check']),
    fields: z.array(z.string()),
    expression: z.string().optional()
});

export const EntityValidationZ = z.object({
    name: z.string().min(1),
    intent: z.string().min(1),
    severity: z.enum(['warning', 'error']).optional()
});

export const EntityTransformationZ = z.object({
    name: z.string().min(1),
    intent: z.string().min(1),
    sourceHints: z.array(EntitySourceHintZ).optional(),
    notes: z.string().optional()
});

export const EntityRelationshipZ = z.object({
    type: z.string().min(1),
    to: z.union([
        z.object({ space: z.string(), externalId: z.string(), version: z.string().optional() }),
        z.object({ module: z.string(), object: z.string() })
    ]),
    description: z.string().optional()
});

export const EntitySpecZ = z.object({
    name: z.string().min(1),
    space: z.string().min(1),
    externalId: z.string().min(1),
    implements: z.array(EntityImplementsRefZ).optional(),
    sources: z.array(z.object({ system: z.string(), resource: z.string(), description: z.string().optional(), keys: z.array(z.string()).optional() })).optional(),
    attributes: z.array(EntityAttributeZ).optional(),
    constraints: z.array(EntityConstraintZ).optional(),
    validations: z.array(EntityValidationZ).optional(),
    transformations: z.array(EntityTransformationZ).optional(),
    security: z.object({ groups: z.array(z.string()).optional(), categories: z.array(z.string()).optional() }).optional(),
    relationships: z.array(EntityRelationshipZ).optional()
});

export const EntitySpecsZ = z.object({
    specVersion: z.string(),
    module: z.string().min(1),
    entities: z.array(EntitySpecZ).min(1)
});

export type EntitySpecs = z.infer<typeof EntitySpecsZ>;


