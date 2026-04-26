export type Job = {
  is_test: boolean;
  is_fte: boolean;
  is_intern: boolean;
  company_name: string;
  title: string;
  date_posted: number;
  url: string;
  source: string;
  degrees: string[];
  sponsorship: string;
  locations: string[];
  category: string;
};

export type WebhookPayload = {
  data: Job[];
};
