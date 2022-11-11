class NodesInstance {
  nodes;

  constructor() {
    this.nodes = [];
  }

  add(node) {
    this.nodes.push(node);
  }

  disconnect(node, io) {
    const getDisconnectedSocketIdx = this.nodes.findIndex((n) => n === node);
    this.nodes.splice(getDisconnectedSocketIdx, 1);
    this.nodes.forEach((n, i) => {
      io.to(n).emit("id", i + 1);
    });
  }

  get(){
      return this.nodes;
  }

  getWithId(clientId){
    const idx = clientId-1;
    if(idx<0 && idx >= this.nodes.length){
        return null;
    }
    return this.nodes[idx];
  }
}

module.exports = NodesInstance;
