INSERT INTO tb_roles (role_id, name) VALUES (1, 'basic') ON CONFLICT (role_id) DO NOTHING;
INSERT INTO tb_roles (role_id, name) VALUES (2, 'admin') ON CONFLICT (role_id) DO NOTHING;