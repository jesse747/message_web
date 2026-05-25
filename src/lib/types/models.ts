export interface User {
	id: number;
	username: string;
	display_name: string;
	email: string;
	avatar?: string;
	role: 'admin' | 'member';
	capabilities: string[];
}

export interface Person {
	id: number;
	user_id?: number;
	first_name: string;
	last_name: string;
	email_personal?: string;
	email_work?: string;
	phone_mobile?: string;
	phone_home?: string;
	phone_work?: string;
	address?: string;
	address_street?: string;
	address_city?: string;
	address_region?: string;
	address_postal_code?: string;
	address_country?: string;
	emergency_contact_name?: string;
	emergency_contact_phone?: string;
	membership_status?: string;
	membership_type?: string;
	membership_number?: string;
	membership_notes?: string;
	date_of_birth?: string;
	notes?: string;
	team_ids?: number[];
	flock_ids?: number[];
	events?: PersonEvent[];
	created_by: number;
	created_at: string;
	updated_at: string;
}

export interface PersonEvent {
	id: number;
	event_type_id: number;
	event_type: string;
	event_date: string;
	location?: string;
	notes?: string;
	file_url?: string | null;
}

export interface EventType {
	id: number;
	name: string;
	description?: string;
	is_active: boolean;
	sort_order: number;
}

export interface InviteToken {
	id: number;
	code: string;
	person_id: number;
	email: string;
	created_by: number;
	created_at: string;
	expires_at: string;
	used_at?: string | null;
	is_active: boolean;
	is_used: boolean;
	is_expired: boolean;
	is_valid: boolean;
}

export interface Team {
	id: number;
	name: string;
	description?: string;
	created_by: number;
	member_count?: number;
	created_at: string;
	updated_at: string;
}

export interface Group {
	id: number;
	name: string;
	description?: string;
	team_id?: number;
	created_by: number;
	member_count?: number;
	created_at: string;
	updated_at: string;
}

export interface GroupMember {
	id: number;
	group_id: number;
	person_id: number;
	role: 'member' | 'admin';
	joined_at: string;
}

export interface Event {
	id: number;
	title: string;
	description?: string;
	start_date: string;
	end_date?: string;
	all_day: boolean;
	recurrence_rule?: string;
	location?: string;
	created_by: number;
	created_at: string;
	updated_at: string;
}

export interface Organization {
	id: number;
	name: string;
	description?: string;
	email?: string;
	phone?: string;
	address?: string;
	address_street?: string;
	address_city?: string;
	address_region?: string;
	address_postal_code?: string;
	address_country?: string;
	website?: string;
	logo_url?: string;
}
