import { StateRow } from './state-row';

describe('StateRow class', () => {

  it('should construct correctly', () => {
    let state = new StateRow({
      name: 'test-name',
      timestamp: {seconds: 42},
      version: [1, 0, 0],
      state: 'test-state',
      context: 'test-context' as any,
    });

    expect(state.name).toBe('test-name');
    expect(state.timestamp.length).toBeGreaterThan(2);
    expect(state.versionLabel).toBe('v1.0.0');
    expect(state.state).toBe('test-state');
  });

  it('toUpdatedStateGame() should update timestamp', () => {
    let state = new StateRow({
      name: 'test-name',
      timestamp: {seconds: 42},
      version: [1, 0, 0],
      state: `{
        "name": "new-name",
        "timestamp": "abc",
        "version": [42]
      }`,
      context: 'test-context' as any,
    });

    let stateGame = state.toUpdatedStateGame();

    expect(stateGame.name).toBe('test-name');
    expect(stateGame.timestamp).toBeGreaterThan(2);
    expect(stateGame.version).not.toEqual([42]);
  });

});
