import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Check, Gift, X, Tag, ShoppingBag, Undo2, ExternalLink, Plus, Trash2, ClipboardList, User, Pencil } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Registry.css'

const categories = [
  { id: 'all', label: 'All Items', icon: '🎁' },
  { id: 'travel', label: 'Travel', icon: '🚗' },
  { id: 'sleep', label: 'Sleep', icon: '😴' },
  { id: 'feeding', label: 'Feeding', icon: '🍼' },
  { id: 'cleaning', label: 'Cleaning', icon: '🧼' },
  { id: 'poo', label: 'Poo', icon: '💩' },
  { id: 'medical', label: 'Medical', icon: '🩺' },
  { id: 'clothes', label: 'Clothes', icon: '👕' },
]

function Registry({ items, claimItem, unclaimItem, addRegistryItem, editRegistryItem, deleteRegistryItem }) {
  const { guest, isAdmin, requireAuth } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [claimModal, setClaimModal] = useState(null)
  const [unclaimModal, setUnclaimModal] = useState(null)
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [newItem, setNewItem] = useState({ name: '', category: 'travel', qty: 1, image: '🎁', link: '' })
  const [editItem, setEditItem] = useState(null) // item being edited
  const [activeView, setActiveView] = useState('items') // 'items' | 'claims'
  // Claims dashboard filters
  const [claimsSearch, setClaimsSearch] = useState('')
  const [claimsCategory, setClaimsCategory] = useState('all')
  const [claimsStatus, setClaimsStatus] = useState('all') // 'all' | 'claimed' | 'available' | 'pre-purchased'
  const [claimsUser, setClaimsUser] = useState('all')

  // Items claimed by the current user
  const myClaims = guest 
    ? items.filter(item => item.claimed && item.claimed_by_id === guest.id)
    : []

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesAvailability = !showAvailableOnly || !item.claimed

    return matchesSearch && matchesCategory && matchesAvailability
  })

  const handleClaim = () => {
    if (guest && claimModal) {
      claimItem(claimModal.id, guest.name, guest.id)
      setClaimModal(null)
    }
  }

  const handleUnclaim = () => {
    if (guest && unclaimModal) {
      unclaimItem(unclaimModal.id)
      setUnclaimModal(null)
    }
  }

  const handleClaimClick = (item) => {
    if (!requireAuth()) return
    setClaimModal(item)
  }

  const isMyItem = (item) => {
    return guest && item.claimed && item.claimed_by_id === guest.id
  }

  const isPrePurchased = (item) => {
    return item.claimed && !item.claimed_by_id
  }

  const handleAddItem = () => {
    if (!newItem.name.trim()) return
    addRegistryItem({
      name: newItem.name.trim(),
      category: newItem.category,
      qty: parseInt(newItem.qty) || 1,
      image: newItem.image || '🎁',
      link: newItem.link.trim() || null,
    })
    setNewItem({ name: '', category: 'travel', qty: 1, image: '🎁', link: '' })
    setShowAddModal(false)
  }

  const handleDeleteItem = () => {
    if (deleteConfirm) {
      deleteRegistryItem(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const handleStartEdit = (item) => {
    setEditItem({ ...item, link: item.link || '' })
  }

  const handleSaveEdit = () => {
    if (!editItem || !editItem.name.trim()) return
    editRegistryItem(editItem.id, {
      name: editItem.name.trim(),
      category: editItem.category,
      qty: parseInt(editItem.qty) || 1,
      image: editItem.image || '🎁',
      link: editItem.link.trim() || null,
    })
    setEditItem(null)
  }

  // Claims data for admin — with filters
  const allClaimedItems = items.filter(item => item.claimed && item.claimed_by_id)
  const uniqueClaimers = [...new Set(allClaimedItems.map(i => i.claimed_by || 'Unknown'))]

  const claimsFiltered = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(claimsSearch.toLowerCase())
    const matchesCat = claimsCategory === 'all' || item.category === claimsCategory
    const isPre = item.claimed && !item.claimed_by_id
    const isClaimed = item.claimed && item.claimed_by_id
    const isAvail = !item.claimed
    const matchesStatus =
      claimsStatus === 'all' ||
      (claimsStatus === 'claimed' && isClaimed) ||
      (claimsStatus === 'available' && isAvail) ||
      (claimsStatus === 'pre-purchased' && isPre)
    const matchesUser =
      claimsUser === 'all' ||
      (item.claimed_by === claimsUser)
    return matchesSearch && matchesCat && matchesStatus && matchesUser
  })

  const claimsByUser = {}
  allClaimedItems.forEach(item => {
    const userName = item.claimed_by || 'Unknown'
    if (!claimsByUser[userName]) claimsByUser[userName] = []
    claimsByUser[userName].push(item)
  })

  const stats = {
    total: items.length,
    claimed: items.filter(i => i.claimed).length,
    remaining: items.filter(i => !i.claimed).length,
    mine: myClaims.length,
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
            <p>Help us prepare for Noah & Yousef! Every gift brings us closer to being ready for their arrival.</p>
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
            {guest && (
              <div className="stat-item mine">
                <span className="stat-number">{stats.mine}</span>
                <span className="stat-label">My Claims</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Admin view toggle: Items / Claims Dashboard */}
        {isAdmin && (
          <motion.div 
            className="registry-view-tabs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <button 
              className={`view-tab ${activeView === 'items' ? 'active' : ''}`}
              onClick={() => setActiveView('items')}
            >
              <Gift size={16} />
              Items
            </button>
            <button 
              className={`view-tab view-tab-admin ${activeView === 'claims' ? 'active' : ''}`}
              onClick={() => setActiveView('claims')}
            >
              <ClipboardList size={16} />
              Claims Dashboard
            </button>
          </motion.div>
        )}

        {/* Admin Add Item Button */}
        {isAdmin && activeView === 'items' && (
          <motion.div 
            className="admin-actions-bar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <button className="admin-add-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              Add Item
            </button>
          </motion.div>
        )}

        {/* ========== CLAIMS DASHBOARD VIEW (Admin only) ========== */}
        {isAdmin && activeView === 'claims' && (
          <motion.div
            key="claims-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Claims By User */}
            {Object.keys(claimsByUser).length > 0 && (
              <div className="claims-by-user">
                <h3 className="claims-section-title">
                  <User size={20} />
                  Claims by Person
                </h3>
                <div className="user-claims-grid">
                  {Object.entries(claimsByUser).map(([userName, userItems]) => (
                    <div key={userName} className="user-claim-card-admin">
                      <div className="user-claim-header-admin">
                        <div className="user-avatar-admin">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info-admin">
                          <span className="user-name-admin">{userName}</span>
                          <span className="user-count-admin">{userItems.length} item{userItems.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="user-items-list-admin">
                        {userItems.map(item => (
                          <div key={item.id} className="user-item-admin">
                            <span className="user-item-emoji-admin">{item.image}</span>
                            <span className="user-item-name-admin">{item.name}</span>
                            {item.qty > 1 && <span className="user-item-qty-admin">×{item.qty}</span>}
                            <button 
                              className="admin-unclaim-inline"
                              onClick={() => unclaimItem(item.id)}
                              title="Remove claim"
                            >
                              Unclaim
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Claims Filter Bar */}
            <div className="claims-filter-bar">
              <div className="claims-filter-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={claimsSearch}
                  onChange={(e) => setClaimsSearch(e.target.value)}
                />
                {claimsSearch && (
                  <button className="claims-filter-clear" onClick={() => setClaimsSearch('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <select
                className="claims-filter-select"
                value={claimsCategory}
                onChange={(e) => setClaimsCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>

              <select
                className="claims-filter-select"
                value={claimsStatus}
                onChange={(e) => setClaimsStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="claimed">Claimed</option>
                <option value="pre-purchased">Pre-Purchased</option>
              </select>

              {uniqueClaimers.length > 0 && (
                <select
                  className="claims-filter-select"
                  value={claimsUser}
                  onChange={(e) => setClaimsUser(e.target.value)}
                >
                  <option value="all">All Users</option>
                  {uniqueClaimers.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              )}

              {(claimsSearch || claimsCategory !== 'all' || claimsStatus !== 'all' || claimsUser !== 'all') && (
                <button
                  className="claims-filter-reset"
                  onClick={() => { setClaimsSearch(''); setClaimsCategory('all'); setClaimsStatus('all'); setClaimsUser('all') }}
                >
                  <X size={14} />
                  Reset
                </button>
              )}
            </div>

            {/* Filtered count */}
            <div className="claims-result-count">
              Showing {claimsFiltered.length} of {items.length} items
            </div>

            {/* Full Items Table */}
            <div className="claims-table-wrapper">
              <table className="claims-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Claimed By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claimsFiltered.length > 0 ? claimsFiltered.map(item => {
                    const isPre = item.claimed && !item.claimed_by_id
                    const isClaimed = item.claimed && item.claimed_by_id
                    const cat = categories.find(c => c.id === item.category)
                    return (
                      <tr
                        key={item.id}
                        className={`claims-row ${isClaimed ? 'row-claimed' : ''} ${isPre ? 'row-pre' : ''} ${!item.claimed ? 'row-available' : ''}`}
                      >
                        <td className="cell-emoji">{item.image}</td>
                        <td className="cell-name">
                          {item.name}
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="item-link-small">🔗</a>
                          )}
                        </td>
                        <td className="cell-category">{cat?.icon} {cat?.label}</td>
                        <td className="cell-qty">{item.qty}</td>
                        <td className="cell-status">
                          {isPre && <span className="status-badge status-pre">Pre-Purchased</span>}
                          {isClaimed && <span className="status-badge status-claimed">Claimed</span>}
                          {!item.claimed && <span className="status-badge status-available">Available</span>}
                        </td>
                        <td className="cell-claimer">
                          {isClaimed ? (
                            <div className="claimer-info">
                              <div className="claimer-avatar">{item.claimed_by?.charAt(0).toUpperCase()}</div>
                              <span>{item.claimed_by}</span>
                            </div>
                          ) : (
                            <span className="pre-label">—</span>
                          )}
                        </td>
                        <td className="cell-actions">
                          {isClaimed && (
                            <button 
                              className="admin-unclaim-inline"
                              onClick={() => unclaimItem(item.id)}
                            >
                              Unclaim
                            </button>
                          )}
                          <button 
                            className="admin-edit-inline"
                            onClick={() => handleStartEdit(item)}
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button 
                            className="admin-delete-inline"
                            onClick={() => setDeleteConfirm(item)}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan="7" className="claims-table-empty">
                        No items match your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ========== ITEMS VIEW ========== */}
        {activeView === 'items' && <>
        {/* My Claims Section */}
        {guest && myClaims.length > 0 && (
          <motion.div 
            className="my-claims-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="my-claims-title">
              <ShoppingBag size={20} />
              My Claims ({myClaims.length})
            </h3>
            <div className="my-claims-grid">
              {myClaims.map((item, index) => (
                <motion.div 
                  key={item.id}
                  className="my-claim-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span className="my-claim-emoji">{item.image}</span>
                  <div className="my-claim-info">
                    <span className="my-claim-name">{item.name}</span>
                    {item.qty > 1 && <span className="my-claim-qty">×{item.qty}</span>}
                  </div>
                  <button 
                    className="unclaim-btn"
                    onClick={() => setUnclaimModal(item)}
                    title="Unclaim this item"
                  >
                    <Undo2 size={14} />
                    Unclaim
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div 
          className="filters-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
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
              filteredItems.map((item, index) => {
                const mine = isMyItem(item)
                const prePurchased = isPrePurchased(item)
                const claimedByOther = item.claimed && !mine && !prePurchased

                return (
                  <motion.div
                    key={item.id}
                    className={`registry-item ${item.claimed ? 'claimed' : ''} ${mine ? 'mine' : ''} ${prePurchased ? 'pre-purchased' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    {/* Pre-purchased overlay — not shown for admins */}
                    {prePurchased && !isAdmin && (
                      <div className="claimed-overlay pre-purchased-overlay">
                        <Check size={32} />
                        <span>Already Purchased</span>
                      </div>
                    )}

                    {/* Admin pre-purchased badge */}
                    {prePurchased && isAdmin && (
                      <div className="admin-status-badge pre-purchased-badge">
                        ✅ Pre-Purchased
                      </div>
                    )}

                    {/* Claimed by someone else overlay — not shown for admins */}
                    {claimedByOther && !isAdmin && (
                      <div className="claimed-overlay">
                        <Check size={32} />
                        <span>Claimed by {item.claimed_by}</span>
                      </div>
                    )}

                    {/* Admin can see claimer info without overlay */}
                    {claimedByOther && isAdmin && (
                      <div className="admin-status-badge claimed-badge">
                        ✅ Claimed by <strong>{item.claimed_by}</strong>
                      </div>
                    )}

                    {/* My claim badge */}
                    {mine && (
                      <div className="my-claim-badge">
                        <Check size={14} />
                        You claimed this!
                      </div>
                    )}

                    {/* Admin edit/delete buttons */}
                    {isAdmin && (
                      <div className="admin-item-actions">
                        <button 
                          className="admin-edit-item-btn"
                          onClick={() => handleStartEdit(item)}
                          title="Edit item"
                        >
                          <Pencil size={13} />
                        </button>
                        <button 
                          className="admin-delete-item-btn"
                          onClick={() => setDeleteConfirm(item)}
                          title="Delete item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}

                    <div className="item-image">
                      <span>{item.image}</span>
                    </div>

                    <div className="item-content">
                      <div className="item-header">
                        <h3>{item.name}</h3>
                      </div>

                      <div className="item-meta">
                        <span className="item-category">
                          {categories.find(c => c.id === item.category)?.icon}{' '}
                          {categories.find(c => c.id === item.category)?.label}
                        </span>
                        {item.qty > 1 && (
                          <span className="item-qty">Qty: {item.qty}</span>
                        )}
                      </div>

                      {item.link && (
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="item-link"
                        >
                          <ExternalLink size={14} />
                          View Product
                        </a>
                      )}

                      {!item.claimed && (
                        <button 
                          className="claim-btn"
                          onClick={() => handleClaimClick(item)}
                        >
                          <Gift size={16} />
                          I'll Get This!
                        </button>
                      )}

                      {mine && (
                        <button 
                          className="unclaim-btn-card"
                          onClick={() => setUnclaimModal(item)}
                        >
                          <Undo2 size={16} />
                          Unclaim
                        </button>
                      )}

                      {/* Admin can unclaim anyone's item */}
                      {isAdmin && claimedByOther && (
                        <button 
                          className="unclaim-btn-card admin-unclaim"
                          onClick={() => unclaimItem(item.id)}
                        >
                          <Undo2 size={16} />
                          Admin Unclaim
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })
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

        </>}

        {/* Claim Confirmation Modal */}
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
                <h3>Claim "{claimModal.name}"?</h3>
                {claimModal.qty > 1 && (
                  <p className="modal-qty">Quantity needed: {claimModal.qty}</p>
                )}

                <p className="modal-claiming-as">
                  Claiming as <strong>{guest?.name}</strong>
                </p>

                {claimModal.link && (
                  <a 
                    href={claimModal.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="modal-product-link"
                  >
                    <ExternalLink size={14} />
                    View Product Link
                  </a>
                )}

                <p className="modal-note">
                  By claiming this item, you're letting others know you plan to purchase it. 
                  You can unclaim it later if you change your mind. Thank you for your generosity! 💙
                </p>

                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setClaimModal(null)}>
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleClaim}
                  >
                    <Check size={18} />
                    Confirm Claim
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unclaim Confirmation Modal */}
        <AnimatePresence>
          {unclaimModal && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUnclaimModal(null)}
            >
              <motion.div 
                className="modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <button className="modal-close" onClick={() => setUnclaimModal(null)}>
                  <X size={20} />
                </button>

                <div className="modal-icon">🔄</div>
                <h3>Unclaim "{unclaimModal.name}"?</h3>
                <p className="modal-note">
                  This will make the item available for others to claim again.
                </p>

                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setUnclaimModal(null)}>
                    Keep It
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={handleUnclaim}
                  >
                    <Undo2 size={18} />
                    Unclaim
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Admin Add Item Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
            >
              <motion.div 
                className="modal add-item-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <button className="modal-close" onClick={() => setShowAddModal(false)}>
                  <X size={20} />
                </button>
                <div className="modal-icon">➕</div>
                <h3>Add Registry Item</h3>

                <div className="add-item-form">
                  <div className="form-group">
                    <label className="form-label">Item Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Baby Monitor"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-input"
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      >
                        {categories.filter(c => c.id !== 'all').map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        className="form-input"
                        min="1"
                        value={newItem.qty}
                        onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Emoji Icon</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="🎁"
                      value={newItem.image}
                      onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Link (optional)</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://..."
                      value={newItem.link}
                      onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleAddItem}
                    disabled={!newItem.name.trim()}
                  >
                    <Plus size={18} />
                    Add Item
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Delete Item Confirmation */}
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
                <h3>Delete "{deleteConfirm.name}"?</h3>
                <p>This will permanently remove this item from the registry.</p>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={handleDeleteItem}>
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Edit Item Modal */}
        <AnimatePresence>
          {editItem && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditItem(null)}
            >
              <motion.div 
                className="modal edit-item-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <button className="modal-close" onClick={() => setEditItem(null)}>
                  <X size={20} />
                </button>
                <div className="modal-icon">✏️</div>
                <h3>Edit Item</h3>

                <div className="add-item-form">
                  <div className="form-group">
                    <label className="form-label">Item Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-input"
                        value={editItem.category}
                        onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                      >
                        {categories.filter(c => c.id !== 'all').map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        className="form-input"
                        min="1"
                        value={editItem.qty}
                        onChange={(e) => setEditItem({ ...editItem, qty: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Emoji Icon</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editItem.image}
                      onChange={(e) => setEditItem({ ...editItem, image: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Link (optional)</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://..."
                      value={editItem.link}
                      onChange={(e) => setEditItem({ ...editItem, link: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setEditItem(null)}>
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSaveEdit}
                    disabled={!editItem.name.trim()}
                  >
                    <Check size={18} />
                    Save Changes
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
