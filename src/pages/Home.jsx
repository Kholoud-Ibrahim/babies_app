import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gift, Heart, Baby, Lightbulb, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import './Home.css'

// Set your due date here
const DUE_DATE = new Date('2026-07-04')

function Home() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = DUE_DATE - new Date()
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      }
    }
    return null
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const features = [
    {
      icon: Gift,
      title: "Gift Registry",
      description: "Browse our wishlist and help us prepare for the twins",
      link: "/registry",
      color: "blue"
    },
    {
      icon: Heart,
      title: "Send Love",
      description: "Share your heartfelt wishes and cards with us",
      link: "/send-love",
      color: "gold"
    },
    {
      icon: Baby,
      title: "Baby Updates",
      description: "Stay updated on our journey to parenthood",
      link: "/updates",
      color: "teal"
    },
    {
      icon: Lightbulb,
      title: "Advice & Tips",
      description: "Share your wisdom and recommendations with us",
      link: "/advice",
      color: "blue"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Arriving Soon</span>
          </div>
          
          <h1 className="hero-title">
            Welcome to Our<br />
            <span className="gradient-text">Twin Boys'</span><br />
            Journey
          </h1>
          
          <p className="hero-subtitle">
            We're so excited to share this incredible journey with you. 
            Our two little champions are on their way, and we can't wait 
            for you to be part of their story. ⭐⭐
          </p>

          <div className="hero-actions">
            <Link to="/registry" className="btn btn-primary">
              <Gift size={18} />
              View Registry
            </Link>
            <Link to="/send-love" className="btn btn-secondary">
              <Heart size={18} />
              Send Love
            </Link>
          </div>
        </motion.div>

        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="twins-illustration">
            <div className="baby-circle baby-1">
              <span>👶</span>
              <div className="baby-label">Idris</div>
            </div>
            <div className="baby-circle baby-2">
              <span>👶</span>
              <div className="baby-label">Yousef</div>
            </div>
            <div className="hearts-decoration">
              <span className="heart h1">💙</span>
              <span className="heart h2">✨</span>
              <span className="heart h3">⭐</span>
              <span className="heart h4">💫</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Countdown Section */}
      {timeLeft && (
        <motion.section 
          className="countdown-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="countdown-container">
            <h2 className="countdown-title">Meeting Our Champions In</h2>
            <div className="countdown-grid">
              <div className="countdown-item">
                <span className="countdown-number">{timeLeft.days}</span>
                <span className="countdown-label">Days</span>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-item">
                <span className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="countdown-label">Hours</span>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-item">
                <span className="countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="countdown-label">Minutes</span>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-item">
                <span className="countdown-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="countdown-label">Seconds</span>
              </div>
            </div>
            <p className="countdown-date">Expected: July 4, 2026</p>
          </div>
        </motion.section>
      )}

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.div 
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Explore & Connect</h2>
            <div className="section-divider"></div>
            <p>Join us in celebrating this wonderful chapter of our lives</p>
          </motion.div>

          <motion.div 
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Link to={feature.link} className={`feature-card feature-${feature.color}`}>
                  <div className="feature-icon">
                    <feature.icon size={28} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <span className="feature-arrow">→</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quote Section - Mum & Dad */}
      <motion.section 
        className="quote-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="quote-content">
          <div className="parents-photo">
            <img src="/images/mum-and-dad.jpeg" alt="Mum and Dad" />
          </div>
          <span className="quote-mark">"</span>
          <blockquote>
            Idris and Yousef, you are coming into a family<br />
            who will always love you unconditionally, celebrate you,<br />
            protect you, and make sure you are always safe.
          </blockquote>
          <span className="quote-author">— Your Mum & Dad 💙</span>
        </div>
      </motion.section>

      {/* Quote Section - Dogs (Pancake & Batata) */}
      <motion.section 
        className="quote-section dogs-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="dogs-quotes-container">
          {/* Pancake */}
          <div className="dog-quote-card">
            <div className="dog-photo pancake-photo">
              <img src="/images/pancake.jpeg" alt="Pancake" />
            </div>
            <blockquote>
              Idris and Yousef, I am over the moon to have brothers
              to play with me and throw the ball to me all day.
              I will always play with you and bring you so much joy,
              and we will always be best friends.
            </blockquote>
            <span className="quote-author">— Pancake 🐕</span>
          </div>

          {/* Batata */}
          <div className="dog-quote-card">
            <div className="dog-photo batata-photo">
              <img src="/images/batata.jpeg" alt="Batata" />
            </div>
            <blockquote>
              Hi boys,
              I'm not as playful as Pancake — I prefer chilling and cuddling more — 
              but I promise I'll give you endless love, and you'll always find me 
              to be the most loving companion.
              Love the family very much.
            </blockquote>
            <span className="quote-author">— Batata 🐕</span>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

export default Home
