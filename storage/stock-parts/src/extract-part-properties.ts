import {
  CustomFn,
  ExtractorConfig,
  FilterConfig,
  SfsPartStructure,
  TransformationFunction,
} from './domain/domain';
import {
  getFiles,
  makeDirectory,
  readFile,
  writeToFile,
} from './input-output';
import { sfsParser } from './parser/sfs-parser';
import { SafeCalledFn } from './domain/safe-called-fn';

let squadPartsPath = '/GameData/Squad/Parts';
let squadExpansionPartsPath = '/GameData/SquadExpansion/Parts';

function filterFolders(paths: string[], filter: FilterConfig): string[] {
  const regExpFolder = /^(.*)\/[^/]+$/i;

  let wFilter = filter?.whitelist?.folders?.map(path => new RegExp(path, 'i'));
  let wFolders = wFilter?.length // check if any filter elements exist inside the folder string
    ? paths.filter(p => wFilter.some(reg => p.match(regExpFolder)[1].match(reg)?.[0]))
    : paths;

  let bFilter = filter?.blacklist?.folders?.map(path => new RegExp(path, 'i'));
  let bFolders = bFilter?.length // check if zero filter elements exist inside the folder string
    ? wFolders.filter(p => !bFilter.some(reg => p.match(regExpFolder)[1].match(reg)?.[0]))
    : wFolders;

  return bFolders;
}

function filterFiles(paths: string[], filter: FilterConfig): string[] {
  const regExpFilename = /[^/]+$/i;

  let wFilter = filter?.whitelist?.files?.map(path => new RegExp(path, 'i'));
  let wPaths = wFilter?.length // check if any filters exist inside filename
    ? paths.filter(p => wFilter.some(reg => p.match(regExpFilename)[0].match(reg)?.[0]))
    : paths;

  let bFilter = filter.blacklist?.files?.map(path => new RegExp(`${path}`));
  let bPaths = bFilter?.length // check if zero filters exist inside filename
    ? wPaths.filter(p => !bFilter.some(reg => p.match(regExpFilename)[0].match(reg)?.[0]))
    : wPaths;

  return bPaths;
}

function filterTags(tagString: string, filter: FilterConfig): boolean {
  let wFilter = filter?.whitelist?.tags?.map(tag => new RegExp(tag, 'i'));
  let tagsPass = wFilter?.length
    ? wFilter.some(reg => tagString.match(reg)?.[0])
    : true;

  let bFilter = filter?.blacklist?.tags?.map(tag => new RegExp(tag, 'i'));
  tagsPass = tagsPass
    && (bFilter?.length
      ? !bFilter.some(reg => tagString.match(reg)?.[0])
      : true);

  return tagsPass;
}

async function setup(config: ExtractorConfig = {},
                     transform: TransformationFunction = item => item) {
  let gamePath = config.gamePath;
  let baseFilePaths = await getFiles(gamePath + squadPartsPath, '.cfg');
  let expansionFilePaths = await getFiles(gamePath + squadExpansionPartsPath, '.cfg');
  let allPartPaths = baseFilePaths.concat(expansionFilePaths);

  let filteredFolders = filterFolders(allPartPaths, config.filter);
  let filteredPaths = filterFiles(filteredFolders, config.filter);

  let wCustomFn = SafeCalledFn.Create(config.filter?.whitelist?.customFn, true);
  if (config.filter?.whitelist?.customFn) {
    filteredPaths = filteredPaths.filter(p => wCustomFn.call(null, null, p));
  }

  let bCustomFn = SafeCalledFn.Create(config.filter?.blacklist?.customFn, false);
  if (config.filter?.blacklist?.customFn) {
    filteredPaths = filteredPaths.filter(p => !bCustomFn.call(null, null, p));
  }

  let outputPath = './dist/';
  await makeDirectory(outputPath);

  let count = 0;
  let sum = [];
  for (let path of filteredPaths) {
    let fileText = await readFile(path);

    let shouldKeepFileText = wCustomFn.call(fileText, null, path)
      && !bCustomFn.call(fileText, null, path);
    if (!shouldKeepFileText) {
      continue;
    }

    let parsed: SfsPartStructure;
    try {
      parsed = sfsParser.parse(fileText);
    } catch (error) {
      console.error('File path:', path);
      throw error;
    }

    let tagString = parsed.PART[0].tags[0].replaceAll(/[^a-z0-9 ]+/ig, '');
    let shouldKeepTags = filterTags(tagString, config.filter);
    if (!shouldKeepTags) {
      continue;
    }

    let shouldKeepParsed = wCustomFn.call(fileText, parsed, path)
      && !bCustomFn.call(fileText, parsed, path);
    if (!shouldKeepParsed) {
      continue;
    }

    let transformed = transform(parsed, path);

    let entryName = parsed.PART?.[0]?.name[0];
    if (config.outputMode === 'one-file') {
      sum.push(transformed);
    } else {
      await writeToFile(outputPath + entryName + '.json', JSON.stringify(transformed));
    }

    count++;
  }
  if (config.outputMode === 'one-file') {
    await writeToFile(outputPath + 'entries.json', JSON.stringify(sum));
  }
  console.info(`Extracted ${count} file(s) into [${outputPath}]`);
}

export async function extract(config?: ExtractorConfig, transform?: TransformationFunction) {
  await setup(config, transform)
    .then(() => console.info(`Operation complete`))
    .catch(e => console.error('Operation failed', e))
    .finally(() => process.exit(0));
}
