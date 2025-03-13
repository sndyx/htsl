# Basic Syntax

## Comments

```htsl
// This is a line comment

/* This is a block comment
   on multiple lines. */
```

Comments are ignored by HTSL.

## Actions

Declare an action using its name and its options separated by spaces:

```htsl
// sends a chat message!
chat "Hello World!"
```

You can only declare one action on a given line.

## Stats

Stats can be set using the `stat` action:

```htsl
// set stat named Kills to 5
stat Kills = 5
```

The following is also equivalent:

```htsl
stat Kills set 5
```

You can use any of the following modes:

| set | increment | decrement | multiply | divide |
|-----|-----------|-----------|----------|--------|
| `=` | `+=`      | `-=`      | `*=`     | `/=`   |

A stat can be assigned to the value given by another stat:

```htsl
stat A = stat B
```

Or a placeholder:

```htsl
stat Ping = %player.ping%
```

## Stat Types

Global and team stats are used the same way:

```htsl
// adds 1 to the global stat named GlobalKills
globalstat GlobalKills += 1

// adds 1 to the team stat named TeamKills for team RedTeam
teamstat TeamKills RedTeam += 1
```

## Conditionals

Actions can be ran if a certain condition is true.

The following code will not send any message to the player:
```htsl
stat Deaths = 5
// ...
if (stat Deaths == 10) {
   chat "You have died too many times!"
}
```

However, if we change the value of Kills to 10, it will send the message to the player:
```diff
- stat Deaths = 5
+ stat Deaths = 10
// ...
if (stat Deaths == 10) {
   chat "You have died too many times!"
}
```