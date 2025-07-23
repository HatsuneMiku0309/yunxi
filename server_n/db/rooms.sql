-- public.rooms definition

-- Drop table

-- DROP TABLE public.rooms;

CREATE TABLE public.rooms (
	id serial4 NOT NULL,
	"no" varchar NOT NULL,
	"name" varchar DEFAULT ''::character varying NULL,
	status int4 NOT NULL,
	create_time timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	update_time timestamptz NULL,
	"desc" varchar DEFAULT ''::character varying NULL,
	CONSTRAINT rooms_no_key UNIQUE (no),
	CONSTRAINT rooms_pkey PRIMARY KEY (id)
);