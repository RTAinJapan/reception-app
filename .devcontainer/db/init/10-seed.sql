-- ローカル開発用のサンプルデータ。code がQRの値になる。
-- start_at/end_at は十分広い期間にして「有効期限外」にならないようにする。
INSERT INTO receptiondb.visitor (name, category, start_at, end_at, identifier, code) VALUES
  ('テスト太郎', '走者', '2020-01-01 00:00:00', '2099-12-31 23:59:59', 'id-001', 'CODE001'),
  ('テスト花子', '観客', '2020-01-01 00:00:00', '2099-12-31 23:59:59', 'id-002', 'CODE002'),
  ('解説ジロー', '解説', '2020-01-01 00:00:00', '2099-12-31 23:59:59', 'id-003', 'CODE003');

INSERT INTO receptiondb.badgeholder (name, category, start_at, end_at, identifier, code) VALUES
  ('名札ボブ', 'スタッフ', '2020-01-01 00:00:00', '2099-12-31 23:59:59', 'id-100', 'BADGE100');
