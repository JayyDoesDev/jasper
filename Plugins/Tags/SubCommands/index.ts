import { commandOptions as createOptions, CreateSubCommand } from "./CreateSubCommand";
import { commandOptions as deleteOptions, DeleteSubCommand } from "./DeleteSubCommand";
import { commandOptions as showOptions, ShowSubCommand } from "./ShowSubCommand";
import { commandOptions as listOptions, ListSubCommand } from "./ListSubCommand";
import { commandOptions as infoOptions, InfoSubCommand } from "./InfoSubCommand";
import { commandOptions as rawOptions, RawSubCommand } from "./RawSubCommand";
import { commandOptions as useOptions, UseSubCommand } from "./UseSubCommand";
import { commandOptions as editOptions, EditSubCommand } from "./EditSubCommand";

export const subCommandOptions = [
    createOptions,
    deleteOptions,
    showOptions,
    listOptions,
    infoOptions,
    rawOptions,
    useOptions,
    editOptions
];

export {
    CreateSubCommand,
    DeleteSubCommand,
    ShowSubCommand,
    ListSubCommand,
    InfoSubCommand,
    RawSubCommand,
    UseSubCommand,
    EditSubCommand
};
