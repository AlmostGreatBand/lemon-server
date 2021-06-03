
SET default_tablespace = ts_lemon;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS accounts
(
    account_id   serial PRIMARY KEY,
    account_name varchar(255) NOT NULL,
    login        varchar(100) NOT NULL,
    password     varchar      NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS iu_accounts$login ON accounts (login) TABLESPACE ts_lemon_indexes;

ALTER TABLE accounts
    ADD CONSTRAINT ch_accounts$login
        CHECK (login ~ '^\S+$');

CREATE TABLE IF NOT EXISTS banks
(
    bank_id   smallserial PRIMARY KEY,
    bank_name varchar(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS cards
(
    card_id    serial PRIMARY KEY,
    bank_id    smallint NOT NULL,
    account_id int      NOT NULL,
    card_num   smallint NOT NULL,
    type       varchar(255) DEFAULT NULL,
    balance    int      NOT NULL,
    currency   char(3)  NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS iu_accounts$account_id_card_num ON accounts (login) TABLESPACE ts_lemon_indexes;
ALTER TABLE cards
    ADD CONSTRAINT ch_len_cards$card_num
        CHECK (CHAR_LENGTH(card_num::text) BETWEEN 4 AND 16),
    ADD CONSTRAINT ch_cards$currency
        CHECK ( CHAR_LENGTH(currency) = 3 AND currency ~ '^\D+$'),
    ADD CONSTRAINT ch_not_negative
        CHECK ( card_num >= 0 ),
    ADD CONSTRAINT fk_cards$bank_id
        FOREIGN KEY (bank_id)
            REFERENCES banks (bank_id) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_cards$account_id
        FOREIGN KEY (account_id)
            REFERENCES accounts (account_id) ON DELETE CASCADE ON UPDATE CASCADE
;

CREATE INDEX IF NOT EXISTS bank_idx ON cards (bank_id) TABLESPACE ts_lemon_indexes;
CREATE INDEX IF NOT EXISTS account_idx ON cards (account_id) TABLESPACE ts_lemon_indexes;

CREATE TABLE IF NOT EXISTS transactions
(
    transaction_id       serial PRIMARY KEY,
    card_id              int DEFAULT NULL,
    amount               int NOT NULL,
    type                 varchar(255) DEFAULT NULL,
    transaction_datetime timestamptz DEFAULT NULL
);
ALTER TABLE transactions
ADD CONSTRAINT fk_transactions$card_id
FOREIGN KEY (card_id) REFERENCES cards (card_id) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT ch_transactions$transaction_datetime
CHECK ( EXTRACT(YEAR FROM transaction_datetime) >=1951 );

CREATE TABLE IF NOT EXISTS types
(
    type_id   smallserial PRIMARY KEY,
    type_name varchar(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS connection
(
    connection_id serial PRIMARY KEY,
    card_id       int      NOT NULL,
    type_id       smallint NOT NULL,
    value         varchar  NOT NULL
);
ALTER TABLE connection
ADD CONSTRAINT fk_connection$card_id
FOREIGN KEY (card_id) REFERENCES cards (card_id) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_connection$type_id
    FOREIGN KEY (type_id) REFERENCES types (type_id) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS type_idx ON connection (type_id) TABLESPACE ts_lemon_indexes;
CREATE INDEX IF NOT EXISTS card_idx ON connection (card_id) TABLESPACE ts_lemon_indexes;


