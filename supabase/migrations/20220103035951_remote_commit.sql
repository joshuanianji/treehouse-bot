-- This script was generated by the Schema Diff utility in pgAdmin 4
-- For the circular dependencies, the order in which Schema Diff writes the objects is not very sophisticated
-- and may require manual changes to the script to ensure changes are applied in the correct order.
-- Please report an issue for any failure with the reproduction steps.

CREATE TABLE IF NOT EXISTS public."NFTDev"
(
    id text COLLATE pg_catalog."default" NOT NULL,
    "fullHash" text COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "from" text COLLATE pg_catalog."default" NOT NULL,
    "ownedBy" text COLLATE pg_catalog."default" NOT NULL,
    "msgLink" text COLLATE pg_catalog."default" NOT NULL,
    "msgLinkValid" boolean NOT NULL DEFAULT true,
    type json NOT NULL,
    CONSTRAINT "NFTDev_pkey" PRIMARY KEY (id),
    CONSTRAINT "NFTDev_fullHash_key" UNIQUE ("fullHash")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."NFTDev"
    OWNER to supabase_admin;

ALTER TABLE IF EXISTS public."NFTDev"
    ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public."NFTDev" TO anon;

GRANT ALL ON TABLE public."NFTDev" TO authenticated;

GRANT ALL ON TABLE public."NFTDev" TO postgres;

GRANT ALL ON TABLE public."NFTDev" TO service_role;

GRANT ALL ON TABLE public."NFTDev" TO supabase_admin;

COMMENT ON TABLE public."NFTDev"
    IS 'NFT Table but Developer';

CREATE TABLE IF NOT EXISTS public."Dev"
(
    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    created_at timestamp with time zone DEFAULT now(),
    value text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Dev_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Dev"
    OWNER to supabase_admin;

ALTER TABLE IF EXISTS public."Dev"
    ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public."Dev" TO anon;

GRANT ALL ON TABLE public."Dev" TO authenticated;

GRANT ALL ON TABLE public."Dev" TO postgres;

GRANT ALL ON TABLE public."Dev" TO service_role;

GRANT ALL ON TABLE public."Dev" TO supabase_admin;

COMMENT ON TABLE public."Dev"
    IS 'Development table';

COMMENT ON COLUMN public."Dev".value
    IS 'Text value';