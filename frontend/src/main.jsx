import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity, ArrowDownRight, ArrowRight, BookOpen, Check, ChevronDown,
  CircleHelp, GraduationCap, LayoutDashboard, LogOut, Menu, Plus, RefreshCw,
  Search, Settings2, ShieldCheck, Trash2, Users, X, Pencil, Layers3, Mail,
  Phone, AlertCircle, LoaderCircle
} from "lucide-react";
import "./styles.css";

const API = "/api";
const TOKEN_KEY = "campusflow_token";

async function api(path, { method = "GET", body, token = localStorage.getItem(TOKEN_KEY) } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, {
    method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!response.ok) {
    const message = data?.detail || data?.message || data?.Message || `Request failed (${response.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return data;
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("Overview");
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [authForm, setAuthForm] = useState({ username: "", password: "", email: "", first_name: "", last_name: "" });
  const [query, setQuery] = useState("");
  const [studentModal, setStudentModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [studentForm, setStudentForm] = useState(emptyStudent());
  const [deptName, setDeptName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  function emptyStudent() {
    return { name: "", ph_num: "", email: "", dept: "", course: "", sem: 1 };
  }
  function notify(type, message) {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 4200);
  }
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(""); setUser(null); setStudents([]); setDepartments([]); setCourses([]);
    setPage("Overview"); notify("success", "You have been signed out.");
  }
  async function loadAll() {
    if (!token) return;
    setLoading(true);
    const results = await Promise.allSettled([
      api("/all-student"), api("/departments"), api("/courses"), api("/auth/profile")
    ]);
    if (results[0].status === "fulfilled") setStudents(Array.isArray(results[0].value) ? results[0].value : []);
    else if ([401, 403].includes(results[0].reason?.status)) logout();
    if (results[1].status === "fulfilled") setDepartments(Array.isArray(results[1].value) ? results[1].value : []);
    if (results[2].status === "fulfilled") setCourses(Array.isArray(results[2].value) ? results[2].value : []);
    if (results[3].status === "fulfilled") setUser(results[3].value);
    const failed = results.find(r => r.status === "rejected");
    if (failed && results.every(r => r.status === "rejected")) {
      notify("error", "Could not connect to the API. Check that all backend services are running.");
    }
    setLoading(false);
  }
  useEffect(() => { if (token) loadAll(); }, [token]);

  async function submitAuth(e) {
    e.preventDefault(); setAuthBusy(true);
    try {
      if (authMode === "register") {
        await api("/auth/register", { method: "POST", token: "", body: authForm });
        notify("success", "Account created. You can now sign in.");
        setAuthMode("login");
      } else {
        const data = await api("/auth/login", {
          method: "POST", token: "",
          body: { username: authForm.username, password: authForm.password }
        });
        const receivedToken = data?.["access token"] || data?.access_token || data?.token;
        if (!receivedToken) throw new Error("Login succeeded, but no access token was found in the response.");
        localStorage.setItem(TOKEN_KEY, receivedToken);
        setToken(receivedToken);
        notify("success", "Welcome back!");
      }
    } catch (err) { notify("error", err.message); }
    finally { setAuthBusy(false); }
  }

  async function saveStudent(e) {
    e.preventDefault();
    const payload = {
      ...studentForm,
      ph_num: String(studentForm.ph_num),
      sem: Number(studentForm.sem),
    };
    try {
      if (editing) {
        await api("/update-student", { method: "PUT", body: { ...payload, id: editing.id } });
        notify("success", "Student updated successfully.");
      } else {
        await api("/students", { method: "POST", body: payload });
        notify("success", "Student added successfully.");
      }
      setStudentModal(false); setEditing(null); setStudentForm(emptyStudent()); await loadAll();
    } catch (err) { notify("error", err.message); }
  }
  function openEdit(student) {
    setEditing(student);
    setStudentForm({
      name: student.name || "", ph_num: String(student.ph_num ?? ""),
      email: student.email || "", dept: student.dept || "",
      course: student.course || "", sem: student.sem ?? 1
    });
    setStudentModal(true);
  }
  async function deleteStudent(student) {
    if (!window.confirm(`Delete ${student.name}? This cannot be undone.`)) return;
    try {
      await api(`/delete-student?stu_id=${student.id}`, { method: "DELETE" });
      notify("success", "Student deleted."); await loadAll();
    } catch (err) { notify("error", err.message); }
  }
  async function addDepartment(e) {
    e.preventDefault();
    if (!deptName.trim()) return;
    try {
      await api(`/add-dept?dept_name=${encodeURIComponent(deptName.trim())}`, { method: "POST" });
      setDeptName(""); notify("success", "Department created."); await loadAll();
    } catch (err) { notify("error", err.message); }
  }
  async function addCourse(e) {
    e.preventDefault();
    if (!courseName.trim()) return;
    try {
      await api(`/add-course?course_name=${encodeURIComponent(courseName.trim())}`, { method: "POST" });
      setCourseName(""); notify("success", "Course created."); await loadAll();
    } catch (err) { notify("error", err.message); }
  }
  async function deleteCourse(course) {
    if (!window.confirm(`Delete course "${course.course}"?`)) return;
    try { await api(`/courses/${course.id}`, { method: "DELETE" }); notify("success", "Course deleted."); await loadAll(); }
    catch (err) { notify("error", err.message); }
  }

  const filteredStudents = useMemo(() => students.filter(s =>
    [s.name, s.email, s.dept, s.course, String(s.id)].some(v => String(v || "").toLowerCase().includes(query.toLowerCase()))
  ), [students, query]);

  if (!token) return <AuthScreen mode={authMode} setMode={setAuthMode} form={authForm} setForm={setAuthForm} onSubmit={submitAuth} busy={authBusy} notice={notice} />;
  const nav = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Students", icon: Users },
    { name: "Departments", icon: Layers3 },
    { name: "Courses", icon: BookOpen },
  ];
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><GraduationCap size={23}/></div><div><b>CampusFlow</b><span>ACADEMIC PORTAL</span></div><button className="mobile-close icon-button" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.name} className={`nav-item ${page === item.name ? "active" : ""}`} onClick={() => { setPage(item.name); setMobileNav(false); }}><item.icon size={18}/><span>{item.name}</span>{item.name === "Students" && <small>{students.length}</small>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><b>Need a hand?</b><p>Manage your campus data with confidence.</p><button onClick={() => notify("info", "Use the sidebar to manage students, departments, and courses.")}>View quick guide <ArrowRight size={14}/></button></div>
        <div className="profile-mini"><div className="avatar">{(user?.first_name || user?.username || "U").slice(0,1).toUpperCase()}</div><div className="profile-text"><b>{user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username || "Signed-in user"}</b><span>Administrator</span></div><button title="Sign out" className="icon-button" onClick={logout}><LogOut size={17}/></button></div>
      </div>
    </aside>
    {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)}><Menu size={20}/></button><div className="breadcrumbs">Workspace <span>/</span> <b>{page}</b></div><div className="topbar-actions"><div className="connection"><span className="status-dot"/><span>API connected</span></div><button className="icon-button" title="Refresh data" onClick={loadAll}><RefreshCw size={17} className={loading ? "spin" : ""}/></button><div className="avatar small">{(user?.first_name || user?.username || "U").slice(0,1).toUpperCase()}</div></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">CAMPUS ADMINISTRATION</div><h1>{page === "Overview" ? "Good day" + (user?.first_name ? `, ${user.first_name}` : "") + " 👋" : page}</h1><p>{page === "Overview" ? "Here's what's happening across your academic community." : page === "Students" ? "Keep student records organized, accurate, and up to date." : page === "Departments" ? "Organize your institution by academic department." : "Manage the courses offered across your campus."}</p></div><div className="heading-actions"><button className="btn btn-secondary" onClick={loadAll}><RefreshCw size={16}/> Refresh</button>{page !== "Courses" && page !== "Departments" && <button className="btn btn-primary" onClick={() => { setEditing(null); setStudentForm(emptyStudent()); setStudentModal(true); }}><Plus size={17}/> Add student</button>}</div></div>
        {page === "Overview" && <Overview students={students} departments={departments} courses={courses} setPage={setPage} loading={loading}/>}
        {page === "Students" && <Students students={filteredStudents} query={query} setQuery={setQuery} onAdd={() => { setEditing(null); setStudentForm(emptyStudent()); setStudentModal(true); }} onEdit={openEdit} onDelete={deleteStudent} loading={loading}/>}
        {page === "Departments" && <Departments departments={departments} courses={courses} deptName={deptName} setDeptName={setDeptName} onSubmit={addDepartment} />}
        {page === "Courses" && <Courses courses={courses} courseName={courseName} setCourseName={setCourseName} onSubmit={addCourse} onDelete={deleteCourse}/>}
      </div>
      <footer className="footer"><span>© {new Date().getFullYear()} CampusFlow</span><span><span className="status-dot"/> Student Management System <span className="footer-divider">·</span> Built for your campus</span></footer>
    </main>
    {studentModal && <StudentModal editing={editing} form={studentForm} setForm={setStudentForm} departments={departments} courses={courses} onClose={() => { setStudentModal(false); setEditing(null); }} onSubmit={saveStudent}/>}
    {notice && <div className={`toast ${notice.type}`}><span className="toast-symbol">{notice.type === "success" ? <Check size={17}/> : notice.type === "error" ? <AlertCircle size={17}/> : <CircleHelp size={17}/>}</span><span>{notice.message}</span><button onClick={() => setNotice(null)}><X size={15}/></button></div>}
  </div>;
}

function AuthScreen({ mode, setMode, form, setForm, onSubmit, busy, notice }) {
  const update = (key, value) => setForm(old => ({ ...old, [key]: value }));
  return <div className="auth-page"><div className="auth-left"><div className="auth-brand"><div className="brand-mark"><GraduationCap size={24}/></div><b>CampusFlow</b></div><div className="auth-hero"><div className="hero-pill"><span className="status-dot"/> YOUR CAMPUS, IN SYNC</div><h1>Better campus<br/><span>management</span><br/>starts here.</h1><p>A clear view of your students, courses, and departments. All the essentials, in one thoughtful workspace.</p><div className="hero-stats"><div><b>One</b><span>Connected workspace</span></div><div><b>Real-time</b><span>Academic records</span></div><div><b>Secure</b><span>Token-based access</span></div></div></div><div className="auth-left-footer">DESIGNED FOR A BETTER ACADEMIC DAY <span>✳</span></div><div className="decor decor-one"/><div className="decor decor-two"/></div><div className="auth-right"><div className="auth-form-wrap"><div className="form-kicker">WELCOME TO CAMPUSFLOW</div><h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2><p className="auth-subtitle">{mode === "login" ? "Sign in to continue to your workspace." : "Fill in your details to get started."}</p><form onSubmit={onSubmit} className="auth-form">
    {mode === "register" && <><div className="field-row"><label>First name<input required value={form.first_name} onChange={e => update("first_name", e.target.value)} placeholder="First name"/></label><label>Last name<input required value={form.last_name} onChange={e => update("last_name", e.target.value)} placeholder="Last name"/></label></div><label>Email address<input type="email" required value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@example.com"/></label></>}
    <label>Username<input autoComplete="username" required value={form.username} onChange={e => update("username", e.target.value)} placeholder="Enter your username"/></label>
    <label>Password<input autoComplete={mode === "login" ? "current-password" : "new-password"} type="password" required minLength={6} value={form.password} onChange={e => update("password", e.target.value)} placeholder="Enter your password"/></label>
    <button className="btn btn-primary auth-submit" disabled={busy}>{busy ? <LoaderCircle size={17} className="spin"/> : null}{mode === "login" ? "Sign in to dashboard" : "Create account"}<ArrowRight size={17}/></button>
  </form><div className="auth-switch">{mode === "login" ? "New to CampusFlow?" : "Already have an account?"} <button onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Create account" : "Sign in"}</button></div><div className="secure-note"><ShieldCheck size={15}/> Your session is protected with token-based authentication.</div></div><div className="auth-right-footer">CAMPUSFLOW <span>•</span> STUDENT MANAGEMENT</div></div>{notice && <div className={`toast auth-toast ${notice.type}`}><span className="toast-symbol">{notice.type === "success" ? <Check size={17}/> : <AlertCircle size={17}/>}</span><span>{notice.message}</span></div>}</div>;
}

function Overview({ students, departments, courses, setPage, loading }) {
  const metrics = [
    { label: "Total students", value: students.length, note: "Registered student records", icon: Users, tone: "violet", link: "Students" },
    { label: "Departments", value: departments.length, note: "Academic departments", icon: Layers3, tone: "mint", link: "Departments" },
    { label: "Available courses", value: courses.length, note: "Courses in your catalog", icon: BookOpen, tone: "amber", link: "Courses" },
  ];
  return <div className="overview-grid">
    <div className="metric-grid">{metrics.map(m => <button className="metric-card" key={m.label} onClick={() => setPage(m.link)}><div className="metric-top"><span>{m.label}</span><span className={`metric-icon ${m.tone}`}><m.icon size={19}/></span></div><div className="metric-value">{loading ? "—" : m.value}</div><div className="metric-note"><span className="note-dot"/> {m.note}</div><span className="metric-arrow"><ArrowDownRight size={17}/></span></button>)}</div>
    <div className="dashboard-lower"><section className="panel recent-panel"><div className="panel-header"><div><h3>Recently added students</h3><p>Your latest student records</p></div><button className="text-link" onClick={() => setPage("Students")}>View all <ArrowRight size={15}/></button></div><StudentTable students={[...students].slice(-5).reverse()} compact empty="No students yet. Add your first student to get started." /></section>
    <section className="panel quick-panel"><div className="panel-header"><div><h3>Quick actions</h3><p>Jump into your daily tasks</p></div><span className="quick-spark">✳</span></div><button className="quick-action" onClick={() => setPage("Students")}><span className="quick-action-icon violet"><Users size={18}/></span><span><b>Manage students</b><small>Add, edit, and review records</small></span><ArrowRight size={16}/></button><button className="quick-action" onClick={() => setPage("Departments")}><span className="quick-action-icon mint"><Layers3 size={18}/></span><span><b>Manage departments</b><small>Organize academic divisions</small></span><ArrowRight size={16}/></button><button className="quick-action" onClick={() => setPage("Courses")}><span className="quick-action-icon amber"><BookOpen size={18}/></span><span><b>Manage courses</b><small>Keep your course catalog updated</small></span><ArrowRight size={16}/></button></section></div>
    <div className="bottom-banner"><div className="banner-symbol"><Activity size={22}/></div><div><b>Your campus at a glance</b><p>Keep student information and academic catalogs in one organized place.</p></div><div className="banner-counts"><span><b>{students.length}</b> students</span><span><b>{departments.length}</b> departments</span><span><b>{courses.length}</b> courses</span></div></div>
  </div>;
}

function Students({ students, query, setQuery, onAdd, onEdit, onDelete, loading }) {
  return <section className="panel list-panel"><div className="list-toolbar"><div><h3>Student directory</h3><p>{students.length} student record{students.length === 1 ? "" : "s"} found</p></div><div className="toolbar-actions"><div className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search students..."/>{query && <button onClick={() => setQuery("")}><X size={14}/></button>}</div><button className="btn btn-primary" onClick={onAdd}><Plus size={16}/> Add student</button></div></div><StudentTable students={students} onEdit={onEdit} onDelete={onDelete} loading={loading} empty={query ? "No students match your search." : "No students yet. Add your first student to get started."}/></section>;
}
function StudentTable({ students, compact = false, onEdit, onDelete, empty, loading }) {
  if (loading && !students.length) return <div className="empty-state"><LoaderCircle className="spin" size={25}/><p>Loading student records…</p></div>;
  if (!students.length) return <div className="empty-state"><div className="empty-icon"><Users size={24}/></div><b>Nothing here yet</b><p>{empty}</p></div>;
  return <div className="table-scroll"><table className="data-table"><thead><tr><th>STUDENT</th>{!compact && <th>PHONE</th>}<th>DEPARTMENT</th><th>COURSE</th>{!compact && <th>SEMESTER</th>}{!compact && <th className="action-column">ACTIONS</th>}</tr></thead><tbody>{students.map(s => <tr key={s.id}><td><div className="student-cell"><div className="student-avatar">{(s.name || "S").split(/\s+/).map(x => x[0]).slice(0,2).join("").toUpperCase()}</div><div className="student-info"><b>{s.name}</b><span><Mail size={12}/>{s.email}</span></div></div></td>{!compact && <td><span className="phone-cell"><Phone size={13}/>{s.ph_num}</span></td>}<td><span className="tag">{s.dept}</span></td><td>{s.course}</td>{!compact && <td><span className="semester-badge">Semester {s.sem ?? "—"}</span></td>}{!compact && <td><div className="row-actions"><button title="Edit student" onClick={() => onEdit(s)}><Pencil size={15}/></button><button title="Delete student" className="danger-action" onClick={() => onDelete(s)}><Trash2 size={15}/></button></div></td>}</tr>)}</tbody></table></div>;
}

function Departments({ departments, courses, deptName, setDeptName, onSubmit }) {
  return <div className="catalog-layout"><section className="panel catalog-form-panel"><div className="panel-header"><div><h3>Add a department</h3><p>Create an academic division for your institution.</p></div><span className="metric-icon mint"><Layers3 size={19}/></span></div><form className="inline-form" onSubmit={onSubmit}><label>Department name<input value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="e.g. Computer Science" required/></label><button className="btn btn-primary"><Plus size={16}/> Add department</button></form><div className="form-tip"><ShieldCheck size={15}/> Duplicate department names are not allowed.</div></section><section className="panel catalog-list-panel"><div className="panel-header"><div><h3>Departments</h3><p>{departments.length} total departments</p></div><span className="count-pill">{departments.length}</span></div>{departments.length ? <div className="catalog-list">{departments.map((d, i) => <div className="catalog-row" key={d.id}><div className="catalog-avatar mint">{(d.department || "D").slice(0,1).toUpperCase()}</div><div className="catalog-main"><b>{d.department}</b><span>Department #{d.id}</span></div><span className="catalog-meta">{courses.length} courses total</span></div>)}</div> : <div className="empty-state"><div className="empty-icon"><Layers3 size={23}/></div><b>No departments yet</b><p>Add your first department using the form.</p></div>}</section></div>;
}
function Courses({ courses, courseName, setCourseName, onSubmit, onDelete }) {
  return <div className="catalog-layout"><section className="panel catalog-form-panel"><div className="panel-header"><div><h3>Add a course</h3><p>Expand your academic course catalog.</p></div><span className="metric-icon amber"><BookOpen size={19}/></span></div><form className="inline-form" onSubmit={onSubmit}><label>Course name<input value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g. Python Programming" required/></label><button className="btn btn-primary"><Plus size={16}/> Add course</button></form><div className="form-tip"><ShieldCheck size={15}/> Choose a clear, recognizable course name.</div></section><section className="panel catalog-list-panel"><div className="panel-header"><div><h3>Course catalog</h3><p>{courses.length} available courses</p></div><span className="count-pill">{courses.length}</span></div>{courses.length ? <div className="catalog-list">{courses.map(c => <div className="catalog-row" key={c.id}><div className="catalog-avatar amber"><BookOpen size={17}/></div><div className="catalog-main"><b>{c.course}</b><span>Course ID #{c.id}</span></div><button className="icon-button delete-course" title="Delete course" onClick={() => onDelete(c)}><Trash2 size={16}/></button></div>)}</div> : <div className="empty-state"><div className="empty-icon"><BookOpen size={23}/></div><b>No courses yet</b><p>Add your first course using the form.</p></div>}</section></div>;
}

function StudentModal({ editing, form, setForm, departments, courses, onClose, onSubmit }) {
  const update = (key, value) => setForm(old => ({ ...old, [key]: value }));
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><section className="modal"><div className="modal-header"><div><div className="eyebrow">{editing ? "EDIT RECORD" : "NEW RECORD"}</div><h2>{editing ? "Update student" : "Add a student"}</h2><p>{editing ? "Update the student details below." : "Enter the student details to create a record."}</p></div><button className="icon-button" onClick={onClose}><X size={19}/></button></div><form onSubmit={onSubmit} className="student-form"><label>Full name<input required value={form.name} onChange={e => update("name", e.target.value)} placeholder="Student's full name"/></label><div className="field-row"><label>Email address<input type="email" required value={form.email} onChange={e => update("email", e.target.value)} placeholder="student@example.com"/></label><label>Phone number<input type="number" required min="1000000000" max="999999999999999" value={form.ph_num} onChange={e => update("ph_num", e.target.value)} placeholder="10-digit phone"/></label></div><div className="field-row"><label>Department<input list="department-options" required value={form.dept} onChange={e => update("dept", e.target.value)} placeholder="Choose or enter department"/><datalist id="department-options">{departments.map(d => <option key={d.id} value={d.department}/>)}</datalist></label><label>Course<input list="course-options" required value={form.course} onChange={e => update("course", e.target.value)} placeholder="Choose or enter course"/><datalist id="course-options">{courses.map(c => <option key={c.id} value={c.course}/>)}</datalist></label></div><label>Semester<select required value={form.sem} onChange={e => update("sem", e.target.value)}>{Array.from({length: 8}, (_,i) => <option key={i+1} value={i+1}>Semester {i+1}</option>)}</select></label><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary"><Check size={16}/>{editing ? "Save changes" : "Create student"}</button></div></form></section></div>;
}

createRoot(document.getElementById("root")).render(<App />);
