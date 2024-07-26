#!/bin/bash

# Define the desired filenames in the correct order
filenames=(
  "0001_users.sql"
  "0002_categories.sql"
  "0003_pockets.sql"
  "0004_create_user.sql"
  "0005_update_phone_number.sql"
  "0006_update_id_number.sql"
  "0007_update_user_role.sql"
  "0008_next_of_kin.sql"
  "0009_security_questions.sql"
  "0010_security_answers.sql"
  "0011_create_answer.sql"
  "0012_reset_tokens.sql"
  "0013_expenses.sql"
  "0014_interestRates.sql"
  "0015_groups.sql"
  "0016_join_group.sql"
  "0017_create_groups.sql"
  "0018_check_grp_membership.sql"
  "0019_get_group_mbrs.sql"
  "0020_update_group_name.sql"
  "0021_leave_group.sql"
  "0022_invitations.sql"
  "0023_send_invite.sql"
  "0024_update_invites.sql"
  "0025_elections.sql"
  "0026_create_elections.sql"
  "0027_get_ongoing_election.sql"
  "0028_get_candidates.sql"
  "0029_create_ballots.sql"
  "0030_compute_ballot.sql"
  "0031_compute_ratification.sql"
  "0032_donors.sql"
  "0033_create_donor.sql"
  "0034_transaction_logs.sql"
  "0035_get_transaction_info.sql"
  "0036_insert_transaction.sql"
  "0037_delete_pocket.sql"
  "0038_create_user_saving.sql"
  "0039_create_user_withdrawal.sql"
  "0040_create_transfr.sql"
  "0041_group_transactions.sql"
  "0042_get_grp_transcations.sql"
  "0043_create_group_deposit.sql"
  "0044_remove_member.sql"
  "0045_initiate_grp_withdrawals.sql"
  "0046_get_withdrawal_requests.sql"
  "0047_compute_grp_withdrawal.sql"
  "0048_complete_grp_withdrawal.sql"
  "0049_loan_transactions.sql"
  "0050_calculate_loan_limit.sql"
  "0051_request_loan.sql"
  "0052_approve-loan.sql"
  "0053_compute_loan_approvals.sql"
)

# Temporary array to hold the current filenames
current_files=(*.sql)

# Loop through each desired filename and rename the files accordingly
for i in "${!filenames[@]}"; do
  if [ -f "${current_files[i]}" ]; then
    mv "${current_files[i]}" "${filenames[i]}"
  fi
done

echo "File numbering fixed."
