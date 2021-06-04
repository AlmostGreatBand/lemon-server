CREATE FUNCTION validate_user(IN in_login VARCHAR(100), IN in_password VARCHAR, OUT INT)
    LANGUAGE sql
    STABLE AS
$$
SELECT account_id
FROM accounts
WHERE login = in_login
  AND password = crypt(in_password, password);
$$;

CREATE PROCEDURE insert_account(in_account_name VARCHAR(255), in_login VARCHAR(255), in_password VARCHAR)
    LANGUAGE plpgsql AS
$$
BEGIN
    INSERT INTO accounts (account_name, login, password)
    VALUES (in_account_name, in_login, crypt(in_password, gen_salt('bf')));
END ;
$$;

CREATE PROCEDURE insert_bank(in_bank_name VARCHAR(255))
    LANGUAGE plpgsql AS
$$
BEGIN
    INSERT INTO banks (bank_name) VALUES (in_bank_name);
END;
$$;

CREATE PROCEDURE insert_type(in_type_name VARCHAR(100))
    LANGUAGE plpgsql AS
$$
BEGIN
    INSERT INTO types (type_name) VALUES (in_type_name);
END;
$$;

CREATE PROCEDURE insert_card(in_bank_name VARCHAR(255), in_account_id INT, in_card_num INT, in_balance INT,
                             in_currency CHAR(3), in_type VARCHAR(255) DEFAULT NULL)
    LANGUAGE sql AS
$$
INSERT INTO cards (bank_id, account_id, card_num, balance, currency, type)
VALUES ((SELECT bank_id
         FROM banks
         WHERE bank_name = in_bank_name), in_account_id, in_card_num, in_balance, in_currency, in_type);
$$;

CREATE PROCEDURE insert_connection(in_card_num INT, in_account_id INT, in_type_name VARCHAR(100),
                                   in_value VARCHAR)
    LANGUAGE sql AS
$$
INSERT INTO connection (card_id, type_id, value)
VALUES ((SELECT card_id
         FROM cards
         WHERE card_num = in_card_num
           AND account_id = in_account_id), (SELECT type_id
                                             FROM types
                                             WHERE type_name = in_type_name), in_value);
$$;

CREATE PROCEDURE insert_transaction(in_card_num INT, in_amount INT, in_account_id INT DEFAULT NULL,
                                    in_type VARCHAR(255) DEFAULT NULL, in_transaction_datetime TIMESTAMP DEFAULT NULL)
    LANGUAGE sql AS
$$
INSERT INTO transactions (card_id, amount, type, transaction_datetime)
VALUES ((SELECT card_id
         FROM cards
         WHERE card_num = in_card_num
           AND account_id = in_account_id), in_amount, in_type, in_transaction_datetime);
$$;

CREATE PROCEDURE delete_card(IN in_account_id INT, IN in_card_num INT)
    LANGUAGE sql AS
$$
DELETE
FROM cards
WHERE account_id = in_account_id
  AND card_num = in_card_num;
$$;

CREATE PROCEDURE delete_account(IN in_account_id INT)
    LANGUAGE sql AS
$$
DELETE
FROM accounts
WHERE account_id = in_account_id;
$$;

CREATE PROCEDURE delete_connection(IN in_account_id INT, IN in_card_num INT, IN in_type_name VARCHAR(100))
    LANGUAGE sql AS
$$
DELETE
FROM connection
WHERE connection_id = (SELECT connection_id
                       FROM connection
                                INNER JOIN types
                                           ON types.type_id = connection.type_id AND types.type_name = in_type_name
                                INNER JOIN cards ON cards.card_id = connection.card_id AND
                                                    cards.account_id = in_account_id AND
                                                    card_num = in_card_num);
$$;

CREATE PROCEDURE delete_transaction(IN in_transaction_id INT)
    LANGUAGE sql AS
$$
DELETE
FROM transactions
WHERE transaction_id = in_transaction_id;
$$;

CREATE PROCEDURE update_account_login(IN in_account_id INT, IN in_login VARCHAR(100))
    LANGUAGE sql AS
$$
UPDATE accounts
SET login=in_login
WHERE account_id = in_account_id;
$$;

CREATE PROCEDURE update_account_password(IN in_account_id INT, IN in_password VARCHAR)
    LANGUAGE sql AS
$$
UPDATE accounts
SET password=crypt(in_password, gen_salt('bf'))
WHERE account_id = in_account_id;
$$;

CREATE PROCEDURE update_account_name(IN in_account_name VARCHAR, IN in_account_id INT)
    LANGUAGE sql AS
$$
UPDATE accounts
SET account_name=in_account_name
WHERE account_id = in_account_id;
$$;

--
CREATE PROCEDURE update_transaction_card(IN in_transaction_id INT, IN in_card_num SMALLINT DEFAULT NULL)
    LANGUAGE sql AS
$$
UPDATE transactions
SET card_id=cards.card_id
FROM cards
WHERE transactions.transaction_id = in_transaction_id
  AND cards.card_num = in_card_num;
$$;

--хз, пусть будет
CREATE PROCEDURE update_transaction_cash(IN in_transaction_id INT)
    LANGUAGE sql AS
$$
UPDATE transactions
SET card_id = NULL
WHERE transactions.transaction_id = in_transaction_id;
$$;

CREATE PROCEDURE update_amount_transaction(IN in_amount INT, IN in_transaction_id INT)
    LANGUAGE sql AS
$$
UPDATE transactions
SET amount=in_amount
WHERE transaction_id = in_transaction_id;
$$;

CREATE PROCEDURE update_transaction_type(IN in_transaction_type VARCHAR(255), IN in_transaction_id INT)
    LANGUAGE sql AS
$$
UPDATE transactions
SET type = in_transaction_type
WHERE transaction_id = in_transaction_id;
$$;

CREATE PROCEDURE update_transaction_datetime(IN in_transaction_datetime INT, IN in_transaction_id INT)
    LANGUAGE sql AS
$$
UPDATE transactions
SET transaction_datetime= in_transaction_datetime
WHERE transaction_id = in_transaction_id;
$$;

CREATE FUNCTION find_account_name(IN in_account_id INT, OUT out_account_name VARCHAR(255))
    LANGUAGE plpgsql AS
$$
BEGIN
    out_account_name := (SELECT account_name FROM accounts WHERE account_id = in_account_id);
END
$$;

CREATE FUNCTION find_bank_cards(IN in_account_id INT, IN in_bank_name VARCHAR(255))
    RETURNS TABLE
            (
                card_num SMALLINT,
                type     VARCHAR(255),
                balance  INTEGER,
                currency CHAR(3)
            )
AS
$body$
SELECT card_num, type, balance, currency
FROM cards
         INNER JOIN banks ON banks.bank_id = cards.bank_id AND banks.bank_name = in_bank_name AND
                             cards.account_id = in_account_id;
$body$ LANGUAGE sql;

CREATE FUNCTION find_last_transaction_timestamptz(IN in_account_id INT, IN in_card_num INT, OUT TIMESTAMP WITH TIME ZONE)
AS
$$
SELECT transaction_datetime
FROM transactions
         INNER JOIN cards ON cards.card_id = transactions.card_id AND card_num = in_card_num AND
                             cards.account_id = in_account_id
ORDER BY transaction_datetime DESC
LIMIT 1;
$$ LANGUAGE sql;
