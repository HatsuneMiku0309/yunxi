-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id uuid NOT NULL,
	account varchar NOT NULL,
	"password" varchar NOT NULL,
	create_time timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	update_time timestamptz NULL,
	is_admin bool DEFAULT false NULL,
	worker_id int4 NULL,
	CONSTRAINT users_account_key UNIQUE (account),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);