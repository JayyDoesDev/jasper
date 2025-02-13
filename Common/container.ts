export enum ConfigurationRoles {
    SupportRoles,
    TagRoles,
    TagAdminRoles,
    AdminRoles,
    StaffRoles,
}

export enum ConfigurationChannels {
    AllowedTagChannels,
}

export const configurationRolesContainer = [
    [ConfigurationRoles.AdminRoles, 'AllowedAdminRoles'],
    [ConfigurationRoles.StaffRoles, 'AllowedStaffRoles'],
    [ConfigurationRoles.SupportRoles, 'SupportRoles'],
    [ConfigurationRoles.TagRoles, 'AllowedTagRoles'],
    [ConfigurationRoles.TagAdminRoles, 'AllowedTagAdminRoles'],
] as const;

export const configurationChannelsContainer = [
    [ConfigurationChannels.AllowedTagChannels, 'AllowedTagChannels'],
] as const;

export function filterContainer<R extends []>(
    container: ReadonlyArray<readonly [ConfigurationRoles | ConfigurationChannels, string]>,
): R {
    const array = [];

    for (let i = 0; i < container.length; i++) {
        array.push(container[i][1]);
    }

    return array as R;
}

export function getRoleConfigurationContainer<R extends Array<R>>(): R {
    return filterContainer(configurationRolesContainer) as unknown as R;
}

export function getChannelConfigurationContainer<R extends Array<R>>(): R {
    return filterContainer(configurationChannelsContainer) as unknown as R;
}
