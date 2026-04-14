import React from 'react';
import { useNavigate } from 'react-router-dom';
import Marquee from 'react-fast-marquee';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BookOpen, Video, FileText, HelpCircle, ArrowRight, Star, Users, Award, Shield, ChevronRight } from 'lucide-react';

const categories = [
  {
    key: 'ebook',
    title: 'E-Book Medis',
    desc: 'Buku digital lengkap untuk dokter umum dan dokter gigi',
    icon: BookOpen,
    image: 'https://images.unsplash.com/photo-1676313496173-e3b325353087?w=500',
    count: '50+ judul'
  },
  {
    key: 'video',
    title: 'Video Kursus',
    desc: 'Kursus video HD dengan sertifikat dan akses seumur hidup',
    icon: Video,
    image: 'https://images.unsplash.com/photo-1666886573264-38075cc56104?w=500',
    count: '30+ kursus'
  },
  {
    key: 'template',
    title: 'Template Dokumen',
    desc: 'Template rekam medis, informed consent, dan dokumen klinis',
    icon: FileText,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500',
    count: '80+ template'
  },
  {
    key: 'quiz',
    title: 'Bank Soal',
    desc: 'Soal latihan UKMPPD & UKMP2DG dengan pembahasan lengkap',
    icon: HelpCircle,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500',
    count: '3000+ soal'
  },
];

const testimonials = [
  { name: 'dr. Rina Safitri', role: 'Dokter Umum, Puskesmas Surabaya', text: 'E-book farmakologi dari Gimu sangat membantu praktik saya sehari-hari. Referensi cepat dan akurat.' },
  { name: 'drg. Budi Pratama', role: 'Dokter Gigi, Klinik Senyum Jakarta', text: 'Video kursus dental photography benar-benar mengubah cara saya mendokumentasikan kasus. Highly recommended!' },
  { name: 'Sarah Amelia', role: 'Mahasiswa Kedokteran Gigi', text: 'Bank soal UKMP2DG dari Gimu sangat komprehensif. Saya berhasil lulus ujian berkat latihan di sini.' },
  { name: 'dr. Ahmad Fauzi', role: 'Dokter Umum, RS Harapan', text: 'Template rekam medis digital sangat praktis dan sesuai standar. Menghemat banyak waktu administrasi.' },
  { name: 'drg. Maya Putri', role: 'Dokter Gigi Spesialis Ortodonti', text: 'Materi kedokteran gigi terpadu sangat lengkap. Cocok untuk refresher dan update ilmu.' },
  { name: 'Kevin Wijaya', role: 'Mahasiswa Kedokteran Umum', text: 'Bank soal UKMPPD premium dengan 2000+ soal sangat membantu persiapan ujian saya. Worth it!' },
];

