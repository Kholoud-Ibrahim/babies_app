import { motion } from 'framer-motion'
import { Calendar, Heart } from 'lucide-react'
import './Updates.css'

const milestones = [
  {
    week: 6,
    date: "12 November 2025",
    images: ["/images/scans/week6.jpeg"],
    content: `In this scan, we didn't even know there were two of you yet.
    
We couldn't see much — just a tiny beating heart — but it was incredibly reassuring for us.

Knowing that you were there and doing fine meant everything to us.`
  },
  {
    week: 10,
    date: "10 December 2025",
    images: ["/images/scans/week10_t1.jpeg", "/images/scans/week10_t2.jpeg"],
    content: `This is the moment when the sonographer suddenly said, "HOLD ON."

"You have two babies."

That's when we found out you were two little, beautiful babies.

We were a bit shocked and stressed at first, but above all, we were so grateful and incredibly happy to have you both 🤍`
  },
  {
    week: 13,
    date: "31 December 2025",
    images: ["/images/scans/week13.jpeg"],
    content: `This is when we did the 4D scan in Cairo.

We never really understood where the "4th D" comes from 😄, but it was the first time we learned that we were having:

• one very cheeky, dancing baby
• and one very cute, calm, and polite baby`
  },
  {
    week: 15,
    date: "14 January 2026",
    images: ["/images/scans/week15_t1.jpeg", "/images/scans/week15_t2.jpeg"],
    content: `By this point, we were certain:

We have one polite baby,
and one professional belly-dancer baby, kicking away nonstop 💃💛`
  },
  {
    week: 20,
    date: "11 February 2026",
    images: ["/images/scans/week20-t1.jpeg", "/images/scans/week20-t2.jpeg"],
    content: `This was the big scan — the one where we checked your hearts, kidneys, and tiny little limbs. Everything looked perfect and healthy. Aaaah that was also the moment we discovered that we are actually having two boys, not two girls 😄😄

It was a little shock to us at first. For so long we had pictured our life with twin girls, and it took us a moment to let that picture go — but only for a moment.

Very quickly we remembered how incredibly blessed we are to have you. Two healthy little boys growing together. And we would not replace you for the world. 💙💙`
  },
  {
    week: 22,
    date: "25 February 2026",
    images: ["/images/scans/week22-t1.jpeg", "/images/scans/week22_t2.jpeg"],
    content: `YES you are two boys, clear and strong 😄

Growing a few grams every week and features are much more clearer now. Also we were told that both of you are too cheeky and moving loads! 💪👶👶`
  }
]

function Updates() {
  return (
    <div className="updates">
      <div className="container">
        {/* Header */}
        <motion.div 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>Our Journey 🤰</h2>
          <div className="section-divider"></div>
          <p>Follow along as Noah and Yousef grow — from the very first heartbeat to today</p>
        </motion.div>

        {/* Timeline */}
        <div className="journey-timeline">
          {milestones.map((milestone, index) => (
            <motion.div 
              key={milestone.week}
              className="timeline-item"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
            >
              {/* Timeline marker */}
              <div className="timeline-marker">
                <div className="marker-circle">
                  <Heart size={18} fill="currentColor" />
                </div>
                {index !== milestones.length - 1 && <div className="marker-line"></div>}
              </div>

              {/* Content card */}
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="week-badge">Week {milestone.week}</span>
                  <span className="timeline-date">
                    <Calendar size={14} />
                    {milestone.date}
                  </span>
                </div>

                <div className={`timeline-images ${milestone.images.length > 1 ? 'double' : 'single'}`}>
                  {milestone.images.map((img, imgIndex) => (
                    <div key={imgIndex} className="scan-image">
                      <img src={img} alt={`Week ${milestone.week} scan ${imgIndex + 1}`} />
                    </div>
                  ))}
                </div>

                <div className="timeline-text">
                  {milestone.content.split('\n').map((paragraph, pIndex) => (
                    <p key={pIndex}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <motion.div 
          className="coming-soon"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="coming-soon-content">
            <span className="coming-soon-emoji">🌟</span>
            <h3>More Milestones Coming Soon!</h3>
            <p>We'll be sharing more moments from our journey. Stay tuned!</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Updates
