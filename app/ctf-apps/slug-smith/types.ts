export type SlugFields = {
  title?: string;
  parent?: { sys: { id: string } } | null;
  slugSegment?: string;
  fullPath?: string;
  // Hybrid: chain + history are stored inside JSON field `pathMeta`
  pathMeta?: {
    pathChain?: string[];
    previousPaths?: string[];
  };
};
