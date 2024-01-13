import Graph from 'graph-data-structure';

type NodeId = string;

interface GraphDataStructureExtensions {
  addBiEdge: (u: NodeId, v: NodeId, weight?: number | undefined) => void;
}

export type GraphDataStructure = ReturnType<typeof Graph> & GraphDataStructureExtensions;

export function NodeGraph(): GraphDataStructure {
  let graph = Graph() as GraphDataStructure;
  graph.addBiEdge = (nodeA: string, nodeB: string, weight: number) => {
    graph.addEdge(nodeA, nodeB, weight);
    graph.addEdge(nodeB, nodeA, weight);
  };
  return graph;
}
