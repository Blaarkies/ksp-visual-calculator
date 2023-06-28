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

interface SfsPartProperties {
  name: string[];
  title?: string[];
  tags?: string[];
  cost?: string[];
  mass?: string[];

  amount?: string[];
  maxAmount?: string[];
  chargeRate?: string[];
  rate?: string[];
  maxEnergyTransfer?: string[];

  ResourceName?: ResourceName[];
  Ratio?: string[];
  Efficiency?: string[];
  MaxCoolant?: string[];
  ConverterName?: string[];
}

export interface SfsPartStructure extends SfsPartProperties {
  PART?: SfsPartStructure[];
  RESOURCE?: SfsPartStructure[];
  MODULE?: SfsPartStructure[];
  KERBAL?: SfsPartStructure[];
  INPUT_RESOURCE?: SfsPartStructure[];
  OUTPUT_RESOURCE?: SfsPartStructure[];
}

export type OutputMode = 'part-name-each-file' | 'one-file';

export interface ExtractorConfig {
  gamePath?: string;
  outputMode?: OutputMode;
  filter?: FilterConfig;
}

export interface FilterConfig {
  whitelist?: FilterDomains;
  blacklist?: FilterDomains;
}

interface FilterDomains {
  folders?: string[];
  files?: string[];
  tags?: string[];
  customFn?: CustomFn;
}

export type CustomFn = (fileText: string, parsed: unknown, path: string) => boolean;

export type TransformationFunction = (parsed: SfsPartStructure, path: string) => unknown;
