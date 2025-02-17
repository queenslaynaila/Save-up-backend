CREATE OR REPLACE FUNCTION create_transfer(
    p_source_pocket_id        INT,
    p_destination_pocket_id   INT,
    p_user_id                 INT, -- The group member or individual user doing the transfer
    p_amount                  NUMERIC(30, 2),
    p_entity_id               INT -- Represents user_id for individual & group_id for group transfers
)
RETURNS VOID AS $$
DECLARE
    v_source_balance          NUMERIC(30, 2);
    v_destination_balance     NUMERIC(30,2);
    v_new_source_balance      NUMERIC(30, 2);
    v_new_destination_balance NUMERIC(30, 2);
    v_reference_id            INT;
    v_is_group_transfer       BOOLEAN;
    v_latest_election_id      INT;
    v_pocket_type             TEXT;
    v_target_at               TIMESTAMP WITH TIME ZONE;
    v_transaction_id          INT;
BEGIN
    v_is_group_transfer := p_entity_id <> p_user_id;

    IF v_is_group_transfer THEN
        SELECT MAX(xid)
        INTO STRICT v_latest_election_id
        FROM elections
        WHERE group_id = p_entity_id
            AND status = 'Closed'
            AND closed_at IS NOT NULL;

        IF NOT EXISTS (
            SELECT 1 FROM group_admins
            WHERE user_id = p_user_id
                AND group_id = p_entity_id
                AND election_id = v_latest_election_id
        ) THEN
            RAISE EXCEPTION USING MESSAGE = 'ERR_NOT_ADMIN', ERRCODE = 'P0001';
        END IF;
    END IF;

    SELECT pocket_type, target_at
    INTO STRICT v_pocket_type, v_target_at
    FROM pockets
    WHERE xid = p_source_pocket_id
        AND entity_id = p_entity_id;

    IF v_pocket_type = 'Locked' AND v_target_at > NOW() THEN
        RAISE EXCEPTION USING MESSAGE = 'ERR_FUNDS_LOCKED', ERRCODE = 'P0005';
    END IF;

    v_source_balance := get_transaction_info(p_entity_id, p_source_pocket_id);
    IF v_source_balance < p_amount THEN
        RAISE EXCEPTION USING MESSAGE = 'ERR_INSUFFICIENT_FUNDS', ERRCODE = 'P0004';
    END IF;

    v_destination_balance := get_transaction_info(p_entity_id, p_destination_pocket_id);
    v_new_source_balance := v_source_balance - p_amount;
    v_new_destination_balance := v_destination_balance + p_amount;
    v_reference_id := floor(random() * 1000000 + 1)::INT;

    v_transaction_id := insert_transaction_log(
        p_entity_id, 6, p_destination_pocket_id, v_reference_id, p_amount, v_new_destination_balance
    );

    PERFORM insert_transaction_log(
        p_entity_id, 7, p_source_pocket_id, v_reference_id, p_amount, v_new_source_balance
    );

    IF v_is_group_transfer THEN
        INSERT INTO group_transfers (group_id, transaction_id, election_id, admin_id, created_at)
        VALUES (p_entity_id, v_transaction_id, v_latest_election_id, p_user_id, NOW());
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_transfer(INT, INT, INT, NUMERIC, INT) TO app_user;
SELECT create_distributed_function(
    'create_transfer(INT, INT, INT, NUMERIC, INT)', 'p_source_pocket_id'
);
