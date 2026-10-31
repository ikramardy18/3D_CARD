'use client';
import './index.css';
import './Portfolio.css';
import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

extend({ MeshLineGeometry, MeshLineMaterial });

const GLTF_PATH = '/assets/kartu.glb';
const TEXTURE_PATH = '/assets/bandd.png';
const CARD_TEXTURE_PATH = '/assets/my-card.png';
const CARD_BACK_TEXTURE_PATH = '/assets/my-card-back.png';

useGLTF.preload(GLTF_PATH);
useTexture.preload(TEXTURE_PATH);

export default function App() {
  const [activeTab, setActiveTab] = useState('All');
  const [activeSection, setActiveSection] = useState('home');
  const [activeModalProject, setActiveModalProject] = useState(null);
  const [selectedAwardImg, setSelectedAwardImg] = useState(null);
  const [activeScenarioTab, setActiveScenarioTab] = useState('normal'); // Tab Normal vs Negative Test

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(sectionId);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'approach', label: 'Approach' },
    { id: 'experience', label: 'Experience' },
    { id: 'awards', label: 'Awards' },
    { id: 'contact', label: 'Contact' },
  ];

  const awardsData = [
    {
      id: 1,
      title: "Best Employee J&T Express Agent 23 (Maluku)",
      year: "2019",
      issuer: "PT. Global Gemilang Express",
      desc: "Penghargaan atas ketaatan SOP, akurasi inspeksi fisik paket, dan dedikasi operasional.",
      imgSrc: "/assets/awards/karyawan.jpg"
    },
    {
      id: 2,
      title: "Best Provinsi Staff QC Operasional",
      year: "2020",
      issuer: "PT. Global Gemilang Express",
      desc: "Penghargaan kinerja terbaik dalam kontrol kualitas dan pengelolaan lalu lintas barang antar provinsi.",
      imgSrc: "/assets/awards/qc awards.jpg"
    }
  ];

  // DATA PROYEK TERPISAH DENGAN RAPI
  const projectDetails = {
    atmSwitching: {
      title: "ATM Switching SIT/UAT Test Scenarios",
      category: "BANKING SYSTEM · QUALITY ASSURANCE",
      tags: ["ATM Switching", "SIT / UAT", "ISO 8583", "Test Cases"],
      desc: "Dokumentasi dan eksekusi skenario pengujian transaksi ATM (59 Skenario), mencakup pengujian fungsionalitas normal serta penanganan kondisi kegagalan (negative testing) secara menyeluruh.",
      stats: {
        normalCases: 25,
        negativeCases: 34,
        totalExecution: 59
      },
      normalScenarios: [
        { no: 1, type: "Cek Saldo", exp: "Saldo tampil di layar ATM & resi tercetak sesuai saldo Core Banking." },
        { no: 2, type: "Tarik Tunai Cepat (Denom 50k / 100k)", exp: "Uang keluar sesuai nominal, saldo berkurang, resi tercetak/tanpa resi." },
        { no: 3, type: "Tarik Tunai Nominal Lain", exp: "Validasi dispenser uang sesuai ketersediaan pecahan 50.000 / 100.000." },
        { no: 4, type: "Setor Tunai (Cash Deposit)", exp: "Mesin menerima uang tunai, saldo Core Banking bertambah secara real-time." },
        { no: 5, type: "Ubah PIN & Cek Mutasi", exp: "Ubah PIN berhasil di Core Banking dan mutasi transaksi sesuai histori." }
      ],
      negativeScenarios: [
        { no: 1, type: "Printer Error / Out of Paper", exp: "Transaksi tetap berhasil, layar memberikan notifikasi resi tidak dapat dicetak." },
        { no: 2, type: "PIN Salah (Multiple Attempt)", exp: "Transaksi gagal, saldo tidak terpotong, sistem memberikan kesempatan max 3x." },
        { no: 3, type: "Jaringan Putus / Shutdown (Reversal)", exp: "Transaksi timeout/gagal, sistem otomatis memicu pesan Reversal ke Core Banking." },
        { no: 4, type: "Timeout Uang Tidak Diambil", exp: "Mesin menarik kembali uang tunai, saldo tetap terdebit demi keamanan penarikan." },
        { no: 5, type: "Uang Palsu / Rusak pada Setor Tunai", exp: "Mesin menolak uang, uang dikeluarkan kembali, saldo tidak bertambah." },
        { no: 6, type: "Kartu Terblokir / Saldo Tidak Cukup", exp: "Transaksi ditolak dengan ISO Response Code yang sesuai (misal: RC 51 / RC 14)." }
      ]
    },
    api: {
      title: "Banking Transaction API Testing",
      category: "API TESTING · POSTMAN",
      tags: ["Postman", "REST API", "JSON", "Automation"],
      desc: "A planned API testing case study using a simulated banking API. Postman requests and test scripts validate HTTP status codes, response fields, data types, and invalid input handling. All endpoints and account data are illustrative.",
      highlights: [
        "GET account details and transaction status",
        "POST a simulated transaction",
        "Validate HTTP status codes and JSON response fields",
        "Test missing fields, invalid amounts, and unknown accounts",
        "Export a Postman Collection and summarize test results"
      ]
    },
    monitoring: {
      title: "System Monitoring & Terminal Status",
      category: "OPERATIONS & MONITORING",
      tags: ["Dashboard", "ATM Monitoring", "TCP / NDC Status", "Linux Logs"],
      desc: "Pemantauan statistik transaksi bulanan (Sukses, Revers, Gagal) serta pemantauan status koneksi jaringan terminal ATM (TCP & NDC Status) secara real-time untuk mendukung respon cepat gangguan operasional.",
      previewImages: [
        { title: "Dashboard Transaksi ATM Switching", src: "/assets/projects/atm-dashboard.png" },
        { title: "Monitoring Koneksi Terminal ATM (TCP & NDC Status)", src: "/assets/projects/atm-monitoring.png" }
      ]
    }
  };

  const handleNavClick = (e, id) => {
    e.preventDefault();
    setActiveSection(id);
    const targetElement = document.getElementById(id);
    if (targetElement) {
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div style={{ background: '#030712' }}>
      {/* NAVBAR KAPSUL MELAYANG */}
      <nav className="navbar-floating">
        <span className="nav-brand">Ikram.</span>
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={activeSection === item.id ? 'active' : ''}
                onClick={(e) => handleNavClick(e, item.id)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="hero-wrapper">
        <div className="hero-content">
          <div className="hero-left">
            <span className="welcome-tag">WELCOME TO MY PORTFOLIO</span>
            <h1 className="hero-title">
              <p>I&apos;m a developer</p>
              <span className="gradient-text">Ikram Ardi Aldjokya</span>
            </h1>
            <h2 className="hero-subtitle">Full Stack & Banking System Tester</h2>
            <p className="hero-desc">
              Lulusan SMK Teknik Komputer dan Jaringan (TKJ) dengan pengalaman di bidang IT Implementation dan System Testing, khususnya pada sistem perbankan. Memiliki pengalaman dalam pelaksanaan SIT/UAT, analisis log menggunakan Linux dan PuTTY, troubleshooting, serta monitoring sistem.
            </p>

            <div className="button-group">
              <a
                href="/assets/CV_Ikram_Ardi_Aldjokya.pdf"
                download="CV_Ikram_Ardi_Aldjokya.pdf"
                className="btn-primary"
              >
                📥 Download CV
              </a>
              <a
                href="https://github.com/ikramardy18"
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
              >
                <FaGithub size={18} /> GitHub
              </a>
              <a
                href="https://linkedin.com/in/ikram-ardi"
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
              >
                <FaLinkedin size={18} color="#0a66c2" /> LinkedIn
              </a>
              <a
                href="#contact"
                className="btn-outline"
                onClick={(e) => handleNavClick(e, 'contact')}
              >
                ✉️ Contact Me
              </a>
            </div>
          </div>

          <div className="hero-right-canvas">
            <Canvas camera={{ position: [0, 0, 13], fov: 25 }} style={{ background: 'transparent' }}>
              <ambientLight intensity={0.5} />
              <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
                <Band />
              </Physics>
              <Environment blur={0.75}>
                <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                <Lightformer intensity={5} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
              </Environment>
            </Canvas>
          </div>
        </div>
      </section>

      {/* SECTION 1: ABOUT ME */}
      <section id="about" className="section-container">
        <div className="section-header">
          <span className="section-subtitle">GET TO KNOW ME</span>
          <h2 className="section-title">About Me</h2>
          <p className="section-desc">Sedikit cerita tentang latar belakang dan minat saya di dunia teknologi dan integrasi sistem.</p>
        </div>

        <div className="about-grid">
          <div className="about-text">
            <p>
              Implementor dan penguji sistem perbankan lulusan SMK Negeri 7 Ambon jurusan TKJ, dengan sekitar 3,5 tahun pengalaman di PT Global Mobilitas Asia dalam menyusun skenario uji berdasarkan kebutuhan klien bank, menjalankan SIT dan UAT, mencatat defect, serta mendukung integrasi sistem ke lingkungan production. Terbiasa menggunakan Postman, ISO 8583, MySQL dasar, serta Linux/PuTTY untuk analisis log dan troubleshooting.
            </p>

            <div className="edu-card">
              <div className="edu-icon">🎓</div>
              <div className="edu-info">
                <h4>Teknik Komputer & Jaringan</h4>
                <p>Spesialisasi Infrastruktur IT, Jaringan & Web Development</p>
              </div>
            </div>

            <div className="edu-card">
              <div className="edu-icon">🏦</div>
              <div className="edu-info">
                <h4>Banking IT & System Integration</h4>
                <p>Pengujian ATM Switching, Core Banking, & ISO 8583</p>
              </div>
            </div>
          </div>

          <div>
            <div className="interests-header">✦ INTERESTS</div>
            <div className="interests-grid">
              <div className="interest-card"><span>💻</span> Interactive Web 3D</div>
              <div className="interest-card"><span>⚙️</span> System Integration</div>
              <div className="interest-card"><span>💳</span> Banking IT & ISO 8583</div>
              <div className="interest-card"><span>🧪</span> Software Quality Assurance</div>
              <div className="interest-card"><span>🎨</span> Modern UI/UX Design</div>
              <div className="interest-card"><span>🛠️</span> Automation & Testing</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SKILLS & TECHNOLOGIES */}
      <section id="skills" className="section-container">
        <div className="section-header">
          <span className="section-subtitle">WHAT I WORK WITH</span>
          <h2 className="section-title">Skills & Technologies</h2>
          <p className="section-desc">Kumpulan bahasa, framework, tools, dan domain sistem yang saya pelajari dan gunakan.</p>
        </div>

        <div className="filter-tabs">
          {['All', 'Programming', 'Frontend', 'Backend & Banking', 'Tools'].map((tab) => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        <div className="skills-grid">
          <div className="skill-card">
            <div className="skill-icon">⚡</div>
            <div className="skill-name">JavaScript</div>
            <div className="skill-cat">Programming</div>
          </div>
          <div className="skill-card">
            <div className="skill-icon">⚛️</div>
            <div className="skill-name">React.js</div>
            <div className="skill-cat">Frontend</div>
          </div>
          <div className="skill-card">
            <div className="skill-icon">🧊</div>
            <div className="skill-name">Three.js / R3F</div>
            <div className="skill-cat">Frontend 3D</div>
          </div>
          <div className="skill-card">
            <div className="skill-icon">🌐</div>
            <div className="skill-name">HTML5 & CSS3</div>
            <div className="skill-cat">Frontend</div>
          </div>
          <div className="skill-card">
            <div className="skill-icon">🟢</div>
            <div className="skill-name">Node.js</div>
            <div className="skill-cat">Backend</div>
          </div>
          <div className="skill-card">
            <div className="skill-icon">💳</div>
            <div className="skill-name">ISO 8583 & ATM Switching</div>
            <div className="skill-cat">Banking Domain</div>
          </div>
          <div className="skill-card">
            <div className="skill-icon">🛠️</div>
            <div className="skill-name">SIT & QA Testing</div>
            <div className="skill-cat">Quality Assurance</div>
          </div>
          <div className="skill-card">
            <div className="skill-icon">☁️</div>
            <div className="skill-name">Netlify & VS Code</div>
            <div className="skill-cat">Tools</div>
          </div>
        </div>
      </section>

      {/* SECTION 3: PROJECTS */}
      <section id="projects" className="section-container">
        <div className="section-header">
          <span className="section-subtitle">04 / SELECTED WORK</span>
          <h2 className="section-title">Projects & <span className="gradient-text">case studies.</span></h2>
          <p className="section-desc">Examples of practical work and portfolio case studies based on my professional domain.</p>
        </div>

        <div className="new-project-grid">
          {/* PROJECT 1: ATM SWITCHING (KHUSUS EXCEL SKENARIO TEST) */}
          <article className="new-project-card">
            <div className="project-art art-checklist">
              <div className="checklist-head">
                <span>ATM SWITCHING SIT/UAT SCOPE</span><span>59 SCENARIOS</span>
              </div>
              <div className="check-row"><span className="check-ok">✓</span><span>Cash Withdrawal & Deposit</span><b>25 CASES</b></div>
              <div className="check-row"><span className="check-ok">✓</span><span>PIN & Balance Inquiry</span><b>NORMAL</b></div>
              <div className="check-row"><span className="check-warn">!</span><span>Timeout & Reversal Handling</span><b>34 NEGATIVE</b></div>
            </div>
            <div className="project-body-content">
              <div className="project-overline">PROJECT 01 <span>· BANKING QA</span></div>
              <h3>ATM Switching SIT/UAT Test Scenarios</h3>
              <p>Dokumentasi dan pengujian 59 skenario uji transaksi ATM (SIT & UAT) berdasarkan kebutuhan klien bank, mencakup skenario normal dan penanganan kegagalan.</p>
              <div className="tag-row">
                <span>ATM Switching</span><span>SIT / UAT</span><span>ISO 8583</span><span>Test Cases</span>
              </div>
              <button className="project-detail-btn" onClick={() => { setActiveModalProject('atmSwitching'); setActiveScenarioTab('normal'); }}>
                View project details <span>↗</span>
              </button>
            </div>
          </article>

          {/* PROJECT 2: API TESTING */}
          <article className="new-project-card">
            <div className="project-art art-api">
              <div className="api-window">
                <div className="api-window-head">
                  <span className="api-dot"></span> POST /transactions
                </div>
                <div className="api-code">
                  <span className="code-purple">pm</span>.test(<span className="code-green">&quot;Status is 200&quot;</span>, () =&gt; &#123;<br />
                  &nbsp;&nbsp;pm.response.to.have.status(<span className="code-orange">200</span>);<br />
                  &#125;);<br /><br />
                  <span className="code-purple">const</span> data = pm.response.json();
                </div>
                <div className="api-result">
                  <span>✓ Response checks</span>
                  <span>Postman tests</span>
                </div>
              </div>
            </div>
            <div className="project-body-content">
              <div className="project-overline">PROJECT 02 <span>· API TESTING</span></div>
              <h3>Banking Transaction API Testing</h3>
              <p>Pengujian API simulasi menggunakan Postman untuk memvalidasi status HTTP, struktur JSON, data transaksi, dan penanganan input yang tidak valid.</p>
              <div className="tag-row">
                <span>Postman</span><span>REST API</span><span>JSON</span>
              </div>
              <button className="project-detail-btn" onClick={() => setActiveModalProject('api')}>
                View project details <span>↗</span>
              </button>
            </div>
          </article>

          {/* PROJECT 3: SYSTEM MONITORING (KHUSUS DASHBOARD & MONITORING ATM) */}
          <article className="new-project-card">
            <div className="project-art art-monitor">
              <div className="art-monitor">
                <div className="monitor-top">
                  <span>atm_monitoring.sys</span>
                  <span className="monitor-status">● REAL-TIME</span>
                </div>
                <div className="chart-bars">
                  {['40%', '65%', '50%', '85%', '60%', '95%', '70%', '100%'].map((h, i) => (
                    <i key={i} style={{ '--h': h }} />
                  ))}
                </div>
                <div className="monitor-bottom">
                  <span>TCP / NDC STATUS</span>
                  <span>Active</span>
                </div>
              </div>
            </div>
            <div className="project-body-content">
              <div className="project-overline">PROJECT 03 <span>· OPERATIONS & MONITORING</span></div>
              <h3>System Monitoring & Log Analysis</h3>
              <p>Pemantauan statistik transaksi bulanan serta konektivitas jaringan terminal ATM (TCP/NDC status) secara real-time untuk penanganan insiden operasional secara cepat.</p>
              <div className="tag-row">
                <span>Dashboard</span><span>ATM Monitoring</span><span>TCP/NDC Status</span><span>Linux</span>
              </div>
              <button className="project-detail-btn" onClick={() => setActiveModalProject('monitoring')}>
                View project details <span>↗</span>
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* SECTION APPROACH */}
      <section id="approach" className="section-container">
        <div className="section-header">
          <span className="section-subtitle">05 / MY APPROACH</span>
          <h2 className="section-title">Reliability is a <span className="gradient-text">practice.</span></h2>
          <p className="section-desc">A simple workflow I bring to technical problems.</p>
        </div>

        <div className="principles-grid">
          <article className="principle-card">
            <span className="principle-number">01</span>
            <span className="principle-icon">◉</span>
            <h3>Observe</h3>
            <p>Collect symptoms, monitoring signals, logs, and reproducible evidence.</p>
          </article>
          <article className="principle-card">
            <span className="principle-number">02</span>
            <span className="principle-icon">⌕</span>
            <h3>Investigate</h3>
            <p>Compare expected versus actual behavior and narrow down possible causes.</p>
          </article>
          <article className="principle-card">
            <span className="principle-number">03</span>
            <span className="principle-icon">✓</span>
            <h3>Resolve & validate</h3>
            <p>Coordinate a fix, test the result, and document outcomes clearly.</p>
          </article>
          <article className="principle-card">
            <span className="principle-number">04</span>
            <span className="principle-icon">↗</span>
            <h3>Improve</h3>
            <p>Capture lessons learned and identify opportunities to prevent recurrence.</p>
          </article>
        </div>
      </section>

      {/* SECTION 4: EXPERIENCE */}
      <section id="experience" className="section-container">
        <div className="section-header">
          <span className="section-subtitle">MY PATH SO FAR</span>
          <h2 className="section-title">Journey Timeline</h2>
          <p className="section-desc">Perjalanan pendidikan dan pengalaman kerja yang membentuk kemampuan saya saat ini.</p>
        </div>

        <div className="timeline-wrapper">
          <div className="timeline-line"></div>

          <div className="timeline-item timeline-left">
            <div className="timeline-dot">🎓</div>
            <div className="timeline-box">
              <div className="timeline-date">2014 - 2017</div>
              <div className="timeline-role">Teknik Komputer dan Jaringan</div>
              <div className="timeline-company">SMK Negeri 7 Ambon</div>
              <p className="timeline-desc">Mempelajari dasar-dasar jaringan komputer, troubleshooting hardware/software, manajemen server, dan pemrograman web dasar.</p>
              <div className="project-tags" style={{ marginTop: '0.8rem' }}>
                <span className="p-tag">Networking</span>
                <span className="p-tag">Hardware</span>
                <span className="p-tag">Web Dev</span>
              </div>
            </div>
          </div>

          <div className="timeline-item timeline-right">
            <div className="timeline-dot">💼</div>
            <div className="timeline-box">
              <div className="timeline-date">JANUARY 2018 - JUNY 2021 (3 YEARS)</div>
              <div className="timeline-role">Staff QC operasional</div>
              <div className="timeline-company">PT. Global Gemilang Express (J&T Express)</div>
              <p className="timeline-desc">Melakukan pengecekan fisik paket yang masuk ke drop point, dan keluar Gudang Gateway ke drop point.</p>
              <div className="project-tags" style={{ marginTop: '0.8rem' }}>
                <span className="p-tag">Google Sheets</span>
                <span className="p-tag">Microsoft Office</span>
                <span className="p-tag">Sistem Informasi Operasional J&T</span>
              </div>
            </div>
          </div>

          <div className="timeline-item timeline-left">
            <div className="timeline-dot">💼</div>
            <div className="timeline-box">
              <div className="timeline-date">MARCH 2022 - JULY 2022 (4 MONTHS)</div>
              <div className="timeline-role">Store Crew</div>
              <div className="timeline-company">Mixue Ice Cream & Tea</div>
              <p className="timeline-desc">Melayani pelanggan di kasir, menjawab pertanyaan dan menyelesaikan transaksi penjualan.</p>
              <div className="project-tags" style={{ marginTop: '0.8rem' }}>
                <span className="p-tag">Communication</span>
                <span className="p-tag">Administration</span>
                <span className="p-tag">Service</span>
              </div>
            </div>
          </div>

          <div className="timeline-item timeline-right">
            <div className="timeline-dot">💼</div>
            <div className="timeline-box">
              <div className="timeline-date">NOVEMBER 2022 - AUGUST 2026 (4 YEARS)</div>
              <div className="timeline-role">Full Stack & Banking System Tester</div>
              <div className="timeline-company">PT. Global Mobilitas Asia (Bank switching company)</div>
              <p className="timeline-desc">Melakukan Test sesuai dengan tahap SIT dan UAT di server development dengan client bank, Mengidentifikasi, mencatat, dan melaporkan bug/defect melalui aplikasi Putty Linux Program.</p>
              <div className="project-tags" style={{ marginTop: '0.8rem' }}>
                <span className="p-tag">ISO 8583 (Message Transaction)</span>
                <span className="p-tag">HTML5 & CSS</span>
                <span className="p-tag">POSTMAN</span>
                <span className="p-tag">JSON/XML</span>
                <span className="p-tag">TROUBLESHOOTING</span>
                <span className="p-tag">BASIC LINUX</span>
                <span className="p-tag">SERVER ENVIRONMENT</span>
                <span className="p-tag">API TESTING</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: AWARDS & HONORS */}
      <section id="awards" className="section-container">
        <div className="section-header">
          <span className="section-subtitle">HONORS & RECOGNITION</span>
          <h2 className="section-title">Awards</h2>
          <p className="section-desc">
            Apresiasi dan penghargaan atas dedikasi serta kinerja operasional terbaik yang pernah saya raih.
          </p>
        </div>

        <div className="awards-grid">
          {awardsData.map((award) => (
            <div
              key={award.id}
              className="award-card"
              onClick={() => setSelectedAwardImg(award)}
            >
              <div className="award-preview">
                <img
                  src={award.imgSrc}
                  alt={award.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="award-placeholder">
                  <span>🏆</span>
                  <p>Klik untuk melihat Piagam</p>
                </div>
                <div className="award-hover-overlay">
                  <span>🔍 Perbesar Piagam</span>
                </div>
              </div>
              <div className="award-body">
                <div className="award-year">🏆 {award.year}</div>
                <h4 className="award-title">{award.title}</h4>
                <div className="award-issuer">{award.issuer}</div>
                <p className="award-desc">{award.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: CONTACT ME */}
      <section id="contact" className="section-container">
        <div className="section-header">
          <span className="section-subtitle">LET&apos;S CONNECT</span>
          <h2 className="section-title">Contact Me</h2>
          <p className="section-desc">Punya project, pertanyaan, atau ingin berkolaborasi? Jangan ragu untuk menghubungi saya.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info-list">
            <a
              href="mailto:ikramardy18@gmail.com"
              className="c-info-card"
            >
              <div className="c-info-icon">✉️</div>
              <div>
                <div className="c-info-label">Email</div>
                <div className="c-info-val">ikramardy18@gmail.com</div>
              </div>
            </a>

            <a
              href="https://github.com/ikramardy18"
              target="_blank"
              rel="noreferrer"
              className="c-info-card"
            >
              <div className="c-info-icon">
                <FaGithub size={20} />
              </div>
              <div>
                <div className="c-info-label">GitHub</div>
                <div className="c-info-val">github.com/ikramardy18</div>
              </div>
            </a>

            <a
              href="https://linkedin.com/in/ikram-ardi"
              target="_blank"
              rel="noreferrer"
              className="c-info-card"
            >
              <div className="c-info-icon">
                <FaLinkedin size={20} color="#0a66c2" />
              </div>
              <div>
                <div className="c-info-label">LinkedIn</div>
                <div className="c-info-val">linkedin.com/in/ikram-ardi</div>
              </div>
            </a>
          </div>

          <form
            className="contact-form"
            action="https://formspree.io/f/xoeelgvj"
            method="POST"
          >
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Nama lengkap kamu"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="email@contoh.com"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                name="message"
                className="form-input"
                rows="4"
                placeholder="Ceritakan tentang project atau pesanmu..."
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ border: 'none', cursor: 'pointer', justifySelf: 'start' }}
            >
              ✈️ Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        © 2026 Ikram Ardi Aldjokya. All rights reserved. Built with React & Three.js.
      </footer>

      {/* MODAL CASE STUDY DENGAN PEMISAHAN SPESIFIK */}
      {activeModalProject && (
        <div className="custom-modal-backdrop" onClick={() => setActiveModalProject(null)}>
          <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActiveModalProject(null)}>&times;</button>
            <span className="project-overline">{projectDetails[activeModalProject].category}</span>
            <h2 className="modal-title">{projectDetails[activeModalProject].title}</h2>
            <div className="tag-row" style={{ marginBottom: '1.2rem' }}>
              {projectDetails[activeModalProject].tags.map((t, idx) => (
                <span key={idx}>{t}</span>
              ))}
            </div>
            <p className="modal-text">{projectDetails[activeModalProject].desc}</p>

            {/* MODAL 1: ATM SWITCHING (KHUSUS SKENARIO EXCEL) */}
            {activeModalProject === 'atmSwitching' && (
              <div className="modal-highlights" style={{ marginTop: '1rem' }}>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.8rem' }}>✦ Executed Test Scenarios Scope</h3>
                {/* BUTTON TAB NORMAL / NEGATIVE */}
                <div style={{ display: 'flex', gap: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.6rem', marginBottom: '1rem' }}>
                  <button
                    onClick={() => setActiveScenarioTab('normal')}
                    style={{
                      background: activeScenarioTab === 'normal' ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                      color: activeScenarioTab === 'normal' ? '#34d399' : '#94a3b8',
                      border: activeScenarioTab === 'normal' ? '1px solid #34d399' : '1px solid transparent',
                      padding: '0.4rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Normal Test ({projectDetails.atmSwitching.stats.normalCases} Cases)
                  </button>
                  <button
                    onClick={() => setActiveScenarioTab('negative')}
                    style={{
                      background: activeScenarioTab === 'negative' ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
                      color: activeScenarioTab === 'negative' ? '#fbbf24' : '#94a3b8',
                      border: activeScenarioTab === 'negative' ? '1px solid #fbbf24' : '1px solid transparent',
                      padding: '0.4rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    ! Negative Test ({projectDetails.atmSwitching.stats.negativeCases} Cases)
                  </button>
                </div>

                {/* DAFTAR SKENARIO EXCEL */}
                <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {activeScenarioTab === 'normal' ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {projectDetails.atmSwitching.normalScenarios.map((item) => (
                        <li key={item.no} style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '0.6rem 0.8rem', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                          <strong style={{ color: '#34d399' }}>{item.type}:</strong> {item.exp}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {projectDetails.atmSwitching.negativeScenarios.map((item) => (
                        <li key={item.no} style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '0.6rem 0.8rem', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                          <strong style={{ color: '#fbbf24' }}>{item.type}:</strong> {item.exp}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* MODAL 3: SYSTEM MONITORING (KHUSUS PREVIEW GAMBAR DASHBOARD & MONITORING) */}
            {activeModalProject === 'monitoring' && projectDetails.monitoring.previewImages && (
              <div className="modal-highlights" style={{ marginTop: '1rem' }}>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.8rem' }}>✦ System Interfaces & Terminal Connection Screenshots</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {projectDetails.monitoring.previewImages.map((img, i) => (
                    <div key={i} style={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                      <img
                        src={img.src}
                        alt={img.title}
                        style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{ display: 'none', height: '160px', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#818cf8', fontSize: '0.8rem', padding: '1rem', textAlign: 'center' }}>
                        🖥️ {img.title}
                      </div>
                      <p style={{ fontSize: '0.75rem', padding: '0.5rem', color: '#94a3b8', textAlign: 'center', margin: 0 }}>{img.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HIGHLIGHT PROYEK API TESTING */}
            {activeModalProject === 'api' && projectDetails.api.highlights && (
              <div className="modal-highlights">
                <h3>Project scope</h3>
                <ul>
                  {projectDetails.api.highlights.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PIAGAM LIGHTBOX */}
      {selectedAwardImg && (
        <div className="custom-modal-backdrop" onClick={() => setSelectedAwardImg(null)}>
          <div className="award-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedAwardImg(null)}>&times;</button>
            <div className="award-modal-img-wrapper">
              <img
                src={selectedAwardImg.imgSrc}
                alt={selectedAwardImg.title}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/800x600/0f172a/818cf8?text=Foto+Piagam+Belum+Dimasukkan";
                }}
              />
            </div>
            <div className="award-modal-info">
              <span className="award-year">🏆 {selectedAwardImg.year}</span>
              <h3>{selectedAwardImg.title}</h3>
              <p className="award-issuer">{selectedAwardImg.issuer}</p>
              <p className="modal-text">{selectedAwardImg.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 10 }) {
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef();
  const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(GLTF_PATH);
  const texture = useTexture(TEXTURE_PATH);
  const cardTexture = useTexture(CARD_TEXTURE_PATH);
  const cardBackTexture = useTexture(CARD_BACK_TEXTURE_PATH);

  cardTexture.colorSpace = THREE.SRGBColorSpace;
  cardTexture.wrapS = THREE.RepeatWrapping;
  cardTexture.wrapT = THREE.ClampToEdgeWrapping;
  cardTexture.repeat.set(-1.5, 1.5);
  cardTexture.rotation = Math.PI;
  cardTexture.center.set(0.5, 0.5);
  cardTexture.offset.set(0.38, -0.22);

  cardBackTexture.colorSpace = THREE.SRGBColorSpace;
  cardBackTexture.wrapS = THREE.ClampToEdgeWrapping;
  cardBackTexture.wrapT = THREE.ClampToEdgeWrapping;
  cardBackTexture.repeat.set(0.85, 0.85);
  cardBackTexture.offset.set(0.075, 0.075);
  cardBackTexture.center.set(0.5, 0.5);
  cardBackTexture.needsUpdate = true;

  const { width, height } = useThree((state) => state.size);
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={(e) => (e.target.setPointerCapture(e.pointerId), drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation()))))}>
            <mesh geometry={nodes.card.geometry} renderOrder={1}>
              <meshStandardMaterial map={cardTexture} map-anisotropy={16} roughness={1} metalness={0} color="#ffffff" side={THREE.FrontSide} />
            </mesh>
            <mesh geometry={nodes.card.geometry} rotation={[0, Math.PI, 0]} position={[0, 0, -0.005]} renderOrder={2}>
              <meshStandardMaterial map={cardBackTexture} map-anisotropy={16} roughness={1} metalness={0} color="#ffffff" side={THREE.FrontSide} />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial color="white" depthTest={false} resolution={[width, height]} useMap map={texture} repeat={[-4, 1]} lineWidth={1} />
      </mesh>
    </>
  );
}