# Jasper User Documentation

This document provides information and instructions on all of Jasper's functionalities.

## Commands

All commands in Jasper are slash commands. Required parameters are wrapped in `<>` while optional parameters are wrapped in `[]` brackets.

### `/settings`

> **Permissions**: `ManageChannels`

> **Description**: Configure server settings

> **Subcommands**:

- `add_channel`: Add a channel to configuration
- `remove_channel`: Remove a channel from configuration
- `add_role`: Add a role to configuration
- `remove_role`: Remove a role from configuration
- `view`: View current settings

### `/help <section>`

> **Permissions**: None

> **Description**: Displays documentation sections

> **Features**: `Autocomplete`

### `/tag`

> **Description**: Manage server tags

> **Subcommands**:

- `create`: Create a new tag (**Modal**)
- `delete <tag_name>`: Delete a tag (**Staff+**, **Autocomplete**)
- `edit`: Edit an existing tag (**Modal**)
- `list`: List all tags
- `info <tag_name>`: View tag details (**Autocomplete**)
- `raw <tag_name>`: Get tag JSON data (**Autocomplete**)
- `use <tag_name>`: Use a tag (**Autocomplete**)
- `import <json>`: Import a tag from JSON (**Staff+**, **Autocomplete**)
- `show <tag_name>`: Display a tag (**Autocomplete**)

### `/resolve` [*original_question*] [*summarized_answer*]

> **Permissions**: `ManageThreads`

> **Config Roles**: `SupportRoles`, `StaffRoles`, `AdminRoles`, `TagAdminRoles`, `TagRoles`

> **Description**: Marks a forum post as resolved and archives it

### `/bruteforce`

> **Permissions**: `Administrator`

> **Description**: Force administrative actions

> **Subcommands**:

- `notify_video_discussions`: Notify about video discussions
