CREATE OR REPLACE FUNCTION calculate_loan_limit (
    p_pocket_id        INT,
    p_group_id         INT,
    p_user_id          INT
)
RETURNS NUMERIC(30, 2) AS $$
DECLARE
    v_total_contribution NUMERIC(30, 2);
    v_total_withdrawal   NUMERIC(30, 2);
    v_net_contribution   NUMERIC(30, 2);
    v_loan_limit         NUMERIC(30, 2);
BEGIN
    SELECT COALESCE(SUM(delta), 0)
    INTO v_total_contribution
    FROM transactions
    WHERE entity_id = p_group_id
      AND pocket_id = p_pocket_id
      AND type_id = 1
      AND EXISTS (
        SELECT 1
        FROM group_deposits
        WHERE group_id = p_group_id
          AND deposit_id = transactions.xid
          AND user_id = p_user_id
    );

    SELECT COALESCE(SUM(transactions.delta), 0)
    INTO v_total_withdrawal
    FROM transactions
    WHERE entity_id = p_group_id
      AND pocket_id = p_pocket_id
      AND transactions.xid IN (
        SELECT transaction_id
        FROM disbursements
        WHERE group_id = p_group_id
          AND user_id = p_user_id
    );

    IF v_total_withdrawal > v_total_contribution THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_WITHDRAWAL_EXCEEDS_CONTRIBUTION',
            ERRCODE = 'P0006';
    END IF;

    v_net_contribution = v_total_contribution - v_total_withdrawal;

    IF v_net_contribution > 0 THEN
        v_loan_limit = 0.80 * v_net_contribution;
    ELSE
        v_loan_limit = 0;
    END IF;

    RETURN v_loan_limit;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION calculate_loan_limit(INT, INT, INT) TO saveup_www;
SELECT create_distributed_function(
    'calculate_loan_limit(INT, INT, INT)', 'p_pocket_id'
);