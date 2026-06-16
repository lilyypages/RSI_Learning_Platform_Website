'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './landing.css';

export default function Home() {
  const [bubbleText, setBubbleText] = useState<string>(
    'Halo! Aku <strong>Panda</strong> 🐼<br>Yuk belajar bareng biar makin pintar!<br>Nanti dapat poin dan hadiah lo! 🎁'
  );
  const [activeSection, setActiveSection] = useState<string>('beranda');
  useEffect(() => {
    // 1. Scroll Reveal Logic using Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Jika section masuk area pandang lebih dari 40%, jadikan aktif
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.4, rootMargin: "-70px 0px 0px 0px" } // dikurangi tinggi navbar (70px)
    );
    
    // Daftarkan semua elemen section yang memiliki ID untuk dipantau
    document.querySelectorAll('section[id]').forEach((section) => {
      sectionObserver.observe(section);
    });

    // 2. Animated Speech Bubble Cycling
    const msgs = [
      'Halo! Aku <strong>Panda</strong> 🐼<br>Yuk belajar bareng biar makin pintar!<br>Nanti dapat poin dan hadiah lo! 🎁',
      'Belajar itu <strong>seru</strong> lho! 🎉<br>Kerjakan soal, kumpulkan poin,<br>dan tukar dengan jajan! 🍪',
      'Orang tua bisa <strong>pantau</strong> 👀<br>perkembangan belajarmu<br>kapan saja! 📱',
      'Soal akan <strong>menyesuaikan</strong> 🧠<br>kemampuanmu otomatis!<br>Tidak susah, tidak gampang! ✨',
    ];
    
    let currentIdx = 0;
    const bubbleElement = document.querySelector('.speech-bubble') as HTMLElement;

    const interval = setInterval(() => {
      if (bubbleElement) {
        bubbleElement.style.opacity = '0';
        bubbleElement.style.transition = 'opacity 0.4s';
      }
      
      setTimeout(() => {
        currentIdx = (currentIdx + 1) % msgs.length;
        setBubbleText(msgs[currentIdx]);
        if (bubbleElement) {
          bubbleElement.style.opacity = '1';
        }
      }, 400);
    }, 4000);

    // 3. Smooth Scroll handler for anchor links
    const handleScroll = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => link.addEventListener('click', handleScroll as EventListener));

    // Cleanup effects on unmount
    return () => {
      observer.disconnect();
      clearInterval(interval);
      links.forEach((link) => link.removeEventListener('click', handleScroll as EventListener));
    };
  }, []);

  return (
    <>
    <div className="landingPageWrapper">
      {/* NAV */}
      <nav className="landing-nav">
        <a href="#" className="nav-logo">
          <span className="logo-icon">🐼</span> SIPANDA
        </a>
        <ul className="nav-links">
          <li><a href="#tentang"className={activeSection === 'tentang' ? 'active' : ''}>Tentang</a></li>
          <li><a href="#fitur" className={activeSection === 'fitur' ? 'active' : ''}>Fitur</a></li>
          <li><a href="#peran" className={activeSection === 'peran' ? 'active' : ''}>Pengguna</a></li>
          <li><a href="#cara-kerja" className={activeSection === 'cara-kerja' ? 'active' : ''}>Cara Kerja</a></li>
          <li><a href="/auth/login" className="btn-login">Masuk</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero" id="beranda">
        <div className="hero-inner">
          <div className="hero-text reveal">
            <span className="hero-badge">🏫 Untuk Sekolah Dasar</span>
            <h1 className="hero-title">
              Belajar Itu<br />
              <span>Seru &amp; Mudah</span><br />
              Bersama SIPANDA!
            </h1>
            <p className="hero-subtitle">
              Platform belajar online khusus untuk siswa SD. Belajar materi pelajaran, kumpulkan poin, dan tukar hadiahnya! Orang tua bisa pantau kemajuan belajar anak kapan saja. 🎉
            </p>
            <div className="hero-cta">
              <a href="#masuk" className="btn-primary">🚀 Mulai Belajar Sekarang</a>
              <a href="#tentang" className="btn-secondary">Pelajari Lebih Lanjut</a>
            </div>
          </div>
          <div className="hero-mascot reveal">
            <div 
              className="speech-bubble" 
              dangerouslySetInnerHTML={{ __html: bubbleText }}
            />
            
            {/* Panda SVG Mascot */}
            <Image
              src="/images/pandas_study.png"
              alt="Panda Study Mascot"
              className="panda-svg"
              width={350}
              height={350}
            />
            <span className="stars-deco">⭐</span>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section" id="tentang">
        <h2 className="section-title">Apa itu SIPANDA?</h2>
        <p className="section-sub">
          <strong>Sistem Informasi Pembelajaran Adaptif berbasis aNalitik DAta siswa</strong> — platform belajar online yang menghubungkan siswa, orang tua, guru, dan kepala sekolah dalam satu ekosistem digital yang menyenangkan!
        </p>
        <div className="about-grid reveal">
          <div className="about-card green">
            <div className="about-card-icon">🎯</div>
            <h3>Belajar Adaptif</h3>
            <p>Sistem otomatis menyesuaikan tingkat kesulitan soal berdasarkan kemampuan dan kecepatan belajar setiap siswa secara real-time.</p>
          </div>
          <div className="about-card yellow">
            <div className="about-card-icon">🏆</div>
            <h3>Poin &amp; Hadiah</h3>
            <p>Setiap jawaban benar dan aktivitas belajar menghasilkan poin yang bisa ditukarkan dengan hadiah menarik di kantin sekolah!</p>
          </div>
          <div className="about-card blue">
            <div className="about-card-icon">👨‍👩‍👧</div>
            <h3>Pantauan Orang Tua</h3>
            <p>Orang tua bisa memantau perkembangan belajar anak kapan saja — lihat grafik kemajuan, nilai, dan aktivitas belajar si kecil.</p>
          </div>
          <div className="about-card orange">
            <div className="about-card-icon">📊</div>
            <h3>Laporan Otomatis</h3>
            <p>Laporan mingguan otomatis dikirim ke orang tua dan guru lengkap dengan analisis kemajuan dan rekomendasi pembelajaran.</p>
          </div>
        </div>

        <div className="notice-box reveal" style={{ marginTop: '2.5rem' }}>
          <span className="notice-icon">⚠️</span>
          <div className="notice-text">
            <strong>Penting untuk Diketahui:</strong> SIPANDA adalah alat bantu belajar digital dan <strong>tidak memengaruhi nilai rapor</strong> secara langsung. Tujuan utama SIPANDA adalah membantu siswa belajar dengan cara yang menyenangkan di waktu senggang — saat libur, hari Minggu, atau sore hari setelah selesai bermain. SIPANDA bukan pengganti guru di kelas!
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="fitur">
        <h2 className="section-title">Fitur Unggulan SIPANDA</h2>
        <p className="section-sub">Belajar jadi lebih seru dengan berbagai fitur canggih yang dirancang khusus untuk siswa SD!</p>
        <div className="features-grid reveal">
          <div className="feature-card f1">
            <span className="feature-icon">🧠</span>
            <h4>Soal Adaptif Pintar</h4>
            <p>Soal otomatis naik atau turun level sesuai kemampuanmu. Tidak terlalu mudah, tidak terlalu susah!</p>
          </div>
          <div className="feature-card f2">
            <span className="feature-icon">🔥</span>
            <h4>Streak Belajar</h4>
            <p>Pertahankan streak belajar harianmu! Semakin panjang streak, semakin banyak bonus poin!</p>
          </div>
          <div className="feature-card f3">
            <span className="feature-icon">📹</span>
            <h4>Materi Video</h4>
            <p>Tonton video pembelajaran seru yang mudah dipahami. Belajar sambil nonton bukan nonton YouTube!</p>
          </div>
          <div className="feature-card f4">
            <span className="feature-icon">💬</span>
            <h4>Forum &amp; Chat</h4>
            <p>Tanya guru atau diskusi dengan teman soal pelajaran melalui forum belajar yang aman.</p>
          </div>
          <div className="feature-card f5">
            <span className="feature-icon">📈</span>
            <h4>Progress Tracker</h4>
            <p>Lihat sejauh mana kamu sudah menguasai setiap bab pelajaran dengan progress bar yang seru!</p>
          </div>
          <div className="feature-card f6">
            <span className="feature-icon">🔔</span>
            <h4>Notifikasi Pintar</h4>
            <p>Pengingat belajar dan notifikasi penting yang dikirim ke siswa, orang tua, dan guru.</p>
          </div>
        </div>
      </section>

      {/* REWARDS */}
      <section className="rewards-section">
        <div className="rewards-inner">
          <div className="rewards-text reveal">
            <h2>🎁 Kumpulkan Poin, Tukar Hadiah!</h2>
            <p>
              Di SIPANDA, setiap aktivitas belajar menghasilkan poin! Selesaikan kuis, pertahankan streak harian, raih nilai tinggi — semuanya berhadiah poin yang bisa ditukar langsung di kantin sekolah.
            </p>
            <p>
              Seperti bermain di Timezone, tapi hadiahnya bisa dimakan atau diminum! 🍭 Anak semangat belajar, orang tua senang screen time anak lebih berkualitas.
            </p>
            <div className="point-badges">
              <span className="point-badge">⭐ Jawaban Benar = +10 poin</span>
              <span className="point-badge">🔥 Streak 7 Hari = +100 poin</span>
              <span className="point-badge">🏆 Skor Sempurna = +50 poin</span>
              <span className="point-badge">📖 Selesai Bab = +75 poin</span>
            </div>
          </div>
          <div className="rewards-visual reveal">
            <div className="reward-item">
              <span className="reward-item-icon">🍪</span>
              <div className="reward-item-info">
                <strong>Snack Kantin</strong>
                <span>Cemilan favorit</span>
              </div>
              <span className="reward-pts">200 pts</span>
            </div>
            <div className="reward-item">
              <span className="reward-item-icon">🥤</span>
              <div className="reward-item-info">
                <strong>Minuman Segar</strong>
                <span>Jus atau susu</span>
              </div>
              <span className="reward-pts">350 pts</span>
            </div>
            <div className="reward-item">
              <span className="reward-item-icon">🍱</span>
              <div className="reward-item-info">
                <strong>Makan Siang</strong>
                <span>Menu spesial kantin</span>
              </div>
              <span className="reward-pts">500 pts</span>
            </div>
            <div className="reward-item">
              <span className="reward-item-icon">📓</span>
              <div className="reward-item-info">
                <strong>Alat Tulis</strong>
                <span>Buku &amp; pensil keren</span>
              </div>
              <span className="reward-pts">800 pts</span>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="roles-section" id="peran">
        <h2 className="section-title">Siapa Saja Penggunanya?</h2>
        <p className="section-sub">SIPANDA melayani seluruh ekosistem sekolah — login sesuai akun masing-masing dan langsung diarahkan ke dashboard yang tepat!</p>
        <div className="roles-grid reveal">
          <div className="role-card siswa">
            <div className="role-avatar">👧</div>
            <h3>Siswa</h3>
            <p>Portal belajar seru dengan gamifikasi, soal adaptif, dan sistem poin hadiah!</p>
            <ul className="role-features">
              <li>Materi &amp; video pelajaran</li>
              <li>Kuis adaptif interaktif</li>
              <li>Streak &amp; sistem poin</li>
              <li>Progress per bab</li>
              <li>Riwayat nilai</li>
            </ul>
          </div>
          <div className="role-card ortu">
            <div className="role-avatar">👩</div>
            <h3>Orang Tua</h3>
            <p>Pantau kemajuan belajar anak kapan saja dan di mana saja dengan mudah!</p>
            <ul className="role-features">
              <li>Grafik kemajuan anak</li>
              <li>Alert perlu perhatian</li>
              <li>Laporan mingguan</li>
              <li>Pesan langsung ke guru</li>
              <li>Histori aktivitas belajar</li>
            </ul>
          </div>
          <div className="role-card guru">
            <div className="role-avatar">👨‍🏫</div>
            <h3>Guru / Wali Kelas</h3>
            <p>Kelola materi, pantau siswa, dan buat soal adaptif dengan mudah!</p>
            <ul className="role-features">
              <li>Monitoring siswa real-time</li>
              <li>Bank soal adaptif</li>
              <li>Laporan mingguan otomatis</li>
              <li>Forum komunikasi siswa</li>
              <li>Analitik per kelas</li>
            </ul>
          </div>
          <div className="role-card kepala">
            <div className="role-avatar">👨‍💼</div>
            <h3>Kepala Sekolah</h3>
            <p>Pantau performa seluruh sekolah dan kelola manajemen guru &amp; siswa!</p>
            <ul className="role-features">
              <li>Overview sekolah</li>
              <li>Manajemen guru</li>
              <li>Data seluruh siswa</li>
              <li>Audit &amp; keamanan sistem</li>
              <li>Ketuntasan per kelas</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SCOPE */}
      <section className="scope-section">
        <h2 className="section-title">Apa yang Bisa &amp; Tidak Bisa SIPANDA Lakukan?</h2>
        <p className="section-sub">Transparansi adalah penting. Berikut ruang lingkup sistem SIPANDA dengan jelas!</p>
        <div className="scope-cols reveal">
          <div className="scope-col scope-in">
            <h3>✅ Dalam Cakupan</h3>
            <ul className="scope-list">
              <li>Manajemen akun dengan hak akses berbeda untuk setiap peran</li>
              <li>Konten pembelajaran: teks, video embed, soal adaptif</li>
              <li>Mesin asesmen adaptif berbasis performa siswa</li>
              <li>Dashboard monitoring siswa real-time</li>
              <li>Laporan mingguan otomatis dengan rekomendasi</li>
              <li>Forum kolaborasi dan notifikasi antar pengguna</li>
              <li>Panel administrasi sekolah untuk kepala sekolah</li>
              <li>Antarmuka responsif (bisa diakses dari HP maupun laptop)</li>
              <li>Sistem poin gamifikasi dan penukaran hadiah</li>
            </ul>
          </div>
          <div className="scope-col scope-out">
            <h3>❌ Di Luar Cakupan</h3>
            <ul className="scope-list">
              <li>Tidak menggantikan kehadiran fisik guru di kelas</li>
              <li>Tidak terintegrasi dengan Dapodik atau Rapor Digital</li>
              <li>Tidak ada fitur video conference / live streaming</li>
              <li>Tidak mencakup absensi atau administrasi non-akademik</li>
              <li>Tidak berpengaruh langsung pada nilai rapor resmi</li>
              <li>Tidak tersedia sebagai aplikasi mobile native (Android/iOS)</li>
              <li>Tidak mencakup modul keuangan sekolah</li>
            </ul>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="cara-kerja">
        <h2 className="section-title">Bagaimana Cara Kerjanya?</h2>
        <p className="section-sub">Mulai belajar dengan SIPANDA sangat mudah! Ikuti langkah-langkah berikut ini:</p>
        <div className="steps">
          <div className="step reveal">
            <div className="step-num">1</div>
            <span className="step-icon">📧</span>
            <div className="step-text">
              <h4>Dapatkan Akun dari Sekolah</h4>
              <p>Sekolah memberikan email dan password akun SIPANDA. Siswa, orang tua, guru, dan kepala sekolah masing-masing mendapat akun sesuai perannya.</p>
            </div>
          </div>
          <div className="step reveal">
            <div className="step-num">2</div>
            <span className="step-icon">🔑</span>
            <div className="step-text">
              <h4>Login ke SIPANDA</h4>
              <p>Masuk menggunakan email yang diberikan. Sistem otomatis mengarahkanmu ke dashboard sesuai peran — siswa ke portal belajar, orang tua ke panel monitoring, dll.</p>
            </div>
          </div>
          <div className="step reveal">
            <div className="step-num">3</div>
            <span className="step-icon">📚</span>
            <div className="step-text">
              <h4>Pelajari Materi &amp; Kerjakan Soal</h4>
              <p>Siswa membaca materi, menonton video, lalu mengerjakan kuis. Sistem secara otomatis menyesuaikan tingkat kesulitan soal berdasarkan jawaban yang diberikan.</p>
            </div>
          </div>
          <div className="step reveal">
            <div className="step-num">4</div>
            <span className="step-icon">⭐</span>
            <div className="step-text">
              <h4>Kumpulkan Poin dari Aktivitas Belajar</h4>
              <p>Setiap jawaban benar, streak harian, dan penyelesaian bab menghasilkan poin. Semakin rajin belajar, semakin banyak poin yang terkumpul!</p>
            </div>
          </div>
          <div className="step reveal">
            <div className="step-num">5</div>
            <span className="step-icon">🎁</span>
            <div className="step-text">
              <h4>Tukar Poin dengan Hadiah!</h4>
              <p>Bawa poin ke kantin sekolah dan tukar dengan jajan atau hadiah favoritmu. Orang tua bisa memantau semua progres ini di dashboard mereka!</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="masuk">
        <h2>Siap Mulai Belajar Bersama SIPANDA? 🚀</h2>
        <p>Bergabung dengan ribuan siswa yang sudah belajar lebih seru, lebih pintar, dan lebih bersemangat setiap harinya!</p>
        <div className="cta-btns">
          <a href="/auth/login" className="btn-white">🐼 Masuk Sekarang</a>
          <a href="#tentang" className="btn-outline-white">Pelajari Lebih Lanjut</a>
        </div>
        <p style={{ marginTop: '1.5rem', fontSize: '0.82rem', opacity: 0.6 }}>Akun SIPANDA diberikan oleh pihak sekolah. Hubungi sekolahmu untuk info lebih lanjut.</p>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">🐼 SIPANDA</div>
            <p>Sistem Informasi Pembelajaran Adaptif berbasis aNalitik DAta siswa. Platform belajar seru untuk ekosistem Sekolah Dasar.</p>
          </div>
          <div className="footer-links">
            <h4>Navigasi</h4>
            <ul>
              <li><a href="#beranda">Beranda</a></li>
              <li><a href="#tentang">Tentang SIPANDA</a></li>
              <li><a href="#fitur">Fitur</a></li>
              <li><a href="#peran">Pengguna</a></li>
              <li><a href="#cara-kerja">Cara Kerja</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Pengguna</h4>
            <ul>
              <li><a href="#">Portal Siswa</a></li>
              <li><a href="#">Panel Orang Tua</a></li>
              <li><a href="#">Guru &amp; Wali Kelas</a></li>
              <li><a href="#">Kepala Sekolah</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Bantuan</h4>
            <ul>
              <li><a href="#">Panduan Penggunaan</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Hubungi Kami</a></li>
              <li><a href="#">Kebijakan Privasi</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 SIPANDA – Sistem Informasi Pembelajaran Adaptif. Dibuat dengan ❤️ untuk kemajuan pendidikan SD Indonesia.</p>
        </div>
      </footer>
    </div>
    </> 
  );
}