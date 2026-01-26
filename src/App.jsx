import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Registry from './pages/Registry'
import SendLove from './pages/SendLove'
import Updates from './pages/Updates'
import Advice from './pages/Advice'
import './App.css'

// Initial registry data
const initialRegistryItems = [
  { id: 1, name: "Twin Stroller", category: "gear", price: 450, claimed: false, claimedBy: null, image: "🚼", priority: "high" },
  { id: 2, name: "Matching Crib Set (2)", category: "nursery", price: 350, claimed: false, claimedBy: null, image: "🛏️", priority: "high" },
  { id: 3, name: "Diaper Bag Backpack", category: "gear", price: 85, claimed: false, claimedBy: null, image: "🎒", priority: "medium" },
  { id: 4, name: "Baby Monitor", category: "electronics", price: 200, claimed: false, claimedBy: null, image: "📱", priority: "high" },
  { id: 5, name: "Swaddle Blankets Set", category: "clothing", price: 45, claimed: false, claimedBy: null, image: "🧣", priority: "medium" },
  { id: 6, name: "Bottle Sterilizer", category: "feeding", price: 75, claimed: false, claimedBy: null, image: "🍼", priority: "medium" },
  { id: 7, name: "Twin Nursing Pillow", category: "feeding", price: 65, claimed: false, claimedBy: null, image: "💝", priority: "high" },
  { id: 8, name: "Matching Onesies Pack", category: "clothing", price: 35, claimed: false, claimedBy: null, image: "👶", priority: "low" },
  { id: 9, name: "Baby Swing", category: "gear", price: 180, claimed: false, claimedBy: null, image: "🎠", priority: "medium" },
  { id: 10, name: "Night Light Projector", category: "nursery", price: 40, claimed: false, claimedBy: null, image: "🌙", priority: "low" },
  { id: 11, name: "Baby Bath Tub (2)", category: "bath", price: 55, claimed: false, claimedBy: null, image: "🛁", priority: "medium" },
  { id: 12, name: "Sound Machine", category: "nursery", price: 50, claimed: false, claimedBy: null, image: "🎵", priority: "medium" },
  { id: 13, name: "Baby Books Collection", category: "toys", price: 30, claimed: false, claimedBy: null, image: "📚", priority: "low" },
  { id: 14, name: "Play Mat", category: "toys", price: 90, claimed: false, claimedBy: null, image: "🎪", priority: "medium" },
  { id: 15, name: "Car Seats (2)", category: "gear", price: 300, claimed: false, claimedBy: null, image: "🚗", priority: "high" },
  { id: 16, name: "Diaper Subscription", category: "essentials", price: 100, claimed: false, claimedBy: null, image: "📦", priority: "high" },
]

// Initial updates data
const initialUpdates = [
  {
    id: 1,
    date: "2026-01-20",
    title: "We're Having Twins! 🎀🎀",
    content: "We are beyond thrilled to announce that we're expecting twin girls! Our hearts are so full, and we can't wait to meet our little blossoms. Thank you all for your love and support on this incredible journey.",
    image: "👶👶",
    likes: 24,
    comments: []
  },
  {
    id: 2,
    date: "2026-01-15",
    title: "Nursery Progress",
    content: "The nursery is coming together beautifully! We've chosen a soft rose and cream theme with touches of gold. Two little cribs side by side, waiting for their tiny occupants. 💕",
    image: "🏠",
    likes: 18,
    comments: []
  }
]

