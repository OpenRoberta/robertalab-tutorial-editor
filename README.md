## Open Roberta Lab - Tutorial Editor

A Javascript based web application to create and edit tutorials for the [openroberta-lab](https://github.com/OpenRoberta/openroberta-lab).

### Prerequisites

This repo can be run standalone. As such, there are no prerequisites to be installed.

In case a current installation of `openrobertalab_binaries` exists, download this repo such that the directory looks as follows:
```
.
├── ...
├── openrobertalab_binaries
└── robertalab-tutorial-editor
```

### Usage

#### Linux
To start the application, open a terminal window in the directory of the repo and run the following:
```shell
./start_linux.sh [-b | --browser <browser-name>] [-h | --help]
```

The app will search for `openrobertalab_binaries` in the same directory as this repo.
If not found, the latest release will be downloaded and unpacked instead.

By default, the app will print out the URLs for accessing the lab and tutorial editor, in case no parameters are provided.

#### Windows

--

### Compatible browsers

This application has been tested on Google Chrome and Mozilla Firefox.