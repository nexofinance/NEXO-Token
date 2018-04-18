#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the testrpc instance that we started (if we started one and if it's still running).
  if [ -n "$testrpc_pid" ] && ps -p $testrpc_pid > /dev/null; then
    kill -9 $testrpc_pid
  fi
}

if [ "$SOLIDITY_COVERAGE" = true ]; then
  testrpc_port=8555
else
  testrpc_port=8545
fi

testrpc_running() {
  nc -z localhost "$testrpc_port"
}

start_testrpc() {
  # We define 10 accounts with balance 1M ether, needed for high-value tests.

  if [ "$SOLIDITY_COVERAGE" = true ]; then
    node_modules/.bin/ganache-cli --account="0x83c14ddb845e629975e138a5c28ad5a72a49252ea65b3d3ec99810c82751cc3a,1000000000000000000000" \
        --unlock "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a" \
        --account="0xd3b6b98613ce7bd4636c5c98cc17afb0403d690f9c2b646726e08334583de101,1000000000000000000000" \
        --unlock "0xf1f42f995046e67b79dd5ebafd224ce964740da3" \
        --account="0xd10fa22a970f5c39538da5df9aaf6527052aad3e34364df1fdb5a5cf894ee4c0,1000000000000000000000" \
        --unlock "0xd646e8c228bfcc0ec6067ad909a34f14f45513b0" \
        --port 8545 \
        -l 8000000 > /dev/null &
  else
    node_modules/.bin/ganache-cli --account="0x83c14ddb845e629975e138a5c28ad5a72a49252ea65b3d3ec99810c82751cc3a,1000000000000000000000" \
        --unlock "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a" \
        --account="0xd3b6b98613ce7bd4636c5c98cc17afb0403d690f9c2b646726e08334583de101,1000000000000000000000" \
        --unlock "0xf1f42f995046e67b79dd5ebafd224ce964740da3" \
        --account="0xd10fa22a970f5c39538da5df9aaf6527052aad3e34364df1fdb5a5cf894ee4c0,1000000000000000000000" \
        --unlock "0xd646e8c228bfcc0ec6067ad909a34f14f45513b0" \
        --port 8545 \
        -l 8000000 > /dev/null &
  fi

  testrpc_pid=$!
}

if testrpc_running; then
  echo "Using existing testrpc instance"
else
  echo "Starting our own testrpc instance"
  start_testrpc
fi

if [ "$SOLIDITY_COVERAGE" = true ]; then
  node_modules/.bin/solidity-coverage
else
  node_modules/.bin/truffle test "$@"
fi
