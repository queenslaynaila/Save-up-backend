CREATE INDEX idx_savings_user_id ON savings (user_id);
CREATE INDEX idx_savings_category ON savings (category);
CREATE INDEX idx_savings_priority ON savings (priority);
CREATE INDEX idx_savings_status ON savings (status);

CREATE INDEX idx_expenses_user_id ON expenses (user_id);
CREATE INDEX idx_expenses_category ON expenses (category);
CREATE INDEX idx_expenses_month ON expenses (month_extracted);

