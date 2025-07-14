CREATE OR REPLACE FUNCTION validate_pocket_before_debit(
    p_group_id INT,
    p_pocket_id INT,
    p_amount NUMERIC(30, 2),
    p_user_id INT,
    p_require_user_deposit_check BOOLEAN DEFAULT FALSE
) RETURNS VOID AS $$
DECLARE
    v_is_locked        BOOLEAN;
    v_current_balance  NUMERIC(30,2);
BEGIN
    SELECT (pocket_type = 'Locked' AND target_at > NOW())
    INTO STRICT v_is_locked
    FROM pockets
    WHERE pockets.xid = p_pocket_id
      AND pockets.entity_id = p_group_id;

    IF v_is_locked THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_FUNDS_LOCKED',
            ERRCODE = 'P0005';
    END IF;

    SELECT
        COALESCE(
            (SELECT balance
             FROM transactions
             WHERE pocket_id = p_pocket_id
             AND entity_id = p_group_id
             ORDER BY xid DESC
             LIMIT 1
             ), 0)
    INTO STRICT v_current_balance;

    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
            ERRCODE = 'P0004';
    END IF;


    IF p_require_user_deposit_check THEN
        IF NOT EXISTS (
            SELECT 1
            FROM group_deposits
            WHERE group_id = p_group_id
              AND user_id = p_user_id
        ) THEN
            RAISE EXCEPTION USING
                MESSAGE = 'ERR_NO_DEPOSIT_MADE',
                ERRCODE = 'P0006';
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION validate_pocket_before_debit(
    INT, INT, NUMERIC(30, 2), INT, BOOLEAN
) TO saveup_www;

SELECT create_distributed_function(
    'validate_pocket_before_debit(INT, INT, NUMERIC(30,2), INT, BOOLEAN)',
    'p_group_id'
);
