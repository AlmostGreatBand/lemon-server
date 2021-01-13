CREATE DATABASE lemon TABLESPACE ts_lemon;
CREATE TABLESPACE ts_lemon LOCATION 'some location';
CREATE TABLESPACE ts_lemon_indexes LOCATION 'some location';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA lemon_schema;
SET search_path TO lemon_schema;
CREATE ROLE lemon_user WITH LOGIN;
GRANT SELECT, INSERT, DELETE, UPDATE ON ALL TABLES IN SCHEMA lemon_schema TO lemon_user;
