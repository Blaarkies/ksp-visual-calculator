export interface ParsePoint {
  index: number;
  depth: number;
}

export interface ParsedStructure {
  key: string;
  properties: {};
  contents?: ParsedStructure[];
}

export type ResourceName = 'ElectricCharge'
  | 'LiquidFuel'
  | 'Oxidizer'
  | 'Ore'
  | 'MonoPropellant';

export type ModuleName = 'ModuleResourceConverter'
  | 'ModuleCoreHeat'
  | 'ModuleDeployableSolarPanel'
  | 'ModuleGenerator'
  | 'ModuleResourceHarvester';

interface BuiltProperties {
  name: string;
  title?: string;
  tags?: string;
  cost?: string;
  mass?: string;

  amount?: string;
  maxAmount?: string;
  chargeRate?: string;
  rate?: string;
  maxEnergyTransfer?: string;

  ResourceName?: ResourceName;
  Ratio?: string;
  Efficiency?: string;
  MaxCoolant?: string;
  ConverterName?: string;
}

export interface BuiltStructure {
  properties: BuiltProperties;

  PART?: BuiltStructure[];
  RESOURCE?: BuiltStructure[];
  MODULE?: BuiltStructure[];
  KERBAL?: BuiltStructure[];
  INPUT_RESOURCE?: BuiltStructure[];
  OUTPUT_RESOURCE?: BuiltStructure[];

  ResourceName?: ResourceName;
  Ratio?: string;
}

export interface ExtractorConfig {
  gamePath?: string;
  filterForFolders?: string[];
  filterNotFolders?: string[];
  filterForTags?: string[];
  filterNotTags?: string[];
  outputMode?: 'part-name-each-file' | 'one-file';
}

export type TransformationFunction = (cfgStructure: BuiltStructure) => {};
