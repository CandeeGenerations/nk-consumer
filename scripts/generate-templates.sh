#!/bin/sh -
PROGNAME=$0
export LC_ALL=C

if [ -d ./templates/build_production ]; then
  # clean current templates
  rm ./templates/build_production/*.hbs
fi

# build templates
cd ./templates
yarn build
cd ./build_production

for f in *.html; do
  # replace ___ with {{ and __ with }} in new templates
  sed -i '' -e 's/___/{{/g' "$f"
  sed -i '' -e 's/__/}}/g' "$f"

  # convert new templates to HBS templates
  mv -- "$f" "${f%.html}.hbs"
done