// Initial tips/advice
const initialTips = [
  {
    id: 1,
    name: "Aunt Maria",
    category: "twins",
    relatedItem: null,
    message: "With twins, the best advice I got was to keep them on the same schedule! When one wakes up to feed, wake the other too. It'll save your sanity and help you get some rest. Trust me on this one! 💪",
    likes: 12,
    dislikes: 0,
    comments: [],
    date: "2026-01-24"
  },
  {
    id: 2,
    name: "Sarah (mom of twins)",
    category: "registry",
    relatedItem: "Twin Stroller",
    message: "For the twin stroller, I'd highly recommend one that's narrow enough to fit through standard doorways. Also look for one where both seats fully recline for those newborn days! The side-by-side is great for interaction between the babies.",
    likes: 8,
    dislikes: 1,
    comments: [
      { id: 101, name: "Emma", text: "Great tip! Which brand did you end up going with?", date: "2026-01-24" }
    ],
    date: "2026-01-23"
  },
  {
    id: 3,
    name: "Grandpa Joe",
    category: "parenting",
    relatedItem: null,
    message: "Remember to take lots of photos and videos - they grow up so fast! And don't forget to take care of yourselves too. Accept help when it's offered, and don't try to be perfect. You've got this! ❤️",
    likes: 15,
    dislikes: 0,
    comments: [],
    date: "2026-01-22"
  },
  {
    id: 4,
    name: "Emma",
    category: "recommendations",
    relatedItem: null,
    message: "Get a good white noise machine - twins can easily wake each other up! Also, the Hatch sound machine is amazing because you can control it from your phone. Game changer for nap time! 🎵",
    likes: 6,
    dislikes: 0,
    comments: [],
    date: "2026-01-21"
  }
]

