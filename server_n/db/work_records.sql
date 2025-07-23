-- public.work_records definition

-- Drop table

-- DROP TABLE public.work_records;

CREATE TABLE public.work_records (
	id serial4 NOT NULL,
	room_id int4 NULL,
	service_id int4 NULL,
	worker_id int4 NULL,
	start_time timestamptz NULL,
	end_time timestamptz NULL,
	addition varchar NOT NULL,
	service_pay_id int4 NULL,
	service_pay_platform varchar NULL,
	service_pay_price numeric NULL,
	service_pay_is_write bool NULL,
	other_pay_price numeric NULL,
	bonus_price numeric DEFAULT 0 NULL,
	extend_price numeric DEFAULT 0 NULL,
	"desc" varchar DEFAULT ''::character varying NULL,
	service_status int4 NOT NULL,
	status int4 NOT NULL,
	create_time timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	update_time timestamptz NULL,
	service_pay_salary_price numeric NULL,
	pay_time timestamptz NULL,
	service_pay_time int4 NULL,
	discount_price numeric DEFAULT 0 NULL,
	CONSTRAINT work_records_pkey PRIMARY KEY (id)
);