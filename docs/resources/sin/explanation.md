# Sin Explanation

## sin.htsl

This sin approximation uses [Bhāskara I's sine approximation](https://en.wikipedia.org/wiki/Bh%C4%81skara_I%27s_sine_approximation_formula):

$$sin\:x^\circ=\frac{4x(180-x)}{40500-x(180-x)}$$

There are many advantages to this approximation, but the biggest is how incredibly accurate it is for its simplicity.

The first issue we encounter is that we want to coerce the input to only positive values. The approach I have gone with
 is adding a large multiple of $360$, which trivially reduces the input to positive values.

```hs
stat sinInput += 4611686018427360000
```

> For cos, we simply add $90000$ to this constant.

The next issue with using it is that it only gives accurate results over the interval $0^\circ< x<180^\circ$. This can
 be solved by modulating the input by $360$. Then, subtract $180$, and take the absolute value.

Modulating input by $360$:
```hs
teamstat a TEAM_NAME = "%stat.player/sinInput%"
teamstat a TEAM_NAME /= 360000
teamstat a TEAM_NAME *= 360000
stat sinInput -= "%stat.team/a TEAM_NAME%"
```

Subtracting $180$ and taking the absolute value:
```hs
stat sinInput -= 180000
globalstat a = "%stat.player/sinInput%"
globalstat a += 180001
globalstat a /= 180001
globalstat a *= 2
globalstat a -= 1
stat sinInput *= "%stat.global/a%"
```

Finally, we can use Bhāskara's approximation:

```hs
teamstat a TEAM_NAME = 179968
teamstat a TEAM_NAME -= "%stat.player/sinInput%"
teamstat a TEAM_NAME *= "%stat.player/sinInput%"
stat sinOutput = 4005
stat sinOutput *= "%stat.team/a TEAM_NAME%"
teamstat b TEAM_NAME = 40500000000
teamstat b TEAM_NAME -= "%stat.team/a TEAM_NAME%"
stat sinOutput /= "%stat.team/b TEAM_NAME%"
```

> Note that the constants are slightly optimized for integer division.