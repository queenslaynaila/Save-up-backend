--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2 (Ubuntu 16.2-1.pgdg22.04+1)
-- Dumped by pg_dump version 16.2 (Ubuntu 16.2-1.pgdg22.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: role_enum; Type: TYPE; Schema: public; Owner: saveup
--

CREATE TYPE public.role_enum AS ENUM (
    'admin',
    'user',
    'moderator'
);


ALTER TYPE public.role_enum OWNER TO saveup;

--
-- Name: status_enum; Type: TYPE; Schema: public; Owner: saveup
--

CREATE TYPE public.status_enum AS ENUM (
    'In Progress',
    'Completed',
    'Dormant'
);


ALTER TYPE public.status_enum OWNER TO saveup;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: saveup
--

CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    name character varying(255) NOT NULL,
    description character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO saveup;

--
-- Name: contributions; Type: TABLE; Schema: public; Owner: saveup
--

CREATE TABLE public.contributions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    saving_id uuid NOT NULL,
    amount numeric(30,3) NOT NULL,
    date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.contributions OWNER TO saveup;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: saveup
--

CREATE TABLE public.expenses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    category_id uuid,
    description character varying(255),
    amount numeric(30,3) NOT NULL,
    date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.expenses OWNER TO saveup;

--
-- Name: savings; Type: TABLE; Schema: public; Owner: saveup
--

CREATE TABLE public.savings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    description character varying(255) NOT NULL,
    category_id uuid,
    target_amount numeric(30,3) NOT NULL,
    priority character varying(255),
    status public.status_enum DEFAULT 'In Progress'::public.status_enum,
    target_date timestamp with time zone,
    start_date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.savings OWNER TO saveup;

--
-- Name: security_answers; Type: TABLE; Schema: public; Owner: saveup
--

CREATE TABLE public.security_answers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    question_id uuid NOT NULL,
    user_id uuid NOT NULL,
    answer character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.security_answers OWNER TO saveup;

--
-- Name: security_questions; Type: TABLE; Schema: public; Owner: saveup
--

CREATE TABLE public.security_questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    question character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.security_questions OWNER TO saveup;

--
-- Name: users; Type: TABLE; Schema: public; Owner: saveup
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    phone_number character varying(255),
    role public.role_enum DEFAULT 'user'::public.role_enum NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT phone_number_format_check CHECK (((phone_number)::text ~* '^\+?254[0-9]{9}$'::text))
);


ALTER TABLE public.users OWNER TO saveup;

--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: contributions contributions_pkey; Type: CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.contributions
    ADD CONSTRAINT contributions_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: savings savings_pkey; Type: CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.savings
    ADD CONSTRAINT savings_pkey PRIMARY KEY (id);


--
-- Name: security_answers security_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.security_answers
    ADD CONSTRAINT security_answers_pkey PRIMARY KEY (id);


--
-- Name: security_questions security_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.security_questions
    ADD CONSTRAINT security_questions_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: expenses_category_idx; Type: INDEX; Schema: public; Owner: saveup
--

CREATE INDEX expenses_category_idx ON public.expenses USING btree (category_id);


--
-- Name: expenses_user_id_idx; Type: INDEX; Schema: public; Owner: saveup
--

CREATE INDEX expenses_user_id_idx ON public.expenses USING btree (user_id);


--
-- Name: savings_category_idx; Type: INDEX; Schema: public; Owner: saveup
--

CREATE INDEX savings_category_idx ON public.savings USING btree (category_id);


--
-- Name: savings_priority_idx; Type: INDEX; Schema: public; Owner: saveup
--

CREATE INDEX savings_priority_idx ON public.savings USING btree (priority);


--
-- Name: savings_status_idx; Type: INDEX; Schema: public; Owner: saveup
--

CREATE INDEX savings_status_idx ON public.savings USING btree (status);


--
-- Name: savings_user_id_idx; Type: INDEX; Schema: public; Owner: saveup
--

CREATE INDEX savings_user_id_idx ON public.savings USING btree (user_id);


--
-- Name: categories categories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: contributions contributions_saving_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.contributions
    ADD CONSTRAINT contributions_saving_id_fkey FOREIGN KEY (saving_id) REFERENCES public.savings(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: expenses expenses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: savings savings_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.savings
    ADD CONSTRAINT savings_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: savings savings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.savings
    ADD CONSTRAINT savings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: security_answers security_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.security_answers
    ADD CONSTRAINT security_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.security_questions(id);


--
-- Name: security_answers security_answers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.security_answers
    ADD CONSTRAINT security_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: security_questions security_questions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: saveup
--

ALTER TABLE ONLY public.security_questions
    ADD CONSTRAINT security_questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

