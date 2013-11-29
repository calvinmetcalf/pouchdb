#!/bin/bash
#you may need to run npm install -g tin
./node_modules/tin/bin/tin -v $1
echo "module.exports = '"$1"';" > src/version.js
git checkout -b build
npm run build
git add dist
git add lib/version.js
git add package.json
git add bower.json
git add component.json
git commit -m build
git tag $1
git push --tags git@github.com:calvinmetcalf/pouchdb.git $1
#npm publish
#jam publish
git checkout master
git branch -D build