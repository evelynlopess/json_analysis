
export interface MessageInfo {
  type: string;
  id?: string;
  endToEndId?: string;
  status?: string;
  reason?: string;
  amount?: string;
  timestamp?: string;
  busMsg?: any;
}

export interface ParsedData {
  pacs008?: MessageInfo;
  pacs002Return?: MessageInfo;
  pacs002Final?: MessageInfo;
  allBusMsgs: string[];
}

export enum Side {
  Payer = 'Pagador',
  Receiver = 'Recebedor'
}
