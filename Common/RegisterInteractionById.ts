import { Context } from "../Source/Context";

interface RegisterByIdOptions {
    id: string;
    ctx: Context;
    interaction;
    typeguards?: {
        positiveTypeGuards?: string[];
        negativeTypeGuards?: string[];
    };
    callback: Function;
}

export function RegisterInteractionById(options: RegisterByIdOptions): void {
    if (options.typeguards) {
        if (options.typeguards.positiveTypeGuards) {
            if (options.typeguards.positiveTypeGuards.some(x => options.interaction[x]())) {
                return;
            }
        }

        if (options.typeguards.negativeTypeGuards) {
            if (options.typeguards.negativeTypeGuards.some(x => !options.interaction[x]())) {
                return;
            }
        }

        if (options.interaction.customId === options.id) {
            options.callback(options.ctx, options.interaction);
        }
    } else {
        if (options.interaction.customId === options.id) {
            options.callback(options.ctx, options.interaction);
        }
    }
}
