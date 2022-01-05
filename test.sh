#!/bin/sh
#
#   AI自動対戦スクリプト (10,000半荘対戦用)
#

if [ ! $1 ]
then
    echo "Usage $0 logdir [legacy [current]]"
    exit
fi

cd `dirname $0`

mkdir log/$1

for n in 01 02 03 04 05 06 07 08 09 10
do
  node dev/testplay.js -i shan/$n.json.gz -o log/$1/$n.json $2 $3
  gzip log/$1/$n.json
done
