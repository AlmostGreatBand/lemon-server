--Run as root
-- CREATE ROLE lemon_admin WITH LOGIN PASSWORD 'pa$$w0rd' CREATEROLE CREATEDB;

--DROP SCHEMA myschema CASCADE;
--RUN AS lemon_admin \/
-- DROP DATABASE IF EXISTS lemon;
-- CREATE TABLESPACE ts_lemon LOCATION '/home/vano/Documents/ts/lemon';
-- CREATE TABLESPACE ts_lemon_indexes LOCATION '/home/vano/Documents/ts/lemon_indexes';
--CREATE DATABASE lemon TABLESPACE ts_lemon;
CREATE SCHEMA lemon_schema;
SET search_path TO lemon_schema;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

--
-- CREATE ROLE lemon_user WITH LOGIN;
-- GRANT SELECT, INSERT, DELETE, UPDATE ON ALL TABLES IN SCHEMA lemon_schema TO lemon_user;

