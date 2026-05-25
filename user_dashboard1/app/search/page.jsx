"use client"

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShellWrapper } from '@/app/layouts/AppShellWrapper'
import SearchResultItem from '@/app/components/search/SearchResultItem'
import { searchService } from '@/app/services/searchService'
import { TRENDING_SEARCHES } from '@/app/constants'
import '@/app/styles/pages/SearchPage.css'

export default function SearchPage() {
  const queryRef = useRef(null)
  const [searchedQuery, setSearchedQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    const currentQuery = queryRef.current?.value || ''
    if (!currentQuery) return
    setIsSearching(true)
    setSearchedQuery(currentQuery)

    try {
      const searchResults = await searchService.searchArtists(currentQuery)
      setResults(searchResults)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleTrendingClick = (tag) => {
    if (queryRef.current) queryRef.current.value = tag
    setSearchedQuery(tag)

    setIsSearching(true)
    searchService.searchArtists(tag).then(res => {
      setResults(res)
      setIsSearching(false)
    })
  }

  return (
    <main className="search-page-layout">
      <div className="lux-container">
        <header className="search-page-header">
          <h1>Discover <span className="text-gradient">Magic</span></h1>
          <p>Search for artists, categories, or events to find your perfect match.</p>
        </header>

        <form className="search-large-bar" onSubmit={handleSearch}>
          <input
            ref={queryRef}
            type="text"
            placeholder="Search for 'Sufi Singers', 'Wedding Bands'..."
            defaultValue=""
            autoFocus
          />
          <button type="submit" className="fx-glow-button" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Find Talent'}
          </button>
        </form>

        <div className="search-results-area">
          <AnimatePresence>
            {results.length > 0 ? (
              <div className="results-grid">
                {results.map((res, idx) => (
                  <SearchResultItem
                    key={res.id}
                    result={res}
                    index={idx}
                  />
                ))}
              </div>
            ) : searchedQuery && !isSearching ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="search-empty"
              >
                <p>No results found for &ldquo;{searchedQuery}&rdquo;. Try searching for categories like &ldquo;Singers&rdquo; or &ldquo;Bands&rdquo;.</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="search-trending">
          <h5>Trending Searches</h5>
          <div className="trending-tags">
            {TRENDING_SEARCHES.map(tag => (
              <button key={tag} onClick={() => handleTrendingClick(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