const stats = [
  { value: '10,000+', label: 'Pengguna Aktif', icon: Users },
  { value: '100+', label: 'Produk Digital', icon: BookOpen },
  { value: '98%', label: 'Tingkat Kepuasan', icon: Award },
  { value: '24/7', label: 'Akses Seumur Hidup', icon: Shield },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1758691463620-188ca7c1a04f?w=1400"
            alt="Medical education"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#143D2E]/85 via-[#143D2E]/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-32">
          <div className="max-w-2xl">
            <Badge className="mb-6 bg-white/15 text-white border-white/20 backdrop-blur-sm text-xs uppercase tracking-[0.2em] font-bold px-4 py-1.5">
              Platform Edukasi Medis #1
            </Badge>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight font-light text-white mb-6 leading-[1.1]" data-testid="hero-title">
              Tingkatkan Kompetensi
              <span className="block font-medium mt-1">Medis Anda</span>
            </h1>
            <p className="text-base md:text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
              Akses ribuan produk digital berkualitas untuk dokter umum, dokter gigi, dan mahasiswa kedokteran. Dari e-book hingga bank soal.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                className="rounded-full px-8 py-3 text-sm font-semibold bg-white text-[#143D2E] hover:bg-white/90"
                onClick={() => navigate('/products')}
                data-testid="hero-cta-explore"
              >
                Jelajahi Produk <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-8 py-3 text-sm font-semibold border-white/30 text-white hover:bg-white/10 bg-transparent"
                onClick={() => navigate('/register')}
                data-testid="hero-cta-register"
              >
                Daftar Gratis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-[#E5E7E2]" data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center" style={{ animationDelay: `${i * 100}ms` }}>
                <stat.icon className="w-6 h-6 text-[#8FA998] mx-auto mb-3" strokeWidth={1.5} />
                <div className="font-heading font-semibold text-2xl md:text-3xl text-[#143D2E]">{stat.value}</div>
                <div className="text-sm text-[#6C7A70] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 md:py-28 bg-[#FBFBF9]" data-testid="categories-section">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-14">
            <span className="text-sm uppercase tracking-[0.2em] font-bold text-[#8FA998]">Kategori</span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-[#1E2320] mt-3">
              Temukan Produk yang Anda Butuhkan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.key}
                className="bg-white border border-[#E5E7E2] rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
                onClick={() => navigate(`/products?category=${cat.key}`)}
                data-testid={`category-${cat.key}`}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[#143D2E]/30" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold bg-white/90 backdrop-blur-sm text-[#143D2E] px-2.5 py-1 rounded-full">
                      {cat.count}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <cat.icon className="w-4 h-4 text-[#8FA998]" strokeWidth={1.5} />
                    <h3 className="font-heading font-medium text-base text-[#1E2320]">{cat.title}</h3>
                  </div>
                  <p className="text-sm text-[#6C7A70] leading-relaxed">{cat.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-sm font-medium text-[#143D2E] group-hover:gap-2 transition-all">
                    Lihat semua <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sm uppercase tracking-[0.2em] font-bold text-[#8FA998]">Mengapa Kami</span>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-[#1E2320] mt-3 mb-6">
                Platform Terpercaya untuk Profesional Medis
              </h2>
              <div className="space-y-6">
                {[
                  { title: 'Konten Berkualitas', desc: 'Dibuat oleh praktisi dan akademisi berpengalaman di bidangnya.' },
                  { title: 'Update Berkala', desc: 'Materi selalu diperbarui sesuai perkembangan ilmu kedokteran terbaru.' },
                  { title: 'Akses Seumur Hidup', desc: 'Beli sekali, akses selamanya. Termasuk semua update konten.' },
                  { title: 'Sertifikat Resmi', desc: 'Dapatkan sertifikat untuk setiap kursus video yang diselesaikan.' },
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#F0F2ED] flex-shrink-0 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[#143D2E]" />
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-base text-[#1E2320] mb-1">{feature.title}</h3>
                      <p className="text-sm text-[#6C7A70] leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1619691249147-c5689d88016b?w=600"
                  alt="Dental professional"
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-lg border border-[#E5E7E2]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F0F2ED] flex items-center justify-center">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-lg text-[#1E2320]">4.8/5</div>
                    <div className="text-xs text-[#6C7A70]">Rating pengguna</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 md:py-28 bg-[#F0F2ED]" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-6 md:px-8 mb-12">
          <div className="text-center">
            <span className="text-sm uppercase tracking-[0.2em] font-bold text-[#8FA998]">Testimoni</span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-[#1E2320] mt-3">
              Dipercaya oleh Ribuan Profesional Medis
            </h2>
          </div>
        </div>
        <Marquee speed={30} pauseOnHover gradient={false}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 mx-4 w-[340px] border border-[#E5E7E2] flex-shrink-0"
              data-testid={`testimonial-${i}`}
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-[#6C7A70] leading-relaxed mb-4 italic">"{t.text}"</p>
              <div>
                <p className="text-sm font-medium text-[#1E2320]">{t.name}</p>
                <p className="text-xs text-[#8FA998]">{t.role}</p>
              </div>
            </div>
          ))}
        </Marquee>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-[#143D2E]" data-testid="cta-section">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-white mb-4">
            Mulai Tingkatkan Kompetensi Anda Hari Ini
          </h2>
          <p className="text-base text-white/70 mb-8 max-w-lg mx-auto">
            Bergabung dengan ribuan dokter dan tenaga medis yang telah mempercayakan pengembangan profesional mereka kepada Gimu Digital Hub.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              className="rounded-full px-8 py-3 text-sm font-semibold bg-white text-[#143D2E] hover:bg-white/90"
              onClick={() => navigate('/products')}
              data-testid="cta-explore-products"
            >
              Jelajahi Produk <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-8 py-3 text-sm font-semibold border-white/30 text-white hover:bg-white/10 bg-transparent"
              onClick={() => navigate('/register')}
              data-testid="cta-register"
            >
              Daftar Sekarang
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
