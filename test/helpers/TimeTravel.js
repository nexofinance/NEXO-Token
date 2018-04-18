const increaseTime = async (addSeconds) => {
    await web3.currentProvider.send({
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [addSeconds], id: 0
    })
    await mineBlock();
};

const mineBlock = async () => {
    return web3.currentProvider.send({
        jsonrpc: "2.0",
        method: "evm_mine",
        params: [], id: 0
    })
};

module.exports = increaseTime;
