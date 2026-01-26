import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Sparkles, ThumbsUp, ThumbsDown, Baby, ShoppingBag, Lightbulb, Heart, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import './Advice.css'

const categories = [
  { id: 'all', label: 'All Tips', icon: Sparkles, emoji: '✨' },
  { id: 'registry', label: 'Registry Items', icon: ShoppingBag, emoji: '🛒' },
  { id: 'twins', label: 'Twin Tips', icon: Baby, emoji: '👶👶' },
  { id: 'parenting', label: 'Parenting', icon: Heart, emoji: '💝' },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, emoji: '💡' },
]

function Advice({ tips, addTip, toggleLikeTip, toggleDislikeTip, userReactions, addComment, deleteComment, deleteTip, registryItems }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [expandedComments, setExpandedComments] = useState({})
  const [commentInputs, setCommentInputs] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    category: 'parenting',
    relatedItem: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filteredTips = tips.filter(tip => 
    activeCategory === 'all' || tip.category === activeCategory
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.message.trim()) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 600))

    addTip({
      name: formData.name.trim(),
      category: formData.category,
      relatedItem: formData.relatedItem || null,
      message: formData.message.trim(),
      likes: 0,
      dislikes: 0,
      comments: []
    })

    setFormData({ name: '', category: 'parenting', relatedItem: '', message: '' })
    setIsSubmitting(false)
    setShowForm(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const toggleComments = (tipId) => {
    setExpandedComments(prev => ({
      ...prev,
      [tipId]: !prev[tipId]
    }))
  }

  const handleAddComment = (tipId) => {
    const input = commentInputs[tipId]
    if (!input?.name?.trim() || !input?.text?.trim()) return
    
    addComment(tipId, {
      name: input.name.trim(),
      text: input.text.trim()
    })
    
    setCommentInputs(prev => ({
      ...prev,
      [tipId]: { name: '', text: '' }
    }))
  }

  const updateCommentInput = (tipId, field, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [tipId]: {
        ...prev[tipId],
        [field]: value
      }
    }))
  }

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteTip(deleteConfirm)
      setDeleteConfirm(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[0]
  }

  return (
    <div className="advice">
      <div className="container">
        {/* Header */}
        <motion.div 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>Advice & Tips 💡</h2>
          <div className="section-divider"></div>
          <p>Share your wisdom! Help us navigate the wonderful world of twin parenting with your tips and recommendations.</p>
        </motion.div>

        {/* Action Bar */}
        <motion.div 
          className="advice-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="category-filters">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.emoji}</span>
                <span className="category-label">{cat.label}</span>
              </button>
            ))}
          </div>

          <button 
            className="btn btn-primary add-tip-btn"
            onClick={() => setShowForm(true)}
          >
            <MessageCircle size={18} />
            Share a Tip
          </button>
        </motion.div>

        {/* Tips Grid */}
        <motion.div 
          className="tips-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence>
            {filteredTips.length > 0 ? (
              filteredTips.map((tip, index) => {
                const catInfo = getCategoryInfo(tip.category)
                const isExpanded = expandedComments[tip.id]
                const commentCount = tip.comments?.length || 0
                
                return (
                  <motion.div
                    key={tip.id}
                    className="tip-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <div className="tip-header">
                      <span className={`tip-category tip-category-${tip.category}`}>
                        {catInfo.emoji} {catInfo.label}
                      </span>
                      <div className="tip-header-right">
                        <span className="tip-date">{formatDate(tip.date)}</span>
                        <button 
                          className="delete-tip-btn"
                          onClick={() => setDeleteConfirm(tip.id)}
                          title="Delete tip"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {tip.relatedItem && (
                      <div className="tip-related">
                        <ShoppingBag size={14} />
                        Re: {tip.relatedItem}
                      </div>
                    )}

                    <p className="tip-message">{tip.message}</p>

                    <div className="tip-footer">
                      <span className="tip-author">— {tip.name}</span>
                      <div className="tip-actions">
                        <motion.button 
                          className={`reaction-btn like ${userReactions.liked.includes(tip.id) ? 'active' : ''}`}
                          onClick={() => toggleLikeTip(tip.id)}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ThumbsUp size={16} fill={userReactions.liked.includes(tip.id) ? 'currentColor' : 'none'} />
                          <span>{tip.likes || 0}</span>
                        </motion.button>
                        <motion.button 
                          className={`reaction-btn dislike ${userReactions.disliked.includes(tip.id) ? 'active' : ''}`}
                          onClick={() => toggleDislikeTip(tip.id)}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ThumbsDown size={16} fill={userReactions.disliked.includes(tip.id) ? 'currentColor' : 'none'} />
                          <span>{tip.dislikes || 0}</span>
                        </motion.button>
                        <button 
                          className="comment-toggle"
                          onClick={() => toggleComments(tip.id)}
                        >
                          <MessageCircle size={16} />
                          <span>{commentCount}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          className="comments-section"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Existing Comments */}
                          {tip.comments && tip.comments.length > 0 && (
                            <div className="comments-list">
                              {tip.comments.map((comment) => (
                                <div key={comment.id} className="comment">
                                  <div className="comment-header">
                                    <span className="comment-author">{comment.name}</span>
                                    <span className="comment-date">{formatDate(comment.date)}</span>
                                    <button 
                                      className="delete-comment-btn"
                                      onClick={() => deleteComment(tip.id, comment.id)}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                  <p className="comment-text">{comment.text}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Comment Form */}
                          <div className="add-comment">
                            <input
                              type="text"
                              placeholder="Your name"
                              className="comment-name-input"
                              value={commentInputs[tip.id]?.name || ''}
                              onChange={(e) => updateCommentInput(tip.id, 'name', e.target.value)}
                            />
                            <div className="comment-input-row">
                              <input
                                type="text"
                                placeholder="Add a comment..."
                                className="comment-text-input"
                                value={commentInputs[tip.id]?.text || ''}
                                onChange={(e) => updateCommentInput(tip.id, 'text', e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') handleAddComment(tip.id)
                                }}
                              />
                              <button 
                                className="send-comment-btn"
                                onClick={() => handleAddComment(tip.id)}
                                disabled={!commentInputs[tip.id]?.name?.trim() || !commentInputs[tip.id]?.text?.trim()}
                              >
                                <Send size={16} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })
            ) : (
              <motion.div 
                className="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="empty-state-icon">💭</div>
                <h3>No tips yet in this category</h3>
                <p>Be the first to share your wisdom!</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  Share a Tip
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tip Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
            >
              <motion.div 
                className="modal advice-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>
                    <Lightbulb size={24} />
                    Share Your Wisdom
                  </h3>
                  <p>Your tips will help us prepare for our twins!</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Your Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-input"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {categories.filter(c => c.id !== 'all').map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.emoji} {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {formData.category === 'registry' && (
                    <div className="form-group">
                      <label className="form-label">Related Registry Item (optional)</label>
                      <select
                        className="form-input"
                        value={formData.relatedItem}
                        onChange={(e) => setFormData({ ...formData, relatedItem: e.target.value })}
                      >
                        <option value="">Select an item...</option>
                        {registryItems.map(item => (
                          <option key={item.id} value={item.name}>
                            {item.image} {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Your Tip or Advice</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="Share your experience, recommendation, or helpful tip..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      maxLength={500}
                    />
                    <span className="char-count">{formData.message.length}/500</span>
                  </div>

                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isSubmitting || !formData.name.trim() || !formData.message.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <Sparkles size={18} className="spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Share Tip
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
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
                <h3>Delete this tip?</h3>
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
                    onClick={handleDelete}
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
              Thank you for sharing your wisdom! 💡
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Advice
