// Registry of known core and process industry views for multiselect controls.
// Source: Cognite Core Data Model and Process Industry Data Model documentation.
export const KNOWN_CORE_VIEWS: Array<{ value: string; label: string }> = [
  // Core concepts
  { value: 'CogniteAsset', label: 'CogniteAsset' },
  { value: 'CogniteAssetClass', label: 'CogniteAssetClass' },
  { value: 'CogniteAssetType', label: 'CogniteAssetType' },
  { value: 'CogniteEquipment', label: 'CogniteEquipment' },
  { value: 'CogniteEquipmentType', label: 'CogniteEquipmentType' },
  { value: 'CogniteFile', label: 'CogniteFile' },
  { value: 'CogniteFileCategory', label: 'CogniteFileCategory' },
  { value: 'CogniteTimeSeries', label: 'CogniteTimeSeries' },
  { value: 'CogniteSequence', label: 'CogniteSequence' },
  { value: 'CogniteEvent', label: 'CogniteEvent' },
  { value: 'CogniteActivity', label: 'CogniteActivity' },
  { value: 'CogniteAnnotation', label: 'CogniteAnnotation' },
  { value: 'CogniteDiagramAnnotation', label: 'CogniteDiagramAnnotation' },
  { value: 'CogniteUnit', label: 'CogniteUnit' },
  // 3D-related concepts (views and view-only types)
  { value: 'Cognite3DObject', label: 'Cognite3DObject' },
  { value: 'Cognite3DModel', label: 'Cognite3DModel' },
  { value: 'CogniteCADModel', label: 'CogniteCADModel (view only)' },
  { value: 'Cognite3DRevision', label: 'Cognite3DRevision' },
  { value: 'CognitePointCloudModel', label: 'CognitePointCloudModel (view only)' },
  { value: 'Cognite360ImageModel', label: 'Cognite360ImageModel (view only)' },
  { value: 'CogniteCADRevision', label: 'CogniteCADRevision' },
  { value: 'CognitePointCloudRevision', label: 'CognitePointCloudRevision' },
  { value: 'Cognite360ImageCollection', label: 'Cognite360ImageCollection (view only)' },
  { value: 'CogniteCADNode', label: 'CogniteCADNode' },
  { value: 'CognitePointCloudVolume', label: 'CognitePointCloudVolume' },
  { value: 'Cognite360Image', label: 'Cognite360Image' },
  { value: 'Cognite360ImageStation', label: 'Cognite360ImageStation (view only)' },
  { value: 'Cognite360ImageAnnotation', label: 'Cognite360ImageAnnotation' }
];

// Extendable: Add process industry model types as needed
export const KNOWN_PROCESS_VIEWS: Array<{ value: string; label: string }> = [
  // Process Industry Data Model concepts (expand as needed)
  { value: 'CogniteProcessUnit', label: 'CogniteProcessUnit' },
  { value: 'CogniteProcessSystem', label: 'CogniteProcessSystem' },
  { value: 'CogniteProcessArea', label: 'CogniteProcessArea' },
  { value: 'CognitePipingNetwork', label: 'CognitePipingNetwork' },
  { value: 'CognitePipeline', label: 'CognitePipeline' },
  { value: 'CogniteLine', label: 'CogniteLine' },
  { value: 'CogniteValve', label: 'CogniteValve' },
  { value: 'CognitePSV', label: 'CognitePSV (Pressure Safety Valve)' },
  { value: 'CogniteReliefValve', label: 'CogniteReliefValve' },
  { value: 'CogniteOrificePlate', label: 'CogniteOrificePlate' },
  { value: 'CogniteFlowMeter', label: 'CogniteFlowMeter' },
  { value: 'CognitePump', label: 'CognitePump' },
  { value: 'CogniteCompressor', label: 'CogniteCompressor' },
  { value: 'CogniteFan', label: 'CogniteFan' },
  { value: 'CogniteBlower', label: 'CogniteBlower' },
  { value: 'CogniteHeatExchanger', label: 'CogniteHeatExchanger' },
  { value: 'CogniteCondenser', label: 'CogniteCondenser' },
  { value: 'CogniteEvaporator', label: 'CogniteEvaporator' },
  { value: 'CogniteBoiler', label: 'CogniteBoiler' },
  { value: 'CogniteFurnace', label: 'CogniteFurnace' },
  { value: 'CogniteChiller', label: 'CogniteChiller' },
  { value: 'CogniteCoolingTower', label: 'CogniteCoolingTower' },
  { value: 'CogniteTank', label: 'CogniteTank' },
  { value: 'CogniteVessel', label: 'CogniteVessel' },
  { value: 'CogniteColumn', label: 'CogniteColumn' },
  { value: 'CogniteDrum', label: 'CogniteDrum' },
  { value: 'CogniteSeparator', label: 'CogniteSeparator' },
  { value: 'CogniteMixer', label: 'CogniteMixer' },
  { value: 'CogniteFilter', label: 'CogniteFilter' },
  { value: 'CogniteInstrument', label: 'CogniteInstrument' },
  { value: 'CogniteSensor', label: 'CogniteSensor' },
  { value: 'CogniteActuator', label: 'CogniteActuator' },
  { value: 'CogniteMotor', label: 'CogniteMotor' },
  { value: 'CogniteGearbox', label: 'CogniteGearbox' },
  { value: 'CogniteReducer', label: 'CogniteReducer' },
  { value: 'CogniteGenerator', label: 'CogniteGenerator' },
  { value: 'CogniteTurbine', label: 'CogniteTurbine' }
];

export const ALL_KNOWN_VIEWS = [...KNOWN_CORE_VIEWS, ...KNOWN_PROCESS_VIEWS];


