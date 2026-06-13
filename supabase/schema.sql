-- 图书管理系统数据库 Schema
-- 在 Supabase SQL Editor 中执行此文件

-- 1. 分类表
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 图书表
CREATE TABLE IF NOT EXISTS books (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  publisher TEXT,
  publish_date DATE,
  stock INT DEFAULT 1 CHECK (stock >= 0),
  available INT DEFAULT 1 CHECK (available >= 0),
  cover_image TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 读者表
CREATE TABLE IF NOT EXISTS members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  member_type TEXT DEFAULT '普通',
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 借阅表
CREATE TABLE IF NOT EXISTS borrowings (
  id BIGSERIAL PRIMARY KEY,
  book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  borrow_date DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  status TEXT DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. 启用 RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;

-- 6. RLS 策略：认证用户可读所有表
CREATE POLICY "认证用户可读分类" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "认证用户可读图书" ON books FOR SELECT TO authenticated USING (true);
CREATE POLICY "认证用户可读读者" ON members FOR SELECT TO authenticated USING (true);
CREATE POLICY "认证用户可读借阅" ON borrowings FOR SELECT TO authenticated USING (true);

-- 7. RLS 策略：认证用户可增删改
CREATE POLICY "认证用户可插入分类" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "认证用户可更新分类" ON categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "认证用户可删除分类" ON categories FOR DELETE TO authenticated USING (true);

CREATE POLICY "认证用户可插入图书" ON books FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "认证用户可更新图书" ON books FOR UPDATE TO authenticated USING (true);
CREATE POLICY "认证用户可删除图书" ON books FOR DELETE TO authenticated USING (true);

CREATE POLICY "认证用户可插入读者" ON members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "认证用户可更新读者" ON members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "认证用户可删除读者" ON members FOR DELETE TO authenticated USING (true);

CREATE POLICY "认证用户可插入借阅" ON borrowings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "认证用户可更新借阅" ON borrowings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "认证用户可删除借阅" ON borrowings FOR DELETE TO authenticated USING (true);

-- 8. 索引
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_borrowings_book ON borrowings(book_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_member ON borrowings(member_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_status ON borrowings(status);

-- 9. RPC 函数：原子借书（检查库存 + 减库存 + 创建记录）
CREATE OR REPLACE FUNCTION borrow_book(
  p_book_id BIGINT,
  p_member_id BIGINT,
  p_borrow_date DATE,
  p_due_date DATE
)
RETURNS BIGINT AS $$
DECLARE
  v_available INT;
  v_borrowing_id BIGINT;
BEGIN
  SELECT available INTO v_available FROM books WHERE id = p_book_id FOR UPDATE;

  IF v_available <= 0 THEN
    RAISE EXCEPTION '该书已无库存，无法借阅';
  END IF;

  UPDATE books SET available = available - 1 WHERE id = p_book_id;

  INSERT INTO borrowings (book_id, member_id, borrow_date, due_date, status)
  VALUES (p_book_id, p_member_id, p_borrow_date, p_due_date, 'borrowed')
  RETURNING id INTO v_borrowing_id;

  RETURN v_borrowing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. RPC 函数：原子还书（更新记录 + 加库存）
CREATE OR REPLACE FUNCTION return_book(p_borrowing_id BIGINT)
RETURNS VOID AS $$
DECLARE
  v_book_id BIGINT;
  v_status TEXT;
BEGIN
  SELECT book_id, status INTO v_book_id, v_status
  FROM borrowings WHERE id = p_borrowing_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '借阅记录不存在';
  END IF;

  IF v_status = 'returned' THEN
    RAISE EXCEPTION '该书已归还，请勿重复操作';
  END IF;

  UPDATE borrowings
  SET return_date = CURRENT_DATE, status = 'returned'
  WHERE id = p_borrowing_id;

  UPDATE books SET available = available + 1 WHERE id = v_book_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. RPC 函数：安全更新图书库存
CREATE OR REPLACE FUNCTION update_book_stock(p_book_id BIGINT, p_new_stock INT)
RETURNS VOID AS $$
DECLARE
  v_borrowed INT;
  v_new_available INT;
BEGIN
  SELECT COUNT(*) INTO v_borrowed
  FROM borrowings
  WHERE book_id = p_book_id AND status IN ('borrowed', 'overdue');

  v_new_available := p_new_stock - v_borrowed;

  IF v_new_available < 0 THEN
    RAISE EXCEPTION '库存不能小于当前借出数量（当前借出 % 本）', v_borrowed;
  END IF;

  UPDATE books
  SET stock = p_new_stock, available = v_new_available, updated_at = now()
  WHERE id = p_book_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
