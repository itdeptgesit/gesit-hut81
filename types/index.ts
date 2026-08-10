export interface Participant {
  registration_id: string;
  timestamp: string;
  name: string;
  department: string;
  floor: string;
  email: string;
  phone: string;
  event: string;
  category: string;
  partner?: string;
  status: string;
  call_name?: string;
  photo_url?: string;
  partner_photo_url?: string;
}

export interface Team {
  team_id: string;
  team_name: string;
  event: string;
  captain: string;
  members: string;
  status: string;
}
