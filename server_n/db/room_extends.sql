-- public.room_extends definition

-- Drop table

-- DROP TABLE public.room_extends;

CREATE TABLE public.room_extends (
	id serial4 NOT NULL,
	room_id int4 NOT NULL,
	worker_id int4 NULL,
	service_id int4 NULL,
	create_time timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	update_time timestamptz NULL,
	work_record_id int4 NULL,
	CONSTRAINT room_extends_pkey PRIMARY KEY (id)
);