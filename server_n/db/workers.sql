-- public.workers definition

-- Drop table

-- DROP TABLE public.workers;

CREATE TABLE public.workers (
	id serial4 NOT NULL,
	"no" varchar NOT NULL,
	"name" varchar DEFAULT ''::character varying NULL,
	"version" int4 NOT NULL,
	status int4 NOT NULL,
	room_id int4 NULL,
	service_id int4 NULL,
	user_id uuid NULL,
	create_time timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	update_time timestamptz NULL,
	enabled bool DEFAULT true NULL,
	work_record_id int4 NULL,
	CONSTRAINT workers_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX "idx-unique-no-version" ON public.workers USING btree (no, version);