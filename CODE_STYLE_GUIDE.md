# Code Style Guide

This file serves the purpose of setting standards for any code that is written
for Red Matter app. If there is any code not following these standards, you
may refactor it at your will.

We follow a strict TypeScript guidelines, such that no code in pure javascript
should ever be written for this app.

Our code style guide is [Airbnb code style guide](https://github.com/airbnb/javascript/tree/master/react).

## Non JSX Function declaration

As you can see reading this codebase, some functions and classes are declared
like this:

```
interface b {
    param1: type
    param2: type
}

class A() {
    b({param1, param2}: bParams) {
        /*  .. */
    }
    private c(param1: type, param1: type) {
        /*  .. */
    }
}

```

Notice this is only applied to **external** functions, which may be used
outside of this file. That means only protected and public functions need
to follow this rule.

This accomplishes three things:

#### 1) Provides labled function calls

In standard typescript, if you implement the same function above without an
interface, you cannot send labeled params. This hurts readability. With this,
we can call function like so:

```
a = new A()
a.b({
    param1: 'hehe',
    param2: 68420
})
```

#### 2) Provides a simple interface to be read when document is opened

When a document is opened, you can read the interface to understand exactly
what goes inside of it's calls.

#### 3) Enables parameters reusability

Best explained with an example:

```
const baseCallParams = { param1: 'hehe', param2: 69420 }
a = new A()

/* a bunch of code later... */

a.b(baseCallParams)

/* a bunch of more code later... */

a.b(baseCallParams)
```

