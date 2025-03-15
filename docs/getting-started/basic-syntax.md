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

Multiple conditions can be added, delimited by commas.

Appending "and" after the if keyword requires all conditions to be met for the conditional to execute;
appending "or" requires only one condition to be true.

By default, a conditional will only run if all conditions are met.
```htsl
stat A = 3
stat B = 20
// ...
if (stat A == 5, stat B == 20) { // By default checks all conditions, does NOT execute because one condition fails
    // ...
}
// ...
if or (stat A == 20, stat A == 3, stat B == 2) { // At least one condition is true, meaning that this will execute
    // ...
}
```

A condition can be inverted by preceding it with an '!'.

Actions can be triggered if the conditions are not met, using the else keyword.
```htsl
if (!isSneaking) {
    chat "You are not sneaky."
} else {
    chat "You are quiet as a mouse."
}
```

## Random Actions

Similar to conditionals, random actions contain a subset of actions; one of these actions will be randomly executed.
```htsl
// Simulate a dice roll
random {
    stat roll = 1
    stat roll = 2
    stat roll = 3
    stat roll = 4
    stat roll = 5
    stat roll = 6
}
```