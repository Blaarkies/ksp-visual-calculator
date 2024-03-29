import {
  extensionAlso,
  extensionLet,
} from './callback-extensions';

export {}; // this file needs to be a module

String.prototype.let = extensionLet<string>;
String.prototype.also = extensionAlso<string>;

String.prototype.includesSome = function (this: string, list: string[]): boolean {
  return list.some(l => this.includes(l));
};

String.prototype.toTitleCase = function (this: string): string {
  return this.replace(
    /([^\W_]+[^\s-]*) */g, // match words separated by space/dash
    word => word[0].toUpperCase() + word.slice(1).toLowerCase());
};

String.prototype.like = function (this: string, search: string): boolean {
  const cleanThis = this.trim().toLowerCase();
  const cleanSearch = search.trim().toLowerCase();
  return cleanThis === cleanSearch;
};

String.prototype.fuzzyMatch = function (this: string, search: string): boolean {
  const cleanThis = this.trim().toLowerCase();
  const cleanSearch = search.trim().toLowerCase();
  if (cleanThis.includes(cleanSearch)) {
    return true;
  }

  return cleanSearch.match(/\S+/g)
    .every(word => cleanThis.includes(word));
};

String.prototype.relevanceScore = function (this: string, search: string): number {
  const cleanThis = this.trim().toLowerCase();
  const cleanSearch = search.trim().toLowerCase();

  let relevanceScore = 0;
  // Exact match
  relevanceScore += cleanThis.includes(cleanSearch) ? 1 : 0;

  const searchWords = cleanSearch.match(/\S+/g);
  if (searchWords) {
    // +1 point for every contained word
    relevanceScore += searchWords.count(word => cleanThis.includes(word));
    // + score if search matches from the very start
    let foundAt = cleanThis.indexOf(searchWords[0]);
    relevanceScore += (foundAt > -1)
      ? cleanThis.length - 1 - foundAt
      : 0;
  }

  return relevanceScore;
};

String.prototype.toNumber = function (this: String): number {
  if (this === '' || this === undefined || this === null) {
    return Number.NaN;
  }
  return Number(this);
};

String.prototype.toBoolean = function (this: String): boolean {
  return this === 'true';
};
