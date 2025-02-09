# Jasper User Documentation

This document provides information and intructions on all of Jasper's functionalities.

## Commands

Commands prefixed with a `/` are app command compatible and commands with `?` are message (prefix) compatible. Required parameters will be
wrapped in `<>` while optional parameters are wrapped in `[]` brackets.

### `/` `resolve` [*original_question*] [*summarized_answer*]

> **Permissions**: `SUPPORT_ROLE`, `STAFF_ROLE`, `ADMIN_ROLE`

> **Description**: Close a forum post with a finalizing message.

> **Feature Flags**: `-`

### `/` `tag` `create`

> **Permissions**: `SUPPORT_ROLE`, `STAFF_ROLE`, `ADMIN_ROLE`

> **Description**: Create a new tag.

> **Feature Flags**: `Modal`

### `/` `tag` `list`

> **Permissions**: `SUPPORT_ROLE`, `STAFF_ROLE`, `ADMIN_ROLE`

> **Description**: List all tags for the current guild.

> **Feature Flags**: `-`

### `/` `tag` `delete` <_tag_name_>

> **Permissions**: `STAFF_ROLE`, `ADMIN_ROLE`

> **Description**: Delete a tag.

> **Feature Flags**: `Autocomplete`

### `/` `tag` `edit`

> **Permissions**: `SUPPORT_ROLE`, `STAFF_ROLE`, `ADMIN_ROLE`

> **Description**: Edit a tag.

> **Feature Flags**: `Modal`

### `/` `tag` `import` <_json_>

> **Permissions**: `STAFF_ROLE`, `ADMIN_ROLE`

> **Description**: Import an tag using the json provided from `/tag raw` command.

> Syntax

> **Feature Flags**: `Autocomplete`

### `/` `tag` `info` <_tag_name_>

> **Permissions**: `SUPPORT_ROLE`, `STAFF_ROLE`, `ADMIN_ROLE`

> **Description**: Get information about a tag.

> **Feature Flags**: `Autocomplete`

### `/` `tag` `show` <_tag_name_>

> **Permissions**: `SUPPORT_ROLE`, `STAFF_ROLE`, `ADMIN_ROLE`

> **Description**: Show a tag.

> **Feature Flags**: `Autocomplete`

### `/` `tag` `raw` <_tag_name_>

> **Permissions**: `SUPPORT_ROLE`, `STAFF_ROLE`, `ADMIN_ROLE`

> **Description**: Get the raw content of a tag and sent it as an ephemeral json message.

> **Feature Flags**: `Autocomplete`

### `/` `tag` `use` <_tag_name_>

> **Permissions**: `SUPPORT_ROLE`, `STAFF_ROLE`, `ADMIN_ROLE`

> **Description**: Use a tag.

> **Feature Flags**: `Autocomplete`

## Message Commands [Deprecated]

Message Commands are triggered by specific message prefixes and provide various functionalities. Below are the details of the available
message commands.

### Prefixes

The following prefixes are recognized by the command handler:

- `yo`
- `w`
- `dude,`
- `omg`
- `lookhere`
- `j`

### Parameters and Actions

Commands can include additional parameters and actions prefixed by a dash (`-`). Parameters and actions modify the behavior of the command.
The recognized actions are:

- `-mention` or `-m`: Mention a specific user in the response.
- `-del` or `-d`: Delete the original command message after executing the command.

### Command Structure

A command is structured as follows:

```plaintext
<prefix> <command> [parameters] [actions]
```

Example:

```plaintext
yo tagname -mention @username -del
```

### Permissions

The command execution requires the user to have one of the following roles:

- `ADMIN_ROLE`
- `STAFF_ROLE`
- `SUPPORT_ROLE`
