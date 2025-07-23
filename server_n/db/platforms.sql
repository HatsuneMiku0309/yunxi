-- public.platforms definition

-- Drop table

-- DROP TABLE public.platforms;

CREATE TABLE public.platforms (
	id serial4 NOT NULL,
	commission numeric NOT NULL,
	update_time timestamptz NULL,
	"name" varchar NOT NULL,
	cn_name varchar DEFAULT ''::character varying NULL,
	CONSTRAINT platforms_pk PRIMARY KEY (id),
	CONSTRAINT platforms_unique UNIQUE (name)
);