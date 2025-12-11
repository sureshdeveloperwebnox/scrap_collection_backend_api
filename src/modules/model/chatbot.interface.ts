export interface IChatbotLead {
  id: string;
  name: string;
  phone: string;
  vehicleDetails: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
    type?: string;
  };
  location?: string;
  chatLog?: Array<{
    role: 'user' | 'bot';
    message: string;
    timestamp: Date;
  }>;
  leadId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateChatbotLeadRequest {
  name: string;
  phone: string;
  vehicleDetails: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
    type?: string;
  };
  location?: string;
  chatLog?: Array<{
    role: 'user' | 'bot';
    message: string;
    timestamp: Date;
  }>;
}

export interface IUpdateChatbotLeadRequest {
  vehicleDetails?: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
    type?: string;
  };
  location?: string;
  chatLog?: Array<{
    role: 'user' | 'bot';
    message: string;
    timestamp: Date;
  }>;
  leadId?: string;
}
