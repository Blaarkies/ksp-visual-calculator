import { parseKspCfgFile } from './parser';
import { getFiles, makeDirectory, promptUser, readFile, writeToFile } from './input-output';
import { BuiltStructure, ExtractorConfig, TransformationFunction } from './domain';

type SearchTagFunction = (json: BuiltStructure) => boolean;

let squadPartsPath = '/GameData/Squad/Parts';
let squadExpansionPartsPath = '/GameData/SquadExpansion/Parts';

function filterPaths(paths: string[], foldersToKeep: string[]) {
  return foldersToKeep?.length
    ? paths.filter(p => {
      let pathLower = p.toLowerCase();
      return foldersToKeep.some(f => pathLower.includes(f));
    })
    : paths;
}

async function filterByFolder(paths: string[]): Promise<string[]> {
  let userInput = await promptUser(`
Provide a list of folder names to match. Separated by a space ' '`
    + '\n');
  let foldersToKeep = userInput.split(' ').map(f => f.toLowerCase());
  console.info('Folders to retain: ', foldersToKeep);
  return filterPaths(paths, foldersToKeep);
}

function getTags(text: string): string[] {
  if (!text) {
    return [];
  }
  let notTranslationPart = text.split('=').at(-1).trim();
  let tags = notTranslationPart.split(' ').map(t => t.toLowerCase());
  return tags;
}

function makeSearchTagFn(filterTags: string[]): SearchTagFunction {
  return filterTags?.length
    ? (json: BuiltStructure) => json?.PART?.some(p => {
      let tags = getTags(p.properties.tags);
      return tags.some(t => filterTags.includes(t));
    })
    : null;
}

async function filterByTags(): Promise<SearchTagFunction> {
  let userInput = await promptUser(`
Provide a list of search tags to match. Separated by a space ' '`
    + '\n');
  let filterTags = userInput.split(' ').map(t => t.toLowerCase());
  console.info('Tag to match: ', filterTags);
  return makeSearchTagFn(filterTags);
}

async function askForFiltering(config: ExtractorConfig,
                               paths: string[]): Promise<{ paths, searchFn }> {
  let filterType = await promptUser(`
${paths.length} cfg files found. Do you want to filter the results?
f  = [by folders]
t  = [by tag search]
tf = [by folders + tag search]
n  = [no]`
      + '\n');

  let searchFn;

  switch (filterType) {
    case 'f':
      paths = await filterByFolder(paths);
      break;
    case 't':
      searchFn = await filterByTags();
      break;
    case 'tf':
      paths = await filterByFolder(paths);
      searchFn = await filterByTags();
      break;
    default:
      break;
  }

  return {paths, searchFn};
}

async function setup(config: ExtractorConfig = {},
                     transform: TransformationFunction = item => item) {
  let gamePath = config.gamePath
    ?? await promptUser('Where is the Kerbal Space Program root folder located?'
      + '\n');
  console.info('Game root: ', gamePath)
  let baseFilePaths = await getFiles(gamePath + squadPartsPath, '.cfg');
  let expansionFilePaths = await getFiles(gamePath + squadExpansionPartsPath, '.cfg');
  let allPartPaths = baseFilePaths.concat(expansionFilePaths);

  let {paths, searchFn} = (config.filterFolders || config.filterTags)
    ? {
      paths: filterPaths(allPartPaths, config.filterFolders),
      searchFn: makeSearchTagFn(config.filterTags),
    }
    : await askForFiltering(config, allPartPaths);

  let outputPath = './dist/';
  await makeDirectory(outputPath);

  let count = 0;
  let sum = [];
  for (let path of paths) {
    let fileText = await readFile(path);
    let parsed = parseKspCfgFile(fileText);

    let notInTagSearch = searchFn && !searchFn(parsed);
    if (notInTagSearch) {
      continue;
    }

    let transformed = transform(parsed);

    let entryName = parsed.PART?.[0]?.properties?.name;
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
