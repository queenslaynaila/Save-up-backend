CREATE OR REPLACE FUNCTION create_transfer(
    p_source_pocket_id INT,
    p_destination_pocket_id INT,
    p_user_id INT,
    p_amount NUMERIC(30, 2),
    p_entity_id INT
) RETURNS VOID AS $$
DECLARE
    v_is_locked                   BOOLEAN;
    v_source_transaction_id        INT;
    v_destination_transaction_id   INT;
    v_latest_election_id           INT;
BEGIN
    SELECT (pocket_type = 'Locked' AND target_at > NOW())
    INTO v_is_locked
    FROM pockets
    WHERE xid = p_source_pocket_id
      AND entity_id = p_entity_id;

    IF v_is_locked THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_FUNDS_LOCKED',
            ERRCODE = 'P0005';
    END IF;

    v_source_transaction_id := process_transaction(
        p_entity_id,
        'TransferOut',
        p_source_pocket_id,
        p_amount * -1
    );

    v_destination_transaction_id := process_transaction(
        p_entity_id,
        'TransferIn',
        p_destination_pocket_id,
        p_amount
    );

    IF EXISTS (
        SELECT 1
        FROM entities
        WHERE id = p_entity_id
          AND entity_type = 'Group'
    ) THEN
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
