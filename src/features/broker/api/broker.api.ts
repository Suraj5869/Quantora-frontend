import axiosInstance from "../../../api/axios";
import type {
  BrokerConnection,
  ConnectBrokerResponse,
} from "../types/broker.types";

export const getBrokerConnection = async (): Promise<BrokerConnection> => {
  const response = await axiosInstance.get<BrokerConnection>("/brokers/upstox");

  return response.data;
};

export const connectBroker = async (): Promise<ConnectBrokerResponse> => {
  const response =
    await axiosInstance.get<ConnectBrokerResponse>("/brokers/connect");

  return response.data;
};

export const disconnectBroker = async (): Promise<void> => {
  await axiosInstance.delete("/brokers/upstox");
};
