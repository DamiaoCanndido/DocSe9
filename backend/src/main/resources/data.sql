INSERT INTO tb_roles (role_id, name) VALUES (1, 'basic') ON CONFLICT (role_id) DO NOTHING;
INSERT INTO tb_roles (role_id, name) VALUES (2, 'manager') ON CONFLICT (role_id) DO NOTHING;
INSERT INTO tb_roles (role_id, name) VALUES (3, 'admin') ON CONFLICT (role_id) DO NOTHING;