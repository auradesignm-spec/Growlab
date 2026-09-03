export type AssistantActionPayload = {
  type:
    | "navigate"
    | "open_quiz"
    | "open_dashboard"
    | "open_timeline"
    | "open_alerts"
    | "calculate_omanisation"
    | "open_pricing"
    | "open_whatsapp_setup"
    | "custom_task"
    | "calculate_profit";
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  targetUrl?: string;
  targetTab?: string;
  autoExecute?: boolean;
  metadata?: Record<string, unknown>;
};

export type AssistantChatResponse = {
  text: string;
  action?: AssistantActionPayload | null;
  suggestions?: string[];
};
