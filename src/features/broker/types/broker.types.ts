export interface BrokerConnection {
  broker: string;
  isConnected: boolean;
  isSandbox: boolean;
  environment: string;
  brokerUserName?: string | null;
  connectedAt?: string | null;
  checkedAt: string;
}

export interface ConnectBrokerResponse {
  authorizationUrl: string;
}
