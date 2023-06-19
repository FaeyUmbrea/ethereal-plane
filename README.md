# Welcome

If you're here, you're probably looking for a way to use this in FoundryVTT.

Either check out the [Patreon](https://patreon.com/voidmonster) or grab the
self-hosted [Server](https://github.com/FaeyUmbrea/ethereal-plane-server).

If you have any question, leave an Issue or send me a message on Patreon. Altenatively, you can also find me on the
official FoundryVTT Discord. Just ping @faey in the module-troubleshooting channel.

# Building

This repository uses xc for task definitions! As such only nodejs, yarn and xc are required.

### Dependencies
| Project     | Version  |
|-------------|----------|
| nodejs.org  | ^18.12.1 |
| xcfile.dev  | ^0.0.159 |
| yarnpkg.com | ^3.5.1   |

## Tasks

### setup

setup the environment

```
yarn install
```

### build

Builds the module

Requires: setup

```
yarn build
```