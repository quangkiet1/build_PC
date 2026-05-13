'use client'

import { useRef, useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface AddressPickerMapProps {
  value: string
  onChange: (address: string) => void
  placeholder?: string
  error?: string
}

export function AddressPickerMap({
  value,
  onChange,
  placeholder = 'Nhập địa chỉ...',
  error,
}: AddressPickerMapProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Search using Nominatim (OpenStreetMap free API)
  const searchAddress = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=vn`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchInput = (query: string) => {
    onChange(query)
    
    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    debounceTimer.current = setTimeout(() => {
      searchAddress(query)
    }, 500)
  }

  const selectResult = (result: any) => {
    const address = result.display_name
    
    onChange(address)
    setSearchResults([])
    if (searchInputRef.current) {
      searchInputRef.current.value = address
    }
  }

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative z-50">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 pointer-events-none z-10" />
        <input
          ref={searchInputRef}
          type="text"
          value={value}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-[#141a26] px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-500 outline-none transition relative z-20 ${
            error
              ? 'border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
              : 'border-[#1e2535] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20'
          }`}
          autoComplete="off"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 animate-spin pointer-events-none" />
        )}

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1f2e] border border-[#2d3748] rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => selectResult(result)}
                className="w-full text-left px-4 py-2 hover:bg-[#2d3748] border-b border-[#2d3748] last:border-b-0 transition text-sm text-slate-300"
              >
                <div className="font-medium text-white truncate">{result.display_name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  )
}
