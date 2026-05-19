'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Build } from '@/app/lib/builder-utils'
import type { Product, Category } from '@/app/types/builder'

export type SavedBuild = {
  id: string
  name: string
  savedAt: string
  totalPrice: number
  build: Build
}

type BuilderStore = {
  build: Build
  activeSlot: Category | null
  searchQuery: string
  budgetLimit: number | null
  savedBuilds: SavedBuild[]
  compareIds: string[]
  setActiveSlot: (category: Category | null) => void
  setSearchQuery: (value: string) => void
  setBudgetLimit: (value: number | null) => void
  setProduct: (product: Product) => void
  removeProduct: (category: Category) => void
  resetBuild: () => void
  setBuildFromAI: (products: Product[]) => void
  saveCurrentBuild: (name: string, totalPrice: number) => SavedBuild | null
  loadSavedBuild: (id: string) => void
  deleteSavedBuild: (id: string) => void
  toggleCompare: (id: string) => void
}

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set, get) => ({
      build: {},
      activeSlot: null,
      searchQuery: '',
      budgetLimit: null,
      savedBuilds: [],
      compareIds: [],
      setActiveSlot: (category) => set({ activeSlot: category }),
      setSearchQuery: (value) => set({ searchQuery: value }),
      setBudgetLimit: (value) => set({ budgetLimit: value }),
      setProduct: (product) =>
        set((state) => ({
          build: { ...state.build, [product.category]: product },
          activeSlot: null,
          searchQuery: '',
        })),
      removeProduct: (category) =>
        set((state) => {
          const nextBuild = { ...state.build }
          delete nextBuild[category]

          return { build: nextBuild }
        }),
      resetBuild: () => set({ build: {}, activeSlot: null, searchQuery: '' }),
      setBuildFromAI: (products) =>
        set(() => {
          const newBuild: Build = {}
          products.forEach((p) => {
            if (p.category) newBuild[p.category] = p
          })
          return { build: newBuild, activeSlot: null, searchQuery: '' }
        }),
      saveCurrentBuild: (name, totalPrice) => {
        const currentBuild = get().build

        if (Object.keys(currentBuild).length === 0) {
          return null
        }

        const savedBuild: SavedBuild = {
          id: crypto.randomUUID(),
          name: name.trim(),
          savedAt: new Date().toISOString(),
          totalPrice,
          build: currentBuild,
        }

        set((state) => ({
          savedBuilds: [savedBuild, ...state.savedBuilds].slice(0, 10),
        }))

        return savedBuild
      },
      loadSavedBuild: (id) => {
        const savedBuild = get().savedBuilds.find((item) => item.id === id)
        if (!savedBuild) return

        set({ build: savedBuild.build, activeSlot: null, searchQuery: '' })
      },
      deleteSavedBuild: (id) =>
        set((state) => ({
          savedBuilds: state.savedBuilds.filter((item) => item.id !== id),
          compareIds: state.compareIds.filter((item) => item !== id),
        })),
      toggleCompare: (id) =>
        set((state) => {
          const exists = state.compareIds.includes(id)

          if (exists) {
            return { compareIds: state.compareIds.filter((item) => item !== id) }
          }

          if (state.compareIds.length >= 2) {
            return { compareIds: [...state.compareIds.slice(1), id] }
          }

          return { compareIds: [...state.compareIds, id] }
        }),
    }),
    {
      name: 'pc-builder-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        build: state.build,
        budgetLimit: state.budgetLimit,
        savedBuilds: state.savedBuilds,
        compareIds: state.compareIds,
      }),
    }
  )
)