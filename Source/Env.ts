import { Nullable } from "../Common/types";

export class Env {
  #tokens: { env: string, aliases: string[] }[];

  constructor(...tokens: { env: string, aliases: string[] }[]) {
    this.#tokens = tokens;
  }

  public get<T extends string, R = string>(env: T): Nullable<R> {
    let token: Nullable<R> = null;

    const matchingToken = this.#tokens.find(t => t.env === env);

    if (matchingToken) {
      token = process.env[env] as Nullable<R>;
    } else {
      for (const tokenObj of this.#tokens) {
        if (tokenObj.aliases.includes(env)) {
          token = <Nullable<R>>process.env[tokenObj.env];
          break;
        }
      }
    }

    return token;
  }

  public validate(): void {
    const tableData: { Status: string, Env: string }[] = [];

    for (const token of this.#tokens) {
      const checkToken = this.get<string, string>(token.env);
      tableData.push({ Status: checkToken === null ? "Invalid" : "Valid", Env: token.env });
    }

    console.table(tableData);
  }
}
