import { motion } from 'framer-motion'

export default function Input({ label, placeholder, value, onChange, type = 'text', icon, error, className = '', as = 'input', rows }) {
  const InputComponent = as;
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className="text-[15px] font-medium text-neutral-900 ml-1">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-[18px] h-[18px] flex items-center justify-center">
            {icon}
          </div>
        )}
        <InputComponent
          type={as === 'input' ? type : undefined}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-surface border-1.5 border-neutral-200 rounded-2xl outline-none transition-all placeholder:text-neutral-500 text-neutral-900 text-[15px]
            ${as === 'input' ? 'py-3.5' : 'py-4'} 
            ${icon ? 'pl-11 pr-4' : 'px-4'} 
            ${error 
              ? 'border-alert focus:border-alert focus:ring-4 focus:ring-alert/10' 
              : 'focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-neutral-300'
            }`}
        />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[13px] text-alert font-medium ml-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