function App() {
  // Load data from localStorage or use initial data
  const [registryItems, setRegistryItems] = useState(() => {
    const saved = localStorage.getItem('registryItems')
    return saved ? JSON.parse(saved) : initialRegistryItems
  })

  const [updates, setUpdates] = useState(() => {
    const saved = localStorage.getItem('updates')
    return saved ? JSON.parse(saved) : initialUpdates
  })

  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem('cards')
    return saved ? JSON.parse(saved) : []
  })

  const [tips, setTips] = useState(() => {
    const saved = localStorage.getItem('tips')
    return saved ? JSON.parse(saved) : initialTips
  })

  // Track user's likes/dislikes for tips
  const [userReactions, setUserReactions] = useState(() => {
    const saved = localStorage.getItem('userReactions')
    return saved ? JSON.parse(saved) : { liked: [], disliked: [] }
  })

  // Track user's likes for updates
  const [userUpdateReactions, setUserUpdateReactions] = useState(() => {
    const saved = localStorage.getItem('userUpdateReactions')
    return saved ? JSON.parse(saved) : { liked: [] }
  })

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('registryItems', JSON.stringify(registryItems))
  }, [registryItems])

  useEffect(() => {
    localStorage.setItem('updates', JSON.stringify(updates))
  }, [updates])

  useEffect(() => {
    localStorage.setItem('cards', JSON.stringify(cards))
  }, [cards])

  useEffect(() => {
    localStorage.setItem('tips', JSON.stringify(tips))
  }, [tips])

  useEffect(() => {
    localStorage.setItem('userReactions', JSON.stringify(userReactions))
  }, [userReactions])

  useEffect(() => {
    localStorage.setItem('userUpdateReactions', JSON.stringify(userUpdateReactions))
  }, [userUpdateReactions])

  // Registry functions
  const claimItem = (itemId, claimerName) => {
    setRegistryItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, claimed: true, claimedBy: claimerName }
        : item
    ))
  }

  // Card functions
  const addCard = (card) => {
    setCards(prev => [{ ...card, id: Date.now(), date: new Date().toISOString().split('T')[0] }, ...prev])
  }

  const deleteCard = (cardId) => {
    setCards(prev => prev.filter(card => card.id !== cardId))
  }

  // Tip functions
  const addTip = (tip) => {
    setTips(prev => [{ ...tip, id: Date.now(), date: new Date().toISOString().split('T')[0], comments: [] }, ...prev])
  }

  const deleteTip = (tipId) => {
    setTips(prev => prev.filter(tip => tip.id !== tipId))
    setUserReactions(prev => ({
      liked: prev.liked.filter(id => id !== tipId),
      disliked: prev.disliked.filter(id => id !== tipId)
    }))
  }

  const toggleLikeTip = (tipId) => {
    const hasLiked = userReactions.liked.includes(tipId)
    const hasDisliked = userReactions.disliked.includes(tipId)

    if (hasLiked) {
      setTips(prev => prev.map(tip =>
        tip.id === tipId ? { ...tip, likes: Math.max(0, (tip.likes || 0) - 1) } : tip
      ))
      setUserReactions(prev => ({
        ...prev,
        liked: prev.liked.filter(id => id !== tipId)
      }))
    } else {
      setTips(prev => prev.map(tip =>
        tip.id === tipId 
          ? { 
              ...tip, 
              likes: (tip.likes || 0) + 1,
              dislikes: hasDisliked ? Math.max(0, (tip.dislikes || 0) - 1) : (tip.dislikes || 0)
            } 
          : tip
      ))
      setUserReactions(prev => ({
        liked: [...prev.liked, tipId],
        disliked: prev.disliked.filter(id => id !== tipId)
      }))
    }
  }

  const toggleDislikeTip = (tipId) => {
    const hasLiked = userReactions.liked.includes(tipId)
    const hasDisliked = userReactions.disliked.includes(tipId)

    if (hasDisliked) {
      setTips(prev => prev.map(tip =>
        tip.id === tipId ? { ...tip, dislikes: Math.max(0, (tip.dislikes || 0) - 1) } : tip
      ))
      setUserReactions(prev => ({
        ...prev,
        disliked: prev.disliked.filter(id => id !== tipId)
      }))
    } else {
      setTips(prev => prev.map(tip =>
        tip.id === tipId 
          ? { 
              ...tip, 
              dislikes: (tip.dislikes || 0) + 1,
              likes: hasLiked ? Math.max(0, (tip.likes || 0) - 1) : (tip.likes || 0)
            } 
          : tip
      ))
      setUserReactions(prev => ({
        liked: prev.liked.filter(id => id !== tipId),
        disliked: [...prev.disliked, tipId]
      }))
    }
  }

  const addComment = (tipId, comment) => {
    setTips(prev => prev.map(tip =>
      tip.id === tipId
        ? { 
            ...tip, 
            comments: [...(tip.comments || []), { 
              ...comment, 
              id: Date.now(), 
              date: new Date().toISOString().split('T')[0] 
            }] 
          }
        : tip
    ))
  }

  const deleteComment = (tipId, commentId) => {
    setTips(prev => prev.map(tip =>
      tip.id === tipId
        ? { ...tip, comments: (tip.comments || []).filter(c => c.id !== commentId) }
        : tip
    ))
  }

  // Update functions
  const toggleLikeUpdate = (updateId) => {
    const hasLiked = userUpdateReactions.liked.includes(updateId)

    if (hasLiked) {
      setUpdates(prev => prev.map(update =>
        update.id === updateId ? { ...update, likes: Math.max(0, update.likes - 1) } : update
      ))
      setUserUpdateReactions(prev => ({
        ...prev,
        liked: prev.liked.filter(id => id !== updateId)
      }))
    } else {
      setUpdates(prev => prev.map(update =>
        update.id === updateId ? { ...update, likes: update.likes + 1 } : update
      ))
      setUserUpdateReactions(prev => ({
        ...prev,
        liked: [...prev.liked, updateId]
      }))
    }
  }

  const addUpdateComment = (updateId, comment) => {
    setUpdates(prev => prev.map(update =>
      update.id === updateId
        ? { 
            ...update, 
            comments: [...(update.comments || []), { 
              ...comment, 
              id: Date.now(), 
              date: new Date().toISOString().split('T')[0] 
            }] 
          }
        : update
    ))
  }

  const deleteUpdateComment = (updateId, commentId) => {
    setUpdates(prev => prev.map(update =>
      update.id === updateId
        ? { ...update, comments: (update.comments || []).filter(c => c.id !== commentId) }
        : update
    ))
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="registry" element={<Registry items={registryItems} claimItem={claimItem} />} />
        <Route path="send-love" element={<SendLove cards={cards} addCard={addCard} deleteCard={deleteCard} />} />
        <Route 
          path="updates" 
          element={
            <Updates 
              updates={updates} 
              toggleLikeUpdate={toggleLikeUpdate}
              userUpdateReactions={userUpdateReactions}
              addUpdateComment={addUpdateComment}
              deleteUpdateComment={deleteUpdateComment}
            />
          } 
        />
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
