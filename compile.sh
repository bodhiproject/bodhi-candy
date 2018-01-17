#!/bin/bash

echo 'Compiling BodhiCandy.sol into /compiled'
solc --optimize --bin --abi --hashes --allow-paths contracts/libs/* -o compiled --overwrite contracts/BodhiCandy.sol
