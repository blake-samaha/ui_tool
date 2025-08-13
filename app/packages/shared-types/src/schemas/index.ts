import { z } from 'zod';

export const SchemaVersionedZ = z.object({
    schemaVersion: z.string().default('0.1.0')
});
export type SchemaVersioned = z.infer<typeof SchemaVersionedZ>;

// Tier 00 — Solution Design Principles
const AuthenticationZ = z.object({
    method: z.enum(['client_credentials', 'device_code', 'pkce', 'token']),
    authority: z.string().optional(),
    tenantId: z.string().optional(),
    tokenUrl: z.string().optional(),
    audience: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    certificateThumbprint: z.string().optional(),
    scopes: z.array(z.string()).optional(),
    redirectUri: z.string().optional(),
    token: z.string().optional()
});

const EnvironmentZ = z.object({
    name: z.string().min(1),
    cdf_cluster: z.string().min(1),
    cdf_region: z.string().min(1),
    idp_tenant_id: z.string().optional(),
    admin_group_source_id: z.string().optional(),
    user_group_source_id: z.string().optional(),
    authentication: AuthenticationZ.optional()
});

const RawSourceZ = z.object({
    sourceSystem: z.string(),
    database: z.string(),
    tables: z.array(z.string()).min(1),
    description: z.string().optional()
});

const ViewRefZ = z.object({
    space: z.string(),
    externalId: z.string(),
    version: z.string()
});

export const Tier00SolutionDesignZ = z.object({
    schemaVersion: z.number().int().min(1),
    moduleId: z.string().regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/),
    projectId: z.string().optional(),
    environments: z.array(EnvironmentZ).min(1),
    space: z
        .object({
            externalId: z.string().regex(/^[a-z0-9_\-:.]+$/),
            description: z.string().optional()
        })
        .optional(),
    rawSources: z.array(RawSourceZ).optional(),
    toolkit: z
        .object({
            deployStrategy: z.enum(['upsert', 'replace']).optional(),
            dryRun: z.boolean().optional(),
            retries: z
                .object({
                    maxAttempts: z.number().int().min(0).optional(),
                    backoff: z.enum(['exponential', 'linear', 'fixed']).optional(),
                    maxBackoffSeconds: z.number().int().min(0).optional()
                })
                .optional()
        })
        .optional(),
    promotion: z
        .object({
            fromEnv: z.string().optional(),
            toEnv: z.string().optional(),
            guardrails: z.array(z.enum(['diff_only', 'require_approval'])).optional()
        })
        .optional(),
    accessRoles: z
        .array(
            z.object({
                name: z.string(),
                sourceIdVariable: z.string().optional(),
                permissionsSummary: z.string().optional(),
                capabilities: z.array(z.string()).optional()
            })
        )
        .optional(),
    globalStandards: z
        .object({
            globalNamingConvention: z.string().optional(),
            timestampStandard: z.string().optional(),
            requiredPropertyForAllObjects: z.string().optional()
        })
        .optional(),
    coreModelInheritance: z
        .object({
            assetView: ViewRefZ.optional(),
            eventView: ViewRefZ.optional()
        })
        .optional(),
    externalModels: z
        .array(
            z.object({
                space: z.string(),
                models: z.array(z.string()).min(1)
            })
        )
        .optional(),
    observability: z
        .object({
            owner: z.string().optional(),
            sla: z
                .object({
                    freshnessMinutes: z.number().int().min(0).optional(),
                    maxErrorRatePct: z.number().min(0).optional()
                })
                .optional(),
            alerts: z
                .object({
                    channel: z.string().optional(),
                    escalation: z.string().optional()
                })
                .optional()
        })
        .optional(),
    idMacros: z
        .object({
            moduleIdPrefix: z.boolean().default(true).optional(),
            examples: z.array(z.string()).optional()
        })
        .optional()
});
export type Tier00SolutionDesign = z.infer<typeof Tier00SolutionDesignZ>;

