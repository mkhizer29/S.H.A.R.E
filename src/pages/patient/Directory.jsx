import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { PROFESSIONALS, SPECIALTIES, LANGUAGES } from '../../data/professionals'
import ProfessionalCard from '../../components/ProfessionalCard'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

export default function Directory() {
  const [query, setQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  const [showAvailableToday, setShowAvailableToday] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return PROFESSIONALS.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.specialties.some((s) => s.toLowerCase().includes(query.toLowerCase()))) return false
      if (selectedSpecialty && !p.specialties.includes(selectedSpecialty)) return false
      if (selectedLanguage && !p.languages.includes(selectedLanguage)) return false
      if (showVerifiedOnly && !p.verified) return false
      if (showAvailableToday && !p.availability.includes('Today')) return false
      return true
    })
  }, [query, selectedSpecialty, selectedLanguage, showVerifiedOnly, showAvailableToday])

  const activeFilterCount = [selectedSpecialty, selectedLanguage, showVerifiedOnly, showAvailableToday].filter(Boolean).length

  const clearFilters = () => {
    setSelectedSpecialty('')
    setSelectedLanguage('')
    setShowVerifiedOnly(false)
    setShowAvailableToday(false)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-1">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Find a Professional</h1>
        <p className="text-neutral-500 text-[15px]">{PROFESSIONALS.filter(p => p.verified).length} verified specialists available to support you.</p>
      </motion.div>

      {/* Search + filter bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name or specialty..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>
        <Button
          variant={showFilters || activeFilterCount > 0 ? 'primary' : 'outline'}
          className={`px-5 py-3 rounded-2xl flex items-center gap-2 font-semibold ${!(showFilters || activeFilterCount > 0) && 'bg-surface text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300'}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={18} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-white/30 rounded-full text-xs flex items-center justify-center font-bold">{activeFilterCount}</span>
          )}
        </Button>
      </motion.div>

      {/* Active filter chips */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 flex-wrap">
            {selectedSpecialty && (
              <Badge variant="primary" className="pl-3 pr-2">
                {selectedSpecialty}
                <button onClick={() => setSelectedSpecialty('')} className="ml-1 p-0.5 hover:bg-primary/20 rounded-full"><X size={12} /></button>
              </Badge>
            )}
            {selectedLanguage && (
              <Badge variant="primary" className="pl-3 pr-2">
                {selectedLanguage}
                <button onClick={() => setSelectedLanguage('')} className="ml-1 p-0.5 hover:bg-primary/20 rounded-full"><X size={12} /></button>
              </Badge>
            )}
            {showVerifiedOnly && (
              <Badge variant="accent" className="pl-3 pr-2">
                Verified only
                <button onClick={() => setShowVerifiedOnly(false)} className="ml-1 p-0.5 hover:bg-accent/20 rounded-full"><X size={12} /></button>
              </Badge>
            )}
            {showAvailableToday && (
              <Badge variant="primary" className="pl-3 pr-2">
                Available today
                <button onClick={() => setShowAvailableToday(false)} className="ml-1 p-0.5 hover:bg-primary/20 rounded-full"><X size={12} /></button>
              </Badge>
            )}
            <button onClick={clearFilters} className="text-[13px] font-semibold text-neutral-400 hover:text-alert transition-colors ml-2">Clear all</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface rounded-3xl p-6 border border-neutral-200 shadow-soft grid md:grid-cols-4 gap-6 mb-2">
              <div>
                <label className="text-[13px] font-bold tracking-wide text-neutral-500 uppercase mb-2 block">Specialty</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full bg-surface-tinted border border-neutral-200 rounded-xl px-4 py-3 text-[15px] font-medium text-neutral-900 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                >
                  <option value="">All Specialties</option>
                  {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[13px] font-bold tracking-wide text-neutral-500 uppercase mb-2 block">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-surface-tinted border border-neutral-200 rounded-xl px-4 py-3 text-[15px] font-medium text-neutral-900 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                >
                  <option value="">All Languages</option>
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 flex flex-col justify-center gap-4 pt-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" checked={showVerifiedOnly} onChange={(e) => setShowVerifiedOnly(e.target.checked)} className="peer w-5 h-5 rounded-[6px] border-neutral-300 text-primary focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer" />
                  </div>
                  <span className="text-[15px] font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors">Show verified professionals only</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" checked={showAvailableToday} onChange={(e) => setShowAvailableToday(e.target.checked)} className="peer w-5 h-5 rounded-[6px] border-neutral-300 text-primary focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer" />
                  </div>
                  <span className="text-[15px] font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors">Only show available today</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Specialty chips */}
      <div className="flex gap-2.5 flex-wrap">
        {['All', ...SPECIALTIES.slice(0, 8)].map((s) => {
          const isActive = (s === 'All' && !selectedSpecialty) || selectedSpecialty === s
          return (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(s === 'All' ? '' : s)}
              className={`px-4 py-2 rounded-full text-[14px] font-semibold transition-all ${
                isActive 
                  ? 'bg-primary text-white shadow-soft' 
                  : 'bg-surface border border-neutral-200 text-neutral-600 hover:bg-primary-light hover:text-primary hover:border-primary-light'
              }`}
            >
              {s}
            </button>
          )
        })}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-surface rounded-[40px] border-2 border-dashed border-neutral-200">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-primary" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">No professionals found</p>
          <p className="text-[15px] text-neutral-500 mb-8 max-w-sm mx-auto">We couldn't find any specialists matching your current filters. Try adjusting your search or clearing filters.</p>
          <Button onClick={clearFilters} variant="primary" className="shadow-float">Clear all filters</Button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <p className="text-[13px] font-bold text-neutral-400 uppercase tracking-wide mb-4 mt-2">
            {filtered.length} professional{filtered.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((pro, i) => (
              <ProfessionalCard key={pro.id} pro={pro} index={i} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
