import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Check, Gift, X, DollarSign, Tag, Star } from 'lucide-react'
import './Registry.css'

const categories = [
  { id: 'all', label: 'All Items', icon: '🎁' },
  { id: 'gear', label: 'Gear', icon: '🚼' },
  { id: 'nursery', label: 'Nursery', icon: '🛏️' },
  { id: 'feeding', label: 'Feeding', icon: '🍼' },
  { id: 'clothing', label: 'Clothing', icon: '👶' },
  { id: 'electronics', label: 'Electronics', icon: '📱' },
  { id: 'bath', label: 'Bath', icon: '🛁' },
  { id: 'toys', label: 'Toys', icon: '🧸' },
  { id: 'essentials', label: 'Essentials', icon: '📦' },
]

const budgetRanges = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under50', label: 'Under $50', min: 0, max: 50 },
  { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
  { id: '100-200', label: '$100 - $200', min: 100, max: 200 },
  { id: 'over200', label: '$200+', min: 200, max: Infinity },
]

const priorityLabels = {
  high: { label: 'Top Priority', color: 'rose' },
  medium: { label: 'Nice to Have', color: 'gold' },
  low: { label: 'Optional', color: 'sage' },
}

function Registry({ items, claimItem }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBudget, setSelectedBudget] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [claimModal, setClaimModal] = useState(null)
  const [claimerName, setClaimerName] = useState('')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const budget = budgetRanges.find(b => b.id === selectedBudget)
    const matchesBudget = item.price >= budget.min && item.price < budget.max
    const matchesAvailability = !showAvailableOnly || !item.claimed

    return matchesSearch && matchesCategory && matchesBudget && matchesAvailability
  })

  const handleClaim = () => {
    if (claimerName.trim() && claimModal) {
      claimItem(claimModal.id, claimerName.trim())
      setClaimModal(null)
      setClaimerName('')
    }
  }

  const stats = {
    total: items.length,
    claimed: items.filter(i => i.claimed).length,
    remaining: items.filter(i => !i.claimed).length,
  }

  return (
    <div className="registry">
      <div className="container">
        {/* Header */}
        <motion.div 
          className="registry-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="section-title">
            <h2>Gift Registry 🎁</h2>
            <div className="section-divider"></div>
            <p>Help us prepare for our twin girls! Every gift brings us closer to being ready for their arrival.</p>
          </div>

          {/* Stats */}
          <div className="registry-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Items</span>
            </div>
            <div className="stat-item claimed">
              <span className="stat-number">{stats.claimed}</span>
              <span className="stat-label">Claimed</span>
            </div>
            <div className="stat-item available">
              <span className="stat-number">{stats.remaining}</span>
              <span className="stat-label">Available</span>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="filters-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>

          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </motion.div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="filter-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="filter-group">
                <label className="filter-label">
                  <Tag size={16} />
                  Category
                </label>
                <div className="filter-options">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  <DollarSign size={16} />
                  Budget
                </label>
                <div className="filter-options">
                  {budgetRanges.map(range => (
                    <button
                      key={range.id}
                      className={`filter-btn ${selectedBudget === range.id ? 'active' : ''}`}
                      onClick={() => setSelectedBudget(range.id)}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={showAvailableOnly}
                    onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  />
                  <span className="checkbox-custom"></span>
                  Show available items only
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items Grid */}
        <motion.div 
          className="items-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence>
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className={`registry-item ${item.claimed ? 'claimed' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  {item.claimed && (
                    <div className="claimed-overlay">
                      <Check size={32} />
                      <span>Claimed by {item.claimedBy}</span>
                    </div>
                  )}

                  <div className="item-image">
                    <span>{item.image}</span>
                  </div>

                  <div className="item-content">
                    <div className="item-header">
                      <h3>{item.name}</h3>
                      <span className={`priority-badge priority-${item.priority}`}>
                        <Star size={12} />
                        {priorityLabels[item.priority].label}
                      </span>
                    </div>

                    <div className="item-meta">
                      <span className="item-category">
                        {categories.find(c => c.id === item.category)?.icon}{' '}
                        {categories.find(c => c.id === item.category)?.label}
                      </span>
                      <span className="item-price">${item.price}</span>
                    </div>

                    {!item.claimed && (
                      <button 
                        className="claim-btn"
                        onClick={() => setClaimModal(item)}
                      >
                        <Gift size={16} />
                        I'll Get This!
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="empty-state-icon">🔍</div>
                <h3>No items found</h3>
                <p>Try adjusting your filters or search query</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Claim Modal */}
        <AnimatePresence>
          {claimModal && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setClaimModal(null)}
            >
              <motion.div 
                className="modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <button className="modal-close" onClick={() => setClaimModal(null)}>
                  <X size={20} />
                </button>

                <div className="modal-icon">{claimModal.image}</div>
                <h3>Claim "{claimModal.name}"</h3>
                <p className="modal-price">${claimModal.price}</p>

                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your name"
                    value={claimerName}
                    onChange={(e) => setClaimerName(e.target.value)}
                    autoFocus
                  />
                </div>

                <p className="modal-note">
                  By claiming this item, you're letting others know you plan to purchase it. 
                  Thank you for your generosity! 💕
                </p>

                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setClaimModal(null)}>
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleClaim}
                    disabled={!claimerName.trim()}
                  >
                    <Check size={18} />
                    Confirm Claim
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Registry

