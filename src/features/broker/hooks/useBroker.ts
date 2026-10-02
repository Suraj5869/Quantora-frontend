import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import axios from "axios";

import {
  connectBroker,
  disconnectBroker,
  getBrokerConnection,
} from "../api/broker.api";

export const BROKER_CONNECTION_QUERY_KEY = [
  "broker-connection",
];

export function useBrokerConnection() {
  return useQuery({
    queryKey: BROKER_CONNECTION_QUERY_KEY,
    queryFn: getBrokerConnection,
    staleTime: 30_000,
  });
}

export function useConnectBroker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: connectBroker,
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: BROKER_CONNECTION_QUERY_KEY,
      });
    },
  });
}

export function useDisconnectBroker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectBroker,
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: BROKER_CONNECTION_QUERY_KEY,
      });
    },
  });
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (
      typeof message === "string" &&
      message.trim()
    ) {
      return message;
    }
  }

  return fallback;
}