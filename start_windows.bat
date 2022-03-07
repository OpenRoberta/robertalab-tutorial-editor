@echo off

rem Get `openrobertalab_binaries` from git, if one doesn't exist already
cd ../

if not exist openrobertalab_binaries\ (
	echo "Getting latest binaries..."
	curl -sLO https://github.com/OpenRoberta/openroberta-lab/releases/latest/download/openrobertalab_binaries.zip
	echo "Done!"

	# Unzip the binaries folder, then delete the zip
	echo "Unzipping binaries..."
	tar -xf openrobertalab_binaries.zip
	echo "Done!"
)

rem Copy `orlab-tutorial-editor` into `staticResources` directory in the binaries
if not exist openrobertalab_binaries\staticResources\tutorialEditor\ (
	echo "Copying resources..."
	mkdir openrobertalab_binaries\staticResources\tutorialEditor\
	robocopy robertalab-tutorial-editor openrobertalab_binaries\staticResources\tutorialEditor /E > null
	echo "Done!"
)

set ADMIN_DIR="%HOMEDRIVE%%HOMEPATH%\openroberta-tutorial"

:arg_parser
if not "%1"=="" (
    if if "%1"=="-admin-dir" (
        set ADMIN_DIR=%2
        shift
    )
    if if "%1"=="-help" (
        @echo on
        echo "Usage:"
        echo "    start_windows.bat [-admin-dir <admin-dir>] [-help]"
        echo ""
        echo "<admin-dir> defaults to '%HOMEDRIVE%%HOMEPATH%\openroberta-tutorial', for example:"
        echo "        C:\Users\mmustermann\openroberta-tutorial"
        echo ""
        @echo off
        exit /B 0
    )
    shift
    goto :arg_parser
)

cd openrobertalab_binaries\
echo "*********************************************************"
echo "Please navigate to:"
echo "    ORLab: http://localhost:1999"
echo "    Tutorial editor: http://localhost:1999/tutorialEditor"
echo "*********************************************************"
call admin.bat -admin-dir %ADMIN_DIR%