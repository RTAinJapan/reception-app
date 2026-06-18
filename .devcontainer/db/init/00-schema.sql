-- reception-server の sql/01.table.sql は receptiondb スキーマにテーブルを作成するが、
-- CREATE SCHEMA が無いためローカルでは補う（DB 自体は POSTGRES_DB=receptiondb で作成済み）。
CREATE SCHEMA IF NOT EXISTS receptiondb;

-- 観客データ
CREATE TABLE receptiondb.visitor (
  id BIGSERIAL NOT NULL,
  name varchar(255) not null,
  category text not null,
  start_at timestamp not null,
  end_at timestamp not null,
  identifier text not null,
  code text not null,
  PRIMARY KEY (id)
);

-- 名札持ち
CREATE TABLE receptiondb.badgeholder (
  id BIGSERIAL NOT NULL,
  name varchar(255) not null,
  category text not null,
  start_at timestamp not null,
  end_at timestamp not null,
  identifier text not null,
  code text not null,
  PRIMARY KEY (id)
);

-- 受付済みユーザー
CREATE TABLE receptiondb.accepted (
  id BIGSERIAL NOT NULL,
  name varchar(64) not null,
  category varchar(64) not null,
  code varchar(64) not null,
  timestamp timestamp default CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
