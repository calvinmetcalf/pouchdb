#!/bin/bash
./node_modules/tin/bin/tin -v $1
git checkout -b build
echo "module.exports = '"$1"';" > src/version.js
npm run build
git add dist
git add lib/version.js
git add package.json
git add bower.json
git add component.json
git commit -m "build $1"
git tag $1
git push --tags git@github.com:calvinmetcalf/pouchdb.git $1
#npm publish
#jam publish
git checkout master
git branch -D build