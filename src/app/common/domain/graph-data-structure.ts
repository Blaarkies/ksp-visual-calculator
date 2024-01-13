import Graph from 'graph-data-structure';

type NodeId = string;

interface GraphDataStructureExtensions {
  addBiEdge: (u: NodeId, v: NodeId, weight?: number | undefined) => void;
}

interface StringArrayWithWeight extends Array<string> {
  weight?: number | undefined;
}

export type GraphDataStructure = ReturnType<typeof Graph> & GraphDataStructureExtensions;

export function NodeGraph(): GraphDataStructure {
  let graph = Graph() as GraphDataStructure;

  graph.addBiEdge = (nodeA: string, nodeB: string, weight: number) => {
    graph.addEdge(nodeA, nodeB, weight);
    graph.addEdge(nodeB, nodeA, weight);
  };

  let baseShortestPath = graph.shortestPath;
  graph.shortestPath = (source: NodeId, destination: NodeId): StringArrayWithWeight => {
    try {
      return baseShortestPath(source, destination);
    } catch (e) {
      return [];
    }
  };

  return graph;
}
