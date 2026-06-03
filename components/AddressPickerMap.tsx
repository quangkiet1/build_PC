'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface AddressPickerMapProps {
  value: string
  onChange: (address: string) => void
  placeholder?: string
  error?: string
}

interface SearchResult {
  display_name: string
}

export function AddressPickerMap({
  value,
  onChange,
  placeholder = 'Nhập địa chỉ...',
  error,
}: AddressPickerMapProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRequestRef = useRef(0)

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      activeRequestRef.current += 1
    }
  }, [])

  const searchAddress = async (query: string) => {
    const trimmedQuery = query.trim()
    const requestId = activeRequestRef.current + 1
    activeRequestRef.current = requestId

    if (!trimmedQuery) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmedQuery)}&format=json&limit=5&countrycodes=vn`
      )

      if (!response.ok) {
        throw new Error(`Address search failed: ${response.status}`)
      }

      const data = await response.json() as SearchResult[]
      if (activeRequestRef.current === requestId) {
        setSearchResults(data)
      }
    } catch (error) {
      console.error('Search failed:', error)
      if (activeRequestRef.current === requestId) {
        setSearchResults([])
      }
    } finally {
      if (activeRequestRef.current === requestId) {
        setIsSearching(false)
      }
    }
  }

  const handleSearchInput = (query: string) => {
    onChange(query)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (!query.trim()) {
      activeRequestRef.current += 1
      setSearchResults([])
      setIsSearching(false)
      return
    }

    debounceTimer.current = setTimeout(() => {
      searchAddress(query)
    }, 500)
  }

  const selectResult = (result: SearchResult) => {
    onChange(result.display_name)
    setSearchResults([])
  }

  return (
    <div className="space-y-3">
      <div className="relative z-50">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-[#FFD600]" />
        <input
          type="text"
          value={value}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder={placeholder}
          className={`relative z-20 w-full rounded-xl border bg-[#141a26] px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-500 outline-none transition ${
            error
              ? 'border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
              : 'border-white/10 focus:border-[#F7931A]/50 focus:ring-1 focus:ring-[#F7931A]/20'
          }`}
          autoComplete="off"
        />
        {isSearching && (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#FFD600]" />
        )}

        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-[#2d3748] bg-[#1a1f2e] shadow-lg">
            {searchResults.map((result, idx) => (
              <button
                key={`${result.display_name}-${idx}`}
                onClick={() => selectResult(result)}
                className="w-full border-b border-[#2d3748] px-4 py-2 text-left text-sm text-slate-300 transition last:border-b-0 hover:bg-[#2d3748]"
              >
                <div className="truncate font-medium text-white">{result.display_name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  )
}
