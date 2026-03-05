import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Sparkles, ThumbsUp, ThumbsDown, Baby, ShoppingBag, Lightbulb, Heart, ChevronDown, ChevronUp, Trash2, Pencil, X, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Advice.css'

const categories = [
  { id: 'all', label: 'All Tips', icon: Sparkles, emoji: '✨' },
  { id: 'registry', label: 'Registry Items', icon: ShoppingBag, emoji: '🛒' },
  { id: 'twins', label: 'Twin Tips', icon: Baby, emoji: '👶👶' },
  { id: 'parenting', label: 'Parenting', icon: Heart, emoji: '💝' },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, emoji: '💡' },
]

function Advice({ tips, addTip, editTip, toggleLikeTip, toggleDislikeTip, userReactions, addComment, editComment, deleteComment, deleteTip, registryItems }) {
  const { guest, isAdmin, requireAuth } = useAuth()
  const [activeCategory, setActiveCategory] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [expandedComments, setExpandedComments] = useState({})
  const [commentInputs, setCommentInputs] = useState({})
  const [formData, setFormData] = useState({
    name: guest?.name || '',
    category: 'parenting',
    relatedItem: '',
    message: ''
  })

  // Auto-fill name when user logs in
  useEffect(() => {
    if (guest?.name) {
      setFormData(prev => ({ ...prev, name: guest.name }))
    }
  }, [guest?.name])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  // Edit state
  const [editingTip, setEditingTip] = useState(null)
  const [editTipMessage, setEditTipMessage] = useState('')
  const [editingComment, setEditingComment] = useState(null) // { tipId, commentId }
  const [editCommentText, setEditCommentText] = useState('')

  const filteredTips = tips.filter(tip => 
    activeCategory === 'all' || tip.category === activeCategory
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!requireAuth()) return
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
      comments: [],
      createdById: guest?.id || null,
    })

    setFormData({ name: guest?.name || '', category: 'parenting', relatedItem: '', message: '' })
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
    if (!requireAuth()) return
    const input = commentInputs[tipId]
    const commentName = input?.name?.trim() || guest?.name || ''
    if (!commentName || !input?.text?.trim()) return
    
    addComment(tipId, {
      name: commentName,
      text: input.text.trim(),
      createdById: guest?.id || null,
    })
    
    setCommentInputs(prev => ({
      ...prev,
      [tipId]: { name: guest?.name || '', text: '' }
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

  // Edit tip handlers
  const handleStartEditTip = (tip) => {
    setEditingTip(tip.id)
    setEditTipMessage(tip.message)
  }

  const handleSaveEditTip = (tipId) => {
    if (editTipMessage.trim()) {
      editTip(tipId, { message: editTipMessage.trim() })
    }
    setEditingTip(null)
    setEditTipMessage('')
  }

  // Edit comment handlers
  const handleStartEditComment = (tipId, comment) => {
    setEditingComment({ tipId, commentId: comment.id })
    setEditCommentText(comment.text)
  }

  const handleSaveEditComment = () => {
    if (editingComment && editCommentText.trim()) {
      editComment(editingComment.tipId, editingComment.commentId, { text: editCommentText.trim() })
    }
    setEditingComment(null)
    setEditCommentText('')
  }

  // Permission helpers
  const canDeleteTip = (tip) => isAdmin || (guest && tip.created_by_id === guest.id)
  const canEditTip = (tip) => guest && tip.created_by_id === guest.id
  const canDeleteComment = (comment) => isAdmin || (guest && comment.created_by_id === guest.id)
  const canEditComment = (comment) => guest && comment.created_by_id === guest.id

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
            onClick={() => { if (requireAuth()) setShowForm(true) }}
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
                        {canEditTip(tip) && (
                          <button 
                            className="edit-tip-btn"
                            onClick={() => handleStartEditTip(tip)}
                            title="Edit tip"
                          >
                            <Pencil size={13} />
                          </button>
                        )}
                        {canDeleteTip(tip) && (
                          <button 
                            className="delete-tip-btn"
                            onClick={() => setDeleteConfirm(tip.id)}
                            title="Delete tip"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {tip.related_item && (
                      <div className="tip-related">
                        <ShoppingBag size={14} />
                        Re: {tip.related_item}
                      </div>
                    )}

                    {/* Tip message — editable or static */}
                    {editingTip === tip.id ? (
                      <div className="tip-edit-inline">
                        <textarea
                          className="tip-edit-textarea"
                          value={editTipMessage}
                          onChange={(e) => setEditTipMessage(e.target.value)}
                          maxLength={500}
                        />
                        <div className="tip-edit-actions">
                          <button className="btn btn-sm btn-secondary" onClick={() => setEditingTip(null)}>
                            Cancel
                          </button>
                          <button 
                            className="btn btn-sm btn-primary" 
                            onClick={() => handleSaveEditTip(tip.id)}
                            disabled={!editTipMessage.trim()}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="tip-message">{tip.message}</p>
                    )}

                    <div className="tip-footer">
                      <span className="tip-author">— {tip.name}</span>
                      <div className="tip-actions">
                        <motion.button 
                          className={`reaction-btn like ${userReactions.liked.includes(tip.id) ? 'active' : ''}`}
                          onClick={() => { if (requireAuth()) toggleLikeTip(tip.id) }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ThumbsUp size={16} fill={userReactions.liked.includes(tip.id) ? 'currentColor' : 'none'} />
                          <span>{tip.likes || 0}</span>
                        </motion.button>
                        <motion.button 
                          className={`reaction-btn dislike ${userReactions.disliked.includes(tip.id) ? 'active' : ''}`}
                          onClick={() => { if (requireAuth()) toggleDislikeTip(tip.id) }}
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
                                    <div className="comment-actions">
                                      {canEditComment(comment) && (
                                        <button 
                                          className="edit-comment-btn"
                                          onClick={() => handleStartEditComment(tip.id, comment)}
                                          title="Edit"
                                        >
                                          <Pencil size={11} />
                                        </button>
                                      )}
                                      {canDeleteComment(comment) && (
                                        <button 
                                          className="delete-comment-btn"
                                          onClick={() => deleteComment(tip.id, comment.id)}
                                          title="Delete"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  {/* Comment text — editable or static */}
                                  {editingComment?.commentId === comment.id ? (
                                    <div className="comment-edit-inline">
                                      <input
                                        type="text"
                                        className="comment-edit-input"
                                        value={editCommentText}
                                        onChange={(e) => setEditCommentText(e.target.value)}
                                      />
                                      <div className="comment-edit-actions">
                                        <button className="comment-edit-cancel" onClick={() => setEditingComment(null)}>
                                          <X size={14} />
                                        </button>
                                        <button 
                                          className="comment-edit-save" 
                                          onClick={handleSaveEditComment}
                                          disabled={!editCommentText.trim()}
                                        >
                                          <Check size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="comment-text">{comment.text}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Comment Form */}
                          <div className="add-comment">
                            <input
                              type="text"
                              placeholder="Your name"
                              className={`comment-name-input ${guest ? 'form-input-readonly' : ''}`}
                              value={commentInputs[tip.id]?.name || guest?.name || ''}
                              onChange={(e) => updateCommentInput(tip.id, 'name', e.target.value)}
                              readOnly={!!guest}
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
                                disabled={!(commentInputs[tip.id]?.name?.trim() || guest?.name) || !commentInputs[tip.id]?.text?.trim()}
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
                        className={`form-input ${guest ? 'form-input-readonly' : ''}`}
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        readOnly={!!guest}
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
