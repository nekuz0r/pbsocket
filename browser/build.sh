#!/bin/bash

browserify -x ws -x long -x protobufjs -x bytebuffer -r ../WSClient.js:WSClient -o ./build/WSClient.js
cat ./build/WSClient.js | uglifyjs > ./build/WSClient.min.js