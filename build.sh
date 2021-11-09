#Setup
rm -rf ./out
rm -rf ./dist
mkdir ./dist
mkdir ./out
cd ./dist

#Copy
cp ../src/main/node/package*.json ./
cp -r ../src/main/node ./
rm -rf ./node/node_modules

#Zip
cd ..
tar -czvf ./out/mfs-news-fetcher.tar ./dist 
