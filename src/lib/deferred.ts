export class Deferred<T> {
  public resolve!: (value: T) => void;
  public reject!: (error: any) => void;

  public promise = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
}
