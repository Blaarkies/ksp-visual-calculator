/** A semantic version number an unknown format. */
export type VersionValue = (number | string)[] | string;

/**
 * Returns a comparison of the `base` to `target` semantic versioning values.
 * <br>When the `target` value is higher than `base`, it returns `-1` indicating
 * that `base` lags behind `target`.
 * <br>When both versions are equal, it returns `0`.
 * <br>Prefixes are automatically discarded in either value, such as the "v" in `v1.4.2`.
 * The remaining numbers are used for comparison.
 *
 * @example
 * `compareSemver([1,0,0], [1,6,9])` will return `-1`, which indicates that `base` is
 * older than `target`.
 *
 * @param base version value to examine
 * @param target intended version value to reference
 */
export function compareSemver(base: VersionValue, target: VersionValue): number {
  let cleanBase = getVersioningValue(base);
  let cleanTarget = getVersioningValue(target);

  if (cleanBase.length !== 3 || cleanTarget.length !== 3) {
    let stringValues = `(base:${base.toString()}), (target:${target.toString()}).`;
    throw Error('Supplied version values must be arrays of 3 number elements '
      + stringValues);
  }

  if (cleanBase.equal(cleanTarget)) {
    return 0;
  }

  for (let i of [0, 1, 2]) {
    let versionDifference = cleanBase[i] - cleanTarget[i];
    if (versionDifference) {
      return versionDifference < 0
        ? -1
        : 1;
    }
  }

  let stringValues = `(base:${base.toString()}), (target:${target.toString()})`;
  throw Error('Cannot compare semver values ' + stringValues);
}

function getVersioningValue(versionValue: VersionValue): number[] {
  let versionList = typeof versionValue === 'string'
    ? versionValue.split('.')
    : versionValue;
  return versionList.map(e => typeof e === 'number'
    ? e
    : e.replace(/\D/g, '').toNumber());
}
