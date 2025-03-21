export enum ConfigurationRoles {
    SupportRoles,
    TagRoles,
    TagAdminRoles,
    AdminRoles,
    StaffRoles,
    IgnoredSnipedRoles,
}

export enum ConfigurationChannels {
    AllowedTagChannels,
    AllowedSnipeChannels,
    AutomaticSlowmodeChannels,
}

export enum ConfigurationUsers {
    IgnoreSnipedUsers,
}

export const configurationRolesContainer = [
    [ConfigurationRoles.AdminRoles, 'AllowedAdminRoles'],
    [ConfigurationRoles.StaffRoles, 'AllowedStaffRoles'],
    [ConfigurationRoles.SupportRoles, 'SupportRoles'],
    [ConfigurationRoles.TagRoles, 'AllowedTagRoles'],
    [ConfigurationRoles.TagAdminRoles, 'AllowedTagAdminRoles'],
    [ConfigurationRoles.IgnoredSnipedRoles, 'IgnoredSnipedRoles'],
] as const;

export const configurationChannelsContainer = [
    [ConfigurationChannels.AllowedTagChannels, 'AllowedTagChannels'],
    [ConfigurationChannels.AllowedSnipeChannels, 'AllowedSnipeChannels'],
    [ConfigurationChannels.AutomaticSlowmodeChannels, 'AutomaticSlowmodeChannels'],
] as const;

export const configurationUsersContainer = [
    [ConfigurationUsers.IgnoreSnipedUsers, 'IgnoreSnipedUsers'],
] as const;

export function filterContainer<R extends []>(
    container: ReadonlyArray<
        readonly [ConfigurationRoles | ConfigurationChannels | ConfigurationUsers, string]
    >,
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

export function getUserConfigurationContainer<R extends Array<R>>(): R {
    return filterContainer(configurationUsersContainer) as unknown as R;
}