// Tier 01 — Conceptual Model
const Tier01ObjectZ = z.object({
    name: z.string(),
    objectId: z.string().regex(/^[a-z][A-Za-z0-9]*$/),
    implementsCore: z.union([
        z.enum(['CogniteAsset', 'CogniteEvent', 'CogniteFile', 'CogniteTimeSeries', 'CogniteSequence']),
        z.array(z.enum(['CogniteAsset', 'CogniteEvent', 'CogniteFile', 'CogniteTimeSeries', 'CogniteSequence'])).min(1)
    ]).optional(),
    viewExternalId: z.string().regex(/^[a-z0-9:_-]+$/).optional(),
    containerExternalId: z.string().regex(/^[a-z0-9:_-]+$/).optional(),
    space: z.string().regex(/^[a-z0-9_:\-:.]+$/),
    viewFilter: z.string().optional(),
    hasData: z.boolean().optional()
});

const Tier01RelationshipZ = z
  .object({
    from: z.string(),
    to: z.string(),
    relationshipId: z.string(),
    description: z.string().optional(),
    type: z.enum(['direct', 'edge']),
    multiplicity: z.enum(['1:1', '1:N', 'N:M']),
    label: z.string().optional(),
    sourceResolution: z.string().optional(),
    edgeSpace: z.string().optional(),
    edgeTypeExternalId: z.string().optional()
  })
  .superRefine((val, ctx) => {
    if (val.type === 'edge') {
      if (!val.edgeSpace) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['edgeSpace'], message: 'edgeSpace is required for edge relationships' });
      if (!val.edgeTypeExternalId) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['edgeTypeExternalId'], message: 'edgeTypeExternalId is required for edge relationships' });
    }
  });

export const Tier01ConceptualModelZ = z.object({
    schemaVersion: z.number().int().min(1),
    moduleId: z.string().regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/),
    objects: z.array(Tier01ObjectZ).min(1),
    relationships: z.array(Tier01RelationshipZ),
    externalReferences: z
        .array(
            z.object({
                externalModel: z.string(),
                space: z.string(),
                implements: z.union([z.string(), z.array(z.string()).min(1)]).optional()
            })
        )
        .optional(),
    dataModel: z.object({
        externalId: z.string(),
        version: z.string(),
        groupedViews: z.array(z.string()).min(1)
    }),
    performanceHints: z
        .object({
            indexes: z
                .array(
                    z.object({
                        onObject: z.string(),
                        fields: z.array(z.string())
                    })
                )
                .optional(),
            uniqueness: z.string().optional()
        })
        .optional()
});
export type Tier01ConceptualModel = z.infer<typeof Tier01ConceptualModelZ>;

// Tier XX — Object Specification
const TierXXPropertyZ = z
    .object({
        name: z.string().regex(/^[a-z][A-Za-z0-9]*$/),
        dataType: z
            .enum(['text', 'int32', 'int64', 'float32', 'float64', 'boolean', 'timestamp', 'date', 'json', 'geojson'])
            .optional(),
        listOf: z
            .enum(['text', 'int32', 'int64', 'float32', 'float64', 'boolean', 'timestamp', 'date', 'json'])
            .optional(),
        nullable: z.boolean(),
        sourceField: z.string().optional(),
        description: z.string().optional(),
        transformationRule: z.string().optional(),
        minimum: z.number().optional(),
        maximum: z.number().optional(),
        minLength: z.number().int().min(0).optional(),
        maxLength: z.number().int().min(0).optional(),
        pattern: z.string().optional(),
        allowedValues: z.array(z.union([z.string(), z.number(), z.boolean()])).optional(),
        unit: z.string().optional()
    })
    .refine((v) => !!v.dataType || !!v.listOf, { message: 'Provide dataType or listOf' });

const TierXXContainerSpecZ = z.object({
    primaryKey: z.string().optional(),
    required: z.array(z.string()).optional(),
    unique: z.array(z.string()).optional(),
    indexes: z
        .array(
            z.object({
                name: z.string(),
                fields: z.array(z.string()).min(1)
            })
        )
        .optional()
});

const TierXXRelationshipZ = z
  .object({
    name: z.string(),
    type: z.enum(['direct', 'edge']),
    sourceField: z.string().optional(),
    targetType: z.string().optional(),
    description: z.string().optional(),
    multiplicity: z.enum(['1:1', '1:N', 'N:M']).optional(),
    label: z.string().optional(),
    resolution: z.string().optional(),
    edgeSpace: z.string().optional(),
    edgeTypeExternalId: z.string().optional()
  })
  .superRefine((val, ctx) => {
    if (val.type === 'edge') {
      if (!val.edgeSpace) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['edgeSpace'], message: 'edgeSpace is required for edge relationships' });
      if (!val.edgeTypeExternalId) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['edgeTypeExternalId'], message: 'edgeTypeExternalId is required for edge relationships' });
    }
  });

