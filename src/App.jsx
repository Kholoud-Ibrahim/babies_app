import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Home from './pages/Home'
import Registry from './pages/Registry'
import SendLove from './pages/SendLove'
import Updates from './pages/Updates'
import Advice from './pages/Advice'
import './App.css'

// Initial registry data (for seeding)
const initialRegistryItems = [
  { name: "Twin Stroller", category: "gear", price: 450, claimed: false, claimed_by: null, image: "🚼", priority: "high" },
  { name: "Matching Crib Set (2)", category: "nursery", price: 350, claimed: false, claimed_by: null, image: "🛏️", priority: "high" },
  { name: "Diaper Bag Backpack", category: "gear", price: 85, claimed: false, claimed_by: null, image: "🎒", priority: "medium" },
  { name: "Baby Monitor", category: "electronics", price: 200, claimed: false, claimed_by: null, image: "📱", priority: "high" },
  { name: "Swaddle Blankets Set", category: "clothing", price: 45, claimed: false, claimed_by: null, image: "🧣", priority: "medium" },
  { name: "Bottle Sterilizer", category: "feeding", price: 75, claimed: false, claimed_by: null, image: "🍼", priority: "medium" },
  { name: "Twin Nursing Pillow", category: "feeding", price: 65, claimed: false, claimed_by: null, image: "💝", priority: "high" },
  { name: "Matching Onesies Pack", category: "clothing", price: 35, claimed: false, claimed_by: null, image: "👶", priority: "low" },
  { name: "Baby Swing", category: "gear", price: 180, claimed: false, claimed_by: null, image: "🎠", priority: "medium" },
  { name: "Night Light Projector", category: "nursery", price: 40, claimed: false, claimed_by: null, image: "🌙", priority: "low" },
  { name: "Baby Bath Tub (2)", category: "bath", price: 55, claimed: false, claimed_by: null, image: "🛁", priority: "medium" },
  { name: "Sound Machine", category: "nursery", price: 50, claimed: false, claimed_by: null, image: "🎵", priority: "medium" },
  { name: "Baby Books Collection", category: "toys", price: 30, claimed: false, claimed_by: null, image: "📚", priority: "low" },
  { name: "Play Mat", category: "toys", price: 90, claimed: false, claimed_by: null, image: "🎪", priority: "medium" },
  { name: "Car Seats (2)", category: "gear", price: 300, claimed: false, claimed_by: null, image: "🚗", priority: "high" },
  { name: "Diaper Subscription", category: "essentials", price: 100, claimed: false, claimed_by: null, image: "📦", priority: "high" },
]

// Initial updates data (for seeding) - empty, add your own updates!
const initialUpdates = []

// Initial tips/advice (for seeding)
const initialTips = [
  {
    name: "Aunt Maria",
    category: "twins",
    related_item: null,
    message: "With twins, the best advice I got was to keep them on the same schedule! When one wakes up to feed, wake the other too. It'll save your sanity and help you get some rest. Trust me on this one! 💪",
    likes: 12,
    dislikes: 0,
    date: "2026-01-24"
  },
  {
    name: "Sarah (mom of twins)",
    category: "registry",
    related_item: "Twin Stroller",
    message: "For the twin stroller, I'd highly recommend one that's narrow enough to fit through standard doorways. Also look for one where both seats fully recline for those newborn days! The side-by-side is great for interaction between the babies.",
    likes: 8,
    dislikes: 1,
    date: "2026-01-23"
  },
  {
    name: "Grandpa Joe",
    category: "parenting",
    related_item: null,
    message: "Remember to take lots of photos and videos - they grow up so fast! And don't forget to take care of yourselves too. Accept help when it's offered, and don't try to be perfect. You've got this! ❤️",
    likes: 15,
    dislikes: 0,
    date: "2026-01-22"
  },
  {
    name: "Emma",
    category: "recommendations",
    related_item: null,
    message: "Get a good white noise machine - twins can easily wake each other up! Also, the Hatch sound machine is amazing because you can control it from your phone. Game changer for nap time! 🎵",
    likes: 6,
    dislikes: 0,
    date: "2026-01-21"
  }
]

