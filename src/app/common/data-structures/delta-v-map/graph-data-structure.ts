// @ts-ignore
import Graph from 'graph-data-structure';

declare type NodeId = string;
declare type EdgeWeight = number;

interface Serialized {
  nodes: {
    id: NodeId;
  }[];
  links: {
    source: NodeId;
    target: NodeId;
    weight: EdgeWeight;
  }[];
}

interface GraphDataStructureExtensions {
  addBiEdge: (u: NodeId, v: NodeId, weight?: number | undefined) => any;
}

export interface GraphDataStructure extends GraphDataStructureExtensions {
  addNode: (node: NodeId) => any;
  removeNode: (node: NodeId) => any;
  nodes: () => NodeId[];
  adjacent: (node: NodeId) => NodeId[];
  addEdge: (u: NodeId, v: NodeId, weight?: number | undefined) => any;
  removeEdge: (u: NodeId, v: NodeId) => any;
  hasEdge: (u: NodeId, v: NodeId) => boolean;
  setEdgeWeight: (u: NodeId, v: NodeId, weight: EdgeWeight) => any;
  getEdgeWeight: (u: NodeId, v: NodeId) => EdgeWeight;
  indegree: (node: NodeId) => number;
  outdegree: (node: NodeId) => number;
  depthFirstSearch: (sourceNodes?: string[] | undefined, includeSourceNodes?: boolean, errorOnCycle?: boolean) => string[];
  hasCycle: () => boolean;
  lowestCommonAncestors: (node1: NodeId, node2: NodeId) => string[];
  topologicalSort: (sourceNodes?: string[] | undefined, includeSourceNodes?: boolean) => string[];
  shortestPath: (source: NodeId, destination: NodeId) => string[] & {
    weight?: number | undefined;
  };
  serialize: () => Serialized;
  deserialize: (serialized: Serialized) => any;
}

export function NodeGraph(): GraphDataStructure {
  let graph = Graph() as GraphDataStructure;
  graph.addBiEdge = (nodeA: string, nodeB: string, weight: number) => {
    graph.addEdge(nodeA, nodeB, weight);
    graph.addEdge(nodeB, nodeA, weight);
  };
  return graph;
}
