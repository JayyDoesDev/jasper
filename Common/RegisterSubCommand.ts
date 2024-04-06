import { Context } from "../Context";
interface RegisterSubCommandOptions {
  subCommand: string;
  ctx: Context;
  interaction;
  callback: Function;
}
export function RegisterSubCommand(options: RegisterSubCommandOptions): void {
  if (options.interaction.options.getSubcommand() === options.subCommand) {
    options.callback(options.ctx, options.interaction);
  };
};
