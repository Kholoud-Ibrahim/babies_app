import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Home from './pages/Home'
import Registry from './pages/Registry'
import SendLove from './pages/SendLove'
import Updates from './pages/Updates'
import Advice from './pages/Advice'
import ResetPin from './pages/ResetPin'
import './App.css'

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
    
    setRegistryItems(data || [])
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
    
    const updatesWithComments = await fetchUpdateComments(data || [])
    setUpdates(updatesWithComments)
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
    
    const tipsWithComments = await fetchTipComments(data || [])
    setTips(tipsWithComments)
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
  const claimItem = async (itemId, claimerName, claimerId) => {
    const { error } = await supabase
      .from('registry_items')
      .update({ claimed: true, claimed_by: claimerName, claimed_by_id: claimerId })
      .eq('id', itemId)
    
    if (error) {
      console.error('Error claiming item:', error)
      return
    }
    
    setRegistryItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, claimed: true, claimed_by: claimerName, claimed_by_id: claimerId }
        : item
    ))
  }

  const unclaimItem = async (itemId) => {
    const { error } = await supabase
      .from('registry_items')
      .update({ claimed: false, claimed_by: null, claimed_by_id: null })
      .eq('id', itemId)
    
    if (error) {
      console.error('Error unclaiming item:', error)
      return
    }
    
    setRegistryItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, claimed: false, claimed_by: null, claimed_by_id: null }
        : item
    ))
  }

  // Admin registry functions
  const addRegistryItem = async (item) => {
    const { error } = await supabase
      .from('registry_items')
      .insert({
        name: item.name,
        category: item.category,
        qty: item.qty || 1,
        image: item.image || '🎁',
        link: item.link || null,
        claimed: false,
        claimed_by: null,
        claimed_by_id: null,
      })
    
    if (error) {
      console.error('Error adding registry item:', error)
      return
    }
    
    // Real-time subscription will refresh the list
    await fetchRegistryItems()
  }

  const deleteRegistryItem = async (itemId) => {
    const { error } = await supabase
      .from('registry_items')
      .delete()
      .eq('id', itemId)
    
    if (error) {
      console.error('Error deleting registry item:', error)
      return
    }
    
    setRegistryItems(prev => prev.filter(item => item.id !== itemId))
  }

  const editRegistryItem = async (itemId, updates) => {
    const { error } = await supabase
      .from('registry_items')
      .update({
        name: updates.name,
        category: updates.category,
        qty: updates.qty,
        image: updates.image,
        link: updates.link || null,
      })
      .eq('id', itemId)

    if (error) {
      console.error('Error editing registry item:', error)
      return
    }

    setRegistryItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, ...updates, link: updates.link || null } : item
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
        date: new Date().toISOString().split('T')[0],
        created_by_id: card.createdById || null,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error adding card:', error)
      return
    }
    
    setCards(prev => [data, ...prev])
  }

  const editCard = async (cardId, updates) => {
    const { error } = await supabase
      .from('cards')
      .update({ message: updates.message })
      .eq('id', cardId)

    if (error) {
      console.error('Error editing card:', error)
      return
    }

    setCards(prev => prev.map(card =>
      card.id === cardId ? { ...card, message: updates.message } : card
    ))
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
        date: new Date().toISOString().split('T')[0],
        created_by_id: tip.createdById || null,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error adding tip:', error)
      return
    }
    
    setTips(prev => [{ ...data, comments: [] }, ...prev])
  }

  const editTip = async (tipId, updates) => {
    const { error } = await supabase
      .from('tips')
      .update({ message: updates.message })
      .eq('id', tipId)

    if (error) {
      console.error('Error editing tip:', error)
      return
    }

    setTips(prev => prev.map(tip =>
      tip.id === tipId ? { ...tip, message: updates.message } : tip
    ))
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
        date: new Date().toISOString().split('T')[0],
        created_by_id: comment.createdById || null,
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

  const editComment = async (tipId, commentId, updates) => {
    const { error } = await supabase
      .from('comments')
      .update({ text: updates.text })
      .eq('id', commentId)

    if (error) {
      console.error('Error editing comment:', error)
      return
    }

    setTips(prev => prev.map(tip =>
      tip.id === tipId
        ? { ...tip, comments: (tip.comments || []).map(c => c.id === commentId ? { ...c, text: updates.text } : c) }
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
          <p>Loading Twin Boys...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="registry" element={<Registry items={registryItems} claimItem={claimItem} unclaimItem={unclaimItem} addRegistryItem={addRegistryItem} editRegistryItem={editRegistryItem} deleteRegistryItem={deleteRegistryItem} />} />
        <Route path="send-love" element={<SendLove cards={cards} addCard={addCard} editCard={editCard} deleteCard={deleteCard} />} />
        <Route path="updates" element={<Updates />} />
        <Route 
          path="advice" 
          element={
            <Advice 
              tips={tips} 
              addTip={addTip}
              editTip={editTip}
              deleteTip={deleteTip}
              toggleLikeTip={toggleLikeTip} 
              toggleDislikeTip={toggleDislikeTip}
              userReactions={userReactions}
              addComment={addComment}
              editComment={editComment}
              deleteComment={deleteComment}
              registryItems={registryItems} 
            />
          } 
        />
      </Route>
      <Route path="/reset-pin" element={<ResetPin />} />
    </Routes>
  )
}

export default App
