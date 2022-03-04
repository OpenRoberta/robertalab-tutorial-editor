# Get `openrobertalab_binaries` from git, if one doesn't exist already
cd ../

if [ $(find -name openrobertalab_binaries | wc -l) -gt 0 ]; then
  :
else
  echo "Getting latest binaries..."
  wget -q https://github.com/OpenRoberta/openroberta-lab/releases/latest/download/openrobertalab_binaries.zip
  echo "Done!"

  # Unzip the binaries folder, then delete the zip
  echo "Unzipping binaries..."
  unzip -q openrobertalab_binaries.zip && rm -rf openrobertalab_binaries.zip
  echo "Done!"
fi

# Copy `orlab-tutorial-editor` into `staticResources` directory in the binaries
# and rename it to "tutorialEditor", so that the URL in the application is succint!
if [ $(find openrobertalab_binaries/staticResources/ -name tutorialEditor | wc -l) -gt 0 ]; then
  :
else
  echo "Copying resources..."
  cp -r robertalab-tutorial-editor openrobertalab_binaries/staticResources/tutorialEditor
  echo "Done!"
fi

ADMIN_DIR="${HOME}/openroberta-tutorial"
BROWSER=""
while true
do
  case "$1" in
    -a|--admin-dir) ADMIN_DIR=$2
                    shift; shift
                    ;;
    -b|--browser)   BROWSER=$2
                    shift; shift;
                    ;;
    -h|--help)      echo "Usage:"
                    echo "    ./start_linux.sh [-a | --admin-dir <admin-dir>] [-b | --browser <browser-name>] [-h | --help]"
                    echo ""
                    echo "<admin-dir> defaults to parent directory."
                    echo "If <browser-name> provided is not installed, URLs to access the"
                    echo "application will be printed to stdout."
                    echo ""
                    exit 0
                    ;;
    *)              break ;;
  esac
done

cd openrobertalab_binaries/
case "$BROWSER" in
  chrome|google-chrome)     if hash google-chrome >/dev/null; then
                              ( sleep 3; google-chrome "http://0.0.0.0:1999/tutorialEditor" "http://0.0.0.0:1999") &
                            else
                              echo "Google Chrome not installed, but supplied as a parameter. Please use another browser..."
                            fi
                            ;;
  firefox|mozilla-firefox)  if hash firefox >/dev/null; then
                              ( sleep 3; firefox "http://0.0.0.0:1999/tutorialEditor" "http://0.0.0.0:1999") &
                            else
                              echo "Mozilla Firefox not installed, but supplied as a parameter. Please use another browser..."
                            fi
                            ;;
  *)                        echo "***************************************************************"
                            echo "Browser name not supplied or not installed. Please navigate to:"
                            echo "    ORLab: http://0.0.0.0:1999"
                            echo "    Tutorial editor: http://0.0.0.0:1999/tutorialEditor"
                            echo "***************************************************************"
                            ;;
esac

/bin/bash admin.sh -admin-dir ${ADMIN_DIR} -q start-server