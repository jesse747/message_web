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
	emergency_contact_name?: string;
	emergency_contact_phone?: string;
	membership_status?: string;
	membership_type?: string;
	membership_number?: string;
	membership_start_date?: string;
	date_joined?: string;
	date_of_birth?: string;
	baptism_date?: string;
	baptism_location?: string;
	transferred_from?: string;
	membership_notes?: string;
	notes?: string;
	team_ids?: number[];
	flock_ids?: number[];
	created_by: number;
	created_at: string;
	updated_at: string;
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
	logo_url?: string;
}
