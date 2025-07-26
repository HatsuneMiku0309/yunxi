-- public.members definition

-- Drop table

-- DROP TABLE public.members;

CREATE TABLE public.members (
	id uuid NOT NULL,
	"name" varchar NOT NULL,
	phone varchar NOT NULL,
	price numeric NOT NULL,
	is_first bool DEFAULT true NULL,
	create_time timestamptz DEFAULT now() NULL,
	update_time timestamptz NULL,
	first_discount int4 NOT NULL,
	discount int4 NOT NULL,
	CONSTRAINT member_pk PRIMARY KEY (id),
	CONSTRAINT members_unique UNIQUE (phone)
);
CREATE INDEX members_name1_idx ON public.members USING btree (name);
CREATE INDEX members_name_idx ON public.members USING btree (name, phone);