function App() {
  const [registryItems, setRegistryItems] = useState([])
  const [updates, setUpdates] = useState([])
  const [cards, setCards] = useState([])
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)

  // Track user's reactions locally (which items this user has liked/disliked)
  const [userReactions, setUserReactions] = useState(() => {
    const saved = localStorage.getItem('userReactions')
    return saved ? JSON.parse(saved) : { liked: [], disliked: [] }
  })

  const [userUpdateReactions, setUserUpdateReactions] = useState(() => {
    const saved = localStorage.getItem('userUpdateReactions')
    return saved ? JSON.parse(saved) : { liked: [] }
  })

  // Save user reactions to localStorage
  useEffect(() => {
    localStorage.setItem('userReactions', JSON.stringify(userReactions))
  }, [userReactions])

  useEffect(() => {
    localStorage.setItem('userUpdateReactions', JSON.stringify(userUpdateReactions))
  }, [userUpdateReactions])

  // Fetch all data from Supabase on load
  useEffect(() => {
    fetchAllData()
    
    // Set up real-time subscriptions
    const cardsSubscription = supabase
      .channel('cards-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' }, () => {
        fetchCards()
      })
      .subscribe()

    const tipsSubscription = supabase
      .channel('tips-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tips' }, () => {
        fetchTips()
      })
      .subscribe()

    const commentsSubscription = supabase
      .channel('comments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchTips()
      })
      .subscribe()

    const updatesSubscription = supabase
      .channel('updates-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'updates' }, () => {
        fetchUpdates()
      })
      .subscribe()

    const updateCommentsSubscription = supabase
      .channel('update-comments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'update_comments' }, () => {
        fetchUpdates()
      })
      .subscribe()

    const registrySubscription = supabase
      .channel('registry-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registry_items' }, () => {
        fetchRegistryItems()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(cardsSubscription)
      supabase.removeChannel(tipsSubscription)
      supabase.removeChannel(commentsSubscription)
      supabase.removeChannel(updatesSubscription)
      supabase.removeChannel(updateCommentsSubscription)
      supabase.removeChannel(registrySubscription)
    }
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchRegistryItems(),
      fetchUpdates(),
      fetchCards(),
      fetchTips()
    ])
    setLoading(false)
  }

  const fetchRegistryItems = async () => {
    const { data, error } = await supabase
      .from('registry_items')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) {
      console.error('Error fetching registry:', error)
      return
    }
    
    // If no items, seed with initial data
    if (data.length === 0) {
      const { data: seededData } = await supabase
        .from('registry_items')
        .insert(initialRegistryItems)
        .select()
      setRegistryItems(seededData || [])
    } else {
      setRegistryItems(data)
    }
  }

  const fetchUpdates = async () => {
    const { data, error } = await supabase
      .from('updates')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) {
      console.error('Error fetching updates:', error)
      return
    }
    
    // If no updates, seed with initial data
    if (data.length === 0) {
      const { data: seededData } = await supabase
        .from('updates')
        .insert(initialUpdates)
        .select()
      // Fetch comments for each update
      const updatesWithComments = await fetchUpdateComments(seededData || [])
      setUpdates(updatesWithComments)
    } else {
      const updatesWithComments = await fetchUpdateComments(data)
      setUpdates(updatesWithComments)
    }
  }

  const fetchUpdateComments = async (updatesData) => {
    const { data: comments } = await supabase
      .from('update_comments')
      .select('*')
      .order('created_at', { ascending: true })
    
    return updatesData.map(update => ({
      ...update,
      comments: (comments || []).filter(c => c.update_id === update.id)
    }))
  }

  const fetchCards = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching cards:', error)
      return
    }
    
    setCards(data || [])
  }

  const fetchTips = async () => {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching tips:', error)
      return
    }
    
    // If no tips, seed with initial data
    if (data.length === 0) {
      const { data: seededData } = await supabase
        .from('tips')
        .insert(initialTips)
        .select()
      const tipsWithComments = await fetchTipComments(seededData || [])
      setTips(tipsWithComments)
    } else {
      const tipsWithComments = await fetchTipComments(data)
      setTips(tipsWithComments)
    }
  }

  const fetchTipComments = async (tipsData) => {
    const { data: comments } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true })
    
    return tipsData.map(tip => ({
      ...tip,
      comments: (comments || []).filter(c => c.tip_id === tip.id)
    }))
  }

  // Registry functions
  const claimItem = async (itemId, claimerName) => {
    const { error } = await supabase
      .from('registry_items')
      .update({ claimed: true, claimed_by: claimerName })
      .eq('id', itemId)
    
    if (error) {
      console.error('Error claiming item:', error)
      return
    }
    
    setRegistryItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, claimed: true, claimed_by: claimerName }
        : item
    ))
  }

  // Card functions
  const addCard = async (card) => {
    const { data, error } = await supabase
      .from('cards')
      .insert({
        sender_name: card.senderName,
        message: card.message,
        template_id: card.templateId,
        template: card.template,
        decoration: card.decoration,
        date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error adding card:', error)
      return
    }
    
    setCards(prev => [data, ...prev])
  }

  const deleteCard = async (cardId) => {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)
    
    if (error) {
      console.error('Error deleting card:', error)
      return
    }
    
    setCards(prev => prev.filter(card => card.id !== cardId))
  }

  // Tip functions
  const addTip = async (tip) => {
    const { data, error } = await supabase
      .from('tips')
      .insert({
        name: tip.name,
        category: tip.category,
        related_item: tip.relatedItem,
        message: tip.message,
        likes: 0,
        dislikes: 0,
        date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error adding tip:', error)
      return
    }
    
    setTips(prev => [{ ...data, comments: [] }, ...prev])
  }

  const deleteTip = async (tipId) => {
    const { error } = await supabase
      .from('tips')
      .delete()
      .eq('id', tipId)
    
    if (error) {
      console.error('Error deleting tip:', error)
      return
    }
    
    setTips(prev => prev.filter(tip => tip.id !== tipId))
    setUserReactions(prev => ({
      liked: prev.liked.filter(id => id !== tipId),
      disliked: prev.disliked.filter(id => id !== tipId)
    }))
  }

  const toggleLikeTip = async (tipId) => {
    const hasLiked = userReactions.liked.includes(tipId)
    const hasDisliked = userReactions.disliked.includes(tipId)
    const tip = tips.find(t => t.id === tipId)
    if (!tip) return

    let newLikes = tip.likes || 0
    let newDislikes = tip.dislikes || 0

    if (hasLiked) {
      newLikes = Math.max(0, newLikes - 1)
      setUserReactions(prev => ({
        ...prev,
        liked: prev.liked.filter(id => id !== tipId)
      }))
    } else {
      newLikes = newLikes + 1
      if (hasDisliked) {
        newDislikes = Math.max(0, newDislikes - 1)
      }
      setUserReactions(prev => ({
        liked: [...prev.liked, tipId],
        disliked: prev.disliked.filter(id => id !== tipId)
      }))
    }

    const { error } = await supabase
      .from('tips')
      .update({ likes: newLikes, dislikes: newDislikes })
      .eq('id', tipId)

    if (error) {
      console.error('Error updating likes:', error)
      return
    }

    setTips(prev => prev.map(t =>
      t.id === tipId ? { ...t, likes: newLikes, dislikes: newDislikes } : t
    ))
  }

  const toggleDislikeTip = async (tipId) => {
    const hasLiked = userReactions.liked.includes(tipId)
    const hasDisliked = userReactions.disliked.includes(tipId)
    const tip = tips.find(t => t.id === tipId)
    if (!tip) return

    let newLikes = tip.likes || 0
    let newDislikes = tip.dislikes || 0

    if (hasDisliked) {
      newDislikes = Math.max(0, newDislikes - 1)
      setUserReactions(prev => ({
        ...prev,
        disliked: prev.disliked.filter(id => id !== tipId)
      }))
    } else {
      newDislikes = newDislikes + 1
      if (hasLiked) {
        newLikes = Math.max(0, newLikes - 1)
      }
      setUserReactions(prev => ({
        liked: prev.liked.filter(id => id !== tipId),
        disliked: [...prev.disliked, tipId]
      }))
    }

    const { error } = await supabase
      .from('tips')
      .update({ likes: newLikes, dislikes: newDislikes })
      .eq('id', tipId)

    if (error) {
      console.error('Error updating dislikes:', error)
      return
    }

    setTips(prev => prev.map(t =>
      t.id === tipId ? { ...t, likes: newLikes, dislikes: newDislikes } : t
    ))
  }

  const addComment = async (tipId, comment) => {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        tip_id: tipId,
        name: comment.name,
        text: comment.text,
        date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding comment:', error)
      return
    }

    setTips(prev => prev.map(tip =>
      tip.id === tipId
        ? { ...tip, comments: [...(tip.comments || []), data] }
        : tip
    ))
  }

  const deleteComment = async (tipId, commentId) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('Error deleting comment:', error)
      return
    }

    setTips(prev => prev.map(tip =>
      tip.id === tipId
        ? { ...tip, comments: (tip.comments || []).filter(c => c.id !== commentId) }
        : tip
    ))
  }

  // Update functions
  const toggleLikeUpdate = async (updateId) => {
    const hasLiked = userUpdateReactions.liked.includes(updateId)
    const update = updates.find(u => u.id === updateId)
    if (!update) return

    let newLikes = update.likes

    if (hasLiked) {
      newLikes = Math.max(0, newLikes - 1)
      setUserUpdateReactions(prev => ({
        ...prev,
        liked: prev.liked.filter(id => id !== updateId)
      }))
    } else {
      newLikes = newLikes + 1
      setUserUpdateReactions(prev => ({
        ...prev,
        liked: [...prev.liked, updateId]
      }))
    }

    const { error } = await supabase
      .from('updates')
      .update({ likes: newLikes })
      .eq('id', updateId)

    if (error) {
      console.error('Error updating likes:', error)
      return
    }

    setUpdates(prev => prev.map(u =>
      u.id === updateId ? { ...u, likes: newLikes } : u
    ))
  }

  const addUpdateComment = async (updateId, comment) => {
    const { data, error } = await supabase
      .from('update_comments')
      .insert({
        update_id: updateId,
        name: comment.name,
        text: comment.text,
        date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding update comment:', error)
      return
    }

    setUpdates(prev => prev.map(update =>
      update.id === updateId
        ? { ...update, comments: [...(update.comments || []), data] }
        : update
    ))
  }

  const deleteUpdateComment = async (updateId, commentId) => {
    const { error } = await supabase
      .from('update_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('Error deleting update comment:', error)
      return
    }

    setUpdates(prev => prev.map(update =>
      update.id === updateId
        ? { ...update, comments: (update.comments || []).filter(c => c.id !== commentId) }
        : update
    ))
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <span className="loading-emoji">🌸</span>
          <p>Loading Twin Blossoms...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="registry" element={<Registry items={registryItems} claimItem={claimItem} />} />
        <Route path="send-love" element={<SendLove cards={cards} addCard={addCard} deleteCard={deleteCard} />} />
        <Route path="updates" element={<Updates />} />
        <Route 
          path="advice" 
          element={
            <Advice 
              tips={tips} 
              addTip={addTip} 
              deleteTip={deleteTip}
              toggleLikeTip={toggleLikeTip} 
              toggleDislikeTip={toggleDislikeTip}
              userReactions={userReactions}
              addComment={addComment}
              deleteComment={deleteComment}
              registryItems={registryItems} 
            />
          } 
        />
      </Route>
    </Routes>
  )
}

export default App
