const IGNORED_PROPERTIES = Object.freeze(
  new Set([
    'asymmetricMatch',
    '$$typeof',
    'constructor',
    'toJSON',
    '@@__IMMUTABLE_ITERABLE__@@',
    '@@__IMMUTABLE_RECORD__@@',
    'hasAttribute',
    'nodeType'
  ])
);

export function mockObject<T>(overrides: Partial<T> = {}): T {
  return new Proxy(
    { ...overrides },
    {
      get(innerTarget: any, fnName) {
        if (typeof fnName === 'symbol' || IGNORED_PROPERTIES.has(fnName)) {
          return innerTarget[fnName];
        }

        innerTarget[fnName] =
          fnName in innerTarget ? innerTarget[fnName] : jest.fn();

        return innerTarget[fnName];
      }
    }
  );
}
