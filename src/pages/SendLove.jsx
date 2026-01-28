import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Send, Sparkles, Palette, BookOpen, Trash2 } from 'lucide-react'
import './SendLove.css'

const cardTemplates = [
  { id: 1, name: 'Rose Garden', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', emoji: '🌹', textColor: '#8b4a5e' },
  { id: 2, name: 'Soft Blush', bg: 'linear-gradient(135deg, #ffeef8 0%, #f8c8dc 100%)', emoji: '🌸', textColor: '#c17b8e' },
  { id: 3, name: 'Golden Hour', bg: 'linear-gradient(135deg, #fef9d7 0%, #d4a853 100%)', emoji: '✨', textColor: '#8b7355' },
  { id: 4, name: 'Lavender Dreams', bg: 'linear-gradient(135deg, #e8dff5 0%, #c5b3e8 100%)', emoji: '💜', textColor: '#6b5b7a' },
  { id: 5, name: 'Mint Fresh', bg: 'linear-gradient(135deg, #e0f5e9 0%, #a8d5ba 100%)', emoji: '🌿', textColor: '#5a7d6a' },
  { id: 6, name: 'Peachy Keen', bg: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)', emoji: '🍑', textColor: '#8b6b5c' },
]

const decorations = ['💕', '🎀', '👶', '🌸', '✨', '💝', '🦋', '🌈', '⭐', '🎁']

function SendLove({ cards, addCard, deleteCard }) {
  const [activeTab, setActiveTab] = useState('create')
  const [formData, setFormData] = useState({
    senderName: '',
    message: '',
    template: cardTemplates[0],
    decoration: '💕'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.senderName.trim() || !formData.message.trim()) return

    setIsSubmitting(true)
    
    await new Promise(resolve => setTimeout(resolve, 800))
    
    addCard({
      senderName: formData.senderName,
      message: formData.message,
      templateId: formData.template.id,
      template: formData.template,
      decoration: formData.decoration
    })

    setShowSuccess(true)
    setFormData({
      senderName: '',
      message: '',
      template: cardTemplates[0],
      decoration: '💕'
    })
    setIsSubmitting(false)

    setTimeout(() => {
      setShowSuccess(false)
      setActiveTab('received')
    }, 2000)
  }

  const handleDelete = (cardId) => {
    deleteCard(cardId)
    setDeleteConfirm(null)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="send-love">
      <div className="container">
        {/* Header */}
        <motion.div 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>Send Love 💌</h2>
          <div className="section-divider"></div>
          <p>Create a beautiful card or leave a heartfelt message for our growing family</p>
        </motion.div>

        {/* Tabs */}
        <div className="love-tabs">
          <button 
            className={`love-tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <Palette size={18} />
            Create Card
          </button>
          <button 
            className={`love-tab ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            <BookOpen size={18} />
            Messages ({cards.length})
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'create' ? (
            <motion.div 
              key="create"
              className="send-love-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Card Creator */}
              <div className="card-creator">
                <h3>
                  <Palette size={20} />
                  Design Your Card
                </h3>

                <form onSubmit={handleSubmit}>
                  {/* Template Selection */}
                  <div className="form-group">
                    <label className="form-label">Choose a Style</label>
                    <div className="template-grid">
                      {cardTemplates.map(template => (
                        <button
                          key={template.id}
                          type="button"
                          className={`template-option ${formData.template.id === template.id ? 'selected' : ''}`}
                          style={{ background: template.bg }}
                          onClick={() => setFormData({ ...formData, template })}
                        >
                          <span>{template.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Decoration Selection */}
                  <div className="form-group">
                    <label className="form-label">Add a Decoration</label>
                    <div className="decoration-grid">
                      {decorations.map(dec => (
                        <button
                          key={dec}
                          type="button"
                          className={`decoration-option ${formData.decoration === dec ? 'selected' : ''}`}
                          onClick={() => setFormData({ ...formData, decoration: dec })}
                        >
                          {dec}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter your name"
                      value={formData.senderName}
                      onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                      required
                    />
                  </div>

                  {/* Message Input */}
                  <div className="form-group">
                    <label className="form-label">Your Message</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="Write your heartfelt message, wishes, or words of wisdom..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      maxLength={500}
                    />
                    <span className="char-count">{formData.message.length}/500</span>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary submit-btn"
                    disabled={isSubmitting || !formData.senderName.trim() || !formData.message.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles size={18} className="spin" />
                        Sending Love...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Card
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Preview */}
              <div className="card-preview-section">
                <h3>
                  <Heart size={20} />
                  Preview
                </h3>

                <div 
                  className="card-preview"
                  style={{ background: formData.template.bg }}
                >
                  <div className="preview-decoration">{formData.decoration}</div>
                  <div className="preview-content">
                    <p className="preview-message" style={{ color: formData.template.textColor }}>
                      {formData.message || 'Your message will appear here...'}
                    </p>
                    <p className="preview-sender" style={{ color: formData.template.textColor }}>
                      — {formData.senderName || 'Your Name'}
                    </p>
                  </div>
                  <div className="preview-decoration bottom">{formData.decoration}</div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="received"
              className="received-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {cards.length > 0 ? (
                <div className="cards-grid">
                  {cards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      className="received-card"
                      style={{ background: card.template.bg }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, rotate: Math.random() > 0.5 ? 1 : -1 }}
                    >
                      <button 
                        className="delete-card-btn"
                        onClick={() => setDeleteConfirm(card.id)}
                        title="Delete card"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="received-decoration">{card.decoration}</div>
                      <p className="received-message" style={{ color: card.template.textColor }}>
                        {card.message}
                      </p>
                      <p className="received-sender" style={{ color: card.template.textColor }}>
                        — {card.sender_name}
                      </p>
                      <span className="received-date">{formatDate(card.date)}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">💌</div>
                  <h3>No messages yet</h3>
                  <p>Be the first to send love!</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('create')}
                  >
                    Create a Card
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div 
                className="modal delete-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="modal-icon">🗑️</div>
                <h3>Delete this card?</h3>
                <p>This action cannot be undone.</p>
                <div className="modal-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(deleteConfirm)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              className="success-toast"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <Sparkles size={20} />
              Your card has been sent! Thank you for the love 💕
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default SendLove
