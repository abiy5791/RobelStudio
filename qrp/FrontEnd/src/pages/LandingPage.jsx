import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { motion } from 'framer-motion'
import { Sparkles, Camera, Share2, Shield, Zap, Palette, Smartphone, QrCode } from 'lucide-react'
import { listAlbums } from '../services/api.js'
import { getImageUrl } from '../utils/imageUtils.js'
import ParticleSystem from '../components/ParticleSystem.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    listAlbums().then((d) => { 
      if (active) {
        setAlbums(d.results || d || [])
      }
    }).catch(() => {}).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const heroImages = Array.isArray(albums) ? albums.flatMap(a => {
    if (a.cover_photo) {
      return [a.cover_photo.thumbnail_url || a.cover_photo.url]
    }
    return (a.photos || []).slice(0, 1).map(photo => typeof photo === 'string' ? photo : (photo.thumbnail_url || photo.url))
  }).filter(Boolean).slice(0, 4) : []
  const heroAlbumUrl = albums?.[0]?.url || window.location.origin + '/create'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  return (
    <motion.section 
      className="py-5 md:py-1 lg:py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border mb-16" style={{ borderColor: 'var(--border)', background: 'var(--surface)', minHeight: 'clamp(450px, 55vh, 650px)' }}>
        {/* Ambient particles */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <ParticleSystem type="bokeh" count={24} />
        </div>

        <div className="relative grid lg:grid-cols-2 gap-6 md:gap-10 lg:gap-14 items-center h-full p-6 md:p-10 lg:p-14">
          <motion.div variants={itemVariants} className="space-y-5 md:space-y-6 lg:space-y-7">
            <div className="badge">
              <Sparkles className="w-3 h-3 mr-2" />
              Elegant • Timeless • Shareable
            </div>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl leading-[1.1] font-bold text-balance" style={{ color: 'var(--text)' }}>
              A modern QR wedding album
              <span className="block text-gradient">crafted to be remembered</span>
            </h1>

            <p className="text-base md:text-md leading-relaxed font-sans" style={{ color: 'var(--text-soft)' }}>
              Create a stunning online album in minutes. Guests join by scanning a QR code—no apps to download, just beautiful memories on any device.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary text-sm md:text-base px-6 md:px-8 py-3 md:py-4">
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/login" className="btn btn-primary text-sm md:text-base px-6 md:px-8 py-3 md:py-4">
                  Sign In
                </Link>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 md:pt-4">
              {["No app required", "Unlimited guests", "Private by default"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-xs md:text-sm font-sans" style={{ color: 'var(--text-soft)' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                  {t}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative h-full flex items-center justify-center">
            <div className="relative w-full" style={{ minHeight: '300px', maxHeight: '500px', height: '100%' }}>
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-2 md:gap-3 w-full max-w-sm md:max-w-md">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="skeleton aspect-[3/4] rounded-xl md:rounded-2xl" />
                    ))}
                  </div>
                </div>
              ) : heroImages.length >= 3 ? (
                <div className="relative w-full h-full flex items-center justify-center px-4 md:px-0">
                  {/* Main large image - centered */}
                  <motion.div 
                    className="absolute z-10 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl"
                    style={{ 
                      width: '58%',
                      height: '68%',
                      top: '16%',
                      left: '21%',
                      border: '3px solid white',
                      boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25)'
                    }}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  >
                    <img src={getImageUrl(heroImages[0])} alt="Album preview" loading="eager" fetchpriority="high" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </motion.div>

                  {/* Top right floating image */}
                  <motion.div 
                    className="absolute z-20 rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl"
                    style={{ 
                      width: '36%',
                      height: '42%',
                      top: '6%',
                      right: '4%',
                      border: '2px solid white',
                      boxShadow: '0 15px 35px -12px rgba(212, 165, 116, 0.4)'
                    }}
                    initial={{ scale: 0.8, opacity: 0, x: 30, rotate: 5 }}
                    animate={{ scale: 1, opacity: 1, x: 0, rotate: 3 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                  >
                    <img src={getImageUrl(heroImages[1])} alt="Album preview" loading="lazy" className="w-full h-full object-cover" />
                  </motion.div>

                  {/* Bottom left floating image */}
                  <motion.div 
                    className="absolute z-20 rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl"
                    style={{ 
                      width: '33%',
                      height: '38%',
                      bottom: '9%',
                      left: '4%',
                      border: '2px solid white',
                      boxShadow: '0 15px 35px -12px rgba(212, 165, 116, 0.4)'
                    }}
                    initial={{ scale: 0.8, opacity: 0, x: -30, rotate: -5 }}
                    animate={{ scale: 1, opacity: 1, x: 0, rotate: -3 }}
                    transition={{ duration: 0.7, delay: 0.6 }}
                  >
                    <img src={getImageUrl(heroImages[2])} alt="Album preview" loading="lazy" className="w-full h-full object-cover" />
                  </motion.div>

                  {/* Decorative elements */}
                  <div className="hidden md:block absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--accent)' }} />
                  <div className="hidden md:block absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--accent)' }} />
                </div>
              ) : heroImages.length > 0 ? (
                <div className="w-full h-full flex items-center justify-center px-4">
                  <motion.div 
                    className="rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl"
                    style={{ 
                      width: '85%',
                      maxWidth: '350px',
                      aspectRatio: '3/4',
                      border: '3px solid white'
                    }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                  >
                    <img src={getImageUrl(heroImages[0])} alt="Album preview" loading="eager" className="w-full h-full object-cover" />
                  </motion.div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-center px-6 md:px-8" style={{ color: 'var(--muted)' }}>
                  <div>
                    <Camera className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 opacity-50" />
                    <p className="font-sans text-sm md:text-base">Your first album preview will appear here</p>
                  </div>
                </div>
              )}
            </div>

            <motion.div 
              className="absolute -bottom-3 -right-3 md:-bottom-5 md:-right-5 glass rounded-lg md:rounded-xl p-2.5 md:p-3.5 shadow-xl md:shadow-2xl flex items-center gap-2.5 md:gap-3 z-30"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5, type: 'spring', stiffness: 200 }}
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="p-1.5 md:p-2.5 rounded-md md:rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <QRCodeCanvas value={heroAlbumUrl} size={40} includeMargin={false} className="md:w-12 md:h-12" />
              </div>
              <div className="font-sans text-xs md:text-sm" style={{ color: 'var(--text)' }}>
                <div className="font-semibold">Instant Access</div>
                <div className="hidden sm:block text-xs" style={{ color: 'var(--text-soft)' }}>Scan & view</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* QUICK STATS / VALUE PROPS */}
      <motion.div 
        className="grid md:grid-cols-3 gap-4 md:gap-6 mb-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {[
          { icon: QrCode, title: 'Frictionless Access', desc: 'Elegant QR codes that just work—no app installs' },
          { icon: Palette, title: 'Beautiful Themes', desc: 'Tailored looks for weddings, travel, family and more' },
          { icon: Shield, title: 'Privacy First', desc: 'You control who sees and what gets shared' },
        ].map(({ icon: Icon, title, desc }) => (
          <motion.div key={title} className="card-enhanced" variants={itemVariants}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: 'var(--blush)' }}>
                <Icon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h3 className="font-serif text-lg md:text-xl font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
                <p className="font-sans text-sm md:text-base mt-1" style={{ color: 'var(--text-soft)' }}>{desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* HOW IT WORKS */}
      <motion.div 
        id="how" 
        className="mt-16 md:mt-24"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div variants={itemVariants} className="text-center mb-10 md:mb-16">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold mb-3 md:mb-4" style={{ color: 'var(--text)' }}>
            Simple. Elegant. Memorable.
          </h2>
          <p className="text-base md:text-xl font-sans px-4" style={{ color: 'var(--text-soft)' }}>
            Three steps to create your perfect wedding album
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { 
              icon: Camera, 
              title: 'Upload & Curate', 
              desc: 'Add your favorite photos, couple names, and wedding details with our intuitive interface.' 
            },
            { 
              icon: QrCode, 
              title: 'Generate QR Code', 
              desc: 'Get a beautiful QR code that you can print on invitations, table cards, or display boards.' 
            },
            { 
              icon: Share2, 
              title: 'Share & Celebrate', 
              desc: 'Guests scan and instantly access your stunning album on any device—no apps required.' 
            },
          ].map((step) => {
            const Icon = step.icon
            return (
              <motion.div 
                key={step.title} 
                className="card-enhanced text-center group"
                variants={itemVariants}
              >
                <div 
                  className="w-16 h-16 rounded-2xl mx-auto mb-6 grid place-items-center group-hover:scale-110 transition-transform duration-300"
                  style={{ background: 'var(--blush)' }}
                >
                  <Icon className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-semibold mb-2 md:mb-3" style={{ color: 'var(--text)' }}>
                  {step.title}
                </h3>
                <p className="font-sans text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                  {step.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* FEATURE GRID */}
      <motion.div 
        className="mt-20 md:mt-28"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div variants={itemVariants} className="text-center mb-10 md:mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold" style={{ color: 'var(--text)' }}>
            Designed for real celebrations
          </h2>
          <p className="text-base md:text-lg font-sans mt-2" style={{ color: 'var(--text-soft)' }}>
            Thoughtful details that make sharing effortless
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[
            { icon: Smartphone, title: 'Mobile‑first', desc: 'Beautiful and fast on every device' },
            { icon: Zap, title: 'Instant setup', desc: 'Create and share in minutes' },
            { icon: Palette, title: 'Premium themes', desc: 'Curated looks for any occasion' },
            { icon: Shield, title: 'Controls that matter', desc: 'Privacy and access you can trust' },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} className="card" variants={itemVariants}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: 'var(--blush)' }}>
                  <Icon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
                  <p className="font-sans text-sm mt-1" style={{ color: 'var(--text-soft)' }}>{desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Categories Section */}
      <motion.div 
        className="mt-20 md:mt-32"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div variants={itemVariants} className="text-center mb-10 md:mb-16">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold mb-3 md:mb-4" style={{ color: 'var(--text)' }}>
            Perfect for Every Occasion
          </h2>
          <p className="text-base md:text-xl font-sans px-4" style={{ color: 'var(--text-soft)' }}>
            Choose from beautifully crafted themes for any life moment
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[
            { icon: '💍', title: 'Weddings & Events', desc: 'Romantic themes with floral elements and elegant styling' },
            { icon: '👨👩👧👦', title: 'Family Milestones', desc: 'Warm scrapbook layouts for precious family memories' },
            { icon: '🎉', title: 'Celebrations', desc: 'Vibrant party themes with confetti and dynamic layouts' },
            { icon: '✈️', title: 'Travel Adventures', desc: 'Fresh sky themes with parallax effects and travel icons' },
            { icon: '🌟', title: 'Special Occasions', desc: 'Premium elegant themes for graduations and achievements' },
            { icon: '🎨', title: 'Creative Albums', desc: 'Artistic freestyle layouts for personal creative projects' },
          ].map((category) => (
            <motion.div 
              key={category.title} 
              className="card text-center group hover:scale-105 transition-transform duration-300"
              variants={itemVariants}
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="font-serif text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
                {category.title}
              </h3>
              <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                {category.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Final CTA */}
      <motion.div 
        className="mt-20 md:mt-28"
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="rounded-2xl md:rounded-3xl p-8 md:p-12 border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h3 className="font-serif text-2xl md:text-3xl font-semibold" style={{ color: 'var(--text)' }}>
            Ready to share your story?
          </h3>
          <p className="font-sans text-sm md:text-base mt-2 mb-6" style={{ color: 'var(--text-soft)' }}>
            Create a beautiful album in minutes and share it instantly via QR code.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            {isAuthenticated ? (
              <Link to="/create" className="btn btn-primary px-8 py-4">Create Album</Link>
            ) : (
              <Link to="/login" className="btn btn-primary px-8 py-4">Get Started</Link>
            )}
            <a href="#how" className="btn btn-ghost px-8 py-4">See How It Works</a>
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}
