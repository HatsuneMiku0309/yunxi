-- public.service_pays definition

-- Drop table

-- DROP TABLE public.service_pays;

CREATE TABLE public.service_pays (
	id serial4 NOT NULL,
	service_id int4 NOT NULL,
	platform varchar NOT NULL,
	price numeric NOT NULL,
	"time" int4 NOT NULL,
	is_write bool DEFAULT false NULL,
	create_time timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	update_time timestamptz NULL,
	salary_price numeric NOT NULL,
	platform_id int4 NULL,
	can_member_card bool DEFAULT false NULL,
	CONSTRAINT service_pays_pkey PRIMARY KEY (id)
);