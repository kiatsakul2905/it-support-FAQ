-- IT Support Knowledge Base - Database Migration
-- Run this in your Neon SQL Editor to set up the database

-- ========================================
-- 1. CREATE TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50) DEFAULT 'folder',
  color VARCHAR(20) DEFAULT '#00ff41',
  description TEXT,
  problem_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problems (
  id SERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) NOT NULL UNIQUE,
  symptoms TEXT NOT NULL,
  causes TEXT NOT NULL,
  solution TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problem_tags (
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (problem_id, tag_id)
);

-- ========================================
-- 2. CREATE INDEXES for performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category_id);
CREATE INDEX IF NOT EXISTS idx_problems_slug ON problems(slug);
CREATE INDEX IF NOT EXISTS idx_problems_created ON problems(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_problems_views ON problems(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_problems_helpful ON problems(helpful_count DESC);
CREATE INDEX IF NOT EXISTS idx_problem_tags_problem ON problem_tags(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_tags_tag ON problem_tags(tag_id);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_problems_fts ON problems 
  USING gin(to_tsvector('english', title || ' ' || symptoms || ' ' || solution));

-- ========================================
-- 3. SEED DATA - Categories
-- ========================================

INSERT INTO categories (name, slug, icon, color, description) VALUES
  ('Hardware', 'hardware', 'cpu', '#ff6b35', 'ปัญหาเกี่ยวกับอุปกรณ์ฮาร์ดแวร์ เช่น คอมพิวเตอร์ เครื่องพิมพ์ หน่วยความจำ'),
  ('Software', 'software', 'monitor', '#00d4ff', 'ปัญหาเกี่ยวกับซอฟต์แวร์ ระบบปฏิบัติการ และแอปพลิเคชัน'),
  ('Network', 'network', 'wifi', '#00ff41', 'ปัญหาเกี่ยวกับเครือข่าย อินเทอร์เน็ต และการเชื่อมต่อ'),
  ('Security', 'security', 'shield', '#ff3a3a', 'ปัญหาด้านความปลอดภัย ไวรัส และการป้องกันข้อมูล'),
  ('Email', 'email', 'mail', '#ffb800', 'ปัญหาเกี่ยวกับอีเมลและการสื่อสาร'),
  ('Printer', 'printer', 'printer', '#a855f7', 'ปัญหาเกี่ยวกับเครื่องพิมพ์และอุปกรณ์ต่อพ่วง')
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- 4. SEED DATA - Tags
-- ========================================

INSERT INTO tags (name, slug) VALUES
  ('windows11', 'windows11'),
  ('windows10', 'windows10'),
  ('wifi', 'wifi'),
  ('printer', 'printer'),
  ('outlook', 'outlook'),
  ('teams', 'teams'),
  ('vpn', 'vpn'),
  ('slow', 'slow'),
  ('crash', 'crash'),
  ('blue-screen', 'blue-screen'),
  ('no-internet', 'no-internet'),
  ('virus', 'virus'),
  ('password', 'password'),
  ('driver', 'driver'),
  ('update', 'update')
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- 5. SEED DATA - Sample Problems
-- ========================================

-- Problem 1: WiFi
INSERT INTO problems (title, slug, symptoms, causes, solution, category_id) VALUES (
  'WiFi เชื่อมต่อไม่ได้ หรือหลุดบ่อย',
  'wifi-disconnection',
  '- ไม่สามารถเชื่อมต่อ WiFi ได้
- WiFi หลุดและเชื่อมต่อใหม่บ่อยๆ
- เชื่อมต่อได้แต่ไม่มีอินเทอร์เน็ต
- ไอคอน WiFi มีเครื่องหมายแสดงข้อผิดพลาด',
  '- Network adapter driver เสียหายหรือล้าสมัย
- IP Address ซ้ำกับอุปกรณ์อื่น
- DNS Server มีปัญหา
- ระยะห่างจาก Access Point มากเกินไป
- ช่องสัญญาณ WiFi ถูกรบกวน (Interference)',
  '### วิธีแก้ไขขั้นที่ 1: รีเซ็ต Network Settings
1. เปิด Command Prompt (Admin)
2. พิมพ์คำสั่งต่อไปนี้ตามลำดับ:
   ```
   netsh winsock reset
   netsh int ip reset
   ipconfig /release
   ipconfig /renew
   ipconfig /flushdns
   ```
3. รีสตาร์ทเครื่อง

### วิธีแก้ไขขั้นที่ 2: อัปเดต Driver
1. คลิกขวา Start → Device Manager
2. ขยาย Network Adapters
3. คลิกขวา WiFi Adapter → Update Driver
4. เลือก "Search automatically"

### วิธีแก้ไขขั้นที่ 3: เปลี่ยน DNS
1. เปิด Network Settings
2. เลือก Properties ของ WiFi
3. เลือก IPv4 → Properties
4. ใส่ DNS: 8.8.8.8 และ 8.8.4.4',
  (SELECT id FROM categories WHERE slug = 'network')
);

-- Problem 2: Printer
INSERT INTO problems (title, slug, symptoms, causes, solution, category_id) VALUES (
  'เครื่องพิมพ์ไม่พิมพ์งาน / งานค้างใน Queue',
  'printer-stuck-queue',
  '- คลิกพิมพ์แล้วไม่มีอะไรออกมา
- เห็นงานค้างใน Print Queue แต่ไม่พิมพ์
- สถานะเครื่องพิมพ์แสดงว่า "Offline"
- พิมพ์แล้วรอนานมากแต่ไม่ออก',
  '- Print Spooler Service หยุดทำงาน
- งานพิมพ์ก่อนหน้าค้างและบล็อกงานใหม่
- Driver เครื่องพิมพ์มีปัญหา
- เครื่องพิมพ์ถูกตั้งค่าเป็น Offline',
  '### วิธีแก้ไขด่วน: ล้าง Print Queue
1. เปิด Command Prompt (Admin)
2. พิมพ์:
   ```
   net stop spooler
   del /Q /F /S "%systemroot%\System32\spool\PRINTERS\*.*"
   net start spooler
   ```
3. ลองพิมพ์อีกครั้ง

### ตั้งค่า Printer Online
1. ไปที่ Settings → Devices → Printers
2. คลิกขวาที่เครื่องพิมพ์
3. ยกเลิก "Use Printer Offline" ถ้ามีเครื่องหมายถูก

### ลบและติดตั้ง Printer ใหม่
1. ลบ Printer เก่าออก
2. ดาวน์โหลด Driver ใหม่จากเว็บผู้ผลิต
3. ติดตั้งและเพิ่ม Printer ใหม่',
  (SELECT id FROM categories WHERE slug = 'printer')
);

-- Problem 3: Blue Screen
INSERT INTO problems (title, slug, symptoms, causes, solution, category_id) VALUES (
  'หน้าจอฟ้า (Blue Screen of Death / BSOD)',
  'blue-screen-bsod',
  '- หน้าจอเปลี่ยนเป็นสีน้ำเงินและแสดง Error Code
  - เครื่องรีสตาร์ทอัตโนมัติ
  - Error codes เช่น SYSTEM_THREAD_EXCEPTION, MEMORY_MANAGEMENT
  - เกิดซ้ำหลายครั้งในวันเดียว',
  '- RAM เสียหายหรือมีปัญหา
  - Driver ไม่เข้ากัน (โดยเฉพาะหลัง Windows Update)
  - Disk มี Bad Sector
  - Overheating ของ CPU/GPU
  - System File เสียหาย',
  '### ตรวจสอบ Error Code
1. จดบันทึก Error Code ที่ปรากฏ (เช่น 0x0000007B)
2. ค้นหาใน Microsoft Support เพื่อหาสาเหตุเฉพาะ

### ตรวจสอบ Memory
```
1. กด Windows + R → พิมพ์ mdsched.exe
2. เลือก Restart now and check for problems
3. รอการตรวจสอบเสร็จสิ้น
```

### ซ่อม System Files
```
sfc /scannow
DISM /Online /Cleanup-Image /RestoreHealth
```

### ตรวจ Disk
```
chkdsk C: /f /r /x
```

### ถ้ายังไม่หาย
- Boot เข้า Safe Mode และ Uninstall Driver ที่ติดตั้งล่าสุด
- ทำ System Restore ไปก่อนเกิดปัญหา
- ติดต่อ IT Support เพื่อตรวจสอบ Hardware',
  (SELECT id FROM categories WHERE slug = 'hardware')
);

-- Problem 4: Outlook
INSERT INTO problems (title, slug, symptoms, causes, solution, category_id) VALUES (
  'Outlook ส่งอีเมลไม่ได้หรือรับอีเมลไม่ได้',
  'outlook-send-receive-error',
  '- คลิก Send แล้วอีเมลค้างอยู่ใน Outbox
  - ไม่มีอีเมลใหม่เข้าทั้งที่ผู้อื่นบอกว่าส่งแล้ว
  - แสดง Error "Cannot connect to server"
  - Outlook แสดงสถานะ "Disconnected" ด้านล่าง',
  '- Outlook Profile เสียหาย
  - Password บัญชีหมดอายุหรือเปลี่ยนแล้ว
  - Exchange Server มีปัญหา
  - PST/OST File เสียหาย
  - Firewall บล็อก Outlook',
  '### ตรวจสอบการเชื่อมต่อ
1. มุมล่างขวาของ Outlook → ดู Connection Status
2. ถ้าแสดง "Disconnected" → ตรวจ Internet Connection

### รีเซ็ต Outlook Profile
1. Control Panel → Mail → Show Profiles
2. Add Profile ใหม่
3. ตั้งค่าบัญชีใหม่อีกครั้ง

### Repair Office
1. Control Panel → Programs → Microsoft 365
2. คลิก Change → Quick Repair → Repair
3. รอจนเสร็จแล้วรีสตาร์ท

### ลบและสร้าง OST ใหม่
1. ปิด Outlook
2. ไปที่ %localappdata%\Microsoft\Outlook
3. ลบไฟล์ .ost
4. เปิด Outlook ใหม่ (จะ Sync ข้อมูลใหม่)',
  (SELECT id FROM categories WHERE slug = 'email')
);

-- Problem 5: Slow Computer
INSERT INTO problems (title, slug, symptoms, causes, solution, category_id) VALUES (
  'คอมพิวเตอร์ทำงานช้ามากหรือค้าง',
  'computer-slow-performance',
  '- เปิดโปรแกรมนานผิดปกติ
  - Task Manager แสดง CPU/Memory สูง 90%+
  - เมาส์กระตุกหรือค้าง
  - เปิด Windows ขึ้นมาช้ามาก',
  '- RAM ไม่เพียงพอสำหรับงานที่ทำ
  - Disk เต็มหรือมี Bad Sector
  - โปรแกรมเริ่มต้นพร้อม Windows มากเกินไป
  - Malware ทำงานเบื้องหลัง
  - Windows ต้องการ Update
  - ฝุ่นสะสมทำให้ Thermal เสีย (Overheating)',
  '### ลด Startup Programs
1. Task Manager (Ctrl+Shift+Esc) → Startup tab
2. Disable โปรแกรมที่ไม่จำเป็นทั้งหมด
3. รีสตาร์ทเครื่อง

### เพิ่มพื้นที่ Disk
```
1. กด Windows + I → System → Storage
2. Storage Sense → Clean up
3. ลบ Temp Files, Recycle Bin
```

### ตรวจ Memory Usage
1. Task Manager → Performance → Memory
2. ถ้าใช้ 80%+ ตลอดเวลา → ควรเพิ่ม RAM

### Scan Malware
1. Windows Security → Virus & threat protection
2. Quick Scan หรือ Full Scan
3. ลบสิ่งที่ตรวจพบทั้งหมด

### ทำ Disk Cleanup
```
cleanmgr.exe
```',
  (SELECT id FROM categories WHERE slug = 'software')
);

-- ========================================
-- 6. ADD TAGS TO PROBLEMS
-- ========================================

INSERT INTO problem_tags (problem_id, tag_id)
SELECT p.id, t.id FROM problems p, tags t
WHERE p.slug = 'wifi-disconnection' AND t.name IN ('wifi', 'no-internet', 'driver', 'windows11')
ON CONFLICT DO NOTHING;

INSERT INTO problem_tags (problem_id, tag_id)
SELECT p.id, t.id FROM problems p, tags t
WHERE p.slug = 'printer-stuck-queue' AND t.name IN ('printer', 'driver', 'windows11')
ON CONFLICT DO NOTHING;

INSERT INTO problem_tags (problem_id, tag_id)
SELECT p.id, t.id FROM problems p, tags t
WHERE p.slug = 'blue-screen-bsod' AND t.name IN ('blue-screen', 'crash', 'windows11', 'windows10', 'driver')
ON CONFLICT DO NOTHING;

INSERT INTO problem_tags (problem_id, tag_id)
SELECT p.id, t.id FROM problems p, tags t
WHERE p.slug = 'outlook-send-receive-error' AND t.name IN ('outlook', 'password')
ON CONFLICT DO NOTHING;

INSERT INTO problem_tags (problem_id, tag_id)
SELECT p.id, t.id FROM problems p, tags t
WHERE p.slug = 'computer-slow-performance' AND t.name IN ('slow', 'virus', 'windows11', 'windows10', 'update')
ON CONFLICT DO NOTHING;

-- ========================================
-- 7. UPDATE COUNTERS
-- ========================================

UPDATE categories c
SET problem_count = (
  SELECT COUNT(*) FROM problems p WHERE p.category_id = c.id
);

UPDATE tags t
SET usage_count = (
  SELECT COUNT(*) FROM problem_tags pt WHERE pt.tag_id = t.id
);

-- Done!
SELECT 'Migration completed successfully!' as status;
