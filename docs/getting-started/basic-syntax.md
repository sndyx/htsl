# Basic Syntax

## Comments

```hs
// This is a line comment

/* This is a block comment
   on multiple lines. */
```

Comments do not affect the resulting actions.

## Actions

Declare an action using its name and its options separated by spaces:

```hs
// sends a chat message!
chat "Hello World!"
```

You can only declare one action on a given line.

## Stats

Stats can be set using the `stat` action:

```hs
// set stat named Kills to 5
stat Kills = 5
```

The following is also equivalent:

```hs
stat Kills set 5
```

You can use any of the following modes:

| set | increment | decrement | multiply | divide |
|-----|-----------|-----------|----------|--------|
| `=` | `+=`      | `-=`      | `*=`     | `/=`   |

Stats can be assigned to other stats:

```hs
stat x = stat y
```

## Stat Types

Global and team stats are virtually the same:

```hs
// adds 1 to the global stat named GlobalKills
globalstat GlobalKills += 1

// adds 1 to the team stat named TeamKills for team RedTeam
teamstat TeamKills RedTeam += 1
```

