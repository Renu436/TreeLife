import { queryOptions } from "@tanstack/react-query";
import { api } from "./client";

export const forestQuery = () =>
  queryOptions({ queryKey: ["forest"], queryFn: api.forest, staleTime: 30_000 });

export const treeQuery = (id: string) =>
  queryOptions({ queryKey: ["tree", id], queryFn: () => api.tree(id), staleTime: 60_000, retry: false });
