-- public.base_settings definition

-- Drop table

-- DROP TABLE public.base_settings;

CREATE TABLE public.base_settings (
	id serial4 NOT NULL,
	"name" varchar NOT NULL,
	value numeric NOT NULL,
	value_str varchar DEFAULT ''::character varying NULL,
	update_time timestamptz NULL,
	CONSTRAINT base_settings_pk PRIMARY KEY (id),
	CONSTRAINT base_settings_unique UNIQUE (name)
);