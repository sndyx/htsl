# Action Reference

## Table of Contents

<!--- TOC -->

- [Definitions](#definitions)
- [Actions](#actions)
    - [Change Player Stat](#change-player-stat)
    - [Change Player Stat](#change-player-stat)
    - [Change Global Stat](#change-global-stat)
    - [Change Team Stat](#change-team-stat)
    - [Set Player Team](#set-player-team)
    - [Apply Inventory Layout](#apply-inventory-layout)
    - [Apply Potion Effect](#apply-potion-effect)
    - [Balance Player Team](#balance-player-team)
    - [Cancel Event](#cancel-event)
    - [Change Health](#change-health)
    - [Change Hunger Level](#change-hunger-level)
    - [Change Max Health](#change-max-health)
    - [Clear All Potion Effects](#clear-all-potion-effects)
    - [Close Menu](#close-menu)
    - [Send to Lobby](#send-to-lobby)
    - [Send a Chat Message](#send-a-chat-message)
    - [Display Action Bar](#display-action-bar)
    - [Display Title](#display-title)
    - [Fail Parkour](#fail-parkour)
    - [Parkour Checkpoint](#parkour-checkpoint)
    - [Display Menu](#display-menu)
    - [Enchant Held Item](#enchant-held-item)
    - [Pause Execution](#pause-execution)
    - [Exit](#exit)
    - [Full Heal](#full-heal)
    - [Kill Player](#kill-player)
    - [Give Experience Levels](#give-experience-levels)
    - [Give Item](#give-item)
    - [Remove Item](#remove-item)
    - [Use/Remove Held Item](#useremove-held-item)
    - [Reset Inventory](#reset-inventory)
    - [Go to House Spawn](#go-to-house-spawn)
    - [Play Sound](#play-sound)
    - [Set Compass Target](#set-compass-target)
    - [Teleport Player](#teleport-player)
    - [Set Gamemode](#set-gamemode)
    - [Trigger Function](#trigger-function)
- [Conditions](#conditions)
    - [Compare Player Stat](#compare-player-stat)

<!--- END -->

## Definitions

#### Stat Name

#### Operator

#### Comparison

#### Amount

#### Text

#### Boolean

#### Inventory Layout Name

#### Potion Effect

#### Duration

#### Group Name

#### Team Name

#### Enchantment Name

#### Item Name

#### Inventory Location

#### Lobby Name

#### Gamemode

#### Function Name

#### Menu Name

#### Sound Name

### Location

## Actions

#### Change Player Stat

| Keyword | Name                    | Operator              | Amount            |
|---------|-------------------------|-----------------------|-------------------|
| `stat`  | [Stat Name](#stat-name) | [Operator](#operator) | [Amount](#amount) |

#### Change Global Stat

| Keyword      | Name                    | Operator              | Amount            |
|--------------|-------------------------|-----------------------|-------------------|
| `globalstat` | [Stat Name](#stat-name) | [Operator](#operator) | [Amount](#amount) |

#### Change Team Stat

| Keyword    | Name                    | Team                    | Operator              | Amount            |
|------------|-------------------------|-------------------------|-----------------------|-------------------|
| `teamstat` | [Stat Name](#stat-name) | [Team Name](#team-name) | [Operator](#operator) | [Amount](#amount) |

#### Set Player Team

| Keyword   | Team                    |
|-----------|-------------------------|
| `setTeam` | [Team name](#team-name) |

#### Apply Inventory Layout

| Keyword       | Name                                            | 
|---------------|-------------------------------------------------|
| `applyLayout` | [Inventory Layout Name](#inventory-layout-name) | 

#### Apply Potion Effect

| Keyword       | Effect                          | Duration              | Level             | Override Existing Effects |
|---------------|---------------------------------|-----------------------|-------------------|---------------------------|
| `applyPotion` | [Potion Effect](#potion-effect) | [Duration](#duration) | [Amount](#amount) | [Boolean](#boolean)       |

#### Balance Player Team

| Keyword       |
|---------------|
| `balanceTeam` |

#### Cancel Event

| Keyword       |
|---------------|
| `cancelEvent` |

#### Change Health

| Keyword        | Operator              | Amount            |
|----------------|-----------------------|-------------------|
| `changeHealth` | [Operator](#operator) | [Amount](#amount) |

#### Change Hunger Level

| Keyword       | Operator              | Amount            |
|---------------|-----------------------|-------------------|
| `hungerLevel` | [Operator](#operator) | [Amount](#amount) |

#### Change Max Health

| Keyword     | Operator              | Amount            |
|-------------|-----------------------|-------------------|
| `maxHealth` | [Operator](#operator) | [Amount](#amount) |

#### Clear All Potion Effects

| Keyword        |
|----------------|
| `clearEffects` |

#### Close Menu

| Keyword     |
|-------------|
| `closeMenu` |

#### Send to Lobby

| Keyword | Lobby                     |
|---------|---------------------------|
| `lobby` | [Lobby Name](#lobby-name) |

#### Send a Chat Message

| Keyword | Message       |
|---------|---------------|
| `chat`  | [Text](#text) |

#### Display Action Bar

| Keyword     | Message       |
|-------------|---------------|
| `actionBar` | [Text](#text) |

#### Display Title

| Keyword | Title         | Subtitle      | Fade In           | Stay              | Fade Out          |
|---------|---------------|---------------|-------------------|-------------------|-------------------|
| `title` | [Text](#text) | [Text](#text) | [Amount](#amount) | [Amount](#amount) | [Amount](#amount) |

#### Fail Parkour

| Keyword       | Reason        |
|---------------|---------------|
| `failParkour` | [Text](#text) |

#### Parkour Checkpoint

| Keyword     |
|-------------|
| `parkCheck` |

#### Display Menu

| Keyword       | Menu                   |
|---------------|------------------------|
| `displayMenu` | [MenuName](#menu-name) |

#### Enchant Held Item

| Keyword   | Enchantment                           | Level             |
|-----------|---------------------------------------|-------------------|
| `enchant` | [Enchantment Name](#enchantment-name) | [Amount](#amount) |

#### Pause Execution

| Keyword | Ticks             |
|---------|-------------------|
| `pause` | [Amount](#amount) |

#### Exit

| Keyword |
|---------|
| `exit`  |

#### Full Heal

| Keyword    |
|------------|
| `fullHeal` |

#### Kill Player

| Keyword |
|---------|
| `kill`  |

#### Give Experience Levels

| Keyword   | Levels            |
|-----------|-------------------|
| `xpLevel` | [Amount](#amount) |

#### Give Item

| Keyword    | Item Name               | Allow Multiple      | Inventory Location                        | Replace Existing Item |
|------------|-------------------------|---------------------|-------------------------------------------|-----------------------|
| `giveItem` | [Item Name](#item-name) | [Boolean](#boolean) | [Inventory Location](#inventory-location) | [Boolean](#boolean)   |

#### Remove Item

| Keyword      | Item Name               |
|--------------|-------------------------|
| `removeItem` | [Item Name](#item-name) |

#### Use/Remove Held Item

| Keyword       |
|---------------|
| `consumeItem` |

#### Reset Inventory

| Keyword          |
|------------------|
| `resetInventory` |

#### Go to House Spawn

| Keyword      |
|--------------|
| `houseSpawn` |

#### Play Sound

| Keyword | Sound Name                | Volume            | Pitch             | Location              |
|---------|---------------------------|-------------------|-------------------|-----------------------|
| `sound` | [Sound Name](#sound-name) | [Amount](#amount) | [Amount](#amount) | [Location](#location) |

#### Set Compass Target

| Keyword         | Target                |
|-----------------|-----------------------|
| `compassTarget` | [Location](#location) |

#### Teleport Player

| Keyword | Target                |
|---------|-----------------------|
| `tp`    | [Location](#location) |

#### Set Gamemode

| Keyword    | Gamemode              |
|------------|-----------------------|
| `gamemode` | [Gamemode](#gamemode) |

#### Trigger Function

| Keyword    | Function Name                   | Trigger for All Players |
|------------|---------------------------------|-------------------------|
| `function` | [Function Name](#function-name) | [Boolean](#boolean)     |

## Conditions

#### Compare Player Stat

| Keyword | Name                    | Comparison                | Amount            |
|---------|-------------------------|---------------------------|-------------------|
| `stat`  | [Stat Name](#stat-name) | [Comparison](#comparison) | [Amount](#amount) |


