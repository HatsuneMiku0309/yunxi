-- public.services definition

-- Drop table

-- DROP TABLE public.services;

CREATE TABLE public.services (
	id serial4 NOT NULL,
	"name" varchar NOT NULL,
	price numeric NOT NULL,
	"time" int4 NOT NULL,
	"desc" varchar DEFAULT ''::character varying NULL,
	create_time timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	update_time timestamptz NULL,
	"order" int4 NOT NULL,
	enabled bool DEFAULT true NULL,
	CONSTRAINT services_pkey PRIMARY KEY (id)
);