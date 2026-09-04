-- Portfolio backend for GitHub Pages + Supabase
-- Admin: man.ngoman2705@gmail.com

create extension if not exists pgcrypto;

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'man.ngoman2705@gmail.com';
$$;

grant execute on function public.is_portfolio_admin() to anon, authenticated;

create table if not exists public.site_profile (
  key text primary key default 'main',
  brand text not null default 'Portfolio',
  full_name text not null,
  role_en text not null,
  role_vi text not null,
  tagline_en text not null,
  tagline_vi text not null,
  about_en text not null,
  about_vi text not null,
  city_en text,
  city_vi text,
  email text,
  phone text,
  github text,
  linkedin text,
  facebook text,
  profile_image_url text,
  cv_en_url text,
  cv_vi_url text,
  cv_web_vi_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt_en text not null default '',
  excerpt_vi text not null default '',
  content_en text not null default '',
  content_vi text not null default '',
  categories text[] not null default '{}',
  technologies text[] not null default '{}',
  role_en text not null default '',
  role_vi text not null default '',
  start_date date,
  end_date date,
  team_size integer,
  status_en text,
  status_vi text,
  github_url text,
  demo_url text,
  app_store_url text,
  play_store_url text,
  video_url text,
  cover_image_url text,
  gallery_urls text[] not null default '{}',
  featured boolean not null default false,
  views bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null,
  title_vi text not null default '',
  excerpt_en text not null default '',
  excerpt_vi text not null default '',
  content_en text not null default '',
  content_vi text not null default '',
  tags text[] not null default '{}',
  cover_image_url text,
  featured boolean not null default false,
  published_at timestamptz not null default now(),
  views bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  position_en text not null,
  position_vi text not null default '',
  location text,
  start_date date not null,
  end_date date,
  current boolean not null default false,
  description_en text not null default '',
  description_vi text not null default '',
  responsibilities jsonb not null default '[]'::jsonb,
  technologies text[] not null default '{}',
  logo_url text,
  company_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree_en text not null default '',
  degree_vi text not null default '',
  field_en text not null default '',
  field_vi text not null default '',
  start_date date not null,
  end_date date,
  current boolean not null default false,
  gpa text,
  description_en text,
  description_vi text,
  thesis_en text,
  thesis_vi text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_vi text not null default '',
  issuer text not null,
  issue_date date,
  credential_id text,
  credential_url text,
  image_url text,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.awards (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_vi text not null default '',
  issuer text,
  award_date date,
  description_en text,
  description_vi text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.award_certificates (
  award_id uuid not null references public.awards(id) on delete cascade,
  certificate_id uuid not null references public.certificates(id) on delete cascade,
  primary key (award_id, certificate_id)
);

create table if not exists public.research (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_vi text not null default '',
  venue text,
  status_en text,
  status_vi text,
  description_en text,
  description_vi text,
  project_id uuid references public.projects(id) on delete set null,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.languages (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_vi text not null default '',
  level_en text not null default '',
  level_vi text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['site_profile','projects','blog_posts','experiences','education','certificates','awards','research']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- Public read, admin write policies.
alter table public.site_profile enable row level security;
alter table public.projects enable row level security;
alter table public.blog_posts enable row level security;
alter table public.experiences enable row level security;
alter table public.education enable row level security;
alter table public.skills enable row level security;
alter table public.certificates enable row level security;
alter table public.awards enable row level security;
alter table public.award_certificates enable row level security;
alter table public.research enable row level security;
alter table public.languages enable row level security;
alter table public.contact_messages enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['site_profile','projects','blog_posts','experiences','education','skills','certificates','awards','award_certificates','research','languages']
  loop
    execute format('drop policy if exists public_read on public.%I', t);
    execute format('create policy public_read on public.%I for select using (true)', t);
    execute format('drop policy if exists admin_insert on public.%I', t);
    execute format('create policy admin_insert on public.%I for insert with check (public.is_portfolio_admin())', t);
    execute format('drop policy if exists admin_update on public.%I', t);
    execute format('create policy admin_update on public.%I for update using (public.is_portfolio_admin()) with check (public.is_portfolio_admin())', t);
    execute format('drop policy if exists admin_delete on public.%I', t);
    execute format('create policy admin_delete on public.%I for delete using (public.is_portfolio_admin())', t);
  end loop;
end $$;

drop policy if exists public_send_contact on public.contact_messages;
drop policy if exists admin_read_contact on public.contact_messages;
drop policy if exists admin_update_contact on public.contact_messages;
drop policy if exists admin_delete_contact on public.contact_messages;
create policy public_send_contact on public.contact_messages for insert with check (true);
create policy admin_read_contact on public.contact_messages for select using (public.is_portfolio_admin());
create policy admin_update_contact on public.contact_messages for update using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy admin_delete_contact on public.contact_messages for delete using (public.is_portfolio_admin());

create or replace function public.increment_project_view(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.projects set views = views + 1 where slug = p_slug;
end;
$$;

create or replace function public.increment_blog_view(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.blog_posts set views = views + 1 where slug = p_slug;
end;
$$;

grant execute on function public.increment_project_view(text) to anon, authenticated;
grant execute on function public.increment_blog_view(text) to anon, authenticated;

-- Public media bucket.
insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "portfolio public media read" on storage.objects;
drop policy if exists "portfolio admin media insert" on storage.objects;
drop policy if exists "portfolio admin media update" on storage.objects;
drop policy if exists "portfolio admin media delete" on storage.objects;

create policy "portfolio public media read"
on storage.objects for select
using (bucket_id = 'portfolio-media');

create policy "portfolio admin media insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'portfolio-media' and public.is_portfolio_admin());

create policy "portfolio admin media update"
on storage.objects for update
to authenticated
using (bucket_id = 'portfolio-media' and public.is_portfolio_admin())
with check (bucket_id = 'portfolio-media' and public.is_portfolio_admin());

create policy "portfolio admin media delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'portfolio-media' and public.is_portfolio_admin());

-- Initial profile.
insert into public.site_profile (
  key, brand, full_name, role_en, role_vi, tagline_en, tagline_vi,
  about_en, about_vi, city_en, city_vi, email, phone, github, linkedin, facebook,
  profile_image_url, cv_en_url, cv_vi_url, cv_web_vi_url
) values (
  'main',
  'Portfolio',
  'Ngô Ngọc Triệu Mẫn',
  'Game Developer',
  'Lập trình viên Game',
  'Beauty catches the eye. A sharper mind builds what lasts.',
  'Vẻ đẹp thu hút ánh nhìn. Một tư duy sắc bén tạo nên giá trị bền lâu.',
  'I build interactive experiences with Unity, game systems, AR/VR and thoughtful product design. I enjoy turning technical ideas into experiences that feel clear, playful and useful.',
  'Mình xây dựng các trải nghiệm tương tác bằng Unity, hệ thống gameplay, AR/VR và tư duy thiết kế sản phẩm. Mình thích biến những ý tưởng kỹ thuật thành trải nghiệm rõ ràng, thú vị và hữu ích.',
  'Ho Chi Minh City, Vietnam',
  'TP. Hồ Chí Minh, Việt Nam',
  'man.ngoman2705@gmail.com',
  '0865127514',
  'https://github.com/Kandy2705',
  'https://www.linkedin.com/in/m%E1%BA%ABn-ng%C3%B4-ng%E1%BB%8Dc-tri%E1%BB%87u-86b199362/',
  'https://www.facebook.com/phuong.nghi.trieu.man/',
  '/images/profile/profile.jpg',
  '/cv/game-developer-en.html',
  '/cv/game-developer-vi.html',
  '/cv/web-developer-vi.html'
)
on conflict (key) do update set
  brand = excluded.brand,
  full_name = excluded.full_name,
  role_en = excluded.role_en,
  role_vi = excluded.role_vi,
  tagline_en = excluded.tagline_en,
  tagline_vi = excluded.tagline_vi,
  about_en = excluded.about_en,
  about_vi = excluded.about_vi,
  city_en = excluded.city_en,
  city_vi = excluded.city_vi,
  email = excluded.email,
  phone = excluded.phone,
  github = excluded.github,
  linkedin = excluded.linkedin,
  facebook = excluded.facebook,
  profile_image_url = excluded.profile_image_url,
  cv_en_url = excluded.cv_en_url,
  cv_vi_url = excluded.cv_vi_url,
  cv_web_vi_url = excluded.cv_web_vi_url;

-- Initial projects based on the supplied CVs.
insert into public.projects (id, slug, title, excerpt_en, excerpt_vi, content_en, content_vi, categories, technologies, role_en, role_vi, start_date, end_date, team_size, status_en, status_vi, github_url, featured, views)
values
('11111111-1111-4111-8111-111111111111','agentic-ar','Agentic AR','An AR navigation application for campus buildings and classrooms using GPS positioning and AR overlays.','Ứng dụng dẫn đường AR cho tòa nhà và lớp học bằng định vị GPS kết hợp lớp phủ AR.','## Overview\nAgentic AR explores seamless navigation between outdoor GPS guidance and indoor spatial guidance.\n\n## Contribution\n- Designed UI/UX in Figma and implemented it in Unity.\n- Researched WGS84 to Unity coordinate conversion.\n- Built routing logic with C# and AR Foundation.\n- Managed project milestones and source control.','## Tổng quan\nAgentic AR nghiên cứu dẫn đường liền mạch giữa GPS ngoài trời và định hướng không gian trong nhà.\n\n## Đóng góp\n- Thiết kế UI/UX trên Figma và triển khai trong Unity.\n- Nghiên cứu chuyển đổi WGS84 sang tọa độ Unity.\n- Xây dựng routing bằng C# và AR Foundation.\n- Quản lý tiến độ và source control.',array['AR/VR','Research'],array['Unity','C#','AR Foundation','GPS','AI Navigation','Supabase','Figma'],'Lead & Developer','Lead & Developer','2025-07-01',null,3,'In progress','Đang phát triển','https://github.com/Kandy2705/AR-Navigation-BK',true,284),
('22222222-2222-4222-8222-222222222222','spiritbound-frontier','Spiritbound Frontier','A farming simulation game with crop growth, inventory and construction systems.','Game mô phỏng nông trại với hệ thống cây trồng, inventory và xây dựng.','## Engineering focus\n- Modular crop-growth and inventory systems.\n- Construction logic.\n- Audio, physics and animation.\n- Design patterns for scalable C# code.','## Trọng tâm kỹ thuật\n- Hệ thống crop-growth và inventory theo hướng module.\n- Logic xây dựng.\n- Audio, physics và animation.\n- Design Pattern cho mã C# dễ mở rộng.',array['Game'],array['Unity','C#','Game Design Patterns','Physics','Animation'],'Solo Developer','Developer cá nhân','2026-01-01','2026-03-01',1,'Completed milestone','Hoàn thành milestone',null,true,193),
('33333333-3333-4333-8333-333333333333','harmony-vr','Harmony','A VR supermarket simulation supporting diagnosis and cognitive training for daily activities.','Mô phỏng siêu thị VR hỗ trợ chẩn đoán và luyện tập nhận thức cho hoạt động hằng ngày.','## Responsibilities\n- Built immersive VR environments and interactive objects.\n- Used OpenXR and XR Interaction Toolkit.\n- Collaborated through Agile/Scrum.\n- Automated build workflows with Jenkins and GitHub.','## Công việc\n- Xây dựng môi trường VR và vật thể tương tác.\n- Sử dụng OpenXR và XR Interaction Toolkit.\n- Phối hợp Agile/Scrum.\n- Tự động hóa build bằng Jenkins và GitHub.',array['AR/VR','Research'],array['Unity 3D','C#','OpenXR','XR Interaction Toolkit','Jenkins','GitHub'],'Lead & Developer','Lead & Developer','2025-09-01',null,null,'In progress','Đang phát triển',null,true,146),
('44444444-4444-4444-8444-444444444444','mini-3d-rendering-tool','Mini 3D Rendering Tool','A lightweight OpenGL renderer for OBJ models with interactive camera controls and lighting.','Công cụ render OpenGL gọn nhẹ cho mô hình OBJ với camera tương tác và lighting.','## Highlights\n- OpenGL rendering pipeline with shaders and lighting.\n- Orbit, zoom and pan camera.\n- OBJ mesh loading.\n- Phong / Blinn-Phong shading.','## Điểm nổi bật\n- Rendering pipeline OpenGL với shader và lighting.\n- Camera orbit, zoom và pan.\n- Load mesh OBJ.\n- Phong / Blinn-Phong shading.',array['Other'],array['C++','OpenGL','Shaders','3D Graphics'],'Solo Developer','Developer cá nhân','2026-03-01',null,1,'In progress','Đang phát triển',null,false,88),
('55555555-5555-4555-8555-555555555555','pokemon-quiz','Pokemon Quiz','A quiz game combined with combat, random encounters, progression, shop and skins.','Game quiz kết hợp combat, random encounter, progression, shop và skin.','## Work completed\n- Rebalanced gameplay and fixed bugs.\n- Added Main Menu and Shop.\n- Extended the combat loop with XP, money and skins.','## Công việc đã làm\n- Cân bằng gameplay và sửa bug.\n- Thêm Main Menu và Shop.\n- Mở rộng vòng lặp combat với XP, tiền và skin.',array['Game'],array['Unity','C#','GitHub'],'Lead & Developer','Lead & Developer','2025-02-01','2025-04-30',null,'Completed','Đã hoàn thành',null,false,101),
('66666666-6666-4666-8666-666666666666','mango-reading-platform','MANGO','A reading platform for comics and novels with authentication flows and responsive frontend pages.','Nền tảng đọc truyện tranh và truyện chữ với luồng xác thực và giao diện responsive.','## Contribution\nDesigned several interface screens and implemented the homepage, sign-in, sign-up and password-recovery frontend flows.','## Đóng góp\nThiết kế một số màn hình và triển khai frontend cho trang chủ, đăng nhập, đăng ký và quên mật khẩu.',array['Web'],array['HTML','CSS','JavaScript','Frontend'],'Frontend Developer','Frontend Developer','2024-10-01','2024-12-31',null,'Completed','Đã hoàn thành',null,false,74),
('77777777-7777-4777-8777-777777777777','print-shop','Print Shop','A student print-ordering website with configurable print options and account pages.','Website đặt đơn in cho sinh viên với tùy chọn in và trang thông tin người dùng.','Implemented frontend interfaces for the homepage, about page, authentication and user profile.','Triển khai frontend cho trang chủ, giới thiệu, xác thực và trang thông tin người dùng.',array['Web'],array['HTML','CSS','JavaScript','Frontend'],'Frontend Developer','Frontend Developer','2024-10-01','2024-12-31',null,'Completed','Đã hoàn thành',null,false,62)
on conflict (slug) do nothing;

insert into public.experiences (id, company, position_en, position_vi, location, start_date, current, description_en, description_vi, responsibilities, technologies)
values (
  'eeeeeeee-1111-4111-8111-111111111111',
  'Ho Chi Minh City University of Technology — URA Research Group',
  'VR Developer — Harmony',
  'VR Developer — Harmony',
  'Ho Chi Minh City',
  '2025-09-01',
  true,
  'Developing a VR supermarket simulation that supports diagnosis and cognitive training for daily activities.',
  'Phát triển mô phỏng siêu thị VR hỗ trợ chẩn đoán và luyện tập nhận thức cho các hoạt động hằng ngày.',
  '[{"en":"Develop immersive VR environments and interactive objects.","vi":"Phát triển môi trường VR và vật thể tương tác."},{"en":"Collaborate in Agile/Scrum with sprint planning and task tracking.","vi":"Phối hợp Agile/Scrum với sprint planning và task tracking."},{"en":"Automate build processes with Jenkins and GitHub.","vi":"Tự động hóa build bằng Jenkins và GitHub."}]'::jsonb,
  array['Unity','C#','OpenXR','XR Interaction Toolkit','Jenkins']
)
on conflict (id) do nothing;

insert into public.education (id, institution, degree_en, degree_vi, field_en, field_vi, start_date, current, gpa, description_en, description_vi)
values
('aaaaaaaa-1111-4111-8111-111111111111','Ho Chi Minh City University of Technology','Bachelor of Computer Science','Cử nhân Khoa học Máy tính','Computer Science — Japan-oriented program','Khoa học Máy tính — Định hướng Nhật Bản','2022-10-01',true,'3.2 / 4.0','Computer Science student focused on interactive systems, game development and research.','Sinh viên Khoa học Máy tính tập trung vào hệ thống tương tác, phát triển game và nghiên cứu.'),
('aaaaaaaa-2222-4222-8222-222222222222','Green Academy','Game Developer Course','Khóa học Game Developer','Game Development','Phát triển Game','2025-11-01',true,'10 / 10',null,null)
on conflict (id) do nothing;

insert into public.skills (name, category, sort_order) values
('Unity','Game Development',1),('C#','Programming Languages',2),('C/C++','Programming Languages',3),('JavaScript / TypeScript','Programming Languages',4),('Python','Programming Languages',5),('PHP','Programming Languages',6),('AR Foundation','AR/VR',7),('Vuforia','AR/VR',8),('OpenXR','AR/VR',9),('XR Interaction Toolkit','AR/VR',10),('Figma','Tools',11),('Git / GitHub / GitLab','Tools',12),('Jenkins','DevOps',13),('Supabase','Database',14)
on conflict (name) do nothing;

insert into public.certificates (id, title_en, title_vi, issuer)
values
('bbbbbbbb-1111-4111-8111-111111111111','Japanese N4 Completion Certificate','Chứng nhận hoàn thành tiếng Nhật N4','Kohi Japanese Language'),
('bbbbbbbb-2222-4222-8222-222222222222','Efficient API Design with Node.js','Efficient API Design with Node.js','SORIMACHI Vietnam'),
('bbbbbbbb-3333-4333-8333-333333333333','OISP Scholarship Certificates','Chứng nhận học bổng OISP','HCMUT OISP')
on conflict (id) do nothing;

insert into public.awards (id, title_en, title_vi, issuer, award_date)
values
('cccccccc-1111-4111-8111-111111111111','Student of 5 Merits — 2024–2025','Sinh viên 5 tốt — 2024–2025','Ho Chi Minh City University of Technology','2025-01-01'),
('cccccccc-2222-4222-8222-222222222222','Comprehensive Excellent Student — 2024–2025','Sinh viên Giỏi toàn phần — 2024–2025','Ho Chi Minh City University of Technology','2025-01-01'),
('cccccccc-3333-4333-8333-333333333333','Top 40 Bach Khoa Innovation','Top 40 Bách Khoa Innovation','Ho Chi Minh City University of Technology','2025-01-01'),
('cccccccc-4444-4444-8444-444444444444','Top 36 Excellent Community Projects','Top 36 Excellent Community Projects',null,null)
on conflict (id) do nothing;

insert into public.award_certificates (award_id, certificate_id)
values ('cccccccc-1111-4111-8111-111111111111','bbbbbbbb-3333-4333-8333-333333333333')
on conflict do nothing;

insert into public.research (id, title_en, title_vi, venue, status_en, status_vi, description_en, description_vi, project_id)
values (
  'dddddddd-1111-4111-8111-111111111111',
  'Agentic AR navigation research',
  'Nghiên cứu dẫn đường Agentic AR',
  'Computers & Graphics (Elsevier) — SCIE',
  'In development',
  'Đang phát triển',
  'Research direction around AR-assisted navigation and indoor/outdoor handoff.',
  'Hướng nghiên cứu về dẫn đường hỗ trợ AR và chuyển giao indoor/outdoor.',
  '11111111-1111-4111-8111-111111111111'
)
on conflict (id) do nothing;

insert into public.languages (id, name_en, name_vi, level_en, level_vi, sort_order)
values ('ffffffff-1111-4111-8111-111111111111','Japanese','Tiếng Nhật','N4 certified','Chứng nhận N4',1)
on conflict (id) do nothing;

insert into public.blog_posts (id, slug, title_en, title_vi, excerpt_en, excerpt_vi, content_en, content_vi, tags, featured, published_at, views)
values (
  'aaaa1111-aaaa-4111-8111-aaaaaaaaaaaa',
  'welcome-to-my-portfolio',
  'Welcome to my portfolio',
  'Chào mừng đến với portfolio của mình',
  'A small note about what I am building, learning and documenting here.',
  'Một lời giới thiệu ngắn về những gì mình đang xây dựng, học hỏi và ghi lại ở đây.',
  '# Hello 👋\n\nThis space is where I share projects, technical notes, research experiments and lessons learned while building games and interactive experiences.\n\n> This starter post can be replaced from the Admin dashboard.',
  '# Xin chào 👋\n\nĐây là nơi mình chia sẻ dự án, ghi chú kỹ thuật, thử nghiệm nghiên cứu và những bài học trong quá trình làm game và các trải nghiệm tương tác.\n\n> Bài viết mẫu này có thể được thay trực tiếp từ trang Admin.',
  array['Portfolio','Unity','Learning'],
  true,
  '2026-09-04T00:00:00Z',
  42
)
on conflict (slug) do nothing;
