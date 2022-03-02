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
if [ $(find openrobertalab_binaries/staticResources/ -name robertalab-tutorial-editor | wc -l) -gt 0 ]; then
  :
else
  echo "Copying resources..."
  cp -r orlab-tutorial-editor openrobertalab_binaries/staticResources/
  VERSION=`basename $(ls openrobertalab_binaries/lib/Robot*-*.jar | head -n1) .jar | cut -d - -f 2`
  mkdir -p xml && unzip -q openrobertalab_binaries/lib/Robot\*-"$VERSION".jar "*.xml" -d xml
  mv xml openrobertalab_binaries/staticResources/robertalab-tutorial-editor/
  echo "Done!"
fi

BROWSER=""
while true
do
  case "$1" in
    -b|--browser) BROWSER=$2
                  shift; shift;
                  ;;
    -h|--help)    echo "Usage:"
                  echo "    ./start_linux.sh [-b | --browser <browser-name>] [-h | --help]"
                  echo ""
                  echo "If <browser-name> provided is not installed, URLs to access the"
                  echo "application will be printed to stdout."
                  echo ""
                  exit 0
                  ;;
    *)            break ;;
  esac
done

cd openrobertalab_binaries/
case "$BROWSER" in
  chrome|google-chrome)     if hash google-chrome >/dev/null; then
                              google-chrome "http://0.0.0.0:1999/robertalab-tutorial-editor" "http://0.0.0.0:1999" &
                            else
                              echo "Google Chrome not installed, but supplied as a parameter. Please use another browser..."
                            fi
                            ;;
  firefox|mozilla-firefox)  if hash firefox >/dev/null; then
                              firefox "http://0.0.0.0:1999/robertalab-tutorial-editor" "http://0.0.0.0:1999" &
                            else
                              echo "Mozilla Firefox not installed, but supplied as a parameter. Please use another browser..."
                            fi
                            ;;
  *)                        echo "***************************************************************"
                            echo "Browser name not supplied or not installed. Please navigate to:"
                            echo "    ORLab: http://0.0.0.0:1999"
                            echo "    Tutorial editor: http://0.0.0.0:1999/robertalab-tutorial-editor"
                            echo "***************************************************************"
                            ;;
esac

/bin/bash admin.sh -q start-server