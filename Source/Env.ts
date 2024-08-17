/* eslint @typescript-eslint/no-explicit-any: "off" */
import { Nullable } from "../Common/Nullable";

export class Env {
    #tokens: { env: string, aliases: string[], }[];
    constructor(...tokens: { env: string, aliases: string[], }[]) {
      this.#tokens = tokens;
  }

  public get<T>(env: string): T {
    let token: Nullable<any> = null;

    const matchingToken: { env: string, aliases: string[] } = this.#tokens.find(t => t.env === env);
    if (matchingToken) {
        token = process.env[env] || null;
    } else {
        for (const tokenObj of this.#tokens) {
            if (tokenObj.aliases.includes(env)) {
                token = process.env[tokenObj.env] || null;
                break;
            }
          }
      }

      return token;
    }

    public validate(): void {
      const tableData: { Status: string, Env: string }[] = [];

      for (const token of this.#tokens) {
          const checkToken = this.get(token.env);
          tableData.push({ Status: checkToken === null ? "Invalid" : "Valid", Env: token.env });
      }
      console.table(tableData);
    }
}
