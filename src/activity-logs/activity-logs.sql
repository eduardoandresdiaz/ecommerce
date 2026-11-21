CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_owner_id uuid NOT NULL,
  actor_user_id uuid NOT NULL,
  actor_name varchar(100) NOT NULL,
  actor_email varchar(100) NOT NULL,
  action varchar(100) NOT NULL,
  entity_type varchar(50) NOT NULL,
  entity_id varchar(100),
  changes jsonb,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_activity_logs_merchant_date
  ON activity_logs (merchant_owner_id, created_at DESC);

CREATE INDEX ix_activity_logs_merchant_actor_date
  ON activity_logs (merchant_owner_id, actor_user_id, created_at DESC);

CREATE INDEX ix_activity_logs_merchant_action_date
  ON activity_logs (merchant_owner_id, action, created_at DESC);
