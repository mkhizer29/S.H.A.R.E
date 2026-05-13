import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, CheckCircle, Globe, Video, MessageSquare, Clock } from 'lucide-react'
import Avatar from './ui/Avatar'
import Badge from './ui/Badge'
import Button from './ui/Button'
import Card from './ui/Card'
import { useNavigate } from 'react-router-dom'
import CheckoutModal from './stripe/CheckoutModal'

export default function ProfessionalCard({ pro, index = 0 }) {
  const navigate = useNavigate()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const sessionIcons = { Video: Video, Text: MessageSquare, Async: Clock }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      style={{ height: '100%' }}
    >
      <Card hover={true} className="p-6 flex flex-col h-full bg-surface">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar name={pro.name} size="lg" online={pro.online} />
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">{pro.name}</h3>
              {pro.verified && (
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-accent-hover bg-accent-light/50 px-2.5 py-1 rounded-full border border-accent-light">
                  <CheckCircle size={12} strokeWidth={2.5} /> Verified
                </span>
              )}
            </div>
            <p className="text-[14px] font-medium text-neutral-500">{pro.title}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Star size={14} className="text-[#FBBF24] fill-[#FBBF24]" />
              <span className="text-[13px] font-bold text-neutral-900">{pro.rating}</span>
              <span className="text-[13px] font-medium text-neutral-400">({pro.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-4">
          {pro.specialties?.slice(0, 3).map((s) => (
            <Badge key={s} variant="primary">{s}</Badge>
          )) || <Badge variant="primary">Specialist</Badge>}
        </div>

        {/* About */}
        <p className="text-[14px] text-neutral-500 line-clamp-3 leading-relaxed mb-4 flex-1">
          {pro.about || "Experienced specialist dedicated to providing supportive care and expert guidance."}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-[13px] font-medium text-neutral-400 bg-surface-tinted p-3 rounded-xl mb-5">
          <span className="flex items-center gap-1.5">
            <Globe size={14} className="text-neutral-500" />
            {pro.languages?.slice(0, 2).join(', ') || 'English'}
          </span>
          <span className="flex items-center gap-1.5 border-l border-neutral-300 pl-3">
            <Clock size={14} className="text-neutral-500" />
            {pro.experience || 5} yrs exp.
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-5 border-t border-neutral-100 mt-auto">
          <div className="space-y-0.5">
            <p className="text-[15px] font-bold text-neutral-900">
              {pro.currency || "PKR"} {Number(pro.pricePerSession || 3000).toLocaleString()} <span className="text-[12px] text-neutral-400 font-medium">/ session</span>
            </p>
            <p className={`text-[12px] font-semibold tracking-wide ${pro.online ? 'text-primary' : 'text-neutral-500'}`}>
              {pro.nextSlot || 'Consultation available'}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCheckoutOpen(true)}
          >
            Connect
          </Button>
        </div>
      </Card>
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} pro={pro} />
    </motion.div>
  )
}
