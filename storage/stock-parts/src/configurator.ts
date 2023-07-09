import { EventEmitter } from 'events';
import { QuestionCollection } from 'inquirer';
import {
  ExtractorConfig,
  FilterConfig,
  OutputMode,
} from './domain/domain';

const inquirer = require('inquirer');

type MenuAction = (answers: unknown) => void;

let toLabel = (text: string) => {
  return text
    ? truncateString(text, 15)
    : 'None';
};

function truncateString(string, limit) {
  return string.length > limit
    ? string.substring(0, limit) + '...'
    : string;
}

export enum ConfiguratorEvents {
  run = 'run'
}

enum FilterShorthand {
  wFolders = 'whitelist_folders',
  wPaths = 'whitelist_paths',
  wTags = 'whitelist_tags',
  wCustomFn = 'whitelist_customFn',
  bFolders = 'blacklist_folders',
  bPaths = 'blacklist_paths',
  bTags = 'blacklist_tags',
  bCustomFn = 'blacklist_customFn',
}

let delimiter = ',';

export class Configurator {

  private menuMain: QuestionCollection = [
    {
      type: 'list',
      name: 'menuSelection',
      message: 'Configuration Setup',
      askAnswered: true,
      loop: false,
      choices: answers => [
        {value: 'gamePath', name: `KSP Folder Path: ${answers.gamePath ?? 'Required'}`},
        {value: 'outputMode', name: `Output Mode:     ${this.outputModeToString(answers.outputMode)}`},
        {value: 'filter', name: `Filters:         ${this.filtersToString(answers.filter)}`},
        {type: 'separator'},
        {value: 'run', name: `Run Extraction`},
      ],
    },
  ];

  private menuGamePath: QuestionCollection = [
    {
      type: 'input',
      name: 'gamePath',
      message: 'Where is the Kerbal Space Program root folder located?',
      askAnswered: true,
      default: __dirname,
    },
  ];

  private menuOutputMode: QuestionCollection = [
    {
      type: 'list',
      name: 'outputMode',
      message: 'Concatenate the results into a single file, or use a separate file for each result?',
      askAnswered: true,
      choices: [
        {name: 'Single File', value: 'one-file'},
        {name: 'Multiple Files', value: 'part-name-each-file'},
      ] as { name: string, value: OutputMode }[],
    },
  ];

  private menuFilter: QuestionCollection = [
    {
      type: 'list',
      name: 'filterSelection',
      message: 'Filter out ranges of files',
      askAnswered: true,
      loop: false,
      choices: a => [
        {value: 'back', name: `Back`},
        {type: 'separator'},
        {value: FilterShorthand.wFolders, name: `Whitelist Folders:         ${toLabel(a.whitelist_folders)}`},
        {value: FilterShorthand.wPaths, name: `Whitelist Files:           ${toLabel(a.whitelist_paths)}`},
        {value: FilterShorthand.wTags, name: `Whitelist Search Tags:     ${toLabel(a.whitelist_tags)}`},
        {value: FilterShorthand.wCustomFn, name: `Whitelist Custom Function: ${toLabel(a.whitelist_customFn)}`},
        {value: FilterShorthand.bFolders, name: `Blacklist Folders:         ${toLabel(a.blacklist_folders)}`},
        {value: FilterShorthand.bPaths, name: `Blacklist Files:           ${toLabel(a.blacklist_paths)}`},
        {value: FilterShorthand.bTags, name: `Blacklist Search Tags:     ${toLabel(a.blacklist_tags)}`},
        {value: FilterShorthand.bCustomFn, name: `Blacklist Custom Function: ${toLabel(a.blacklist_customFn)}`},
      ],
    },
  ];

  private questionActionMap = new Map<QuestionCollection, MenuAction>([
    [this.menuMain, a => this.handleSelectionMainMenu(a)],
    [this.menuGamePath, a => this.callMenu(this.menuMain, a)],
    [this.menuOutputMode, a => this.callMenu(this.menuMain, a)],
    [this.menuFilter, a => this.handleSelectionFilterMenu(a)],
  ]);

  private handleSelectionFilterMenu(a) {
    let filterSelection = a.filterSelection;
    if (filterSelection === 'back') {
      return this.callMenu(this.menuMain, a);
    }
    let [filterType, entityType] = filterSelection.split('_');

    let filterTypeMessage = filterType === 'whitelist'
      ? 'kept'
      : 'excluded';
    let entityTypeMessage = entityType === 'folders'
      ? entityType
      : entityType === 'paths'
        ? 'files'
        : entityType === 'tags'
          ? 'search tags'
          : entityType;

    let message = entityType === 'customFn'
      ? this.getCustomFunctionMessage(filterTypeMessage)
      : `Provide a comma(,) separated list for ${entityTypeMessage} to be ${filterTypeMessage}.`;

    let question: QuestionCollection = [
      {
        type: 'input',
        name: filterSelection,
        message,
        askAnswered: true,
        default: filterSelection,
      },
    ];
    this.callMenu(question, a,
      a => this.callMenu(this.menuFilter, this.getFormalizedConfig(a)));
  }

