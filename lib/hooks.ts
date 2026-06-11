"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export const useOverview = () => useQuery({ queryKey: ["overview"], queryFn: api.overview });
export const useNodes = () => useQuery({ queryKey: ["nodes"], queryFn: api.nodes });
export const useEvents = (limit = 120) =>
  useQuery({ queryKey: ["events", limit], queryFn: () => api.events(limit) });
export const useAlerts = (status?: string) =>
  useQuery({ queryKey: ["alerts", status ?? "all"], queryFn: () => api.alerts(status) });
export const useAlert = (id: number | null) =>
  useQuery({ queryKey: ["alert", id], queryFn: () => api.alert(id as number), enabled: id != null });
export const useTimeseries = (hours = 6) =>
  useQuery({ queryKey: ["ts", hours], queryFn: () => api.timeseries(hours) });
export const useSensors = (hours = 24) =>
  useQuery({ queryKey: ["sensors", hours], queryFn: () => api.sensors(hours) });
export const useHeatmap = (hours = 6) =>
  useQuery({ queryKey: ["heatmap", hours], queryFn: () => api.heatmap(hours) });
export const useForecast = (hours = 6) =>
  useQuery({ queryKey: ["forecast", hours], queryFn: () => api.forecast(hours) });
export const useRiskConfig = () =>
  useQuery({ queryKey: ["riskConfig"], queryFn: api.riskConfig, refetchInterval: false, staleTime: Infinity });
export const useRouteRecommendation = () =>
  useQuery({ queryKey: ["routeRec"], queryFn: api.routeRecommendation, refetchInterval: 3000 });

export function useUpdateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: { status?: string; acknowledged?: boolean; note?: string } }) =>
      api.updateAlert(id, body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["alert", vars.id] });
    },
  });
}
