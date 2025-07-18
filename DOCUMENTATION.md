# Jasper User Documentation

This document provides information and instructions on all of Jasper's functionalities.

## Commands

All commands in Jasper are slash commands. Required parameters are wrapped in `<>` while optional parameters are wrapped in `[]` brackets.

| Section | Description |
| --- | --- |
| [Configuration](#configuration) | Commands for configuring settings for a server |
| [Core](#core) | Commands for core processes |
| [Fun](#fun) | Various fun commands |
| [Moderation](#moderation) | Comands that are useful for moderating channels |
| [Tags](#tags) | Commands for configuring tags |

## Configuration
### `/settings`

> **Permissions**: `ManageChannels`

> **Description**: Configure server settings

> **Subcommands**:

- `add_channel`: Add a channel to configuration
- `remove_channel`: Remove a channel from configuration
- `add_role`: Add a role to configuration
- `remove_role`: Remove a role from configuration
- `add_skullboard_channel`: Add a channel for skullboard
- `set_skullboard_emoji`: Set the emoji for the skullboard
- `set_skullboard_reaction_thres`: Set a required number of reactions for skullboard
- `add_topics`: Add a new topic to the list of topics
- `remove_topics`: Remove a topic from the configuration
- `view_topics`: View the current topics in the configuration
- `view`: View current settings
  
## Core

### `/help <section>`

> **Permissions**: None

> **Description**: Displays documentation sections

> **Features**: `Autocomplete`

### `/bruteforce`

> **Permissions**: `Administrator`

> **Description**: Force administrative actions

> **Subcommands**:

- `notify_video_discussions`: Notify about video discussions

### `/contribute <section>`
> **Permissions**: None

> **Description**: Displays sections on how to contribute to Jasper

> **Features**: `Autocomplete`

### `/secret`

> **Permissions**: None

> **Description**: Displays all registered commands and the bot's permissions

## Fun

### `/caption <text> <image> [font_size] [position]`

> **Permissions**: `Send Messages`, `AttachFiles`

> **Description**: Applies a caption to an image

> **Features**: `File Attachment`

### `/meme <toptext> <bottomtext> <image> [font_size]`

> **Permissions**: `Send Messages`, `AttachFiles`

> **Description**: Applies top and bottom text to an image

> **Features**: `File Attachment`

### `/speechbubble <image> [position]`

> **Permissions**: `Send Messages`, `AttachFiles`

> **Description**: Applies a speech bubble overlay to an image

> **Features**: `File Attachment`

## Moderation

### `/snipe`

> **Permissions**: `Send Messages`, `View Channel`

> **Description**: Retrieve the last deleted message from a channel

### `/topic`

> **Permissions**: `Send Messages`

> **Description**: Send a random topic message into a channel

## Tags

### `/tag`

> **Description**: Manage server tags

> **Subcommands**: Send Messages, 

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
