CREATE TABLE public.stocks (
    "id"        serial NOT NULL,
    "timestamp" timestamp without time zone NOT NULL DEFAULT now(),
    "symbol"    character varying(5) NOT NULL,
    "open"      double precision NOT NULL,
    "close"     double precision NOT NULL,
    "high"      double precision NOT NULL,
    "low"       double precision NOT NULL,
    "volume"    double precision NOT NULL
  );

ALTER TABLE public.stocks ADD CONSTRAINT stocks_pkey PRIMARY KEY (id);
ALTER TABLE public.stocks ADD CONSTRAINT unique_symbol UNIQUE (symbol);

CREATE TABLE public.users (
    "id"            serial NOT NULL,
    "created_at"    timestamp without time zone NOT NULL DEFAULT now(),
    "fullname"      character varying(255) NOT NULL,
    "email"         character varying(255) NOT NULL
    "password"      character varying(255) NOT NULL
  );

ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

CREATE TABLE public.watchlist (
    "id"            serial NOT NULL,
    "created_at"    timestamp without time zone NOT NULL DEFAULT now(),
    "user_id"       integer NOT NULL,
    "symbol"        character varying(5) NOT NULL
  );

ALTER TABLE public.watchlist ADD CONSTRAINT watchlist_pkey PRIMARY KEY ("id");
ALTER TABLE public.watchlist ADD CONSTRAINT user_symbol UNIQUE ("user_id", "symbol");

ALTER TABLE public.watchlist ADD CONSTRAINT fk_user FOREIGN KEY ("user_id") REFERENCES public.users (id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.watchlist ADD CONSTRAINT fk_symbol FOREIGN KEY ("symbol") REFERENCES public.stocks (symbol) ON UPDATE CASCADE ON DELETE CASCADE;


CREATE TABLE public."sessions" (
    id          serial NOT NULL,
    created_at  timestamp without time zone NOT NULL DEFAULT now(),
    user_id     integer NOT NULL,
    session_id  character varying(255) NOT NULL
  );

ALTER TABLE public."sessions" ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
ALTER TABLE public."sessions" ADD CONSTRAINT fk_sessions_user FOREIGN KEY ("user_id") REFERENCES public.users (id) ON UPDATE CASCADE ON DELETE CASCADE;