const TierXXTimeSeriesZ = z.object({
    name: z.string(),
    sourceExternalIdPattern: z.string(),
    description: z.string().optional()
});

const TierXXTransformationPlanZ = z.object({
    externalId: z.string().optional(),
    engine: z.enum(['sql', 'function']).optional(),
    source: z
        .object({
            type: z.enum(['raw']).optional(),
            database: z.string().optional(),
            table: z.string().optional()
        })
        .optional(),
    target: z
        .object({
            containerExternalId: z.string().optional(),
            upsertKeys: z.array(z.string()).optional(),
            scdType: z.enum(['SCD1', 'SCD2']).optional()
        })
        .optional(),
    schedule: z
        .object({
            cron: z.string().optional(),
            timezone: z.string().optional()
        })
        .optional(),
    idempotent: z.boolean().optional(),
    backfill: z
        .object({
            strategy: z.enum(['full', 'date_range']).optional(),
            from: z.string().optional()
        })
        .optional()
});

export const TierXXObjectSpecificationZ = z.object({
    schemaVersion: z.number().int().min(1),
    moduleId: z.string().regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/),
    objectId: z.string().regex(/^[a-z][A-Za-z0-9]*$/),
    metadata: z
        .object({
            author: z.string().optional(),
            date: z.string().optional(),
            version: z.string().optional()
        })
        .optional(),
    description: z.object({
        summary: z.string(),
        externalId: z.string()
    }),
    identifiers: z.object({
        viewExternalId: z.string().regex(/^[a-z0-9:_-]+$/),
        containerExternalId: z.string().regex(/^[a-z0-9:_-]+$/)
    }),
    dataSource: z.object({
        sourceSystem: z.string(),
        space: z.string().regex(/^[-a-z0-9_:.]+$/),
        primaryRawTable: z.string(),
        lineage: z
            .object({
                inputs: z.array(z.string()).optional(),
                outputs: z.array(z.string()).optional()
            })
            .optional()
    }),
    properties: z.array(TierXXPropertyZ),
    containerSpecification: TierXXContainerSpecZ,
    relationships: z.array(TierXXRelationshipZ),
    viewConfiguration: z
        .object({
            implements: z.union([z.string(), z.array(z.string()).min(1)]).optional(),
            requires: z.union([z.string(), z.array(z.string()).min(1)]).optional(),
            implementsCore: z
                .union([
                    z.enum(['CogniteAsset', 'CogniteEvent', 'CogniteFile', 'CogniteTimeSeries', 'CogniteSequence']),
                    z.array(z.enum(['CogniteAsset', 'CogniteEvent', 'CogniteFile', 'CogniteTimeSeries', 'CogniteSequence'])).min(1)
                ])
                .optional()
        })
        .optional(),
    timeSeries: z.array(TierXXTimeSeriesZ).optional(),
    transformationPlan: TierXXTransformationPlanZ.optional(),
    dataQuality: z
        .object({
            rules: z.array(
                z.object({
                    name: z.string(),
                    type: z.enum(['not_null', 'range', 'regex', 'unique']),
                    field: z.string(),
                    severity: z.enum(['info', 'warn', 'error']).optional(),
                    min: z.number().optional(),
                    max: z.number().optional(),
                    pattern: z.string().optional()
                })
            )
        })
        .optional(),
    observability: z
        .object({
            owner: z.string().optional(),
            sla: z
                .object({
                    freshnessMinutes: z.number().int().min(0).optional(),
                    maxErrorRatePct: z.number().min(0).optional()
                })
                .optional()
        })
        .optional(),
    orchestration: z
        .object({
            playbookExternalId: z.string().optional(),
            tasks: z
                .array(
                    z.object({
                        type: z.enum(['transformation', 'contextualization']),
                        ref: z.string().optional()
                    })
                )
                .optional()
        })
        .optional()
});
export type TierXXObjectSpecification = z.infer<typeof TierXXObjectSpecificationZ>;
