import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Calendar, MessageCircle, Send, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import './Updates.css'

function Updates({ updates, toggleLikeUpdate, userUpdateReactions, addUpdateComment, deleteUpdateComment }) {
  const [expandedComments, setExpandedComments] = useState({})
  const [commentInputs, setCommentInputs] = useState({})

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const toggleComments = (updateId) => {
    setExpandedComments(prev => ({
      ...prev,
      [updateId]: !prev[updateId]
    }))
  }

  const handleAddComment = (updateId) => {
    const input = commentInputs[updateId]
    if (!input?.name?.trim() || !input?.text?.trim()) return
    
    addUpdateComment(updateId, {
      name: input.name.trim(),
      text: input.text.trim()
    })
    
    setCommentInputs(prev => ({
      ...prev,
      [updateId]: { name: '', text: '' }
    }))
  }

  const updateCommentInput = (updateId, field, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [updateId]: {
        ...prev[updateId],
        [field]: value
      }
    }))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="updates">
      <div className="container">
        {/* Header */}
        <motion.div 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>Baby Updates 👶</h2>
          <div className="section-divider"></div>
          <p>Follow along our journey as we prepare for Layla and Leen</p>
        </motion.div>

        {/* Timeline */}
        <motion.div 
          className="timeline"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {updates.length > 0 ? (
            updates.map((update, index) => {
              const isLiked = userUpdateReactions.liked.includes(update.id)
              const isExpanded = expandedComments[update.id]
              const commentCount = update.comments?.length || 0

              return (
                <motion.article 
                  key={update.id}
                  className="update-card"
                  variants={itemVariants}
                >
                  <div className="update-timeline-marker">
                    <div className="marker-dot"></div>
                    {index !== updates.length - 1 && <div className="marker-line"></div>}
                  </div>

                  <div className="update-content">
                    <div className="update-header">
                      <span className="update-date">
                        <Calendar size={14} />
                        {formatDate(update.date)}
                      </span>
                    </div>

                    <div className="update-image">
                      <span>{update.image}</span>
                    </div>

                    <h3 className="update-title">{update.title}</h3>
                    <p className="update-text">{update.content}</p>

                    <div className="update-actions">
                      <motion.button 
                        className={`like-btn ${isLiked ? 'active' : ''}`}
                        onClick={() => toggleLikeUpdate(update.id)}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                        <span>{update.likes}</span>
                      </motion.button>

                      <button 
                        className="comment-toggle-btn"
                        onClick={() => toggleComments(update.id)}
                      >
                        <MessageCircle size={16} />
                        <span>{commentCount}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {/* Comments Section */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          className="update-comments-section"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Existing Comments */}
                          {update.comments && update.comments.length > 0 && (
                            <div className="update-comments-list">
                              {update.comments.map((comment) => (
                                <div key={comment.id} className="update-comment">
                                  <div className="update-comment-header">
                                    <span className="update-comment-author">{comment.name}</span>
                                    <span className="update-comment-date">{formatDate(comment.date)}</span>
                                    <button 
                                      className="delete-comment-btn"
                                      onClick={() => deleteUpdateComment(update.id, comment.id)}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                  <p className="update-comment-text">{comment.text}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Comment Form */}
                          <div className="add-update-comment">
                            <input
                              type="text"
                              placeholder="Your name"
                              className="comment-name-input"
                              value={commentInputs[update.id]?.name || ''}
                              onChange={(e) => updateCommentInput(update.id, 'name', e.target.value)}
                            />
                            <div className="comment-input-row">
                              <input
                                type="text"
                                placeholder="Add a comment..."
                                className="comment-text-input"
                                value={commentInputs[update.id]?.text || ''}
                                onChange={(e) => updateCommentInput(update.id, 'text', e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') handleAddComment(update.id)
                                }}
                              />
                              <button 
                                className="send-comment-btn"
                                onClick={() => handleAddComment(update.id)}
                                disabled={!commentInputs[update.id]?.name?.trim() || !commentInputs[update.id]?.text?.trim()}
                              >
                                <Send size={16} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.article>
              )
            })
          ) : (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="empty-state-icon">📝</div>
              <h3>No updates yet</h3>
              <p>Check back soon for news about Layla and Leen!</p>
            </motion.div>
          )}
        </motion.div>

        {/* Coming Soon Section */}
        <motion.div 
          className="coming-soon"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="coming-soon-content">
            <span className="coming-soon-emoji">🌟</span>
            <h3>More Updates Coming Soon!</h3>
            <p>We'll be sharing more moments from our journey. Stay tuned for nursery reveals, baby showers, and more!</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Updates
