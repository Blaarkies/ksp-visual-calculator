import { makeIntRange, windowed } from './common';
import { BuiltStructure, ParsedStructure, ParsePoint } from './domain';

function makeParseMap(lines: Indexed<string>[],
                      openChar: string,
                      closeChar: string): ParsePoint[] {
  return lines.reduce((parseMap, c, index) => {
    if (c.value === openChar) {
      parseMap.push({index, depth: 1});
    } else if (c.value === closeChar) {
      parseMap.push({index, depth: -1});
    }
    return parseMap;
  }, <ParsePoint[]>[]);
}

/**
 * Analogous to a function graph plotted with total depth of each index.
 * Returns the list of parse points that intersect the chosen depth level.
 * @param parseMap: List of parse point
 * @param level: Depth level to extract
 */
function getLevelParsePoints(parseMap: ParsePoint[],
                             level: number): ParsePoint[] {
  return parseMap.reduce((sum, c) => {
    if (sum.depth === level && c.depth === 1) {
      sum.results.push(c);
    }

    sum.depth += c.depth;

    if (sum.depth === level && c.depth === -1) {
      sum.results.push(c);
    }

    return sum;
  }, { depth: 0, results: <ParsePoint[]>[]})
    .results;
}

function getProperties(propertyLines: string[]): {} {
  return Object.fromEntries(
    propertyLines.map(l => {
      let indexSeparator = l.indexOf('=');
      return [
        l.slice(0, indexSeparator).trim(),
        l.slice(indexSeparator + 1).trim(),
      ];
    }));
}

function getPropertyLines(childParsePoints: ParsePoint[],
                          lines: Indexed<string>[],
                          parentOpen: ParsePoint,
                          parentClose: ParsePoint): string[] {
  let linesToSkip = windowed(childParsePoints, 2, 2)
    .flatMap(([open, close]) => makeIntRange(open.index - 1, close.index));
  let skipSet = new Set<number>(Object.values(linesToSkip));
  return lines
    .slice(
      1 + lines.findIndex(({index}) => index === parentOpen.index),
      lines.findIndex(({index}) => index === parentClose.index))
    .filter(({index}) => !skipSet.has(index))
    .map(({value}) => value);
}

function parseContents(lines: Indexed<string>[],
                       parseMap: ParsePoint[]): ParsedStructure[] {
  let siblingParsePoints = getLevelParsePoints(parseMap, 0);
  let childParsePoints = getLevelParsePoints(parseMap, 1);

  return windowed(siblingParsePoints, 2, 2)
    .map(([open, close]) => {
      let key = lines
        .find(({index}) => index === open.index - 1)
        .value;

      let propertyLines = getPropertyLines(
        childParsePoints,
        lines,
        open,
        close);

      let contentParseMap = parseMap.slice(
        parseMap.indexOf(open) + 1,
        parseMap.indexOf(close));
      let contents = contentParseMap.length >= 2
        ? parseContents(lines, contentParseMap)
        : null;

      return {
        key,
        properties: getProperties(propertyLines),
        contents,
      };
    });
}

function buildPlainObject(parsedStructures: ParsedStructure[]): BuiltStructure {
  return parsedStructures.reduce((sum, c) => {
    if (!sum[c.key]) {
      sum[c.key] = <BuiltStructure[]>[];
    }
    let contents = c.contents ? buildPlainObject(c.contents) : null;
    sum[c.key].push(<BuiltStructure>{
      properties: c.properties,
      ...contents,
    });

    return sum;
  }, <BuiltStructure>{});
}

interface Indexed<T> {
  value: T;
  index: number;
}
export function parseKspCfgFile(fileText: string): BuiltStructure {
  let lines: Indexed<string>[] = fileText
    .replace(/[\r\t]/g, '')
    .split(/[\n]/g)
    .map((l, index) => ({value: l.trim(), index}));
  let parseMap = makeParseMap(lines, '{', '}');
  let parsedStructures = parseContents(lines, parseMap);
  let builtStructure = buildPlainObject(parsedStructures);

  return builtStructure;
}
