export type CdmType = { space: string; externalId: string; version?: string; label: string; category?: 'core-concept' | 'core-feature' | '3d' | 'pid' };

// Pinned catalog built exclusively from the Industrial Graph (CDM) — not legacy asset hierarchy/resources
// Names and versions reflect CDM view identifiers under the canonical space `cdf_cdm`.
const PINNED_CATALOG: ReadonlyArray<CdmType> = [
  // Core concepts (implementable)
  { space: 'cdf_cdm', externalId: 'CogniteAsset', version: 'v1', label: 'CogniteAsset (CDM v1)', category: 'core-concept' },
  { space: 'cdf_cdm', externalId: 'CogniteEquipment', version: 'v1', label: 'CogniteEquipment (CDM v1)', category: 'core-concept' },
  { space: 'cdf_cdm', externalId: 'CogniteActivity', version: 'v1', label: 'CogniteActivity (CDM v1)', category: 'core-concept' },
  { space: 'cdf_cdm', externalId: 'CogniteFile', version: 'v1', label: 'CogniteFile (CDM v1)', category: 'core-concept' },
  { space: 'cdf_cdm', externalId: 'CogniteTimeSeries', version: 'v1', label: 'CogniteTimeSeries (CDM v1)', category: 'core-concept' },
  { space: 'cdf_cdm', externalId: 'CogniteAnnotation', version: 'v1', label: 'CogniteAnnotation (CDM v1)', category: 'core-concept' },
  { space: 'cdf_cdm', externalId: 'CogniteUnit', version: 'v1', label: 'CogniteUnit (CDM v1)', category: 'core-concept' },

  // Core features (optional; can be implemented for shared properties)
  { space: 'cdf_cdm', externalId: 'CogniteDescribable', version: 'v1', label: 'CogniteDescribable (CDM v1)', category: 'core-feature' },
  { space: 'cdf_cdm', externalId: 'CogniteSourceable', version: 'v1', label: 'CogniteSourceable (CDM v1)', category: 'core-feature' },
  { space: 'cdf_cdm', externalId: 'CogniteSourceSystem', version: 'v1', label: 'CogniteSourceSystem (CDM v1)', category: 'core-feature' },
  { space: 'cdf_cdm', externalId: 'CogniteSchedulable', version: 'v1', label: 'CogniteSchedulable (CDM v1)', category: 'core-feature' },
  { space: 'cdf_cdm', externalId: 'CogniteVisualizable', version: 'v1', label: 'CogniteVisualizable (CDM v1)', category: 'core-feature' },

  // 3D concepts (often not used for implements in PoC but included for completeness)
  { space: 'cdf_cdm', externalId: 'Cognite3DObject', version: 'v1', label: 'Cognite3DObject (CDM v1)', category: '3d' },
  { space: 'cdf_cdm', externalId: 'Cognite3DModel', version: 'v1', label: 'Cognite3DModel (CDM v1)', category: '3d' },
  { space: 'cdf_cdm', externalId: 'Cognite3DRevision', version: 'v1', label: 'Cognite3DRevision (CDM v1)', category: '3d' },
  { space: 'cdf_cdm', externalId: 'CogniteCADModel', version: 'v1', label: 'CogniteCADModel (view only) (CDM v1)', category: '3d' },
  { space: 'cdf_cdm', externalId: 'CognitePointCloudModel', version: 'v1', label: 'CognitePointCloudModel (view only) (CDM v1)', category: '3d' },
  { space: 'cdf_cdm', externalId: 'Cognite360ImageModel', version: 'v1', label: 'Cognite360ImageModel (view only) (CDM v1)', category: '3d' },
  { space: 'cdf_cdm', externalId: 'CogniteCADRevision', version: 'v1', label: 'CogniteCADRevision (CDM v1)', category: '3d' },
  { space: 'cdf_cdm', externalId: 'CognitePointCloudRevision', version: 'v1', label: 'CognitePointCloudRevision (CDM v1)', category: '3d' },
  { space: 'cdf_cdm', externalId: 'Cognite360ImageCollection', version: 'v1', label: 'Cognite360ImageCollection (view only) (CDM v1)', category: '3d' },
  { space: 'cdf_cdm', externalId: 'CogniteCADNode', version: 'v1', label: 'CogniteCADNode (CDM v1)', category: '3d' },
  { space: 'cdf_cdm', externalId: 'CognitePointCloudVolume', version: 'v1', label: 'CognitePointCloudVolume (CDM v1)', category: '3d' },
  { space: 'cdf_cdm', externalId: 'Cognite360Image', version: 'v1', label: 'Cognite360Image (CDM v1)', category: '3d' },
  { space: 'cdf_cdm', externalId: 'Cognite360ImageStation', version: 'v1', label: 'Cognite360ImageStation (view only) (CDM v1)', category: '3d' },
  { space: 'cdf_cdm', externalId: 'Cognite360ImageAnnotation', version: 'v1', label: 'Cognite360ImageAnnotation (CDM v1)', category: '3d' },
];

export async function getCdmCatalog(): Promise<ReadonlyArray<CdmType>> {
  return PINNED_CATALOG;
}

export async function getImplementableCoreTypes(): Promise<ReadonlyArray<CdmType>> {
  const all = await getCdmCatalog();
  return all.filter((t) => t.category === 'core-concept' || t.category === 'core-feature');
}

export function formatCdmTemplateValue(t: CdmType): string {
  return `${t.space}:${t.externalId}${t.version ? '@' + t.version : ''}`;
}

export function parseCdmTemplateValue(value: string): { space?: string; externalId?: string; version?: string } {
  const v = String(value || '').trim();
  if (!v) return {};
  const partsAt = v.split('@');
  const left = partsAt[0];
  const ver = partsAt.length > 1 ? partsAt.slice(1).join('@') : undefined;
  if (!left || left.indexOf(':') === -1) return {};
  const [space, externalId] = left.split(':');
  if (!space || !externalId) return {};
  return { space, externalId, version: ver };
}


