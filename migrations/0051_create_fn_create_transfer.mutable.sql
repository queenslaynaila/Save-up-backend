CREATE OR REPLACE FUNCTION create_transfer(
    p_source_pocket_id        INT,
    p_destination_pocket_id   INT,
    p_user_id                INT,
    p_amount                 NUMERIC(30, 2),
    p_entity_id              INT
) 
RETURNS VOID AS $$
DECLARE
    v_source_balance          NUMERIC(30, 2);
    v_destination_balance     NUMERIC(30, 2);
    v_new_source_balance      NUMERIC(30, 2);
    v_new_destination_balance NUMERIC(30, 2);
    v_reference_id           INT;
    v_is_group               BOOLEAN;
    v_pocket_type            TEXT;
    v_target_at              TIMESTAMP WITH TIME ZONE;
    v_source_transaction_id  INT;
    v_destination_transaction_id INT;
    v_transaction_out_type_id INT;
    v_transaction_in_type_id  INT;
    v_latest_election_id      INT;
BEGIN
    SELECT entity_type = 'Group' 
    INTO STRICT v_is_group 
    FROM entities
    WHERE id = p_entity_id;

    SELECT pocket_type, target_at
    INTO STRICT v_pocket_type, v_target_at
    FROM pockets
    WHERE xid = p_source_pocket_id
      AND entity_id = p_entity_id;

    IF v_pocket_type = 'Locked' AND v_target_at > NOW() THEN
        RAISE EXCEPTION USING 
            MESSAGE = 'ERR_FUNDS_LOCKED',
            ERRCODE = 'P0005';
    END IF;

    v_source_balance := get_transaction_info(p_entity_id, p_source_pocket_id);
    IF v_source_balance < p_amount THEN
        RAISE EXCEPTION USING 
            MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
            ERRCODE = 'P0004';
    END IF;

    SELECT 
        (SELECT id FROM transaction_types WHERE slug = 'TransferOut'),
        (SELECT id FROM transaction_types WHERE slug = 'TransferIn')
    INTO STRICT v_transaction_out_type_id, v_transaction_in_type_id;

    v_destination_balance := get_transaction_info(p_entity_id, p_destination_pocket_id);
    v_new_source_balance := v_source_balance - p_amount;
    v_new_destination_balance := v_destination_balance + p_amount;
    v_reference_id := floor(random() * 1000000 + 1)::INT;

    v_source_transaction_id := insert_transaction_log(
        p_entity_id,
        v_transaction_out_type_id,
        p_source_pocket_id,
        v_reference_id,
        p_amount * -1,
        v_new_source_balance
    );

    v_destination_transaction_id := insert_transaction_log(
        p_entity_id,
        v_transaction_in_type_id,
        p_destination_pocket_id,
        v_reference_id,
        p_amount,
        v_new_destination_balance
    );

    IF v_is_group THEN
        SELECT MAX(xid)
        INTO STRICT v_latest_election_id
        FROM elections
        WHERE group_id = p_entity_id
          AND status = 'Closed'
          AND closed_at IS NOT NULL;

        INSERT INTO group_transfers (
            group_id,
            source_transaction_id,
            destination_transaction_id,
            election_id,
            admin_id,
            created_at
        ) VALUES (
            p_entity_id,
            v_source_transaction_id,
            v_destination_transaction_id,
            v_latest_election_id,
            p_user_id,
            NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_transfer(
    INT, INT, INT, NUMERIC(30, 2), INT
) TO saveup_www;

SELECT create_distributed_function(
    'create_transfer(INT, INT, INT, NUMERIC(30, 2), INT)',
    'p_source_pocket_id'
);