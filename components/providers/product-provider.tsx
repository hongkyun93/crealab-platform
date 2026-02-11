"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/types"

interface ProductContextType {
    products: Product[]
    isLoading: boolean
    addProduct: (product: Omit<Product, "id" | "brandId" | "createdAt">) => Promise<void>
    updateProduct: (id: string, updates: Partial<Product>) => Promise<void>
    deleteProduct: (id: string) => Promise<void>
    refreshProducts: () => Promise<void>
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children, userId }: { children: React.ReactNode, userId?: string }) {
    const [supabase] = useState(() => createClient())
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const isFetching = useRef(false)

    // Fetch all products (public) or user's products
    const fetchProducts = async () => {
        if (isFetching.current) return

        isFetching.current = true
        setIsLoading(true)

        try {
            console.log('[ProductProvider] Fetching products...')

            const { data, error } = await supabase
                .from('brand_products')
                .select(`
                    *,
                    profiles(display_name, avatar_url, bio)
                `)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('[ProductProvider] Fetch error:', error)
                if (error.code === '42P01') {
                    console.warn('The "brand_products" table is missing')
                }
                return
            }

            if (data) {
                const mapped: Product[] = data.map((p: any) => ({
                    id: p.id,
                    brandId: p.brand_id,
                    brandName: p.profiles?.display_name || 'Brand',
                    brandAvatar: p.profiles?.avatar_url,
                    brandBio: p.profiles?.bio,
                    name: p.name,
                    price: p.price || 0,
                    image: p.image_url || '',
                    link: p.website_url || '',
                    points: p.selling_points || '',
                    shots: p.required_shots || '',
                    category: p.category || '기타',
                    description: p.description,
                    contentGuide: p.content_guide,
                    formatGuide: p.format_guide,
                    tags: p.tags || [],
                    accountTag: p.account_tag,
                    createdAt: p.created_at,
                    isMock: p.is_mock || false
                }))

                setProducts(mapped)
                console.log('[ProductProvider] Loaded products:', mapped.length)
            }
        } catch (err) {
            console.error('[ProductProvider] Exception:', err)
        } finally {
            isFetching.current = false
            setIsLoading(false)
        }
    }

    // Fetch on mount
    useEffect(() => {
        fetchProducts()
    }, [])

    // Add product
    const addProduct = async (newProduct: Omit<Product, "id" | "brandId" | "createdAt">) => {
        if (!userId) {
            throw new Error('User ID required to create product')
        }

        try {
            console.log('[ProductProvider] Creating product:', newProduct)

            const { data, error } = await supabase
                .from('brand_products')
                .insert({
                    brand_id: userId,
                    name: newProduct.name,
                    price: newProduct.price,
                    image_url: newProduct.image,
                    website_url: newProduct.link,
                    selling_points: newProduct.points,
                    required_shots: newProduct.shots,
                    category: newProduct.category,
                    description: newProduct.description,
                    content_guide: newProduct.contentGuide,
                    format_guide: newProduct.formatGuide,
                    tags: newProduct.tags,
                    account_tag: newProduct.accountTag
                })
                .select()
                .single()

            if (error) {
                console.error('[ProductProvider] Create error:', error)
                throw error
            }

            await fetchProducts()
            console.log('[ProductProvider] Product created successfully')
        } catch (error: any) {
            console.error('[ProductProvider] Add error:', error)
            throw error
        }
    }

    // Update product
    const updateProduct = async (id: string, updates: Partial<Product>) => {
        try {
            console.log('[ProductProvider] Updating product:', id, updates)

            const dbUpdates: any = {}
            if (updates.name) dbUpdates.name = updates.name
            if (updates.price !== undefined) dbUpdates.price = updates.price
            if (updates.image) dbUpdates.image_url = updates.image
            if (updates.link) dbUpdates.website_url = updates.link
            if (updates.points) dbUpdates.selling_points = updates.points
            if (updates.shots) dbUpdates.required_shots = updates.shots
            if (updates.category) dbUpdates.category = updates.category
            if (updates.description !== undefined) dbUpdates.description = updates.description
            if (updates.contentGuide !== undefined) dbUpdates.content_guide = updates.contentGuide
            if (updates.formatGuide !== undefined) dbUpdates.format_guide = updates.formatGuide
            if (updates.tags) dbUpdates.tags = updates.tags
            if (updates.accountTag !== undefined) dbUpdates.account_tag = updates.accountTag

            const { error } = await supabase
                .from('brand_products')
                .update(dbUpdates)
                .eq('id', id)

            if (error) {
                console.error('[ProductProvider] Update error:', error)
                throw error
            }

            // Update local state
            setProducts(prev => prev.map(p =>
                p.id === id ? { ...p, ...updates } : p
            ))
            console.log('[ProductProvider] Product updated')
        } catch (error: any) {
            console.error('[ProductProvider] Update error:', error)
            throw error
        }
    }

    // Delete product
    const deleteProduct = async (id: string) => {
        try {
            console.log('[ProductProvider] Deleting product:', id)

            const { error } = await supabase
                .from('brand_products')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('[ProductProvider] Delete error:', error)
                throw error
            }

            // Remove from local state
            setProducts(prev => prev.filter(p => p.id !== id))
            console.log('[ProductProvider] Product deleted')
        } catch (error: any) {
            console.error('[ProductProvider] Delete error:', error)
            throw error
        }
    }

    return (
        <ProductContext.Provider value={{
            products,
            isLoading,
            addProduct,
            updateProduct,
            deleteProduct,
            refreshProducts: fetchProducts
        }}>
            {children}
        </ProductContext.Provider>
    )
}

export function useProducts() {
    const context = useContext(ProductContext)
    if (!context) {
        throw new Error('useProducts must be used within ProductProvider')
    }
    return context
}