  private getCustomFunctionMessage(filterTypeMessage: string) {
    return `Provide a javascript function body that returns a true boolean if the file needs to be ${filterTypeMessage}.`
      + `\nThese parameters are given: (fileText: string, parsed: string, path: string) => boolean;`
      + `\nExample:  let isTooSmall = fileText.length < 200; return isTooSmall;\n`
      + `\nThis function will be called at different depth with a variety of missing arguments.`;
  }

  private handleSelectionMainMenu(a) {
    let selection: 'gamePath' | 'outputMode' | 'filter' | 'run' = a.menuSelection;
    switch (selection) {
      case 'gamePath':
        this.callMenu(this.menuGamePath, a);
        break;
      case 'outputMode':
        this.callMenu(this.menuOutputMode, a);
        break;
      case 'filter':
        this.callMenu(this.menuFilter, a);
        break;
      case 'run':
        let formalConfig: ExtractorConfig = {
          gamePath: a.gamePath,
          outputMode: a.outputMode,
          filter: a.filter,
        };
        this.emitEvent.emit(ConfiguratorEvents.run, formalConfig);
        break;
    }
  }

  emitEvent = new EventEmitter();

  constructor(config: ExtractorConfig = {outputMode: 'one-file', filter: {}}) {
    let safeConfig = this.getSafeConfig(config);
    this.callMenu(this.menuMain, safeConfig);
  }

  private async callMenu(questions: QuestionCollection,
                   initialAnswers: ExtractorConfig,
                   overrideAction?: MenuAction) {
    let action = overrideAction ?? this.questionActionMap.get(questions);
    let answers = await inquirer.prompt(questions, initialAnswers);
    action(answers);
  }

  private filtersToString(filter: FilterConfig): string {
    if (filter?.whitelist || filter?.blacklist) {
      return 'Multiple';
    }
    return 'None';
  }

  private outputModeToString(outputMode: OutputMode) {
    switch (outputMode) {
      case 'one-file':
        return 'Single File';
      case 'part-name-each-file':
        return 'Multiple Files';
    }
  }

  private reduceFilterShorthandToObject(list: (string | unknown)[][])
    : { whitelist: {}, blacklist: {} } {
    return list.reduce((sum, c) => {
      let key = c[0] as string;
      let property = key.split('_')[1];
      let listType = key.includes('blacklist') ? 'whitelist' : 'blacklist';
      sum[listType][property] = c[1];
      return sum;
    }, {whitelist: {}, blacklist: {}});
  }

  private getFormalizedConfig(answers: unknown): ExtractorConfig {
    let filterOptions = Object.entries(answers)
      .filter(([k]) => k.includes('whitelist') || k.includes('blacklist'));

    let listedValues = filterOptions
      .filter(([k]) => !k.includes('customFn'))
      .map(([k, v]: [string, string]) => [k, v?.split(delimiter)]);
    let reducedValues = this.reduceFilterShorthandToObject(listedValues);

    let customFns = filterOptions
      .filter(([k]) => k.includes('customFn'))
      .map(([k, v]: [string, string]) => [k, new Function('fileText', 'parsed', 'path', v)]);
    let reducedCustomFns = this.reduceFilterShorthandToObject(customFns);

    let asConfig = answers as ExtractorConfig;
    return {
      ...asConfig,
      filter: {
        ...asConfig.filter,
        whitelist: {
          ...asConfig.filter?.whitelist,
          ...reducedValues.whitelist,
          ...reducedCustomFns.whitelist,
        },
        blacklist: {
          ...asConfig.filter?.blacklist,
          ...reducedValues.blacklist,
          ...reducedCustomFns.blacklist,
        },
      },
    };
  }

  private getSafeConfig(config: ExtractorConfig): unknown {
    let w = config.filter?.whitelist;
    let b = config.filter?.blacklist;
    return {
      ...config,
      [FilterShorthand.wFolders]: w?.folders?.join(delimiter),
      [FilterShorthand.wPaths]: w?.files?.join(delimiter),
      [FilterShorthand.wTags]: w?.tags?.join(delimiter),
      [FilterShorthand.wCustomFn]: this.getSerializedFunction(w?.customFn),
      [FilterShorthand.bFolders]: b?.folders?.join(delimiter),
      [FilterShorthand.bPaths]: b?.files?.join(delimiter),
      [FilterShorthand.bTags]: b?.tags?.join(delimiter),
      [FilterShorthand.bCustomFn]: this.getSerializedFunction(b?.customFn),
    };
  }

  private getSerializedFunction(customFunction: Function): string {
    if (!customFunction) {
      return undefined;
    }
    const pattern = /{([^{}]+)}/;
    const match = customFunction.toString().match(pattern);
    return match[1];
  }
}
