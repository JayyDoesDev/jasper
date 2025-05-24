import { commandOptions as createOptions, CreateSubCommand } from './createSubCommand';
import { commandOptions as deleteOptions, DeleteSubCommand } from './deleteSubCommand';
import { commandOptions as editOptions, EditSubCommand } from './editSubCommand';
import { commandOptions as importOptions, ImportSubCommand } from './importSubCommand';
import { commandOptions as infoOptions, InfoSubCommand } from './infoSubCommand';
import { commandOptions as listOptions, ListSubCommand } from './listSubCommand';
import { commandOptions as rawOptions, RawSubCommand } from './rawSubCommand';
import { commandOptions as showOptions, ShowSubCommand } from './showSubCommand';
import { commandOptions as useOptions, UseSubCommand } from './useSubCommand';

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
