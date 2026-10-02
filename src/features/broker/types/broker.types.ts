export interface BrokerConnection {
  broker: string;
  isConnected: boolean;
  isSandbox: boolean;
  environment: string;
  checkedAt: string;
}

export interface ConnectBrokerResponse {
  authorizationUrl: string;
}