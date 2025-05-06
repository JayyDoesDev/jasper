import { commandOptions as createOptions, CreateSubCommand } from './CreateSubCommand';
import { commandOptions as deleteOptions, DeleteSubCommand } from './DeleteSubCommand';
import { commandOptions as editOptions, EditSubCommand } from './EditSubCommand';
import { commandOptions as importOptions, ImportSubCommand } from './ImportSubCommand';
import { commandOptions as infoOptions, InfoSubCommand } from './InfoSubCommand';
import { commandOptions as listOptions, ListSubCommand } from './ListSubCommand';
import { commandOptions as rawOptions, RawSubCommand } from './RawSubCommand';
import { commandOptions as showOptions, ShowSubCommand } from './ShowSubCommand';
import { commandOptions as useOptions, UseSubCommand } from './UseSubCommand';

export const subCommandOptions = [
    createOptions,
    deleteOptions,
    showOptions,
    listOptions,
    infoOptions,
    rawOptions,
    useOptions,
    editOptions,
    importOptions,
];

export {
    CreateSubCommand,
    DeleteSubCommand,
    EditSubCommand,
    ImportSubCommand,
    InfoSubCommand,
    ListSubCommand,
    RawSubCommand,
    ShowSubCommand,
    UseSubCommand,
};
